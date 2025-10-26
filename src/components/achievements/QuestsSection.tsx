
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { UserQuest, Quest } from "@/types/quest";
import { QuestCard } from "./QuestCard";
import { getUserQuests, fetchAvailableQuests } from "@/services/questService";
import { supabase } from "@/integrations/supabase/client";
import { Compass, Sparkles, Scroll, Star } from "lucide-react";

export function QuestsSection() {
  const [unlockedQuests, setUnlockedQuests] = useState<UserQuest[]>([]);
  const [allQuests, setAllQuests] = useState<Quest[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

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
            <span className="flex-1 min-w-0">Quêtes Accomplies</span>
            <Star className="h-4 w-4 sm:h-5 sm:w-5 text-reed-primary animate-pulse flex-shrink-0" />
          </CardTitle>
          <CardDescription className="text-reed-dark">
            Exploits spéciaux déverrouillés par vos actions
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
            <div className="space-y-6">
              {/* Afficher toutes les quêtes (locked + unlocked) */}
              {allQuests.map((quest) => {
                // Trouver si cette quête est débloquée
                const userQuest = unlockedQuests.find(uq => uq.quest_slug === quest.slug);

                return (
                  <QuestCard
                    key={quest.slug}
                    quest={userQuest}
                    questInfo={quest}
                    isLocked={!userQuest}
                  />
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
                  <h3 className="font-serif text-h4 text-reed-darker mb-3">Aucune quête disponible</h3>
                  <p className="text-reed-dark leading-relaxed px-4">
                    Les quêtes seront bientôt disponibles
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
