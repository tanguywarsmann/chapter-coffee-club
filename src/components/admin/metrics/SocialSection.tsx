import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { SectionWrapper } from './SectionWrapper';
import { MetricCard } from './MetricCard';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export function SocialSection() {
  const { data, isLoading } = useQuery({
    queryKey: ['admin-social-stats'],
    queryFn: async () => {
      const { data, error } = await (supabase.rpc as any)('admin_get_social_stats');
      if (error) throw error;
      return data as Record<string, any>;
    },
  });

  return (
    <SectionWrapper title="6. Social & Viralité" isLoading={isLoading}>
      {data && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <MetricCard label="Connexions moy. / user" value={data.avg_connections} />
            <MetricCard label="Users sans connexion" value={data.pct_zero} suffix="%" />
            <MetricCard label="Users avec 1+ connexion" value={data.pct_one_plus} suffix="%" />
            <MetricCard label="Users avec 3+ connexions" value={data.pct_three_plus} suffix="%" />
          </div>

          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.distribution}>
                <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                <XAxis dataKey="bucket" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="count" fill="#3498db" radius={[4, 4, 0, 0]} name="Utilisateurs" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="p-4 rounded-lg bg-muted border border-border text-sm" style={{ color: '#7f8c8d' }}>
            <p className="font-semibold mb-2">⚠️ Tracking manquant pour la viralité</p>
            <p className="mb-2">Les métriques suivantes ne sont pas encore trackées :</p>
            <ul className="list-disc list-inside space-y-1 text-xs">
              <li>Nombre de partages (share events)</li>
              <li>Source d'inscription (referral tracking)</li>
              <li>Invitations envoyées et converties</li>
              <li>K-factor</li>
            </ul>
            <p className="mt-2 text-xs">
              <strong>Action requise :</strong> ajouter une table <code>tracking_events</code> (user_id, event_type, meta jsonb, created_at)
              et logger les events <code>share_initiated</code>, <code>invite_sent</code>, <code>invite_converted</code>.
            </p>
          </div>
        </div>
      )}
    </SectionWrapper>
  );
}
