
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Target, Plus } from "lucide-react";

export function UserGoals() {
  // Mock data - in a real app this would come from an API
  const currentGoal = {
    type: "monthly",
    target: 2,
    current: 1,
    unit: "livres"
  };

  const progress = (currentGoal.current / currentGoal.target) * 100;

  return (
    <Card className="border-coffee-light">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-xl font-serif text-coffee-darker">Objectifs de lecture</CardTitle>
        <Button variant="ghost" size="sm" className="text-coffee-dark hover:text-coffee-darker">
          <Plus className="h-4 w-4 mr-1" />
          Nouvel objectif
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center text-coffee-darker">
              <Target className="h-4 w-4 mr-1" />
              <span>Objectif mensuel</span>
            </div>
            <span className="text-muted-foreground">{currentGoal.current}/{currentGoal.target} {currentGoal.unit}</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      </CardContent>
    </Card>
  );
}
