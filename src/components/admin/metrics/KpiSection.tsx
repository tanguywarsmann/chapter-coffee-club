import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { MetricCard } from './MetricCard';
import { SectionWrapper } from './SectionWrapper';

interface Props { periodDays: number | null; }

export function KpiSection({ periodDays }: Props) {
  const { data, isLoading } = useQuery({
    queryKey: ['admin-kpis', periodDays],
    queryFn: async () => {
      const { data, error } = await (supabase.rpc as any)('admin_get_kpis', { p_days: periodDays });
      if (error) throw error;
      return data as Record<string, any>;
    },
  });

  return (
    <SectionWrapper title="1. Vue d'ensemble — KPIs" isLoading={isLoading}>
      {data && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <MetricCard label="Total inscrits" value={data.total_users} />
          <MetricCard label="Actifs (période)" value={data.active_users} delta={data.delta_active} />
          <MetricCard label="Premium actifs" value={data.premium_users} />
          <MetricCard label="Conversion free→premium" value={data.conversion_rate} suffix="%" />
          <MetricCard label="Segments validés" value={data.segments_validated} delta={data.delta_segments} />
          <MetricCard label="Livres complétés" value={data.books_completed} delta={data.delta_books} />
          <MetricCard label="⭐ North Star" value={data.north_star} suffix=" seg/u/sem" subtitle="Segments / user actif / semaine" />
          <MetricCard label="XP moyen (actifs)" value={data.avg_xp} />
        </div>
      )}
    </SectionWrapper>
  );
}
