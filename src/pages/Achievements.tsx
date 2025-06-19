
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
import { toast } from "sonner";
import { Award, TrendingUp } from "lucide-react";

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
      <div className="min-h-screen bg-gradient-to-br from-background via-coffee-lightest to-background">
        <AppHeader />
        <main className="container mx-auto px-4 py-8 max-w-6xl">
          {/* En-tête principal */}
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Award className="h-8 w-8 text-coffee-dark" />
              <h1 className="text-4xl font-serif font-medium text-coffee-darker">
                Vos Accomplissements
              </h1>
              <TrendingUp className="h-8 w-8 text-coffee-dark" />
            </div>
            <p className="text-lg text-coffee-medium font-light max-w-2xl mx-auto">
              Découvrez vos progrès, célébrez vos réussites et relevez de nouveaux défis
            </p>
          </div>

          {/* Statistiques principales */}
          <div className="mb-12">
            <StreakStats />
          </div>

          {/* Section centrale avec la carte de série */}
          <div className="mb-12">
            <StreakCard 
              currentStreak={streak.current_streak} 
              longestStreak={streak.longest_streak} 
            />
          </div>
          
          {/* Grille principale des sections */}
          <div className="space-y-12">
            {/* Cartes de statistiques */}
            <section>
              <h2 className="text-2xl font-serif font-medium text-coffee-darker mb-6 text-center">
                Vos Statistiques
              </h2>
              <StatsCards />
            </section>

            {/* Badges et Quêtes */}
            <section>
              <h2 className="text-2xl font-serif font-medium text-coffee-darker mb-6 text-center">
                Collections et Défis
              </h2>
              <div className="grid gap-8 lg:grid-cols-2">
                <BadgesSection />
                <QuestsSection />
              </div>
            </section>

            {/* Défis en cours */}
            <section>
              <h2 className="text-2xl font-serif font-medium text-coffee-darker mb-6 text-center">
                Défis Actuels
              </h2>
              <ChallengesSection />
            </section>
          </div>

          {/* Boutons de test visibles uniquement en mode développement */}
          {process.env.NODE_ENV === 'development' && (
            <div className="mt-16 pt-8 border-t border-coffee-light/30">
              <div className="text-center">
                <p className="text-sm text-coffee-medium mb-4 font-light">Outils de développement</p>
                <div className="flex gap-3 justify-center">
                  <Button 
                    onClick={testAddBadge} 
                    variant="outline" 
                    size="sm" 
                    className="text-xs font-medium border-coffee-light text-coffee-dark hover:bg-coffee-light">
                    Tester badge standard
                  </Button>
                  <Button 
                    onClick={testSpecificBadge} 
                    variant="outline" 
                    size="sm" 
                    className="text-xs font-medium border-coffee-light text-coffee-dark hover:bg-coffee-light">
                    Tester badge spécifique
                  </Button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </AuthGuard>
  );
}
