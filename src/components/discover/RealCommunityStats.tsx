
import { Users, UserCheck, UserPlus } from "lucide-react";
import { DiscoverStats } from "@/services/user/realDiscoverService";
import { cn } from "@/lib/utils";

interface RealCommunityStatsProps {
  stats: DiscoverStats;
  loading?: boolean;
  className?: string;
}

export function RealCommunityStats({ stats, loading, className }: RealCommunityStatsProps) {
  if (loading) {
    return (
      <div className={cn("p-6 rounded-2xl bg-muted/10 border border-border/40 space-y-4", className)}>
         <div className="h-5 w-32 bg-muted/30 rounded animate-pulse" />
         <div className="space-y-3">
            {[1,2,3].map(i => <div key={i} className="h-8 w-full bg-muted/20 rounded animate-pulse" />)}
         </div>
      </div>
    );
  }

  const statItems = [
    {
      label: "Lecteurs",
      value: stats.readers,
      icon: Users,
    },
    {
      label: "Abonné·e·s",
      value: stats.followers,
      icon: UserCheck,
    },
    {
      label: "Abonnements",
      value: stats.following,
      icon: UserPlus,
    }
  ];

  return (
    <div className={cn("p-6 rounded-2xl bg-muted/10 border border-border/40", className)}>
      <h3 className="font-serif font-medium text-lg mb-4 text-foreground">Communauté</h3>
      <div className="space-y-4">
        {statItems.map((item, index) => (
            <div key={index} className="flex items-center justify-between group">
                <div className="flex items-center gap-3 text-muted-foreground group-hover:text-foreground transition-colors">
                    <item.icon className="h-4 w-4" />
                    <span className="text-sm font-medium">{item.label}</span>
                </div>
                <span className="font-semibold text-foreground tabular-nums">
                    {item.value}
                </span>
            </div>
        ))}
      </div>
    </div>
  );
}
