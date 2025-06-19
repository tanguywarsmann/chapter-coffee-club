
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { UserQuest } from "@/types/quest";
import { QuestCard } from "./QuestCard";
import { getUserQuests } from "@/services/questService";
import { supabase } from "@/integrations/supabase/client";
import { Compass, Sparkles, Scroll, Star } from "lucide-react";

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
    <div className="relative">
      {/* Effet d'arrière-plan décoratif */}
      <div className="absolute inset-0 bg-gradient-to-br from-coffee-light/10 to-chocolate-light/10 rounded-3xl blur-2xl" />
      
      <Card className="relative border-0 bg-white/60 backdrop-blur-md shadow-2xl rounded-3xl overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-coffee-lightest/50 to-chocolate-lightest/50 border-b border-white/20">
          <CardTitle className="font-serif text-coffee-darker flex items-center gap-3 text-xl">
            <div className="p-2 bg-gradient-to-br from-purple-100 to-indigo-100 rounded-xl">
              <Scroll className="h-6 w-6 text-purple-600" />
            </div>
            Quêtes Accomplies
            <Star className="h-5 w-5 text-coffee-medium animate-pulse" />
          </CardTitle>
          <CardDescription className="text-coffee-medium font-light">
            Exploits spéciaux déverrouillés par vos actions
          </CardDescription>
        </CardHeader>
        <CardContent className="p-8">
          {loading ? (
            <div className="space-y-6">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-24 bg-gradient-to-r from-coffee-lightest/30 to-chocolate-lightest/30 animate-pulse rounded-2xl" />
              ))}
            </div>
          ) : quests.length > 0 ? (
            <div className="space-y-6">
              {quests.map((quest) => (
                <QuestCard key={quest.id} quest={quest} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="flex justify-center mb-6">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-coffee-medium/20 to-chocolate-medium/20 rounded-3xl blur-xl" />
                  <div className="relative p-6 bg-gradient-to-br from-coffee-light/30 to-chocolate-light/30 rounded-3xl border border-white/30">
                    <Sparkles className="h-12 w-12 text-coffee-dark" />
                  </div>
                </div>
              </div>
              <h3 className="font-serif text-xl text-coffee-darker mb-3">Aucune quête accomplie</h3>
              <p className="text-coffee-medium font-light leading-relaxed">
                Continuez à lire pour débloquer vos premières quêtes<br />
                et découvrir des récompenses exceptionnelles
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
