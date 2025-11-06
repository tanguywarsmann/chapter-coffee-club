
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { StarIcon } from "lucide-react";
import { UserLevel, getLevelFromXP, getXPForNextLevel, getUserLevel } from "@/services/user/levelService";

interface UserLevelProgressProps {
  userId: string;
}

export function UserLevelProgress({ userId }: UserLevelProgressProps) {
  const [userLevel, setUserLevel] = useState<UserLevel | null>(null);
  const [progressPercent, setProgressPercent] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [currentLevelXP, setCurrentLevelXP] = useState<number>(0);
  const [nextLevelXP, setNextLevelXP] = useState<number>(100);
  
  useEffect(() => {
    async function fetchUserLevel() {
      if (!userId) return;
      
      try {
        setLoading(true);
        const levelData = await getUserLevel(userId);
        
        if (levelData) {
          setUserLevel(levelData);
          
          // Calcul des valeurs pour la barre de progression
          const level = levelData.level || 1;
          const xp = levelData.xp || 0;
          
          // Calculer l'XP du niveau actuel et suivant
          let currentMin = 0;
          switch (level - 1) {
            case 1: currentMin = 0; break;
            case 2: currentMin = 100; break;
            case 3: currentMin = 250; break;
            case 4: currentMin = 500; break;
            default: currentMin = 0;
          }
          
          const nextLevelTarget = getXPForNextLevel(level);
          setCurrentLevelXP(currentMin);
          setNextLevelXP(nextLevelTarget);
          
          // Calculer le pourcentage de progression
          if (level === 5) {
            // Au niveau max, la barre est complète
            setProgressPercent(100);
          } else {
            const levelRange = nextLevelTarget - currentMin;
            const progress = xp - currentMin;
            const percent = Math.floor((progress / levelRange) * 100);
            setProgressPercent(percent);
          }
        }
      } catch (error) {
        console.error("Error fetching user level:", error);
      } finally {
        setLoading(false);
      }
    }
    
    fetchUserLevel();
  }, [userId]);

  if (loading) {
    return (
      <Card className="border-coffee-light">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-serif text-coffee-darker flex items-center gap-2">
            <StarIcon className="h-5 w-5 text-coffee-dark" />
            Niveau
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-16 flex items-center justify-center">
            <div className="w-8 h-8 border-4 border-coffee-light border-t-coffee-dark rounded-full animate-spin" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!userLevel) {
    return null;
  }

  return (
    <Card className="border-coffee-light">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-serif text-coffee-darker flex items-center gap-2">
          <StarIcon className="h-5 w-5 text-coffee-dark" />
          Niveau de lecture
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-between items-center">
          <span className="text-xl font-medium text-coffee-darker">
            Niveau {userLevel.level}
          </span>
          <span className="text-sm text-muted-foreground">
            {userLevel.xp} XP
          </span>
        </div>
        
        <div>
          <Progress value={progressPercent} className="h-2" />
          {userLevel.level < 5 && (
            <div className="flex justify-between mt-1">
              <span className="text-xs text-muted-foreground">
                {userLevel.xp - currentLevelXP} / {nextLevelXP - currentLevelXP} XP
              </span>
              <span className="text-xs text-muted-foreground">
                {nextLevelXP - userLevel.xp} XP avant niveau {userLevel.level + 1}
              </span>
            </div>
          )}
          {userLevel.level === 5 && (
            <div className="mt-1">
              <span className="text-xs text-muted-foreground">
                Niveau maximum atteint ! 🎉
              </span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
