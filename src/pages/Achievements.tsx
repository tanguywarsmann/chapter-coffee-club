
import { useNavigate } from "react-router-dom";
import { AppHeader } from "@/components/layout/AppHeader";
import { StreakStats } from "@/components/achievements/StreakStats";
import { StreakCard } from "@/components/achievements/StreakCard";
import { StatsCards } from "@/components/achievements/StatsCards";
import { BadgesSection } from "@/components/achievements/BadgesSection";
import { ChallengesSection } from "@/components/achievements/ChallengesSection";
import { getUserStreak } from "@/services/streakService";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useState } from "react";
import { unlockBadge, getUserBadges } from "@/services/badgeService";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

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
      <div className="min-h-screen bg-background">
        <AppHeader />
        <main className="container py-6 space-y-8">
          <h1 className="text-3xl font-serif font-medium text-coffee-darker">Récompenses et défis</h1>

          {/* Section streaks dynamiques & record */}
          <StreakStats />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2">
              <StreakCard 
                currentStreak={streak.current_streak} 
                longestStreak={streak.longest_streak} 
              />
            </div>
            <div className="md:col-span-1" />
          </div>
          
          <StatsCards />
          <BadgesSection />
          <ChallengesSection />

          {/* Boutons de test visibles uniquement en mode développement */}
          {process.env.NODE_ENV === 'development' && (
            <div className="border-t pt-4 mt-8 border-gray-100">
              <p className="text-sm text-muted-foreground mb-2">Outils de développement :</p>
              <Button 
                onClick={testAddBadge} 
                variant="outline" 
                size="sm" 
                className="text-xs mr-2">
                Tester l'ajout d'un badge
              </Button>
              <Button 
                onClick={testSpecificBadge} 
                variant="outline" 
                size="sm" 
                className="text-xs">
                Tester badge_test_insertion
              </Button>
            </div>
          )}
        </main>
      </div>
    </AuthGuard>
  );
}
