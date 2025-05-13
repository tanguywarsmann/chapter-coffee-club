
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BadgeGrid } from "./BadgeGrid";
import { getUserBadges, availableBadges } from "@/services/badgeService";
import { Badge } from "@/types/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { BadgeRarityProgress } from "./BadgeRarityProgress";

// Classement des raretés du plus rare au plus commun
const rarityOrder = ["legendary", "epic", "rare", "common"];

function sortBadgesByRarity(badges: Badge[]) {
  return badges.sort((a, b) => 
    rarityOrder.indexOf(a.rarity || "common") - rarityOrder.indexOf(b.rarity || "common")
  );
}

function LoadingCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Mes badges</CardTitle>
        <CardDescription>Chargement en cours...</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-6 w-full" />
        <Skeleton className="h-6 w-1/2" />
      </CardContent>
    </Card>
  );
}

export function BadgesSection() {
  const [badges, setBadges] = useState<Badge[]>([]);
  const [lockedBadges, setLockedBadges] = useState<Badge[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const userId = user?.id;

  useEffect(() => {
    if (!userId) return;

    async function fetchBadges() {
      setLoading(true);
      try {
        const earned = await getUserBadges(userId);
        const all = await availableBadges();

        // Ensure all badges have dateEarned property (even if undefined)
        const earnedIds = new Set(earned.map((b) => b.id));
        const locked = all.filter((badge) => !earnedIds.has(badge.id))
          .map(badge => ({ ...badge, dateEarned: undefined }));

        setBadges(sortBadgesByRarity(earned));
        setLockedBadges(sortBadgesByRarity(locked));
      } catch (error) {
        toast.error("Erreur lors du chargement des badges");
      } finally {
        setLoading(false);
      }
    }

    fetchBadges();
  }, [userId]);

  if (loading) return <LoadingCard />;

  return (
    <Tabs defaultValue="unlocked" className="w-full">
      <TabsList className="grid w-full grid-cols-2 mb-2">
        <TabsTrigger value="unlocked">🎉 Gagnés</TabsTrigger>
        <TabsTrigger value="locked">🔒 À débloquer</TabsTrigger>
      </TabsList>
      <TabsContent value="unlocked">
        <Card className="shadow-md border border-green-100">
          <CardHeader>
            <CardTitle>Badges débloqués</CardTitle>
            <CardDescription>Triés par rareté décroissante</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <BadgeRarityProgress earnedBadges={badges} allBadges={[...badges, ...lockedBadges]} />
            <BadgeGrid badges={badges} isLocked={false} />
          </CardContent>
        </Card>
      </TabsContent>
      <TabsContent value="locked">
        <Card className="shadow-sm border border-gray-200">
          <CardHeader>
            <CardTitle>Objectifs à venir</CardTitle>
            <CardDescription>Voici ceux que tu peux encore débloquer</CardDescription>
          </CardHeader>
          <CardContent>
            <BadgeGrid badges={lockedBadges} isLocked={true} />
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
