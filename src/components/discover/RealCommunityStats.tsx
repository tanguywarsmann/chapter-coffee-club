
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, UserCheck, UserPlus } from "lucide-react";
import { DiscoverStats } from "@/services/user/realDiscoverService";

interface RealCommunityStatsProps {
  stats: DiscoverStats;
  loading?: boolean;
}

export function RealCommunityStats({ stats, loading }: RealCommunityStatsProps) {
  if (loading) {
    return (
      <Card className="border-coffee-light bg-white/70 backdrop-blur-md">
        <CardHeader className="pb-3">
          <CardTitle className="font-serif text-coffee-darker text-h4">
            Statistiques de la communauté
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-16 bg-coffee-light/10 rounded-lg animate-pulse" />
          ))}
        </CardContent>
      </Card>
    );
  }

  const statItems = [
    {
      icon: Users,
      label: "Lecteurs",
      value: stats.readers.toString(),
      color: "text-coffee-dark",
      bgColor: "bg-coffee-light/20"
    },
    {
      icon: UserCheck,
      label: "Abonné·e·s",
      value: stats.followers.toString(),
      color: "text-coffee-darker", 
      bgColor: "bg-coffee-medium/20"
    },
    {
      icon: UserPlus,
      label: "Abonnements",
      value: stats.following.toString(),
      color: "text-coffee-dark",
      bgColor: "bg-coffee-light/30"
    }
  ];

  return (
    <Card className="border-coffee-light bg-white/70 backdrop-blur-md">
      <CardHeader className="pb-3">
        <CardTitle className="font-serif text-coffee-darker text-h4">
          Statistiques de la communauté
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {statItems.map((stat, index) => (
          <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-gradient-to-r from-coffee-light/10 to-coffee-medium/5">
            <div className="flex items-center space-x-3">
              <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </div>
              <span className="text-coffee-dark font-medium text-body-sm">{stat.label}</span>
            </div>
            <span className="font-bold text-coffee-darker text-h4">{stat.value}</span>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
