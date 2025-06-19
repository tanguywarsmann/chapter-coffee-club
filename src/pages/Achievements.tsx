
import { useNavigate } from "react-router-dom";
import { AppHeader } from "@/components/layout/AppHeader";
import { StreakStats } from "@/components/achievements/StreakStats";
import { StreakCard } from "@/components/achievements/StreakCard";
import { StatsCards } from "@/components/achievements/StatsCards";
import { BadgesSection } from "@/components/achievements/BadgesSection";
import { ChallengesSection } from "@/components/achievements/ChallengesSection";
import { QuestsSection } from "@/components/achievements/QuestsSection";
import { getUserStreak } from "@/services/streakService";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useState } from "react";
import { unlockBadge, getUserBadges } from "@/services/badgeService";
import { Button } from "@/components/ui/button";
import { Award, Crown, Star, Sparkles } from "lucide-react";

export default function Achievements() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const userId = user?.id || "";
  const streak = getUserStreak(userId);
  const [badgeCount, setBadgeCount] = useState(0);

  // Récupérer le nombre de badges pour synchroniser l'affichage
  useEffect(() => {
    if (userId) {
      const fetchBadgeCount = async () => {
        try {
          const badges = await getUserBadges(userId);
          setBadgeCount(badges.length);
        } catch (error) {
          console.error("Erreur lors de la récupération du nombre de badges:", error);
        }
      };
      
      fetchBadgeCount();
    }
  }, [userId]);

  // Fonction pour tester l'ajout d'un badge en mode développement
  const testAddBadge = async () => {
    if (userId && process.env.NODE_ENV === 'development') {
      const success = await unlockBadge(userId, "premier-livre");
      if (success) {
        // Refresh badge count after adding a badge
        const badges = await getUserBadges(userId);
        setBadgeCount(badges.length);
      }
    }
  };

  // Fonction pour tester l'ajout du badge spécifique demandé
  const testSpecificBadge = async () => {
    if (userId && process.env.NODE_ENV === 'development') {
      const success = await unlockBadge(userId, "badge_test_insertion");
      if (success) {
        console.log("Badge test_insertion ajouté avec succès");
        // Refresh badge count after adding a badge
        const badges = await getUserBadges(userId);
        setBadgeCount(badges.length);
      }
    }
  };

  return (
    <AuthGuard>
      {/* Arrière-plan premium avec dégradés sophistiqués */}
      <div className="min-h-screen relative overflow-hidden">
        {/* Fond principal avec texture */}
        <div className="absolute inset-0 bg-gradient-to-br from-coffee-lightest via-chocolate-light/20 to-coffee-light/40" />
        
        {/* Éléments décoratifs d'arrière-plan */}
        <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-coffee-medium/10 to-transparent rounded-full blur-3xl transform -translate-x-48 -translate-y-48" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-tl from-chocolate-medium/10 to-transparent rounded-full blur-3xl transform translate-x-48 translate-y-48" />
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-gradient-to-r from-coffee-light/5 to-chocolate-light/5 rounded-full blur-2xl transform -translate-x-32 -translate-y-32" />

        {/* Motif subtil en overlay */}
        <div className="absolute inset-0 opacity-[0.02]" style={{
          backgroundImage: `radial-gradient(circle at 20px 20px, #8B4513 1px, transparent 0)`,
          backgroundSize: '40px 40px'
        }} />

        <AppHeader />
        
        <main className="relative z-10 container mx-auto px-4 py-12 max-w-6xl">
          {/* En-tête avec design premium */}
          <div className="text-center mb-16 relative">
            {/* Badge décoratif d'arrière-plan */}
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-4">
              <div className="w-24 h-24 bg-gradient-to-br from-coffee-dark/10 to-chocolate-dark/10 rounded-full blur-xl" />
            </div>
            
            <div className="relative">
              {/* Couronne premium */}
              <div className="flex justify-center mb-6">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-amber-400 to-yellow-500 rounded-full blur-sm opacity-30 scale-110" />
                  <div className="relative bg-gradient-to-br from-amber-100 to-yellow-100 p-4 rounded-full border-2 border-amber-300/50 shadow-xl">
                    <Crown className="h-10 w-10 text-amber-600" />
                  </div>
                </div>
              </div>

              <h1 className="text-5xl font-serif font-light text-coffee-darker mb-4 tracking-wide">
                Vos <span className="font-medium bg-gradient-to-r from-coffee-dark to-chocolate-dark bg-clip-text text-transparent">Accomplissements</span>
              </h1>
              
              <div className="flex items-center justify-center gap-2 mb-6">
                <div className="h-px w-16 bg-gradient-to-r from-transparent to-coffee-light"></div>
                <Sparkles className="h-5 w-5 text-coffee-medium" />
                <div className="h-px w-16 bg-gradient-to-l from-transparent to-coffee-light"></div>
              </div>
              
              <p className="text-xl text-coffee-medium font-light max-w-3xl mx-auto leading-relaxed">
                Célébrez votre parcours littéraire et découvrez vos prochains défis
              </p>
            </div>
          </div>

          {/* Statistiques principales avec style premium */}
          <div className="mb-16">
            <StreakStats />
          </div>

          {/* Section centrale avec la carte de série */}
          <div className="mb-16">
            <StreakCard 
              currentStreak={streak.current_streak} 
              longestStreak={streak.longest_streak} 
            />
          </div>
          
          {/* Grille principale avec sections élégantes */}
          <div className="space-y-16">
            {/* Cartes de statistiques */}
            <section>
              <div className="text-center mb-10">
                <div className="flex items-center justify-center gap-3 mb-4">
                  <div className="h-px w-12 bg-gradient-to-r from-transparent to-coffee-medium"></div>
                  <Star className="h-6 w-6 text-coffee-dark" />
                  <h2 className="text-3xl font-serif font-light text-coffee-darker">
                    Vos Statistiques
                  </h2>
                  <Star className="h-6 w-6 text-coffee-dark" />
                  <div className="h-px w-12 bg-gradient-to-l from-transparent to-coffee-medium"></div>
                </div>
                <p className="text-coffee-medium font-light">Votre progression en un coup d'œil</p>
              </div>
              <StatsCards />
            </section>

            {/* Badges et Quêtes avec titre sophistiqué */}
            <section>
              <div className="text-center mb-10">
                <div className="flex items-center justify-center gap-3 mb-4">
                  <div className="h-px w-12 bg-gradient-to-r from-transparent to-coffee-medium"></div>
                  <Award className="h-6 w-6 text-coffee-dark" />
                  <h2 className="text-3xl font-serif font-light text-coffee-darker">
                    Collections & Exploits
                  </h2>
                  <Award className="h-6 w-6 text-coffee-dark" />
                  <div className="h-px w-12 bg-gradient-to-l from-transparent to-coffee-medium"></div>
                </div>
                <p className="text-coffee-medium font-light">Vos récompenses et défis accomplis</p>
              </div>
              <div className="grid gap-8 lg:grid-cols-2">
                <BadgesSection />
                <QuestsSection />
              </div>
            </section>

            {/* Défis en cours */}
            <section>
              <div className="text-center mb-10">
                <div className="flex items-center justify-center gap-3 mb-4">
                  <div className="h-px w-12 bg-gradient-to-r from-transparent to-coffee-medium"></div>
                  <Sparkles className="h-6 w-6 text-coffee-dark" />
                  <h2 className="text-3xl font-serif font-light text-coffee-darker">
                    Défis Actuels
                  </h2>
                  <Sparkles className="h-6 w-6 text-coffee-dark" />
                  <div className="h-px w-12 bg-gradient-to-l from-transparent to-coffee-medium"></div>
                </div>
                <p className="text-coffee-medium font-light">Prochains objectifs à atteindre</p>
              </div>
              <ChallengesSection />
            </section>
          </div>

          {/* Boutons de test avec style intégré */}
          {process.env.NODE_ENV === 'development' && (
            <div className="mt-20 pt-12 border-t border-coffee-light/20">
              <div className="text-center">
                <div className="bg-white/40 backdrop-blur-sm rounded-2xl p-6 border border-coffee-light/30">
                  <p className="text-sm text-coffee-medium mb-4 font-light italic">Outils de développement</p>
                  <div className="flex gap-3 justify-center">
                    <Button 
                      onClick={testAddBadge} 
                      variant="outline" 
                      size="sm" 
                      className="text-xs font-medium border-coffee-light/50 text-coffee-dark hover:bg-coffee-light/30 backdrop-blur-sm">
                      Tester badge standard
                    </Button>
                    <Button 
                      onClick={testSpecificBadge} 
                      variant="outline" 
                      size="sm" 
                      className="text-xs font-medium border-coffee-light/50 text-coffee-dark hover:bg-coffee-light/30 backdrop-blur-sm">
                      Tester badge spécifique
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </AuthGuard>
  );
}
