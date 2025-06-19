
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { UserQuest } from "@/types/quest";
import { QuestCard } from "./QuestCard";
import { getUserQuests } from "@/services/questService";
import { supabase } from "@/integrations/supabase/client";
import { Compass, Sparkles } from "lucide-react";

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
    <Card className="border-coffee-light/30 bg-white/80 backdrop-blur-sm shadow-sm">
      <CardHeader>
        <CardTitle className="font-serif text-coffee-darker flex items-center gap-2">
          <Compass className="h-5 w-5 text-coffee-dark" />
          Quêtes Accomplies
        </CardTitle>
        <CardDescription className="text-coffee-medium">
          Exploits spéciaux déverrouillés par vos actions
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-20 bg-coffee-light/30 animate-pulse rounded-xl" />
            ))}
          </div>
        ) : quests.length > 0 ? (
          <div className="space-y-4">
            {quests.map((quest) => (
              <QuestCard key={quest.id} quest={quest} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="flex justify-center mb-4">
              <div className="p-4 bg-gradient-to-br from-coffee-light to-chocolate-light rounded-2xl">
                <Sparkles className="h-8 w-8 text-coffee-dark" />
              </div>
            </div>
            <p className="font-serif text-coffee-darker mb-2">Aucune quête accomplie</p>
            <p className="text-sm text-coffee-medium font-light">
              Continuez à lire pour débloquer vos premières quêtes
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
