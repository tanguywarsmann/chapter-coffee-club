
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Target, Plus } from "lucide-react";
import { getGoalProgress, getUserGoal, setUserGoal } from "@/services/user/userGoalsService";

export function UserGoals() {
  const [currentGoal, setCurrentGoal] = useState("");
  const [progress, setProgress] = useState(0);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchGoalData = async () => {
      try {
        const user = localStorage.getItem("user");
        const parsed = user ? JSON.parse(user) : null;
        if (parsed?.id) {
          // Get goal and progress
          const goal = await getUserGoal(parsed.id);
          setCurrentGoal(goal);
          
          const goalProgress = await getGoalProgress(parsed.id);
          setProgress(goalProgress);
        } else {
          // Fallback
          setCurrentGoal("Lire 2 livres par mois");
          setProgress(40);
        }
      } catch (error) {
        console.error("Error fetching goal data:", error);
        // Fallback values
        setCurrentGoal("Lire 2 livres par mois");
        setProgress(40);
      } finally {
        setLoading(false);
      }
    };
    
    fetchGoalData();
  }, []);

  const handleUpdateGoal = async () => {
    // This would open a dialog to update the goal
    // For simplicity, we're just toggling between 2 and 3 books per month
    const user = localStorage.getItem("user");
    const parsed = user ? JSON.parse(user) : null;
    
    if (parsed?.id) {
      const newGoal = currentGoal.includes("2 livre") 
        ? "Lire 3 livres par mois" 
        : "Lire 2 livres par mois";
        
      await setUserGoal(parsed.id, newGoal);
      setCurrentGoal(newGoal);

      // Rafraîchir la progression également
      const progressValue = await getGoalProgress(parsed.id);
      setProgress(progressValue);
    }
  };

  return (
    <Card className="border-coffee-light">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-xl font-serif text-coffee-darker flex items-center gap-2">
          <Target className="h-5 w-5 text-coffee-dark" />
          Mon objectif
        </CardTitle>
        <Button 
          variant="ghost" 
          size="sm" 
          className="text-coffee-dark hover:text-coffee-darker"
          onClick={handleUpdateGoal}
          disabled={loading}
        >
          <Plus className="h-4 w-4 mr-1" />
          Modifier mon objectif
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-coffee-darker">Objectif : {currentGoal}</span>
            <span className="text-muted-foreground">{progress}% atteint</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
        <div className="mt-2 text-center text-coffee-dark font-serif">
          🎯 Objectif atteint à {progress}% ce mois-ci
        </div>
      </CardContent>
    </Card>
  );
}
