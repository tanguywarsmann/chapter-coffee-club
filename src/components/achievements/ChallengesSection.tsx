
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Target, TrendingUp, Zap } from "lucide-react";

export function ChallengesSection() {
  const challenges = [
    {
      id: 1,
      title: "Lecture Quotidienne",
      description: "Lisez tous les jours pendant 7 jours consécutifs",
      progress: 5,
      total: 7,
      icon: Zap,
      gradient: "from-orange-100 to-red-100",
      iconColor: "text-orange-600"
    },
    {
      id: 2,
      title: "Explorateur de Genres",
      description: "Lisez des livres de 3 catégories différentes",
      progress: 2,
      total: 3,
      icon: Target,
      gradient: "from-blue-100 to-indigo-100",
      iconColor: "text-blue-600"
    },
    {
      id: 3,
      title: "Marathon de Pages",
      description: "Lisez 500 pages en un mois",
      progress: 385,
      total: 500,
      icon: TrendingUp,
      gradient: "from-green-100 to-emerald-100",
      iconColor: "text-green-600"
    }
  ];

  return (
    <Card className="border-coffee-light/30 bg-white/80 backdrop-blur-sm shadow-sm">
      <CardHeader>
        <CardTitle className="font-serif text-coffee-darker flex items-center gap-2">
          <Target className="h-5 w-5 text-coffee-dark" />
          Défis en Cours
        </CardTitle>
        <CardDescription className="text-coffee-medium">
          Relevez ces défis pour progresser encore plus vite
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {challenges.map((challenge) => (
            <div key={challenge.id} className="group">
              <div className="bg-white/60 border border-coffee-light/30 rounded-xl p-6 hover:shadow-md transition-all duration-300">
                <div className="flex items-start gap-4 mb-4">
                  <div className={`p-3 bg-gradient-to-br ${challenge.gradient} rounded-xl group-hover:scale-110 transition-transform duration-300`}>
                    <challenge.icon className={`h-6 w-6 ${challenge.iconColor}`} />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-serif font-semibold text-coffee-darker text-lg mb-1">
                      {challenge.title}
                    </h3>
                    <p className="text-coffee-medium font-light">
                      {challenge.description}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="inline-flex items-center px-3 py-1 bg-coffee-light/50 rounded-full">
                      <span className="text-sm font-medium text-coffee-darker">En cours</span>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-coffee-medium">Progression</span>
                    <span className="text-sm font-semibold text-coffee-darker">
                      {challenge.progress}/{challenge.total}
                      {challenge.id === 3 ? ' pages' : challenge.id === 2 ? ' catégories' : ' jours'}
                    </span>
                  </div>
                  <div className="h-3 bg-coffee-lightest rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-coffee-dark to-coffee-medium transition-all duration-500 ease-out"
                      style={{ width: `${Math.round((challenge.progress / challenge.total) * 100)}%` }}
                    />
                  </div>
                  <div className="text-xs text-coffee-medium font-light">
                    {Math.round((challenge.progress / challenge.total) * 100)}% accompli
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
