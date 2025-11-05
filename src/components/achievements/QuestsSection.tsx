
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { UserQuest, Quest } from "@/types/quest";
import { QuestCard } from "./QuestCard";
import { useTranslation } from "@/i18n/LanguageContext";
import { getUserQuests, fetchAvailableQuests, getQuestProgress } from "@/services/questService";
import { supabase } from "@/integrations/supabase/client";
import { Compass, Sparkles, Scroll, Star } from "lucide-react";

export function QuestsSection() {
  const { t } = useTranslation();
  const [unlockedQuests, setUnlockedQuests] = useState<UserQuest[]>([]);
  const [allQuests, setAllQuests] = useState<Quest[]>([]);
  const [questProgress, setQuestProgress] = useState<Record<string, { current: number; target: number } | null>>({});
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  const questsByCategory = {
    marathons: allQuests.filter(q => q.category === 'marathons'),
    vitesse: allQuests.filter(q => q.category === 'vitesse'),
    variete: allQuests.filter(q => q.category === 'variete'),
    regularite: allQuests.filter(q => q.category === 'regularite'),
    horaires: allQuests.filter(q => q.category === 'horaires'),
  };

  useEffect(() => {
    const fetchUserAndQuests = async () => {
      try {
        setLoading(true);

        // Récupérer l'utilisateur connecté
        const { data } = await supabase.auth.getUser();
        if (data?.user) {
          setUserId(data.user.id);

          // Récupérer TOUTES les quêtes disponibles
          const available = await fetchAvailableQuests();
          setAllQuests(available);

          // Récupérer les quêtes débloquées par l'utilisateur
          const userQuests = await getUserQuests(data.user.id);
          setUnlockedQuests(userQuests);

          // Calculer la progression pour les quêtes locked
          const progressMap: Record<string, { current: number; target: number } | null> = {};
          for (const quest of available) {
            // Seulement calculer pour les quêtes non débloquées
            const isUnlocked = userQuests.some(uq => uq.quest_slug === quest.slug);
            if (!isUnlocked) {
              const progress = await getQuestProgress(data.user.id, quest.slug);
              if (progress) {
                progressMap[quest.slug] = progress;
              }
            }
          }
          setQuestProgress(progressMap);
        }
      } catch (error) {
        console.error("Erreur lors du chargement des quêtes:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserAndQuests();
  }, []);

  return (
    <div className="relative">
      {/* Effet d'arrière-plan décoratif avec les couleurs Reed */}
      <div className="absolute inset-0 bg-gradient-to-br from-reed-primary/10 to-reed-secondary/10 rounded-3xl blur-2xl" />
      
      <Card className="relative border-0 bg-white/70 backdrop-blur-md shadow-2xl rounded-3xl overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-reed-secondary/40 to-reed-light/40 border-b border-white/20">
          <CardTitle className="font-serif text-reed-darker flex items-center gap-3 text-h4">
            <div className="p-2 bg-gradient-to-br from-reed-light to-white rounded-xl flex-shrink-0">
              <Scroll className="h-5 w-5 sm:h-6 sm:w-6 text-reed-primary" />
            </div>
            <span className="flex-1 min-w-0">{t.achievements.quests.title}</span>
            <Star className="h-4 w-4 sm:h-5 sm:w-5 text-reed-primary animate-pulse flex-shrink-0" />
          </CardTitle>
          <CardDescription className="text-reed-dark">
            {t.achievements.quests.subtitle}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6 sm:p-8">
          {loading ? (
            <div className="space-y-6">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-20 sm:h-24 bg-gradient-to-r from-reed-secondary/30 to-reed-light/30 animate-pulse rounded-2xl" />
              ))}
            </div>
          ) : (
            <div className="space-y-8">
              {/* Afficher les quêtes groupées par catégorie */}
              {Object.entries(questsByCategory).map(([categoryKey, quests]) => {
                if (quests.length === 0) return null;

                const catKey = categoryKey as keyof typeof t.achievements.quests.categories;
                const categoryInfo = t.achievements.quests.categories[catKey];

                return (
                  <div key={categoryKey} className="space-y-4">
                    <div className="flex items-center gap-3 pb-2 border-b-2 border-reed-primary/20">
                      <span className="text-2xl">{categoryInfo.icon}</span>
                      <div className="flex-1">
                        <h3 className="font-serif text-h5 text-reed-darker">
                          {categoryInfo.label}
                        </h3>
                        <p className="text-caption text-reed-medium">
                          {categoryInfo.desc} • {quests.length > 1 ? t.achievements.quests.questsCountPlural.replace('{count}', String(quests.length)) : t.achievements.quests.questsCount.replace('{count}', String(quests.length))}
                        </p>
                      </div>
                    </div>

                    {/* Quêtes de cette catégorie */}
                    <div className="space-y-4 pl-2">
                      {quests.map((quest) => {
                        const userQuest = unlockedQuests.find(uq => uq.quest_slug === quest.slug);
                        const progress = questProgress[quest.slug];

                        return (
                          <QuestCard
                            key={quest.slug}
                            quest={userQuest}
                            questInfo={quest}
                            isLocked={!userQuest}
                            progress={progress}
                          />
                        );
                      })}
                    </div>
                  </div>
                );
              })}

              {allQuests.length === 0 && (
                <div className="text-center py-12 sm:py-16">
                  <div className="flex justify-center mb-6">
                    <div className="relative">
                      <div className="absolute inset-0 bg-gradient-to-br from-reed-primary/20 to-reed-secondary/20 rounded-3xl blur-xl" />
                      <div className="relative p-6 bg-gradient-to-br from-reed-secondary/30 to-reed-light/30 rounded-3xl border border-white/30">
                        <Sparkles className="h-10 w-10 sm:h-12 sm:w-12 text-reed-primary" />
                      </div>
                    </div>
                  </div>
                  <h3 className="font-serif text-h4 text-reed-darker mb-3">{t.achievements.quests.empty}</h3>
                  <p className="text-reed-dark leading-relaxed px-4">
                    {t.achievements.quests.emptyDesc}
                  </p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
