
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Target, Plus } from "lucide-react";
import { useState } from "react";

export function UserGoals() {
  const [currentGoal] = useState(() => {
    const user = localStorage.getItem("user");
    const parsed = user ? JSON.parse(user) : null;
    return parsed?.preferences?.readingGoal || 2;
  });

  const progress = 40; // À connecter avec les données réelles

  return (
    <Card className="border-coffee-light">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-xl font-serif text-coffee-darker flex items-center gap-2">
          <Target className="h-5 w-5 text-coffee-dark" />
          Mon objectif
        </CardTitle>
        <Button variant="ghost" size="sm" className="text-coffee-dark hover:text-coffee-darker">
          <Plus className="h-4 w-4 mr-1" />
          Modifier mon objectif
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-coffee-darker">Objectif : {currentGoal} livres par mois</span>
            <span className="text-muted-foreground">{progress}% atteint</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      </CardContent>
    </Card>
  );
}
