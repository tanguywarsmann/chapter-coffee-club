import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { SectionWrapper } from './SectionWrapper';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const WINDOWS = ['d0', 'd1', 'd3', 'd7', 'd14', 'd30', 'd60', 'd90'] as const;
const WIN_LABELS: Record<string, string> = { d0: 'J0', d1: 'J1', d3: 'J3', d7: 'J7', d14: 'J14', d30: 'J30', d60: 'J60', d90: 'J90' };
const WIN_DAYS: Record<string, number> = { d0: 0, d1: 1, d3: 3, d7: 7, d14: 14, d30: 30, d60: 60, d90: 90 };

function cellColor(pct: number): string {
  if (pct >= 40) return '#1a7a3a';
  if (pct >= 30) return '#27AE60';
  if (pct >= 20) return '#f0ad4e';
  if (pct >= 10) return '#E67E22';
  return '#C0392B';
}

function exportCSV(cohorts: any[]) {
  const headers = ['Semaine', 'Inscrits', ...WINDOWS.map(w => `${WIN_LABELS[w]} (%)`),...WINDOWS.map(w => `${WIN_LABELS[w]} (abs)`)];
  const rows = cohorts.map(c => [
    c.cohort_week, c.cohort_size,
    ...WINDOWS.map(w => c.cohort_age_days >= WIN_DAYS[w] ? (c[w] / c.cohort_size * 100).toFixed(1) : ''),
    ...WINDOWS.map(w => c.cohort_age_days >= WIN_DAYS[w] ? c[w] : ''),
  ]);
  const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'cohort_retention.csv';
  a.click();
}

const COLORS = ['#bdc3c7', '#95a5a6', '#7f8c8d', '#636e72', '#576574', '#2C3E50', '#1e272e', '#0a1931'];

export function CohortSection() {
  const { data: cohorts, isLoading } = useQuery({
    queryKey: ['admin-cohort-retention'],
    queryFn: async () => {
      const { data, error } = await (supabase.rpc as any)('admin_get_cohort_retention', { p_weeks: 12 });
      if (error) throw error;
      return (data as any[]) || [];
    },
  });

  const chartData = cohorts
    ? WINDOWS.map(w => {
        const pt: any = { label: WIN_LABELS[w] };
        const valid = cohorts.filter((c: any) => c.cohort_age_days >= WIN_DAYS[w] && c.cohort_size > 0);
        valid.slice(0, 8).forEach((c: any, i: number) => {
          pt[`c${i}`] = Math.round(c[w] / c.cohort_size * 100);
        });
        if (valid.length > 0) {
          pt.avg = Math.round(valid.reduce((s: number, c: any) => s + c[w] / c.cohort_size * 100, 0) / valid.length);
        }
        return pt;
      })
    : [];

  return (
    <SectionWrapper title="2. Rétention par cohorte" isLoading={isLoading}>
      {cohorts && cohorts.length > 0 ? (
        <>
          <div className="overflow-x-auto rounded-lg border border-border">
            <table className="w-full text-xs border-collapse min-w-[700px]">
              <thead>
                <tr className="bg-muted">
                  <th className="p-2 text-left font-medium">Semaine</th>
                  <th className="p-2 text-center font-medium">Inscrits</th>
                  {WINDOWS.map(w => (
                    <th key={w} className="p-2 text-center font-medium">{WIN_LABELS[w]}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {cohorts.map((c: any) => (
                  <tr key={c.cohort_week} className="border-t border-border">
                    <td className="p-2 font-mono text-xs">{c.cohort_week}</td>
                    <td className="p-2 text-center font-semibold">{c.cohort_size}</td>
                    {WINDOWS.map(w => {
                      if (c.cohort_age_days < WIN_DAYS[w])
                        return <td key={w} className="p-2 text-center bg-muted text-muted-foreground">—</td>;
                      const pct = c.cohort_size > 0 ? Math.round(c[w] / c.cohort_size * 100) : 0;
                      return (
                        <td key={w} className="p-2 text-center text-white font-bold text-xs"
                            style={{ backgroundColor: cellColor(pct) }}>
                          {pct}%
                          <span className="block text-[10px] font-normal opacity-80">({c[w]})</span>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <button onClick={() => exportCSV(cohorts)}
            className="text-sm px-3 py-1.5 rounded-md border border-border hover:bg-muted transition-colors">
            📥 Exporter CSV
          </button>

          <div className="h-80 mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                <XAxis dataKey="label" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} domain={[0, 100]} unit="%" />
                <Tooltip formatter={(v: number) => `${v}%`} />
                {cohorts.slice(0, 8).map((_: any, i: number) => (
                  <Line key={i} dataKey={`c${i}`} stroke={COLORS[i]} strokeWidth={1} dot={false} opacity={0.5} name={`Cohorte ${i + 1}`} />
                ))}
                <Line dataKey="avg" stroke="#E67E22" strokeWidth={3} dot={{ fill: '#E67E22', r: 4 }} name="Moyenne" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </>
      ) : (
        <p className="text-muted-foreground">Aucune donnée de cohorte.</p>
      )}
    </SectionWrapper>
  );
}
