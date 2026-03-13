import { useState } from 'react';
import { AdminGuard } from '@/components/admin/AdminGuard';
import AdminLayout from '@/components/admin/AdminLayout';
import { KpiSection } from '@/components/admin/metrics/KpiSection';
import { CohortSection } from '@/components/admin/metrics/CohortSection';
import { FunnelSection } from '@/components/admin/metrics/FunnelSection';
import { EngagementSection } from '@/components/admin/metrics/EngagementSection';
import { ConversionSection } from '@/components/admin/metrics/ConversionSection';
import { SocialSection } from '@/components/admin/metrics/SocialSection';
import { CatalogSection } from '@/components/admin/metrics/CatalogSection';
import { AlertsSection } from '@/components/admin/metrics/AlertsSection';

const PERIODS = [
  { label: '7j', value: 7 },
  { label: '30j', value: 30 },
  { label: '90j', value: 90 },
  { label: 'Tout', value: null as number | null },
];

export default function AdminMetrics() {
  const [periodDays, setPeriodDays] = useState<number | null>(30);

  return (
    <AdminGuard>
      <AdminLayout>
        <div className="max-w-7xl mx-auto px-4 py-6 space-y-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <h1 className="text-2xl font-bold" style={{ color: '#2C3E50' }}>
              📊 Dashboard Métriques
            </h1>
            <div className="flex gap-1 bg-muted rounded-lg p-1">
              {PERIODS.map(p => (
                <button
                  key={p.label}
                  onClick={() => setPeriodDays(p.value)}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                    periodDays === p.value
                      ? 'bg-card shadow-sm text-foreground'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          <KpiSection periodDays={periodDays} />
          <CohortSection />
          <FunnelSection periodDays={periodDays} />
          <EngagementSection periodDays={periodDays} />
          <ConversionSection periodDays={periodDays} />
          <SocialSection />
          <CatalogSection />
          <AlertsSection />
        </div>
      </AdminLayout>
    </AdminGuard>
  );
}
