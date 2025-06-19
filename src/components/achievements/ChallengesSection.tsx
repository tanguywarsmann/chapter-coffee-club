
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Target, TrendingUp, Zap, Sparkles, Trophy } from "lucide-react";

export function ChallengesSection() {
  const challenges = [
    {
      id: 1,
      title: "Lecture Quotidienne",
      description: "Lisez tous les jours pendant 7 jours consécutifs",
      progress: 5,
      total: 7,
      icon: Zap,
      gradient: "from-orange-400 to-red-500",
      bgGradient: "from-orange-100 to-red-100",
      iconColor: "text-orange-600",
      glowColor: "from-orange-200/30 to-red-200/30"
    },
    {
      id: 2,
      title: "Explorateur de Genres",
      description: "Lisez des livres de 3 catégories différentes",
      progress: 2,
      total: 3,
      icon: Target,
      gradient: "from-blue-400 to-indigo-500",
      bgGradient: "from-blue-100 to-indigo-100",
      iconColor: "text-blue-600",
      glowColor: "from-blue-200/30 to-indigo-200/30"
    },
    {
      id: 3,
      title: "Marathon de Pages",
      description: "Lisez 500 pages en un mois",
      progress: 385,
      total: 500,
      icon: TrendingUp,
      gradient: "from-emerald-400 to-green-500",
      bgGradient: "from-emerald-100 to-green-100",
      iconColor: "text-emerald-600",
      glowColor: "from-emerald-200/30 to-green-200/30"
    }
  ];

  return (
    <div className="relative">
      {/* Effet d'arrière-plan décoratif */}
      <div className="absolute inset-0 bg-gradient-to-br from-coffee-light/10 to-chocolate-light/10 rounded-3xl blur-2xl" />
      
      <Card className="relative border-0 bg-white/60 backdrop-blur-md shadow-2xl rounded-3xl overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-coffee-lightest/50 to-chocolate-lightest/50 border-b border-white/20">
          <CardTitle className="font-serif text-coffee-darker flex items-center gap-3 text-xl">
            <div className="p-2 bg-gradient-to-br from-emerald-100 to-green-100 rounded-xl">
              <Trophy className="h-6 w-6 text-emerald-600" />
            </div>
            Défis en Cours
            <Sparkles className="h-5 w-5 text-coffee-medium animate-pulse" />
          </CardTitle>
          <CardDescription className="text-coffee-medium font-light">
            Relevez ces défis pour progresser encore plus vite
          </CardDescription>
        </CardHeader>
        <CardContent className="p-8">
          <div className="space-y-8">
            {challenges.map((challenge) => (
              <div key={challenge.id} className="group relative">
                {/* Effet de lueur pour chaque défi */}
                <div className={`absolute inset-0 bg-gradient-to-br ${challenge.glowColor} rounded-2xl blur-xl transform group-hover:scale-105 transition-transform duration-500`} />
                
                <div className="relative bg-white/70 backdrop-blur-sm border border-white/50 rounded-2xl p-8 hover:shadow-2xl transition-all duration-500 group-hover:-translate-y-1">
                  <div className="flex items-start gap-6 mb-6">
                    {/* Icône premium */}
                    <div className="relative">
                      <div className={`absolute inset-0 bg-gradient-to-br ${challenge.gradient} rounded-2xl blur-sm opacity-30 scale-110`} />
                      <div className={`relative p-4 bg-gradient-to-br ${challenge.bgGradient} rounded-2xl border border-white/50 group-hover:scale-110 transition-transform duration-300`}>
                        <challenge.icon className={`h-7 w-7 ${challenge.iconColor}`} />
                      </div>
                    </div>
                    
                    <div className="flex-1">
                      <h3 className="font-serif font-semibold text-coffee-darker text-xl mb-2">
                        {challenge.title}
                      </h3>
                      <p className="text-coffee-medium font-light leading-relaxed">
                        {challenge.description}
                      </p>
                    </div>
                    
                    {/* Badge de statut premium */}
                    <div className="text-right">
                      <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-coffee-light/50 to-chocolate-light/50 rounded-full border border-white/30 backdrop-blur-sm">
                        <span className="text-sm font-serif font-medium text-coffee-darker">En cours</span>
                        <Sparkles className="h-4 w-4 ml-2 text-coffee-medium" />
                      </div>
                    </div>
                  </div>
                  
                  {/* Section progression élégante */}
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-serif font-medium text-coffee-medium">Progression</span>
                      <span className="text-sm font-serif font-semibold text-coffee-darker">
                        {challenge.progress}/{challenge.total}
                        {challenge.id === 3 ? ' pages' : challenge.id === 2 ? ' catégories' : ' jours'}
                      </span>
                    </div>
                    
                    {/* Barre de progression premium */}
                    <div className="relative h-4 bg-gradient-to-r from-coffee-lightest to-chocolate-lightest rounded-full overflow-hidden border border-white/30">
                      <div 
                        className={`h-full bg-gradient-to-r ${challenge.gradient} transition-all duration-1000 ease-out relative`}
                        style={{ width: `${Math.round((challenge.progress / challenge.total) * 100)}%` }}
                      >
                        {/* Effet brillant sur la barre */}
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <div className="text-xs text-coffee-medium font-light">
                        {Math.round((challenge.progress / challenge.total) * 100)}% accompli
                      </div>
                      {challenge.progress / challenge.total > 0.8 && (
                        <div className="flex items-center gap-1 text-xs text-coffee-dark font-medium">
                          <Sparkles className="h-3 w-3" />
                          Presque fini !
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
