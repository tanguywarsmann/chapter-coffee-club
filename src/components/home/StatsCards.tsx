
import { Card } from "@/components/ui/card";
import { User } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { useEffect, useState } from "react";
import { getMockFollowers, getMockFollowing } from "@/mock/activities";
import { getUserBadges } from "@/mock/badges";
import { useConfetti } from "@/hooks/useConfetti";

export function StatsCards() {
  const [followersProgress, setFollowersProgress] = useState(0);
  const [badgesProgress, setBadgesProgress] = useState(0);
  const { showConfetti } = useConfetti();
  
  const followers = getMockFollowers();
  const following = getMockFollowing();
  const badges = getUserBadges();
  
  // Calculer la progression vers les objectifs
  useEffect(() => {
    // Animation progressive des barres
    const timer = setTimeout(() => {
      setFollowersProgress(followers.length > 0 ? (followers.length / 10) * 100 : 0);
      setBadgesProgress(badges.length > 0 ? (badges.length / 5) * 100 : 0);
    }, 300);
    
    // Déclencher les confettis si l'utilisateur a atteint un palier
    if (badges.length === 5 || followers.length === 10) {
      showConfetti();
    }
    
    return () => clearTimeout(timer);
  }, [badges.length, followers.length, showConfetti]);

  return (
    <div className="flex flex-wrap gap-4 mb-6">
      <Card className="flex-1 p-4 border-coffee-light min-w-[140px]">
        <div className="flex items-center gap-3 mb-2">
          <User className="h-5 w-5 text-coffee-dark" />
          <div>
            <p className="text-sm text-muted-foreground">Abonné{followers.length > 1 ? "s" : ""}</p>
            <p className="text-2xl font-medium text-coffee-darker">{followers.length}</p>
          </div>
        </div>
        <div className="space-y-1">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{followers.length}/10 pour débloquer un badge</span>
          </div>
          <Progress value={followersProgress} className="h-1.5" />
        </div>
      </Card>
      
      <Card className="flex-1 p-4 border-coffee-light min-w-[140px]">
        <div className="flex items-center gap-3 mb-2">
          <User className="h-5 w-5 text-coffee-dark" />
          <div>
            <p className="text-sm text-muted-foreground">Abonnement{following.length > 1 ? "s" : ""}</p>
            <p className="text-2xl font-medium text-coffee-darker">{following.length}</p>
          </div>
        </div>
        <div className="space-y-1">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{badges.length}/5 badge{badges.length > 1 ? "s" : ""} collecté{badges.length > 1 ? "s" : ""}</span>
          </div>
          <Progress value={badgesProgress} className="h-1.5" />
        </div>
      </Card>
    </div>
  );
}
