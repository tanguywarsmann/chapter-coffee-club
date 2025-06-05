
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

  // Fonction pour obtenir le texte avec bon accord pour la série actuelle
  const getCurrentStreakText = () => {
    if (currentStreak === 0) return "Pas de série en cours";
    if (currentStreak === 1) return "1 jour consécutif";
    return `${currentStreak} jours consécutifs`;
  };

  // Fonction pour obtenir le texte avec bon accord pour le record
  const getRecordText = () => {
    if (longestStreak === 0) return "Aucun record";
    if (longestStreak === 1) return "Record de régularité : 1 jour";
    return `Record de régularité : ${longestStreak} jours`;
  };

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
            {getCurrentStreakText()}
          </div>
        </div>
        {hasRecord && (
          <div className="flex items-center gap-2 text-muted-foreground animate-fade-in">
            <Award className="h-5 w-5 text-amber-500" />
            <span className="font-medium">
              {getRecordText()}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
