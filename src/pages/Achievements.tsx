
import { useNavigate } from "react-router-dom";
import { AppHeader } from "@/components/layout/AppHeader";
import { StreakStats } from "@/components/achievements/StreakStats";
import { StatsCards } from "@/components/achievements/StatsCards";
import { BadgesSection } from "@/components/achievements/BadgesSection";
import { ChallengesSection } from "@/components/achievements/ChallengesSection";
import { QuestsSection } from "@/components/achievements/QuestsSection";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { useAuth } from "@/contexts/AuthContext";
import { useUserStats } from "@/hooks/useUserStats";
import { SkeletonCards } from "@/components/achievements/SkeletonCards";
import { LevelCard } from "@/components/achievements/LevelCard";
import { UserStats } from "@/services/reading/statsService";
import { Button } from "@/components/ui/button";
import { Award, Crown, Star, Sparkles } from "lucide-react";

export default function Achievements() {
  const { user } = useAuth();
  const { data: stats, isLoading } = useUserStats(user?.id || "");
  
  // Type-safe stats access
  const safeStats: UserStats = stats || {
    booksRead: 0,
    pagesRead: 0,
    badgesCount: 0,
    streakCurrent: 0,
    streakBest: 0,
    questsDone: 0,
    xp: 0,
    lvl: 1,
  };

  if (isLoading) {
    return (
      <AuthGuard>
        <div className="min-h-screen relative overflow-hidden">
          {/* ... keep existing background styling ... */}
          <div className="absolute inset-0 bg-gradient-to-br from-reed-light via-reed-secondary/30 to-reed-primary/20" />
          <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-reed-primary/15 to-transparent rounded-full blur-3xl transform -translate-x-48 -translate-y-48" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-tl from-reed-secondary/20 to-transparent rounded-full blur-3xl transform translate-x-48 translate-y-48" />
          <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-gradient-to-r from-reed-primary/10 to-reed-secondary/10 rounded-full blur-2xl transform -translate-x-32 -translate-y-32" />
          <div className="absolute inset-0 opacity-[0.02]" style={{
            backgroundImage: `radial-gradient(circle at 20px 20px, #AE6841 1px, transparent 0)`,
            backgroundSize: '40px 40px'
          }} />

          <AppHeader />
          
          <main className="relative z-10 mx-auto w-full px-4 max-w-none py-8 sm:py-12">
            <div className="text-center mb-12 sm:mb-16 relative">
              {/* ... keep existing header styling ... */}
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-4">
                <div className="w-24 h-24 bg-gradient-to-br from-reed-primary/20 to-reed-secondary/20 rounded-full blur-xl" />
              </div>
              
              <div className="relative">
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
                
                <p className="text-lg sm:text-xl text-reed-dark font-light max-w-none mx-auto leading-relaxed px-4">
                  Célébrez votre parcours littéraire et découvrez vos prochains défis
                </p>
              </div>
            </div>

            <SkeletonCards />
          </main>
        </div>
      </AuthGuard>
    );
  }

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
        
         <main className="relative z-10 mx-auto w-full px-4 max-w-none py-8 sm:py-12">
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
              
              <p className="text-lg sm:text-xl text-reed-dark font-light max-w-none mx-auto leading-relaxed px-4">
                Célébrez votre parcours littéraire et découvrez vos prochains défis
              </p>
            </div>
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
              <StatsCards 
                booksRead={safeStats.booksRead}
                pagesRead={safeStats.pagesRead}
                badges={safeStats.badgesCount}
                quests={safeStats.questsDone}
              />
            </section>

            {/* Statistiques de séries */}
            <section>
              <div className="text-center mb-8 sm:mb-10">
                <div className="flex items-center justify-center gap-3 mb-4">
                  <div className="h-px w-8 sm:w-12 bg-gradient-to-r from-transparent to-reed-primary"></div>
                  <Sparkles className="h-5 w-5 sm:h-6 sm:w-6 text-reed-primary" />
                  <h2 className="text-2xl sm:text-3xl font-serif font-light text-reed-darker px-2">
                    Séries de Lecture
                  </h2>
                  <Sparkles className="h-5 w-5 sm:h-6 sm:w-6 text-reed-primary" />
                  <div className="h-px w-8 sm:w-12 bg-gradient-to-l from-transparent to-reed-primary"></div>
                </div>
                <p className="text-reed-dark font-light px-4">Votre régularité et vos records</p>
              </div>
              <StreakStats 
                current={safeStats.streakCurrent}
                best={safeStats.streakBest}
              />
            </section>

            {/* Niveau et XP */}
            <section>
              <div className="text-center mb-8 sm:mb-10">
                <div className="flex items-center justify-center gap-3 mb-4">
                  <div className="h-px w-8 sm:w-12 bg-gradient-to-r from-transparent to-reed-primary"></div>
                  <Star className="h-5 w-5 sm:h-6 sm:w-6 text-reed-primary" />
                  <h2 className="text-2xl sm:text-3xl font-serif font-light text-reed-darker px-2">
                    Progression
                  </h2>
                  <Star className="h-5 w-5 sm:h-6 sm:w-6 text-reed-primary" />
                  <div className="h-px w-8 sm:w-12 bg-gradient-to-l from-transparent to-reed-primary"></div>
                </div>
                <p className="text-reed-dark font-light px-4">Votre niveau et votre expérience</p>
              </div>
              <LevelCard 
                xp={safeStats.xp}
                level={safeStats.lvl}
              />
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

        </main>
      </div>
    </AuthGuard>
  );
}
