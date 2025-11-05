
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BadgeRarityProgress } from "./BadgeRarityProgress";
import { Badge } from "@/types/badge";
import { useAuth } from "@/contexts/AuthContext";
import { useTranslation } from "@/i18n/LanguageContext";
import { useUserBadges } from "@/hooks/useUserBadges";
import { fetchAvailableBadges } from "@/services/badgeService";
import { Award, Sparkles, Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

export function BadgesSection() {
  const { user } = useAuth();
  const { t } = useTranslation();
  const { data: earnedBadges = [], isLoading: isLoadingUserBadges } = useUserBadges(user?.id || '');
  const { data: allBadges = [], isLoading: isLoadingAllBadges } = useQuery({
    queryKey: ['all-badges'],
    queryFn: fetchAvailableBadges,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });

  const isLoading = isLoadingUserBadges || isLoadingAllBadges;

  // Show loading state
  if (isLoading) {
    return (
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-br from-reed-primary/10 to-reed-secondary/10 rounded-3xl blur-2xl" />

        <Card className="relative border-0 bg-white/70 backdrop-blur-md shadow-2xl rounded-3xl overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-reed-secondary/40 to-reed-light/40 border-b border-white/20">
            <CardTitle className="font-serif text-reed-darker flex items-center gap-3 text-h4">
              <div className="p-2 bg-gradient-to-br from-reed-secondary to-reed-light rounded-xl flex-shrink-0">
                <Award className="h-5 w-5 sm:h-6 sm:w-6 text-reed-primary" />
              </div>
              <span className="flex-1 min-w-0">{t.achievements.badges.title}</span>
              <Sparkles className="h-4 w-4 sm:h-5 sm:w-5 text-reed-primary animate-pulse flex-shrink-0" />
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 sm:p-8 flex items-center justify-center min-h-[200px]">
            <Loader2 className="h-8 w-8 animate-spin text-reed-primary" />
          </CardContent>
        </Card>
      </div>
    );
  }


  return (
    <div className="relative">
      <div className="absolute inset-0 bg-gradient-to-br from-reed-primary/10 to-reed-secondary/10 rounded-3xl blur-2xl" />

      <Card className="relative border-0 bg-white/70 backdrop-blur-md shadow-2xl rounded-3xl overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-reed-secondary/40 to-reed-light/40 border-b border-white/20">
          <CardTitle className="font-serif text-reed-darker flex items-center gap-3 text-h4">
            <div className="p-2 bg-gradient-to-br from-reed-secondary to-reed-light rounded-xl flex-shrink-0">
              <Award className="h-5 w-5 sm:h-6 sm:w-6 text-reed-primary" />
            </div>
            <span className="flex-1 min-w-0">{t.achievements.badges.title}</span>
            <Sparkles className="h-4 w-4 sm:h-5 sm:w-5 text-reed-primary animate-pulse flex-shrink-0" />
          </CardTitle>
          <CardDescription className="text-reed-dark">
            {t.achievements.badges.subtitle}
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
                      <div className="text-h2 mb-3">{badge.icon}</div>
                      <h3 className="font-serif font-semibold text-reed-darker text-body-sm sm:text-body mb-2 break-words">
                        {badge.label}
                      </h3>
                      <p className="text-caption sm:text-body-sm text-reed-dark leading-relaxed break-words">
                        {badge.description}
                      </p>
                      {badge.dateEarned && (
                        <p className="text-caption text-reed-medium mt-2">
                          {t.achievements.badges.earnedOn.replace('{date}', badge.dateEarned)}
                        </p>
                      )}

                      <div className="absolute -top-2 -right-2">
                        <div className={`px-2 py-1 rounded-full text-caption font-medium ${
                          badge.rarity === 'legendary' ? 'bg-amber-100 text-amber-800' :
                          badge.rarity === 'epic' ? 'bg-purple-100 text-purple-800' :
                          badge.rarity === 'rare' ? 'bg-blue-100 text-blue-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {badge.rarity === 'legendary' ? t.achievements.badges.rarity.legendary :
                           badge.rarity === 'epic' ? t.achievements.badges.rarity.epic :
                           badge.rarity === 'rare' ? t.achievements.badges.rarity.rare : t.achievements.badges.rarity.common}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="text-hero mb-4 opacity-30">🏆</div>
                <h3 className="font-serif text-reed-darker text-h4 mb-2">
                  {t.achievements.badges.empty}
                </h3>
                <p className="text-reed-dark">
                  {t.achievements.badges.emptyDesc}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
