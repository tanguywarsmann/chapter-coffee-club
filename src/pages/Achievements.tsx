import { AppHeader } from "@/components/layout/AppHeader";
import { BadgesSection } from "@/components/achievements/BadgesSection";
import { QuestsSection } from "@/components/achievements/QuestsSection";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { useAuth } from "@/contexts/AuthContext";
import { useTranslation } from "@/i18n/LanguageContext";
import { useUserStats } from "@/hooks/useUserStats";
import { LevelCard } from "@/components/achievements/LevelCard";
import { UserStats } from "@/services/reading/statsService";
import { Loader2 } from "lucide-react";

export default function Achievements() {
  const { user } = useAuth();
  const { t } = useTranslation();
  const { data: stats, isLoading } = useUserStats(user?.id || "");

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
        <div className="min-h-screen bg-background">
          <AppHeader />

          <main className="max-w-6xl mx-auto px-4 py-8 md:py-12 space-y-8">
            <div className="mb-8">
              <h1 className="text-3xl md:text-4xl font-serif font-bold text-coffee-darker mb-2" style={{ hyphens: 'none', wordBreak: 'normal', whiteSpace: 'nowrap' }}>
                {t.achievements.title}
              </h1>
              <p className="text-body text-reed-dark">
                {t.achievements.subtitle}
              </p>
            </div>

            <div className="flex items-center justify-center min-h-[400px]">
              <Loader2 className="h-8 w-8 animate-spin text-reed-primary" />
            </div>
          </main>
        </div>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard>
      <div className="min-h-screen bg-background">
        <AppHeader />

        <main className="max-w-6xl mx-auto px-4 py-8 md:py-12 space-y-8">
          <div className="mb-10 sm:mb-12">
            <h1 className="text-3xl md:text-4xl font-serif font-bold text-coffee-darker mb-2" style={{ hyphens: 'none', wordBreak: 'normal', whiteSpace: 'nowrap' }}>
              {t.achievements.title}
            </h1>
            <p className="text-body sm:text-lg text-reed-dark">
              {t.achievements.subtitle}
            </p>
          </div>

          <div className="space-y-8">
            <LevelCard
              xp={safeStats.xp}
              level={safeStats.lvl}
            />

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {/* Books */}
              <div className="bg-white/80 backdrop-blur-sm border border-reed-primary/20 rounded-2xl p-4 text-center shadow-sm hover:shadow-md transition-shadow">
                <div className="text-h2 mb-1">📚</div>
                <div className="text-h3 font-serif text-reed-darker">{safeStats.booksRead}</div>
                <div className="text-caption text-reed-dark">{t.achievements.stats.booksRead}</div>
              </div>

              {/* Pages */}
              <div className="bg-white/80 backdrop-blur-sm border border-reed-primary/20 rounded-2xl p-4 text-center shadow-sm hover:shadow-md transition-shadow">
                <div className="text-h2 mb-1">📄</div>
                <div className="text-h3 font-serif text-reed-darker">{safeStats.pagesRead}</div>
                <div className="text-caption text-reed-dark">{t.achievements.stats.pagesRead}</div>
              </div>

              {/* Streak */}
              <div className="bg-white/80 backdrop-blur-sm border border-reed-primary/20 rounded-2xl p-4 text-center shadow-sm hover:shadow-md transition-shadow">
                <div className="text-h2 mb-1">🔥</div>
                <div className="text-h3 font-serif text-reed-darker">{safeStats.streakCurrent}</div>
                <div className="text-caption text-reed-dark">
                  {t.achievements.stats.currentStreak}
                  {safeStats.streakBest > 0 && (
                    <span className="block text-caption text-reed-medium mt-1">
                      {t.achievements.stats.record.replace('{count}', String(safeStats.streakBest))}
                    </span>
                  )}
                </div>
              </div>

              {/* Badges */}
              <div className="bg-white/80 backdrop-blur-sm border border-reed-primary/20 rounded-2xl p-4 text-center shadow-sm hover:shadow-md transition-shadow">
                <div className="text-h2 mb-1">🏆</div>
                <div className="text-h3 font-serif text-reed-darker">{safeStats.badgesCount}</div>
                <div className="text-caption text-reed-dark">{t.achievements.stats.badges}</div>
              </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              <BadgesSection />
              <QuestsSection />
            </div>
          </div>
        </main>
      </div>
    </AuthGuard>
  );
}
