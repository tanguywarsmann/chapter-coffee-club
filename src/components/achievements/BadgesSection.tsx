
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BadgeGrid } from "./BadgeGrid";
import { getUserBadges, availableBadges, resetAllBadges } from "@/services/badgeService";
import { Badge } from "@/types/badge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";

export function BadgesSection() {
  const [badges, setBadges] = useState<Badge[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const userId = user?.id;
  
  // Les badges non débloqués sont maintenant dérivés de availableBadges
  const [lockedBadges, setLockedBadges] = useState<Omit<Badge, "dateEarned">[]>([]);
  
  useEffect(() => {
    const fetchBadges = async () => {
      if (!userId) return;
      
      setLoading(true);
      try {
        // Récupérer les badges débloqués depuis Supabase
        const userBadges = await getUserBadges(userId);
        setBadges(userBadges);
        
        // Déterminer les badges verrouillés en filtrant les badges disponibles
        // pour exclure ceux déjà obtenus
        const unlockedBadgeIds = new Set(userBadges.map(badge => badge.id));
        const notUnlockedBadges = availableBadges.filter(
          badge => !unlockedBadgeIds.has(badge.id)
        );
        setLockedBadges(notUnlockedBadges);
      } catch (error) {
        console.error("Erreur lors du chargement des badges:", error);
        toast.error("Impossible de charger vos badges");
      } finally {
        setLoading(false);
      }
    };
    
    fetchBadges();
  }, [userId]);

  // Fonction de développement pour réinitialiser tous les badges
  const handleResetBadges = async () => {
    if (process.env.NODE_ENV === 'development' && userId) {
      const confirmed = window.confirm("Êtes-vous sûr de vouloir supprimer tous vos badges ? Cette action est irréversible.");
      
      if (confirmed) {
        const success = await resetAllBadges(userId);
        if (success) {
          setBadges([]);
          setLockedBadges(availableBadges);
        }
      }
    }
  };

  return (
    <Card className="border-coffee-light">
      <CardHeader>
        <CardTitle className="text-xl font-serif text-coffee-darker">Badges</CardTitle>
        <CardDescription>Collectionnez des badges en relevant des défis de lecture</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-6">
            <Skeleton className="h-12 w-48" />
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex flex-col items-center space-y-3">
                  <Skeleton className="h-24 w-24 rounded-full" />
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-3 w-32" />
                </div>
              ))}
            </div>
          </div>
        ) : (
          <Tabs defaultValue="earned">
            <TabsList className="mb-6 bg-muted border-coffee-light">
              <TabsTrigger value="earned" className="data-[state=active]:bg-coffee-dark data-[state=active]:text-white">
                Badges obtenus ({badges.length})
              </TabsTrigger>
              <TabsTrigger value="locked" className="data-[state=active]:bg-coffee-dark data-[state=active]:text-white">
                À débloquer ({lockedBadges.length})
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="earned">
              {badges.length > 0 ? (
                <BadgeGrid badges={badges} />
              ) : (
                <div className="text-center py-8">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
                    <span className="text-2xl">🏆</span>
                  </div>
                  <p className="text-muted-foreground">Vous n'avez pas encore obtenu de badges.</p>
                  <p className="text-sm text-muted-foreground mt-2">Continuez votre parcours de lecture pour en débloquer !</p>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="locked">
              <BadgeGrid badges={lockedBadges} isLocked />
            </TabsContent>
          </Tabs>
        )}
        
        {process.env.NODE_ENV === 'development' && (
          <div className="mt-8 pt-4 border-t border-muted">
            <p className="text-xs text-muted-foreground mb-2">Options de développement :</p>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleResetBadges} 
              className="text-xs">
              Réinitialiser tous les badges
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
