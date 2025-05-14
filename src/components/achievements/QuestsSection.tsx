
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { UserQuest } from "@/types/quest";
import { QuestCard } from "./QuestCard";
import { getUserQuests } from "@/services/questService";
import { supabase } from "@/integrations/supabase/client";

export function QuestsSection() {
  const [quests, setQuests] = useState<UserQuest[]>([]);
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
          
          // Récupérer les quêtes de l'utilisateur
          const userQuests = await getUserQuests(data.user.id);
          setQuests(userQuests);
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
    <Card className="border-coffee-light">
      <CardHeader>
        <CardTitle className="text-xl font-serif text-coffee-darker">Quêtes débloquées</CardTitle>
        <CardDescription>
          Accomplissez des actions spéciales pour débloquer des quêtes
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-100 animate-pulse rounded-lg" />
            ))}
          </div>
        ) : quests.length > 0 ? (
          <div className="space-y-4">
            {quests.map((quest) => (
              <QuestCard key={quest.id} quest={quest} />
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <p>Aucune quête débloquée pour le moment</p>
            <p className="text-sm mt-2">Continuez à lire pour en découvrir !</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
