import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { SectionWrapper } from './SectionWrapper';
import { MetricCard } from './MetricCard';

function exportTableCSV(rows: any[], filename: string, columns: { key: string; label: string }[]) {
  const headers = columns.map(c => c.label);
  const csv = [headers.join(','), ...rows.map(r => columns.map(c => r[c.key] ?? '').join(','))].join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
}

function BookTable({ title, rows, valueLabel, valueKey }: { title: string; rows: any[]; valueLabel: string; valueKey: string }) {
  if (!rows || rows.length === 0) return null;
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs font-semibold" style={{ color: '#2C3E50' }}>{title}</p>
        <button
          onClick={() => exportTableCSV(rows, `${title.replace(/\s+/g, '_')}.csv`, [
            { key: 'title', label: 'Titre' },
            { key: 'author', label: 'Auteur' },
            { key: valueKey, label: valueLabel },
          ])}
          className="text-xs px-2 py-1 rounded border border-border hover:bg-muted transition-colors"
        >
          📥 CSV
        </button>
      </div>
      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="w-full text-xs border-collapse">
          <thead>
            <tr className="bg-muted">
              <th className="p-2 text-left">#</th>
              <th className="p-2 text-left">Titre</th>
              <th className="p-2 text-left">Auteur</th>
              <th className="p-2 text-right">{valueLabel}</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r: any, i: number) => (
              <tr key={i} className="border-t border-border">
                <td className="p-2 text-muted-foreground">{i + 1}</td>
                <td className="p-2 font-medium max-w-[200px] truncate">{r.title}</td>
                <td className="p-2 text-muted-foreground">{r.author}</td>
                <td className="p-2 text-right font-semibold">
                  {typeof r[valueKey] === 'number' && valueKey === 'rate' ? `${r[valueKey]}%` : r[valueKey]}
                  {r.total_readers && <span className="text-muted-foreground font-normal"> ({r.total_readers} lecteurs)</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function CatalogSection() {
  const { data, isLoading } = useQuery({
    queryKey: ['admin-catalog'],
    queryFn: async () => {
      const { data, error } = await (supabase.rpc as any)('admin_get_catalog');
      if (error) throw error;
      return data as Record<string, any>;
    },
  });

  return (
    <SectionWrapper title="7. Catalogue & Contenu" isLoading={isLoading}>
      {data && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <MetricCard label="Total livres" value={data.total_books} />
            <MetricCard label="Livres publiés" value={data.published_books} />
            <MetricCard label="Avec activité" value={data.books_with_activity} />
            <MetricCard label="Sans activité" value={data.books_without_activity} />
          </div>
          <MetricCard label="Segments moyens / livre" value={data.avg_expected_segments ?? '—'} />

          <BookTable title="Top 10 — Segments validés" rows={data.top_validated} valueLabel="Segments" valueKey="segments" />
          <BookTable title="Top 10 — Taux de complétion" rows={data.top_completed} valueLabel="Complétion" valueKey="rate" />
          <BookTable title="Top 10 — Taux d'abandon" rows={data.top_abandoned} valueLabel="Abandon" valueKey="rate" />
        </div>
      )}
    </SectionWrapper>
  );
}
