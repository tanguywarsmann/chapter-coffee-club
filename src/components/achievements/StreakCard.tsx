
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Flame, Award } from "lucide-react";

interface StreakCardProps {
  currentStreak: number;
  longestStreak: number;
}

export function StreakCard({ currentStreak, longestStreak }: StreakCardProps) {
  return (
    <Card className="border-coffee-light bg-gradient-to-br from-coffee-light to-chocolate-light">
      <CardHeader>
        <CardTitle className="text-xl font-serif text-coffee-darker flex items-center gap-2">
          <Flame className="h-6 w-6 text-orange-500" />
          Série de lecture
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="text-3xl font-bold text-coffee-darker">
            {currentStreak} {currentStreak > 1 ? "jours" : "jour"}
          </div>
        </div>
        <div className="flex items-center gap-2 text-muted-foreground">
          <Award className="h-5 w-5 text-amber-500" />
          <span>Record : {longestStreak} {longestStreak > 1 ? "jours" : "jour"}</span>
        </div>
      </CardContent>
    </Card>
  );
}
