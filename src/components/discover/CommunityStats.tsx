
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, UserCheck, UserPlus } from "lucide-react";

export function CommunityStats() {
  const stats = [
    {
      icon: Users,
      label: "Lecteurs",
      value: "55",
      color: "text-coffee-dark",
      bgColor: "bg-coffee-light/20"
    },
    {
      icon: UserCheck,
      label: "Abonné·e·s",
      value: "55",
      color: "text-coffee-darker", 
      bgColor: "bg-coffee-medium/20"
    },
    {
      icon: UserPlus,
      label: "Abonnements",
      value: "55",
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
        {stats.map((stat, index) => (
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
