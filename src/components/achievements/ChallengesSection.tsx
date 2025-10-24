
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Target, TrendingUp, Zap, Sparkles, Trophy } from "lucide-react";

export function ChallengesSection() {
  const challenges = [
    {
      id: 1,
      title: "🔥 Lecture quotidienne pendant un mois",
      description: "Lire tous les jours pendant 30 jours consécutifs",
      progress: 30,
      total: 30,
      icon: Zap,
      gradient: "from-reed-primary to-reed-dark",
      bgGradient: "from-reed-secondary to-reed-light",
      iconColor: "text-reed-primary",
      glowColor: "from-reed-primary/20 to-reed-secondary/20"
    },
    {
      id: 2,
      title: "Explorateur de Genres",
      description: "Lisez des livres de 3 catégories différentes",
      progress: 3,
      total: 3,
      icon: Target,
      gradient: "from-reed-dark to-reed-darker",
      bgGradient: "from-reed-light to-reed-secondary",
      iconColor: "text-reed-dark",
      glowColor: "from-reed-dark/20 to-reed-primary/20"
    },
    {
      id: 3,
      title: "Marathon de Pages",
      description: "Lisez 500 pages en un mois",
      progress: 500,
      total: 500,
      icon: TrendingUp,
      gradient: "from-reed-primary to-reed-secondary",
      bgGradient: "from-reed-light to-white",
      iconColor: "text-reed-primary",
      glowColor: "from-reed-secondary/20 to-reed-light/20"
    }
  ];

  return (
    <div className="relative">
      {/* Effet d'arrière-plan décoratif avec les couleurs Reed */}
      <div className="absolute inset-0 bg-gradient-to-br from-reed-primary/10 to-reed-secondary/10 rounded-3xl blur-2xl" />
      
      <Card className="relative border-0 bg-white/70 backdrop-blur-md shadow-2xl rounded-3xl overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-reed-secondary/40 to-reed-light/40 border-b border-white/20">
          <CardTitle className="font-serif text-reed-darker flex items-center gap-3 text-h4">
            <div className="p-2 bg-gradient-to-br from-reed-secondary to-reed-light rounded-xl flex-shrink-0">
              <Trophy className="h-5 w-5 sm:h-6 sm:w-6 text-reed-primary" />
            </div>
            <span className="flex-1 min-w-0">Défis en Cours</span>
            <Sparkles className="h-4 w-4 sm:h-5 sm:w-5 text-reed-primary animate-pulse flex-shrink-0" />
          </CardTitle>
          <CardDescription className="text-reed-dark">
            Relevez ces défis pour progresser encore plus vite
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6 sm:p-8">
          <div className="space-y-6 sm:space-y-8">
            {challenges.map((challenge) => (
              <div key={challenge.id} className="group relative">
                {/* Effet de lueur pour chaque défi */}
                <div className={`absolute inset-0 bg-gradient-to-br ${challenge.glowColor} rounded-2xl blur-xl transform group-hover:scale-105 transition-transform duration-500`} />
                
                <div className="relative bg-white/80 backdrop-blur-sm border border-white/50 rounded-2xl p-6 sm:p-8 hover:shadow-2xl transition-all duration-500 group-hover:-translate-y-1">
                  <div className="flex flex-col sm:flex-row sm:items-start gap-4 sm:gap-6 mb-6">
                    {/* Icône premium */}
                    <div className="relative flex-shrink-0 self-start">
                      <div className={`absolute inset-0 bg-gradient-to-br ${challenge.gradient} rounded-2xl blur-sm opacity-30 scale-110`} />
                      <div className={`relative p-3 sm:p-4 bg-gradient-to-br ${challenge.bgGradient} rounded-2xl border border-white/50 group-hover:scale-110 transition-transform duration-300`}>
                        <challenge.icon className={`h-6 w-6 sm:h-7 sm:w-7 ${challenge.iconColor}`} />
                      </div>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <h3 className="font-serif font-semibold text-reed-darker text-h4 mb-2 break-words">
                        {challenge.title}
                      </h3>
                      <p className="text-reed-dark leading-relaxed break-words">
                        {challenge.description}
                      </p>
                    </div>
                    
                    {/* Badge de statut premium */}
                    <div className="flex-shrink-0 self-start">
                      <div className="inline-flex items-center px-3 sm:px-4 py-2 bg-gradient-to-r from-green-100 to-green-200 rounded-full border border-green-300 backdrop-blur-sm">
                        <span className="text-caption sm:text-body-sm font-serif font-medium text-green-800 whitespace-nowrap">
                          {challenge.progress >= challenge.total ? "Terminé" : "En cours"}
                        </span>
                        <Sparkles className="h-3 w-3 sm:h-4 sm:w-4 ml-2 text-green-600 flex-shrink-0" />
                      </div>
                    </div>
                  </div>
                  
                  {/* Section progression élégante */}
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-body-sm font-serif font-medium text-reed-dark">Progression</span>
                      <span className="text-body-sm font-serif font-semibold text-reed-darker">
                        {challenge.progress}/{challenge.total}
                        {challenge.id === 3 ? ' pages' : challenge.id === 2 ? ' catégories' : ' jours'}
                      </span>
                    </div>
                    
                    {/* Barre de progression premium avec couleurs Reed */}
                    <div className="relative h-3 sm:h-4 bg-gradient-to-r from-reed-light to-reed-secondary rounded-full overflow-hidden border border-white/30">
                      <div 
                        className={`h-full bg-gradient-to-r ${challenge.gradient} transition-all duration-1000 ease-out relative`}
                        style={{ width: `${Math.round((challenge.progress / challenge.total) * 100)}%` }}
                      >
                        {/* Effet brillant sur la barre */}
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <div className="text-caption text-reed-dark">
                        {Math.round((challenge.progress / challenge.total) * 100)}% accompli
                      </div>
                      {challenge.progress >= challenge.total && (
                        <div className="flex items-center gap-1 text-caption text-green-600 font-medium">
                          <Sparkles className="h-3 w-3 flex-shrink-0" />
                          <span className="whitespace-nowrap">Défi accompli !</span>
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
