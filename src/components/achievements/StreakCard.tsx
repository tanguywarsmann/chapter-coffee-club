
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Flame, Award, Target } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";

interface StreakCardProps {
  currentStreak: number;
  longestStreak: number;
}

const getStreakMessage = (streak: number) => {
  if (streak === 0) return "Commencez votre première série de lecture";
  if (streak === 1) return "Excellent début ! Continuez sur cette lancée";
  if (streak <= 7) return "Fantastique régularité dans vos lectures";
  if (streak <= 14) return "Habitude remarquable de lecture établie";
  return "Lecteur assidu exceptionnel";
};

const getMotivationalQuote = (streak: number) => {
  if (streak === 0) return "Chaque grand lecteur a commencé par un premier jour";
  if (streak <= 3) return "La constance transforme l'effort en excellence";
  if (streak <= 7) return "Votre discipline façonne votre esprit";
  return "L'excellence est une habitude, et vous l'incarnez";
};

export function StreakCard({ currentStreak = 0, longestStreak = 0 }: StreakCardProps) {
  const [isVisible, setIsVisible] = useState(false);
  const hasStreak = currentStreak > 0;
  const hasRecord = longestStreak > currentStreak && longestStreak > 0;

  // Animation d'apparition
  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 200);
    return () => clearTimeout(timer);
  }, []);

  const formatStreakText = (streak: number) => {
    if (streak === 0) return "Aucune série active";
    if (streak === 1) return "1 jour consécutif";
    return `${streak} jours consécutifs`;
  };

  const formatRecordText = (record: number) => {
    if (record === 0) return null;
    if (record === 1) return "Record : 1 jour";
    return `Record : ${record} jours`;
  };

  return (
    <Card 
      className={cn(
        "relative overflow-hidden border-0 bg-gradient-to-br from-white via-coffee-lightest to-white shadow-xl transition-all duration-500",
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8",
        "hover:shadow-2xl"
      )}
    >
      {/* Décoration de fond */}
      <div className="absolute inset-0 bg-gradient-to-r from-coffee-light/20 via-transparent to-chocolate-light/20" />
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-coffee-light/10 to-transparent rounded-bl-full" />
      
      <CardHeader className="relative pb-4">
        <CardTitle className="flex items-center gap-3 text-2xl font-serif text-coffee-darker">
          <div className={cn(
            "p-2 rounded-xl transition-all duration-300",
            hasStreak 
              ? "bg-gradient-to-br from-orange-100 to-red-100" 
              : "bg-gradient-to-br from-gray-100 to-gray-200"
          )}>
            <Flame 
              className={cn(
                "h-7 w-7 transition-all duration-300",
                hasStreak 
                  ? "text-orange-600 animate-pulse" 
                  : "text-gray-500"
              )} 
            />
          </div>
          <div className="flex-1">
            <div className="font-serif text-coffee-darker">
              {getStreakMessage(currentStreak)}
            </div>
            <p className="text-sm font-light text-coffee-medium mt-1 italic">
              {getMotivationalQuote(currentStreak)}
            </p>
          </div>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="relative space-y-6">
        {/* Série actuelle */}
        <div className="text-center py-4">
          <div className="inline-flex items-center gap-3 px-6 py-3 bg-white/80 rounded-2xl border border-coffee-light/30 shadow-sm">
            <Target className="h-5 w-5 text-coffee-dark" />
            <span className="text-3xl font-serif font-bold text-coffee-darker">
              {formatStreakText(currentStreak)}
            </span>
          </div>
        </div>

        {/* Record personnel */}
        {hasRecord && (
          <div className="flex items-center justify-center gap-3 px-4 py-3 bg-gradient-to-r from-amber-50 to-yellow-50 rounded-xl border border-amber-200/50">
            <Award className="h-5 w-5 text-amber-600" />
            <span className="font-medium text-amber-800">
              {formatRecordText(longestStreak)}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
