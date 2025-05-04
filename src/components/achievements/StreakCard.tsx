
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Flame, Award } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";

interface StreakCardProps {
  currentStreak: number;
  longestStreak: number;
}

const getStreakMessage = (streak: number) => {
  if (streak === 0) return "Commence une série de lecture !";
  if (streak === 1) return "Tu as commencé une série de lecture !";
  if (streak <= 3) return "Belle série de lecture !";
  return "Impressionnante série de lecture !";
};

export function StreakCard({ currentStreak = 0, longestStreak = 0 }: StreakCardProps) {
  const [isVisible, setIsVisible] = useState(false);
  const hasStreak = currentStreak > 0;
  const hasRecord = longestStreak > currentStreak && longestStreak > 0;

  // Animation d'apparition
  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <Card 
      className={cn(
        "border-coffee-light bg-gradient-to-br from-coffee-light to-chocolate-light transition-all duration-300",
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4",
        "hover:shadow-md"
      )}
    >
      <CardHeader>
        <CardTitle className="text-xl font-serif text-coffee-darker flex items-center gap-2">
          <Flame 
            className={cn(
              "h-6 w-6 text-orange-500 transition-all",
              hasStreak && "animate-[pulse_2s_cubic-bezier(0.4,0,0.6,1)_infinite]"
            )} 
          />
          {getStreakMessage(currentStreak)}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="text-3xl font-bold text-coffee-darker">
            {currentStreak > 0 ? (
              <>
                {currentStreak} jour{currentStreak > 1 ? "s" : ""} consécutif{currentStreak > 1 ? "s" : ""}
              </>
            ) : (
              "Pas de série en cours"
            )}
          </div>
        </div>
        {hasRecord && (
          <div className="flex items-center gap-2 text-muted-foreground animate-fade-in">
            <Award className="h-5 w-5 text-amber-500" />
            <span className="font-medium">
              Record de régularité : {longestStreak} jour{longestStreak > 1 ? "s" : ""}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
