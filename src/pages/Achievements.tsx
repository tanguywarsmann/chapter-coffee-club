
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AppHeader } from "@/components/layout/AppHeader";
import { StreakStats } from "@/components/achievements/StreakStats";
import { StreakCard } from "@/components/achievements/StreakCard";
import { StatsCards } from "@/components/achievements/StatsCards";
import { BadgesSection } from "@/components/achievements/BadgesSection";
import { ChallengesSection } from "@/components/achievements/ChallengesSection";
import { getUserStreak } from "@/services/streakService";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { checkBadgesForUser } from "@/services/badgeService";
import { useAuth } from "@/contexts/AuthContext";

export default function Achievements() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const userId = user?.id || localStorage.getItem("user") || "user123";
  const streak = getUserStreak(userId);

  useEffect(() => {
    // Vérifier les badges au chargement de la page
    if (userId) {
      checkBadgesForUser(userId);
    }
  }, [userId]);

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
        </main>
      </div>
    </AuthGuard>
  );
}
