import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { SectionWrapper } from './SectionWrapper';
import { MetricCard } from './MetricCard';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';

interface Props { periodDays: number | null; }

export function ConversionSection({ periodDays }: Props) {
  const { data, isLoading } = useQuery({
    queryKey: ['admin-conversion', periodDays],
    queryFn: async () => {
      const { data, error } = await (supabase.rpc as any)('admin_get_conversion', { p_days: periodDays });
      if (error) throw error;
      return data as Record<string, any>;
    },
  });

  const cohortData = data?.cohort_conversion || [];
  const avgRate = cohortData.length > 0
    ? cohortData.reduce((s: number, c: any) => s + (c.rate || 0), 0) / cohortData.length
    : 0;

  return (
    <SectionWrapper title="5. Conversion & Monétisation" isLoading={isLoading}>
      {data && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <MetricCard label="Premium actifs" value={data.premium_active} />
            <MetricCard label="MRR estimé" value={`${data.mrr_estimated}€`} subtitle="Basé sur 3,33€/mois (39,99€/an)" />
            <MetricCard label="ARR estimé" value={`${(data.mrr_estimated * 12).toFixed(0)}€`} />
            <MetricCard label="Délai moyen → premium" value={data.avg_delay_days ?? '—'} suffix=" jours" />
            <MetricCard label="Segments avant conversion (moy)" value={data.avg_segments_before ?? '—'} />
            <MetricCard label="Segments avant conversion (méd)" value={data.median_segments_before ?? '—'} />
            {data.churn_available ? (
              <MetricCard label="Taux de churn" value={data.churn_rate ?? '—'} suffix="%" />
            ) : (
              <div className="bg-card rounded-xl p-4 shadow-sm border border-border">
                <p className="text-xs text-muted-foreground">Churn</p>
                <p className="text-sm text-muted-foreground mt-1">Données insuffisantes</p>
              </div>
            )}
          </div>

          <div>
            <p className="text-xs text-muted-foreground mb-2">Conversion par cohorte hebdomadaire</p>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={cohortData.slice().reverse()}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                  <XAxis dataKey="week" tick={{ fontSize: 9 }} />
                  <YAxis tick={{ fontSize: 11 }} unit="%" />
                  <Tooltip formatter={(v: number) => `${v}%`} />
                  <ReferenceLine y={avgRate} stroke="#E67E22" strokeDasharray="5 5" label={{ value: `Moy: ${avgRate.toFixed(1)}%`, fill: '#E67E22', fontSize: 10 }} />
                  <Bar dataKey="rate" fill="#2C3E50" radius={[4, 4, 0, 0]} name="Taux conversion %" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}
    </SectionWrapper>
  );
}
