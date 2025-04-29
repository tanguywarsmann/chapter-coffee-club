
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/types/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useEffect, useState } from "react";
import { getUserBadges } from "@/services/badgeService";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/contexts/AuthContext";

interface ProfileBadgesProps {
  badges?: Badge[];
}

export function ProfileBadges({ badges: propBadges }: ProfileBadgesProps) {
  const [badges, setBadges] = useState<Badge[]>(propBadges || []);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  
  useEffect(() => {
    if (!propBadges) {
      const fetchBadges = async () => {
        if (!user?.id) return;
        
        setLoading(true);
        try {
          // Récupérer les badges de l'utilisateur depuis Supabase
          const userBadges = await getUserBadges(user.id);
          setBadges(userBadges);
        } catch (error) {
          console.error("Erreur lors du chargement des badges:", error);
        } finally {
          setLoading(false);
        }
      };
      
      fetchBadges();
    }
  }, [propBadges, user?.id]);

  if (loading) {
    return (
      <Card className="border-coffee-light">
        <CardHeader>
          <CardTitle className="text-xl font-serif text-coffee-darker">Mes badges</CardTitle>
          <CardDescription>Chargement des badges...</CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[180px] pr-4">
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex flex-col items-center space-y-2">
                  <Skeleton className="w-16 h-16 rounded-full" />
                  <Skeleton className="w-16 h-3" />
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    );
  }

  if (!badges.length) {
    return (
      <Card className="border-coffee-light">
        <CardHeader>
          <CardTitle className="text-xl font-serif text-coffee-darker">Mes badges</CardTitle>
          <CardDescription>Complétez des livres pour gagner des badges</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center p-6 text-center space-y-3">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
              <span className="text-2xl text-muted-foreground">🏆</span>
            </div>
            <p className="text-muted-foreground">Vous n'avez pas encore de badges</p>
            <p className="text-xs text-muted-foreground">Continuez votre parcours de lecture pour en débloquer!</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-coffee-light">
      <CardHeader>
        <CardTitle className="text-xl font-serif text-coffee-darker">Mes badges</CardTitle>
        <CardDescription>Vos accomplissements de lecture</CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[180px] pr-4">
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4">
            {badges.map((badge) => (
              <TooltipProvider key={badge.id}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex flex-col items-center space-y-2">
                      <div className={`w-16 h-16 rounded-full bg-${badge.color} flex items-center justify-center shadow-sm`}>
                        <span className="text-2xl">{badge.icon}</span>
                      </div>
                      <span className="text-xs text-center font-medium text-coffee-dark line-clamp-1">
                        {badge.name}
                      </span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <div className="space-y-1 max-w-xs">
                      <p className="font-medium">{badge.name}</p>
                      <p className="text-xs text-muted-foreground">{badge.description}</p>
                      <p className="text-xs text-coffee-medium">Obtenu le {badge.dateEarned}</p>
                    </div>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
