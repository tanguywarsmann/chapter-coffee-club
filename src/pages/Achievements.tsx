
import { useNavigate } from "react-router-dom";
import { AppHeader } from "@/components/layout/AppHeader";
import { StreakStats } from "@/components/achievements/StreakStats";
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
      {/* Arrière-plan premium avec les couleurs Reed */}
      <div className="min-h-screen relative overflow-hidden">
        {/* Fond principal avec les couleurs Reed */}
        <div className="absolute inset-0 bg-gradient-to-br from-reed-light via-reed-secondary/30 to-reed-primary/20" />
        
        {/* Éléments décoratifs d'arrière-plan avec les couleurs Reed */}
        <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-reed-primary/15 to-transparent rounded-full blur-3xl transform -translate-x-48 -translate-y-48" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-tl from-reed-secondary/20 to-transparent rounded-full blur-3xl transform translate-x-48 translate-y-48" />
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-gradient-to-r from-reed-primary/10 to-reed-secondary/10 rounded-full blur-2xl transform -translate-x-32 -translate-y-32" />

        {/* Motif subtil en overlay */}
        <div className="absolute inset-0 opacity-[0.02]" style={{
          backgroundImage: `radial-gradient(circle at 20px 20px, ${`#AE6841`} 1px, transparent 0)`,
          backgroundSize: '40px 40px'
        }} />

        <AppHeader />
        
        <main className="relative z-10 container mx-auto px-4 py-8 sm:py-12 max-w-6xl">
          {/* En-tête avec design premium */}
          <div className="text-center mb-12 sm:mb-16 relative">
            {/* Badge décoratif d'arrière-plan */}
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-4">
              <div className="w-24 h-24 bg-gradient-to-br from-reed-primary/20 to-reed-secondary/20 rounded-full blur-xl" />
            </div>
            
            <div className="relative">
              {/* Couronne premium avec couleurs Reed */}
              <div className="flex justify-center mb-6">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-reed-primary to-reed-secondary rounded-full blur-sm opacity-40 scale-110" />
                  <div className="relative bg-gradient-to-br from-reed-secondary to-reed-light p-4 rounded-full border-2 border-reed-primary/30 shadow-xl">
                    <Crown className="h-8 w-8 sm:h-10 sm:w-10 text-reed-primary" />
                  </div>
                </div>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-light text-reed-darker mb-4 tracking-wide px-4">
                Vos <span className="font-medium bg-gradient-to-r from-reed-primary to-reed-dark bg-clip-text text-transparent">Accomplissements</span>
              </h1>
              
              <div className="flex items-center justify-center gap-2 mb-6">
                <div className="h-px w-12 sm:w-16 bg-gradient-to-r from-transparent to-reed-primary"></div>
                <Sparkles className="h-4 w-4 sm:h-5 sm:w-5 text-reed-primary" />
                <div className="h-px w-12 sm:w-16 bg-gradient-to-l from-transparent to-reed-primary"></div>
              </div>
              
              <p className="text-lg sm:text-xl text-reed-dark font-light max-w-3xl mx-auto leading-relaxed px-4">
                Célébrez votre parcours littéraire et découvrez vos prochains défis
              </p>
            </div>
          </div>

          {/* Statistiques principales avec style premium mobile-first */}
          <div className="mb-12 sm:mb-16">
            <StreakStats />
          </div>
          
          {/* Grille principale avec sections élégantes */}
          <div className="space-y-12 sm:space-y-16">
            {/* Cartes de statistiques */}
            <section>
              <div className="text-center mb-8 sm:mb-10">
                <div className="flex items-center justify-center gap-3 mb-4">
                  <div className="h-px w-8 sm:w-12 bg-gradient-to-r from-transparent to-reed-primary"></div>
                  <Star className="h-5 w-5 sm:h-6 sm:w-6 text-reed-primary" />
                  <h2 className="text-2xl sm:text-3xl font-serif font-light text-reed-darker px-2">
                    Vos Statistiques
                  </h2>
                  <Star className="h-5 w-5 sm:h-6 sm:w-6 text-reed-primary" />
                  <div className="h-px w-8 sm:w-12 bg-gradient-to-l from-transparent to-reed-primary"></div>
                </div>
                <p className="text-reed-dark font-light px-4">Votre progression en un coup d'œil</p>
              </div>
              <StatsCards />
            </section>

            {/* Badges et Quêtes avec titre sophistiqué */}
            <section>
              <div className="text-center mb-8 sm:mb-10">
                <div className="flex items-center justify-center gap-3 mb-4">
                  <div className="h-px w-8 sm:w-12 bg-gradient-to-r from-transparent to-reed-primary"></div>
                  <Award className="h-5 w-5 sm:h-6 sm:w-6 text-reed-primary" />
                  <h2 className="text-2xl sm:text-3xl font-serif font-light text-reed-darker px-2">
                    Collections & Exploits
                  </h2>
                  <Award className="h-5 w-5 sm:h-6 sm:w-6 text-reed-primary" />
                  <div className="h-px w-8 sm:w-12 bg-gradient-to-l from-transparent to-reed-primary"></div>
                </div>
                <p className="text-reed-dark font-light px-4">Vos récompenses et défis accomplis</p>
              </div>
              <div className="grid gap-6 sm:gap-8 lg:grid-cols-2">
                <BadgesSection />
                <QuestsSection />
              </div>
            </section>

            {/* Défis en cours */}
            <section>
              <div className="text-center mb-8 sm:mb-10">
                <div className="flex items-center justify-center gap-3 mb-4">
                  <div className="h-px w-8 sm:w-12 bg-gradient-to-r from-transparent to-reed-primary"></div>
                  <Sparkles className="h-5 w-5 sm:h-6 sm:w-6 text-reed-primary" />
                  <h2 className="text-2xl sm:text-3xl font-serif font-light text-reed-darker px-2">
                    Défis Actuels
                  </h2>
                  <Sparkles className="h-5 w-5 sm:h-6 sm:w-6 text-reed-primary" />
                  <div className="h-px w-8 sm:w-12 bg-gradient-to-l from-transparent to-reed-primary"></div>
                </div>
                <p className="text-reed-dark font-light px-4">Prochains objectifs à atteindre</p>
              </div>
              <ChallengesSection />
            </section>
          </div>

          {/* Boutons de test avec style intégré */}
          {process.env.NODE_ENV === 'development' && (
            <div className="mt-16 sm:mt-20 pt-8 sm:pt-12 border-t border-reed-primary/20">
              <div className="text-center">
                <div className="bg-white/40 backdrop-blur-sm rounded-2xl p-4 sm:p-6 border border-reed-primary/30 max-w-md mx-auto">
                  <p className="text-sm text-reed-dark mb-4 font-light italic">Outils de développement</p>
                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Button 
                      onClick={testAddBadge} 
                      variant="outline" 
                      size="sm" 
                      className="text-xs font-medium border-reed-primary/50 text-reed-dark hover:bg-reed-primary/20 backdrop-blur-sm">
                      Tester badge standard
                    </Button>
                    <Button 
                      onClick={testSpecificBadge} 
                      variant="outline" 
                      size="sm" 
                      className="text-xs font-medium border-reed-primary/50 text-reed-dark hover:bg-reed-primary/20 backdrop-blur-sm">
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
