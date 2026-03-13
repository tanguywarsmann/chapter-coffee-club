interface MetricCardProps {
  label: string;
  value: number | string;
  delta?: number | null;
  suffix?: string;
  subtitle?: string;
}

export function MetricCard({ label, value, delta, suffix = '', subtitle }: MetricCardProps) {
  return (
    <div className="bg-card rounded-xl p-4 shadow-sm border border-border">
      <p className="text-xs text-muted-foreground mb-1">{label}</p>
      <p className="text-2xl font-bold" style={{ color: '#2C3E50' }}>
        {typeof value === 'number' ? value.toLocaleString('fr-FR') : value}{suffix}
      </p>
      {delta != null && (
        <p className="text-xs font-medium" style={{ color: delta >= 0 ? '#27AE60' : '#C0392B' }}>
          {delta >= 0 ? '↑' : '↓'} {Math.abs(delta)}%
        </p>
      )}
      {subtitle && <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>}
    </div>
  );
}
