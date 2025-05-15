import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Trophy, Target } from "lucide-react";
import { cn } from "@/lib/utils";

interface Goal {
  id: string;
  title: string;
  current: number;
  target: number;
  type: "pages" | "books" | "streak";
  icon: "trophy" | "target";
}

console.log("Import de GoalsPreview.tsx OK");

export function GoalsPreview() {
  const upcomingGoals: Goal[] = [
    {
      id: "1",
      title: "Badge 100 pages",
      current: 80,
      target: 100,
      type: "pages",
      icon: "trophy"
    },
    {
      id: "2",
      title: "Série de lecture",
      current: 4,
      target: 7,
      type: "streak",
      icon: "target"
    }
  ];

  return (
    <Card className="border-coffee-light transition-all duration-300 ease-in-out hover:shadow-md">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-serif text-coffee-darker">Prochains objectifs</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {upcomingGoals.length > 0 ? (
          upcomingGoals.map((goal) => (
            <div key={goal.id} className="space-y-2 transition-opacity duration-300 ease-in-out">
              <div className="flex items-center gap-2">
                {goal.icon === "trophy" ? (
                  <Trophy className="h-4 w-4 text-amber-500" />
                ) : (
                  <Target className="h-4 w-4 text-blue-500" />
                )}
                <span className="text-sm font-medium text-coffee-darker">{goal.title}</span>
                <span className="text-xs text-muted-foreground ml-auto">
                  {goal.current}/{goal.target}{" "}
                  {goal.type === "pages"
                    ? "pages"
                    : goal.type === "books"
                    ? goal.current > 1 ? "livres" : "livre"
                    : goal.current > 1 ? "jours" : "jour"}
                </span>
              </div>
              <Progress
                value={(goal.current / goal.target) * 100}
                className={cn(
                  "h-2 transition-all duration-300",
                  goal.current / goal.target > 0.8 ? "bg-green-100" : ""
                )}
              />
            </div>
          ))
        ) : (
          <div className="py-2 text-center text-sm text-muted-foreground">
            Aucun objectif en cours
          </div>
        )}
      </CardContent>
    </Card>
  );
}
