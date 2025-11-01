
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
    <Card className="border-coffee-light bg-white/80 backdrop-blur-md shadow-lg">
      <CardHeader className="pb-4 bg-gradient-to-r from-coffee-light/10 to-transparent">
        <CardTitle className="font-serif text-coffee-darker text-h3 flex items-center gap-2">
          <Users className="h-6 w-6 text-coffee-medium" />
          Communauté
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {statItems.map((stat, index) => (
          <div 
            key={index} 
            className="group flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-coffee-light/10 to-coffee-medium/5 hover:from-coffee-light/20 hover:to-coffee-medium/10 transition-all hover:shadow-md hover:scale-[1.02] cursor-default"
          >
            <div className="flex items-center space-x-4">
              <div className={`p-3 rounded-xl ${stat.bgColor} group-hover:scale-110 transition-transform`}>
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </div>
              <span className="text-coffee-dark font-medium">{stat.label}</span>
            </div>
            <span className="font-bold text-coffee-darker text-4xl tabular-nums">{stat.value}</span>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
