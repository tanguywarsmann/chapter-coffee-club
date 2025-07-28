
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/types/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useEffect, useState } from "react";
import { getUserBadges } from "@/services/badgeService";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/contexts/AuthContext";
import { BadgeCard } from "@/components/achievements/BadgeCard";
import { getFavoriteBadges } from "@/services/user";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface ProfileBadgesProps {
  badges?: Badge[];
  userId?: string;
}

export function ProfileBadges({ badges: propBadges, userId: propUserId }: ProfileBadgesProps) {
  const [badges, setBadges] = useState<Badge[]>(propBadges || []);
  const [favoriteBadges, setFavoriteBadges] = useState<Badge[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const userId = propUserId || user?.id;
  const navigate = useNavigate();
  
  useEffect(() => {
    if (!userId) return;
    
    const fetchBadges = async () => {
      setLoading(true);
      try {
        // Get all user badges
        const userBadges = await getUserBadges(userId);
        setBadges(userBadges);
        
        // Get favorite badge IDs
        const favoriteBadgeIds = await getFavoriteBadges(userId);
        
        // Filter favorite badges from all badges
        const favorites = userBadges.filter(badge => 
          favoriteBadgeIds.includes(badge.id)
        );
        
        setFavoriteBadges(favorites);
      } catch (error) {
        console.error("Erreur lors du chargement des badges:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchBadges();
  }, [userId, propBadges]);

  const navigateToAchievements = () => {
    navigate('/achievements');
  };

  if (loading) {
    return (
      <Card className="border-coffee-light">
        <CardHeader>
          <CardTitle className="text-h3 font-serif text-coffee-darker">Mes badges</CardTitle>
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

  // Render for favorite badges
  if (favoriteBadges.length > 0) {
    return (
      <Card className="border-coffee-light">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-h3 font-serif text-coffee-darker">Mes badges favoris</CardTitle>
            <CardDescription>Les badges dont je suis le plus fier</CardDescription>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={navigateToAchievements}
            className="text-coffee-dark"
          >
            Voir tous
          </Button>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap justify-center gap-6 p-2">
            {favoriteBadges.map((badge) => (
              <BadgeCard 
                key={badge.id} 
                badge={badge} 
                isFavorite={true}
              />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Render for no favorite badges but has badges
  if (badges.length > 0) {
    return (
      <Card className="border-coffee-light">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-h3 font-serif text-coffee-darker">Mes badges favoris</CardTitle>
            <CardDescription>Sélectionne tes badges préférés dans la section Badges</CardDescription>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={navigateToAchievements}
            className="text-coffee-dark"
          >
            Choisir
          </Button>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center p-6 text-center space-y-3">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
              <span className="text-h3 text-muted-foreground">⭐</span>
            </div>
            <p className="text-muted-foreground">Tu n'as pas encore sélectionné de badge favori</p>
            <p className="text-caption text-muted-foreground">Choisis jusqu'à 3 badges pour les mettre en avant sur ton profil</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Default render for no badges at all
  return (
    <Card className="border-coffee-light">
      <CardHeader>
        <CardTitle className="text-h3 font-serif text-coffee-darker">Mes badges</CardTitle>
        <CardDescription>Complétez des livres pour gagner des badges</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center justify-center p-6 text-center space-y-3">
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
            <span className="text-h3 text-muted-foreground">🏆</span>
          </div>
          <p className="text-muted-foreground">Vous n'avez pas encore de badges</p>
          <p className="text-caption text-muted-foreground">Continuez votre parcours de lecture pour en débloquer!</p>
        </div>
      </CardContent>
    </Card>
  );
}
