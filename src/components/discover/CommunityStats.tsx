
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, UserCheck, UserPlus } from "lucide-react";

export function CommunityStats() {
  const stats = [
    {
      icon: Users,
      label: "Lecteurs",
      value: "55",
      color: "text-blue-600",
      bgColor: "bg-blue-50"
    },
    {
      icon: UserCheck,
      label: "Abonné·e·s",
      value: "55",
      color: "text-green-600", 
      bgColor: "bg-green-50"
    },
    {
      icon: UserPlus,
      label: "Abonnements",
      value: "55",
      color: "text-purple-600",
      bgColor: "bg-purple-50"
    }
  ];

  return (
    <Card className="border-coffee-light bg-white/70 backdrop-blur-md">
      <CardHeader className="pb-3">
        <CardTitle className="font-serif text-coffee-darker text-lg">
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
              <span className="text-coffee-dark font-medium text-sm">{stat.label}</span>
            </div>
            <span className="font-bold text-coffee-darker text-lg">{stat.value}</span>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
