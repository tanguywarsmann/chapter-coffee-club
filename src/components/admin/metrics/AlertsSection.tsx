import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { SectionWrapper } from './SectionWrapper';

interface Alert {
  level: 'critical' | 'warning' | 'info';
  emoji: string;
  message: string;
}

const LEVEL_STYLES: Record<string, { bg: string; border: string; text: string }> = {
  critical: { bg: '#fde8e8', border: '#C0392B', text: '#922B21' },
  warning: { bg: '#fef5e7', border: '#E67E22', text: '#935116' },
  info: { bg: '#eaf2f8', border: '#3498db', text: '#1a5276' },
};

export function AlertsSection() {
  const { data, isLoading } = useQuery({
    queryKey: ['admin-alerts'],
    queryFn: async () => {
      const { data, error } = await (supabase.rpc as any)('admin_get_alerts');
      if (error) throw error;
      return data as Record<string, any>;
    },
  });

  const alerts: Alert[] = [];

  if (data) {
    if (data.d30_pct != null && data.d30_pct < 15) {
      alerts.push({
        level: 'critical',
        emoji: '🔴',
        message: `Rétention D30 critique (${data.d30_pct}%). Le produit ne retient pas assez. Priorité absolue : comprendre pourquoi les utilisateurs décrochent après J7.`,
      });
    }
    if (data.activation_pct != null && data.activation_pct < 30) {
      alerts.push({
        level: 'warning',
        emoji: '🟠',
        message: `Seulement ${data.activation_pct}% des inscrits valident un segment. L'onboarding doit être simplifié.`,
      });
    }
    if (data.wau_mau_ratio != null && data.wau_mau_ratio < 30) {
      alerts.push({
        level: 'warning',
        emoji: '🟠',
        message: `Engagement hebdo faible (${data.wau_mau_ratio}%). Les utilisateurs ne reviennent pas assez souvent.`,
      });
    }
    if (data.recent_conv != null && data.prev_conv != null && (data.prev_conv - data.recent_conv) > 2) {
      alerts.push({
        level: 'warning',
        emoji: '🟠',
        message: `Conversion en baisse : de ${data.prev_conv}% à ${data.recent_conv}%. Vérifier la proposition de valeur premium.`,
      });
    }
    if (data.avg_connections != null && data.avg_connections < 1) {
      alerts.push({
        level: 'info',
        emoji: '🟡',
        message: `Social graph très peu dense (${data.avg_connections} connexion/user). L'absence de liens sociaux pèse sur la rétention.`,
      });
    }
    if (data.stale_books != null && data.stale_books > 0) {
      alerts.push({
        level: 'info',
        emoji: '🟡',
        message: `${data.stale_books} livre(s) sans activité depuis 30 jours malgré des lecteurs. Envisager des relances.`,
      });
    }
  }

  return (
    <SectionWrapper title="8. Alertes automatiques" isLoading={isLoading}>
      {alerts.length > 0 ? (
        <div className="space-y-3">
          {alerts.map((a, i) => {
            const style = LEVEL_STYLES[a.level];
            return (
              <div
                key={i}
                className="p-3 rounded-lg text-sm border-l-4"
                style={{ backgroundColor: style.bg, borderColor: style.border, color: style.text }}
              >
                {a.emoji} {a.message}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="p-4 rounded-lg text-sm font-medium" style={{ backgroundColor: '#d5f5e3', color: '#1a7a3a' }}>
          ✅ Aucune alerte. Les métriques sont dans les zones saines.
        </div>
      )}
    </SectionWrapper>
  );
}
