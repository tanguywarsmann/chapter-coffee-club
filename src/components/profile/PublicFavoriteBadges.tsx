
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/types/badge";
import { BadgeCard } from "@/components/achievements/BadgeCard";
import { Skeleton } from "@/components/ui/skeleton";
import { getUserFavoriteBadges } from "@/services/user/favoriteBadgesService";

interface PublicFavoriteBadgesProps {
  userId: string;
}

export function PublicFavoriteBadges({ userId }: PublicFavoriteBadgesProps) {
  const [badges, setBadges] = useState<Badge[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBadges = async () => {
      setLoading(true);
      try {
        const favBadges = await getUserFavoriteBadges(userId);
        setBadges(favBadges);
      } catch (error) {
        console.error("Erreur lors du chargement des badges favoris:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBadges();
  }, [userId]);

  if (loading) {
    return (
      <Card className="border-coffee-light">
        <CardHeader>
          <CardTitle className="text-xl font-serif text-coffee-darker">Badges favoris</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap justify-center gap-6 p-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex flex-col items-center space-y-2">
                <Skeleton className="w-16 h-16 rounded-full" />
                <Skeleton className="w-16 h-3" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (badges.length === 0) {
    return (
      <Card className="border-coffee-light">
        <CardHeader>
          <CardTitle className="text-xl font-serif text-coffee-darker">Badges favoris</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center p-6 text-center space-y-2">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
              <span className="text-2xl text-muted-foreground">🏆</span>
            </div>
            <p className="text-muted-foreground">Aucun badge favori</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-coffee-light">
      <CardHeader>
        <CardTitle className="text-xl font-serif text-coffee-darker">Badges favoris</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap justify-center gap-6 p-2">
          {badges.map((badge) => (
            <BadgeCard 
              key={badge.id} 
              badge={badge} 
              isFavorite={true}
              isReadOnly={true}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
