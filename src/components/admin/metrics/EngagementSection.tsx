import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { SectionWrapper } from './SectionWrapper';
import { MetricCard } from './MetricCard';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';

interface Props { periodDays: number | null; }

export function EngagementSection({ periodDays }: Props) {
  const { data, isLoading } = useQuery({
    queryKey: ['admin-engagement', periodDays],
    queryFn: async () => {
      const { data, error } = await (supabase.rpc as any)('admin_get_engagement', { p_days: periodDays });
      if (error) throw error;
      return data as Record<string, any>;
    },
  });

  const { data: socialRet, isLoading: socialLoading } = useQuery({
    queryKey: ['admin-social-retention'],
    queryFn: async () => {
      const { data, error } = await (supabase.rpc as any)('admin_get_social_retention');
      if (error) throw error;
      return data as Record<string, any>;
    },
  });

  const wauMau = data?.wau_mau || [];
  const latestRatio = wauMau.length > 0 ? wauMau[wauMau.length - 1].ratio : 0;

  return (
    <SectionWrapper title="4. Engagement" isLoading={isLoading}>
      {data && (
        <div className="space-y-6">
          {/* 4A: Frequency */}
          <div>
            <h3 className="text-sm font-semibold mb-3" style={{ color: '#2C3E50' }}>4A. Fréquence d'usage</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-muted-foreground mb-2">Jours actifs / semaine (distribution)</p>
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data.frequency_distribution}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                      <XAxis dataKey="bucket" tick={{ fontSize: 11 }} label={{ value: 'jours/sem', position: 'insideBottom', offset: -5, fontSize: 10 }} />
                      <YAxis tick={{ fontSize: 11 }} />
                      <Tooltip />
                      <Bar dataKey="count" fill="#E67E22" radius={[4, 4, 0, 0]} name="Utilisateurs" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
              <div>
                <div className="flex items-center gap-4 mb-2">
                  <p className="text-xs text-muted-foreground">WAU/MAU (12 semaines)</p>
                  <span className="text-xl font-bold" style={{ color: latestRatio >= 30 ? '#27AE60' : '#C0392B' }}>
                    {latestRatio}%
                  </span>
                </div>
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={wauMau}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                      <XAxis dataKey="week" tick={{ fontSize: 9 }} />
                      <YAxis tick={{ fontSize: 11 }} domain={[0, 100]} unit="%" />
                      <Tooltip formatter={(v: number) => `${v}%`} />
                      <Line dataKey="ratio" stroke="#E67E22" strokeWidth={2} dot={{ fill: '#E67E22', r: 3 }} name="WAU/MAU" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>

          {/* 4B: Validation activity */}
          <div>
            <h3 className="text-sm font-semibold mb-3" style={{ color: '#2C3E50' }}>4B. Activité de validation</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
              <MetricCard label="Temps moyen entre validations" value={data.avg_gap_days ?? '—'} suffix=" jours" />
              <MetricCard label="Livres en cours / user actif" value={data.avg_books_in_progress ?? '—'} />
            </div>
            <p className="text-xs text-muted-foreground mb-2">Distribution segments validés / utilisateur</p>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.segments_distribution}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                  <XAxis dataKey="bucket" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Bar dataKey="users" fill="#2C3E50" radius={[4, 4, 0, 0]} name="Utilisateurs" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* 4C: Streaks */}
          <div>
            <h3 className="text-sm font-semibold mb-3" style={{ color: '#2C3E50' }}>4C. Streaks</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
              <MetricCard label="Streak moyen actuel" value={data.avg_current_streak ?? 0} suffix=" jours" />
              <MetricCard label="Streak > 7 jours" value={data.pct_streak_7 ?? 0} suffix="%" />
              <MetricCard label="Streak > 30 jours" value={data.pct_streak_30 ?? 0} suffix="%" />
            </div>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.streak_distribution}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                  <XAxis dataKey="bucket" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#27AE60" radius={[4, 4, 0, 0]} name="Utilisateurs" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* 4D: Social × Retention */}
          <div>
            <h3 className="text-sm font-semibold mb-3" style={{ color: '#2C3E50' }}>4D. Social × Rétention</h3>
            {socialLoading ? (
              <p className="text-muted-foreground text-sm">Chargement…</p>
            ) : socialRet ? (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm border-collapse">
                    <thead>
                      <tr className="bg-muted">
                        <th className="p-2 text-left">Groupe</th>
                        <th className="p-2 text-center">N</th>
                        <th className="p-2 text-center">D7</th>
                        <th className="p-2 text-center">D14</th>
                        <th className="p-2 text-center">D30</th>
                      </tr>
                    </thead>
                    <tbody>
                      {['social', 'no_social'].map(g => (
                        <tr key={g} className="border-t border-border">
                          <td className="p-2 font-medium">{g === 'social' ? '👥 Avec social' : '🚫 Sans social'}</td>
                          <td className="p-2 text-center">{socialRet[g]?.count}</td>
                          {['d7', 'd14', 'd30'].map(d => (
                            <td key={d} className="p-2 text-center font-semibold">{socialRet[g]?.[d]}%</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {socialRet.social?.d30 > socialRet.no_social?.d30 && (
                  <div className="mt-3 p-3 rounded-lg text-sm font-medium" style={{ backgroundColor: '#d5f5e3', color: '#1a7a3a' }}>
                    ✅ Les utilisateurs avec des connexions sociales retiennent {(socialRet.social.d30 - socialRet.no_social.d30).toFixed(1)}% de mieux à D30.
                  </div>
                )}
              </>
            ) : null}
          </div>
        </div>
      )}
    </SectionWrapper>
  );
}
