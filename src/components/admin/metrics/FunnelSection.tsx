import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { SectionWrapper } from './SectionWrapper';

interface Props { periodDays: number | null; }

export function FunnelSection({ periodDays }: Props) {
  const { data: steps, isLoading } = useQuery({
    queryKey: ['admin-funnel', periodDays],
    queryFn: async () => {
      const { data, error } = await (supabase.rpc as any)('admin_get_activation_funnel', { p_days: periodDays });
      if (error) throw error;
      return (data as { step: string; value: number }[]) || [];
    },
  });

  const maxVal = steps?.[0]?.value || 1;

  return (
    <SectionWrapper title="3. Funnel d'activation" isLoading={isLoading}>
      {steps && steps.length > 0 && (
        <div className="space-y-2">
          {steps.map((s, i) => {
            const pctTotal = maxVal > 0 ? (s.value / maxVal * 100) : 0;
            const prev = i > 0 ? steps[i - 1].value : s.value;
            const pctPrev = prev > 0 ? (s.value / prev * 100) : 0;
            const dropSevere = i > 0 && pctPrev < 40;

            return (
              <div key={s.step} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium" style={{ color: '#2C3E50' }}>{s.step}</span>
                  <div className="flex items-center gap-3 text-xs">
                    <span className="font-semibold">{s.value.toLocaleString('fr-FR')}</span>
                    <span className="text-muted-foreground">{pctTotal.toFixed(1)}% du total</span>
                    {i > 0 && (
                      <span style={{ color: dropSevere ? '#C0392B' : '#2C3E50' }} className="font-medium">
                        {pctPrev.toFixed(1)}% de l'étape préc.
                      </span>
                    )}
                  </div>
                </div>
                <div className="h-6 bg-muted rounded-md overflow-hidden">
                  <div
                    className="h-full rounded-md transition-all duration-500"
                    style={{
                      width: `${Math.max(pctTotal, 1)}%`,
                      backgroundColor: dropSevere ? '#C0392B' : '#E67E22',
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </SectionWrapper>
  );
}
