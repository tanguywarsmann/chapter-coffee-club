// Stub component - original was minified
import { Crown } from 'lucide-react';

interface PremiumBadgeProps {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'compact';
}

export function PremiumBadge({ size = 'md', variant = 'default' }: PremiumBadgeProps) {
  return (
    <span className="inline-flex items-center gap-1 text-orange-600">
      <Crown className="h-4 w-4" />
      {variant !== 'compact' && <span className="text-sm font-semibold">Premium</span>}
    </span>
  );
}
