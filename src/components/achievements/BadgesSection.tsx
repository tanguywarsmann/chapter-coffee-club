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
      {/* Effet d'arrière-plan décoratif avec les couleurs Reed */}
      <div className="absolute inset-0 bg-gradient-to-br from-reed-primary/10 to-reed-secondary/10 rounded-3xl blur-2xl" />
      
      <Tabs defaultValue="unlocked" className="relative w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6 sm:mb-8 bg-white/70 backdrop-blur-md border border-white/40 rounded-2xl p-1 shadow-lg">
          <TabsTrigger 
            value="unlocked" 
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-reed-secondary data-[state=active]:to-reed-light data-[state=active]:text-reed-darker font-serif font-medium text-reed-dark rounded-xl transition-all duration-300"
          >
            <Crown className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
            <span className="hidden sm:inline">Collection</span>
            <span className="sm:hidden">Mes badges</span>
          </TabsTrigger>
          <TabsTrigger 
            value="locked"
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-reed-secondary data-[state=active]:to-reed-light data-[state=active]:text-reed-darker font-serif font-medium text-reed-dark rounded-xl transition-all duration-300"
          >
            <Target className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
            <span className="hidden sm:inline">Objectifs</span>
            <span className="sm:hidden">À obtenir</span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="unlocked">
          <Card className="border-0 bg-white/70 backdrop-blur-md shadow-2xl rounded-3xl overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-reed-secondary/40 to-reed-light/40 border-b border-white/20">
              <CardTitle className="font-serif text-reed-darker flex items-center gap-3 text-lg sm:text-xl">
                <div className="p-2 bg-gradient-to-br from-reed-secondary to-reed-light rounded-xl flex-shrink-0">
                  <Crown className="h-5 w-5 sm:h-6 sm:w-6 text-reed-primary" />
                </div>
                <span className="flex-1 min-w-0">Badges Débloqués</span>
                <Sparkles className="h-4 w-4 sm:h-5 sm:w-5 text-reed-primary animate-pulse flex-shrink-0" />
              </CardTitle>
              <CardDescription className="text-reed-dark font-light">
                Vos accomplissements par ordre de rareté
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 sm:p-8 space-y-6 sm:space-y-8">
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
          <Card className="border-0 bg-white/70 backdrop-blur-md shadow-2xl rounded-3xl overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-reed-secondary/40 to-reed-light/40 border-b border-white/20">
              <CardTitle className="font-serif text-reed-darker flex items-center gap-3 text-lg sm:text-xl">
                <div className="p-2 bg-gradient-to-br from-reed-light to-white rounded-xl flex-shrink-0">
                  <Target className="h-5 w-5 sm:h-6 sm:w-6 text-reed-dark" />
                </div>
                <span className="flex-1 min-w-0">Objectifs à Atteindre</span>
                <Sparkles className="h-4 w-4 sm:h-5 sm:w-5 text-reed-primary animate-pulse flex-shrink-0" />
              </CardTitle>
              <CardDescription className="text-reed-dark font-light">
                Découvrez les prochains défis à relever
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 sm:p-8">
              <BadgeGrid badges={lockedBadges} isLocked={true} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
