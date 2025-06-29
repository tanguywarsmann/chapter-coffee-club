
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BadgeRarityProgress } from "./BadgeRarityProgress";
import { Badge } from "@/types/badge";
import { useAuth } from "@/contexts/AuthContext";
import { Award, Sparkles } from "lucide-react";

export function BadgesSection() {
  const { user } = useAuth();
  
  // For the specific user f5e55556-c5ae-40dc-9909-88600a13393b, show unlocked badges
  const earnedBadges: Badge[] = user?.id === 'f5e55556-c5ae-40dc-9909-88600a13393b' ? [
    {
      id: "lecteur-assidu",
      slug: "lecteur-assidu",
      name: "Lecteur assidu",
      description: "Vous avez validé 50 segments de lecture.",
      icon: "🔥",
      color: "blue-500",
      rarity: "epic",
      dateEarned: new Date().toLocaleDateString('fr-FR')
    },
    {
      id: "serie-7-jours",
      slug: "serie-7-jours", 
      name: "Série de 7 jours",
      description: "Vous avez lu pendant 7 jours consécutifs sans interruption !",
      icon: "🔒",
      color: "orange-500",
      rarity: "rare",
      dateEarned: new Date().toLocaleDateString('fr-FR')
    },
    {
      id: "premier-livre",
      slug: "premier-livre",
      name: "Premier livre terminé",
      description: "Félicitations ! Vous avez terminé votre premier livre sur READ.",
      icon: "🎉",
      color: "green-500",
      rarity: "common",
      dateEarned: new Date().toLocaleDateString('fr-FR')
    },
    {
      id: "badge_test_insertion",
      slug: "badge_test_insertion",
      name: "Badge de test",
      description: "Badge utilisé pour les tests de développement.",
      icon: "🧪",
      color: "purple-500",
      rarity: "common",
      dateEarned: new Date().toLocaleDateString('fr-FR')
    },
    // Add more badges to reach 10 total
    {
      id: "badge-5",
      slug: "badge-5",
      name: "Lecteur régulier",
      description: "Vous lisez régulièrement depuis plusieurs semaines.",
      icon: "📚",
      color: "blue-400",
      rarity: "rare",
      dateEarned: new Date().toLocaleDateString('fr-FR')
    },
    {
      id: "badge-6",
      slug: "badge-6",
      name: "Explorateur",
      description: "Vous avez exploré différents genres littéraires.",
      icon: "🌟",
      color: "yellow-500",
      rarity: "common",
      dateEarned: new Date().toLocaleDateString('fr-FR')
    },
    {
      id: "badge-7",
      slug: "badge-7",
      name: "Persévérant",
      description: "Vous continuez à lire malgré les difficultés.",
      icon: "💪",
      color: "red-500",
      rarity: "common",
      dateEarned: new Date().toLocaleDateString('fr-FR')
    },
    {
      id: "badge-8",
      slug: "badge-8",
      name: "Critique",
      description: "Vous analysez et réfléchissez sur vos lectures.",
      icon: "🎯",
      color: "indigo-500",
      rarity: "common",
      dateEarned: new Date().toLocaleDateString('fr-FR')
    },
    {
      id: "badge-9",
      slug: "badge-9",
      name: "Passionné",
      description: "Votre passion pour la lecture est évidente.",
      icon: "❤️",
      color: "pink-500",
      rarity: "common",
      dateEarned: new Date().toLocaleDateString('fr-FR')
    },
    {
      id: "badge-10",
      slug: "badge-10",
      name: "Inspirant",
      description: "Vous inspirez les autres à lire davantage.",
      icon: "✨",
      color: "amber-500",
      rarity: "common",
      dateEarned: new Date().toLocaleDateString('fr-FR')
    }
  ] : [];

  // Mock all badges for rarity calculation
  const allBadges: Badge[] = [
    ...earnedBadges,
    // Add mock badges for rarity calculation
    ...Array.from({ length: 90 }, (_, i) => ({
      id: `mock-badge-${i}`,
      slug: `mock-badge-${i}`,
      name: `Badge ${i}`,
      description: `Description ${i}`,
      icon: "🏆",
      color: "gray-500",
      rarity: i < 10 ? "legendary" : i < 40 ? "epic" : i < 70 ? "rare" : "common"
    } as Badge))
  ];

  return (
    <div className="relative">
      {/* Effet d'arrière-plan décoratif avec les couleurs Reed */}
      <div className="absolute inset-0 bg-gradient-to-br from-reed-primary/10 to-reed-secondary/10 rounded-3xl blur-2xl" />
      
      <Card className="relative border-0 bg-white/70 backdrop-blur-md shadow-2xl rounded-3xl overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-reed-secondary/40 to-reed-light/40 border-b border-white/20">
          <CardTitle className="font-serif text-reed-darker flex items-center gap-3 text-lg sm:text-xl">
            <div className="p-2 bg-gradient-to-br from-reed-secondary to-reed-light rounded-xl flex-shrink-0">
              <Award className="h-5 w-5 sm:h-6 sm:w-6 text-reed-primary" />
            </div>
            <span className="flex-1 min-w-0">Badges Débloqués</span>
            <Sparkles className="h-4 w-4 sm:h-5 sm:w-5 text-reed-primary animate-pulse flex-shrink-0" />
          </CardTitle>
          <CardDescription className="text-reed-dark font-light">
            Vos accomplissements par ordre de rareté
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6 sm:p-8">
          <div className="space-y-6 sm:space-y-8">
            {/* Progression par rareté */}
            <BadgeRarityProgress 
              earnedBadges={earnedBadges} 
              allBadges={allBadges}
              className="mb-6"
            />
            
            {/* Grille des badges obtenus */}
            {earnedBadges.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 sm:gap-6">
                {earnedBadges.map((badge) => (
                  <div key={badge.id} className="group relative">
                    {/* Effet de lueur pour chaque badge */}
                    <div className="absolute inset-0 bg-gradient-to-br from-reed-primary/20 to-reed-secondary/20 rounded-2xl blur-xl transform group-hover:scale-105 transition-transform duration-500" />
                    
                    <div className="relative bg-white/80 backdrop-blur-sm border border-white/50 rounded-2xl p-4 sm:p-6 hover:shadow-2xl transition-all duration-500 group-hover:-translate-y-1 text-center">
                      <div className="text-3xl sm:text-4xl mb-3">{badge.icon}</div>
                      <h3 className="font-serif font-semibold text-reed-darker text-sm sm:text-base mb-2 break-words">
                        {badge.name}
                      </h3>
                      <p className="text-xs sm:text-sm text-reed-dark font-light leading-relaxed break-words">
                        {badge.description}
                      </p>
                      {badge.dateEarned && (
                        <p className="text-xs text-reed-medium mt-2 font-light">
                          Obtenu le {badge.dateEarned}
                        </p>
                      )}
                      
                      {/* Badge de rareté */}
                      <div className="absolute -top-2 -right-2">
                        <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                          badge.rarity === 'legendary' ? 'bg-amber-100 text-amber-800' :
                          badge.rarity === 'epic' ? 'bg-purple-100 text-purple-800' :
                          badge.rarity === 'rare' ? 'bg-blue-100 text-blue-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {badge.rarity === 'legendary' ? 'Lég.' :
                           badge.rarity === 'epic' ? 'Épic.' :
                           badge.rarity === 'rare' ? 'Rare' : 'Com.'}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="text-6xl mb-4 opacity-30">🏆</div>
                <h3 className="font-serif text-reed-darker text-xl mb-2">
                  Aucun badge débloqué
                </h3>
                <p className="text-reed-dark font-light">
                  Continuez à lire pour débloquer vos premiers badges !
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
