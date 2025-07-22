
import { Award, Book, FileText, Flag, Sparkles } from "lucide-react";

interface StatsCardsProps {
  booksRead: number;
  pagesRead: number;
  badges: number;
  quests: number;
  isLoading?: boolean;
}

export function StatsCards({ booksRead, pagesRead, badges, quests, isLoading = false }: StatsCardsProps) {

  const stats = [
    {
      icon: Award,
      value: badges,
      label: badges === 0 ? "Aucun badge" : badges === 1 ? "Badge obtenu" : "Badges obtenus",
      gradient: "from-reed-primary to-reed-dark",
      bgGradient: "from-reed-secondary to-reed-light",
      iconColor: "text-reed-primary",
      glowColor: "from-reed-primary/20 to-reed-secondary/20"
    },
    {
      icon: Book,
      value: booksRead,
      label: booksRead === 0 ? "Aucun livre terminé" : booksRead === 1 ? "Livre terminé" : "Livres terminés",
      gradient: "from-reed-dark to-reed-darker",
      bgGradient: "from-reed-light to-reed-secondary",
      iconColor: "text-reed-dark",
      glowColor: "from-reed-dark/20 to-reed-primary/20"
    },
    {
      icon: FileText,
      value: pagesRead,
      label: "Pages lues",
      gradient: "from-reed-primary to-reed-secondary",
      bgGradient: "from-reed-light to-white",
      iconColor: "text-reed-primary",
      glowColor: "from-reed-secondary/20 to-reed-light/20"
    },
    {
      icon: Flag,
      value: quests,
      label: quests === 0 ? "Aucune quête" : quests === 1 ? "Quête accomplie" : "Quêtes accomplies",
      gradient: "from-reed-secondary to-reed-primary",
      bgGradient: "from-reed-light to-reed-secondary",
      iconColor: "text-reed-secondary",
      glowColor: "from-reed-secondary/20 to-reed-primary/20"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-6 sm:gap-8">
      {stats.map((stat, index) => (
        <div key={index} className="group relative">
          {/* Effet de lueur d'arrière-plan avec les couleurs Reed */}
          <div className={`absolute inset-0 bg-gradient-to-br ${stat.glowColor} rounded-3xl blur-xl transform group-hover:scale-105 transition-transform duration-500`} />
          
          <div className="relative bg-white/70 backdrop-blur-md border border-white/40 rounded-3xl p-6 sm:p-8 shadow-2xl hover:shadow-3xl transition-all duration-500 group-hover:-translate-y-2">
            <div className="flex flex-col sm:flex-row items-start sm:items-center sm:justify-between gap-4">
              <div className="flex-1 min-w-0">
                <h3 className="text-xs sm:text-sm font-serif font-medium text-reed-dark uppercase tracking-wider mb-3">
                  {stat.label}
                </h3>
                <div className="flex items-baseline gap-2">
                  <p className="text-3xl sm:text-4xl font-serif font-bold text-reed-darker leading-none break-all">
                    {isLoading ? "—" : stat.value.toLocaleString()}
                  </p>
                  {!isLoading && stat.value > 0 && (
                    <Sparkles className="h-4 w-4 sm:h-5 sm:w-5 text-reed-primary animate-pulse flex-shrink-0" />
                  )}
                </div>
              </div>
              
              {/* Icône avec effet premium Reed */}
              <div className="relative flex-shrink-0">
                <div className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} rounded-2xl blur-sm opacity-30 scale-110`} />
                <div className={`relative p-3 sm:p-4 bg-gradient-to-br ${stat.bgGradient} rounded-2xl border border-white/50 group-hover:scale-110 transition-transform duration-300`}>
                  <stat.icon className={`h-6 w-6 sm:h-8 sm:w-8 ${stat.iconColor}`} />
                </div>
                {/* Badge décoratif pour les valeurs positives */}
                {!isLoading && stat.value > 0 && (
                  <div className="absolute -top-2 -right-2">
                    <div className="w-5 h-5 sm:w-6 sm:h-6 bg-gradient-to-br from-reed-primary to-reed-dark rounded-full flex items-center justify-center">
                      <Sparkles className="h-2 w-2 sm:h-3 sm:w-3 text-white" />
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            {/* Barre de progression décorative avec couleurs Reed */}
            <div className="mt-6 h-1 bg-reed-light/50 rounded-full overflow-hidden">
              <div 
                className={`h-full bg-gradient-to-r ${stat.gradient} transition-all duration-1000 ease-out`}
                style={{ 
                  width: isLoading ? '0%' : `${Math.min(100, Math.max(10, (stat.value / Math.max(stat.value, 10)) * 100))}%` 
                }}
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
