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
import { getFavoriteBadges, toggleFavoriteBadge } from "@/services/user";
import { Award, Target, Sparkles, Crown } from "lucide-react";

// Classement des raretés du plus rare au plus commun
const rarityOrder = ["legendary", "epic", "rare", "common"];

function sortBadgesByRarity(badges: Badge[]) {
  return badges.sort((a, b) => 
    rarityOrder.indexOf(a.rarity) - rarityOrder.indexOf(b.rarity)
  );
}

function LoadingCard() {
  return (
    <Card className="border-coffee-light/30 bg-white/80 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="font-serif text-coffee-darker">Collection de Badges</CardTitle>
        <CardDescription className="text-coffee-medium">Chargement en cours...</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Skeleton className="h-6 w-3/4 bg-coffee-light/30" />
        <Skeleton className="h-6 w-full bg-coffee-light/30" />
        <Skeleton className="h-6 w-1/2 bg-coffee-light/30" />
      </CardContent>
    </Card>
  );
}

export function BadgesSection() {
  const [badges, setBadges] = useState<Badge[]>([]);
  const [lockedBadges, setLockedBadges] = useState<Badge[]>([]);
  const [loading, setLoading] = useState(true);
  const [favoriteBadgeIds, setFavoriteBadgeIds] = useState<string[]>([]);
  const { user } = useAuth();
  const userId = user?.id;

  // Load badges and favorite badges
  useEffect(() => {
    if (!userId) return;

    async function fetchBadges() {
      setLoading(true);
      try {
        const earned = await getUserBadges(userId);
        // Fix: availableBadges is an array, not a function
        const all = availableBadges;

        // Get favorite badges
        const favorites = await getFavoriteBadges(userId);
        setFavoriteBadgeIds(favorites);

        // Ensure all badges have dateEarned property (even if undefined)
        const earnedIds = new Set(earned.map((b) => b.id));
        const locked = all.filter((badge) => !earnedIds.has(badge.id));

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

  // Handle favorite toggle
  const handleFavoriteToggle = async (badgeId: string) => {
    if (!userId) return;
    
    const updatedFavorites = await toggleFavoriteBadge(
      userId,
      badgeId,
      favoriteBadgeIds
    );
    
    setFavoriteBadgeIds(updatedFavorites);
  };

  if (loading) return <LoadingCard />;

  return (
    <div className="relative">
      {/* Effet d'arrière-plan décoratif */}
      <div className="absolute inset-0 bg-gradient-to-br from-coffee-light/10 to-chocolate-light/10 rounded-3xl blur-2xl" />
      
      <Tabs defaultValue="unlocked" className="relative w-full">
        <TabsList className="grid w-full grid-cols-2 mb-8 bg-white/60 backdrop-blur-md border border-white/40 rounded-2xl p-1 shadow-lg">
          <TabsTrigger 
            value="unlocked" 
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-coffee-light data-[state=active]:to-chocolate-light data-[state=active]:text-coffee-darker font-serif font-medium text-coffee-medium rounded-xl transition-all duration-300"
          >
            <Crown className="h-5 w-5 mr-2" />
            Collection
          </TabsTrigger>
          <TabsTrigger 
            value="locked"
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-coffee-light data-[state=active]:to-chocolate-light data-[state=active]:text-coffee-darker font-serif font-medium text-coffee-medium rounded-xl transition-all duration-300"
          >
            <Target className="h-5 w-5 mr-2" />
            Objectifs
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="unlocked">
          <Card className="border-0 bg-white/60 backdrop-blur-md shadow-2xl rounded-3xl overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-coffee-lightest/50 to-chocolate-lightest/50 border-b border-white/20">
              <CardTitle className="font-serif text-coffee-darker flex items-center gap-3 text-xl">
                <div className="p-2 bg-gradient-to-br from-amber-100 to-yellow-100 rounded-xl">
                  <Crown className="h-6 w-6 text-amber-600" />
                </div>
                Badges Débloqués
                <Sparkles className="h-5 w-5 text-coffee-medium animate-pulse" />
              </CardTitle>
              <CardDescription className="text-coffee-medium font-light">
                Vos accomplissements par ordre de rareté
              </CardDescription>
            </CardHeader>
            <CardContent className="p-8 space-y-8">
              <BadgeRarityProgress earnedBadges={badges} allBadges={[...badges, ...lockedBadges]} />
              <BadgeGrid 
                badges={badges} 
                isLocked={false} 
                favoriteBadgeIds={favoriteBadgeIds}
                onFavoriteToggle={handleFavoriteToggle}
                showFavoriteToggle={true}
              />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="locked">
          <Card className="border-0 bg-white/60 backdrop-blur-md shadow-2xl rounded-3xl overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-coffee-lightest/50 to-chocolate-lightest/50 border-b border-white/20">
              <CardTitle className="font-serif text-coffee-darker flex items-center gap-3 text-xl">
                <div className="p-2 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-xl">
                  <Target className="h-6 w-6 text-blue-600" />
                </div>
                Objectifs à Atteindre
                <Sparkles className="h-5 w-5 text-coffee-medium animate-pulse" />
              </CardTitle>
              <CardDescription className="text-coffee-medium font-light">
                Découvrez les prochains défis à relever
              </CardDescription>
            </CardHeader>
            <CardContent className="p-8">
              <BadgeGrid badges={lockedBadges} isLocked={true} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
