
import { useEffect, useState } from "react";
import { Flame, Medal, CalendarDays } from "lucide-react";
import { getCurrentStreak, getBestStreak } from "@/services/reading/statsService";
import { supabase } from "@/integrations/supabase/client";

export function StreakStats() {
  const [currentStreak, setCurrentStreak] = useState<number>(0);
  const [bestStreak, setBestStreak] = useState<number>(0);
  const [monthlySegments, setMonthlySegments] = useState<number>(0);

  useEffect(() => {
    const user = localStorage.getItem("user");
    const parsed = user ? JSON.parse(user) : null;
    if (!parsed?.id) return;

    getCurrentStreak(parsed.id).then(setCurrentStreak);
    getBestStreak(parsed.id).then(setBestStreak);

    // Compter les validations du mois en cours
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const startOfMonth = new Date(year, month, 1);
    supabase
      .from("reading_validations")
      .select("id", { count: "exact", head: true })
      .eq("user_id", parsed.id)
      .gte("validated_at", startOfMonth.toISOString())
      .then(({ count }) => setMonthlySegments(count ?? 0));
  }, []);

  // Fonction pour obtenir le texte avec bon accord pour la série actuelle
  const getCurrentStreakText = () => {
    if (currentStreak === 0) return "Aucune série de lecture en cours";
    if (currentStreak === 1) return <>🔥 Tu lis depuis <b>1</b> jour d'affilée !</>;
    return <>🔥 Tu lis depuis <b>{currentStreak}</b> jours d'affilée !</>;
  };

  // Fonction pour obtenir le texte avec bon accord pour le record
  const getBestStreakText = () => {
    if (bestStreak === 0) return <>🏅 Aucun record établi</>;
    if (bestStreak === 1) return <>🏅 Ton record : <b>1</b> jour consécutif</>;
    return <>🏅 Ton record : <b>{bestStreak}</b> jours consécutifs</>;
  };

  // Fonction pour obtenir le texte avec bon accord pour les segments du mois
  const getMonthlySegmentsText = () => {
    if (monthlySegments === 0) return "Aucun segment validé ce mois-ci";
    if (monthlySegments === 1) return "1 segment validé ce mois-ci";
    return `${monthlySegments} segments validés ce mois-ci`;
  };

  return (
    <div className="flex flex-col md:flex-row gap-4 mb-6">
      <div className="flex-1 flex items-center bg-gradient-to-br from-coffee-light to-chocolate-light rounded-lg px-4 py-3 gap-3">
        <Flame className="h-8 w-8 text-orange-500" />
        <div>
          <div className="font-serif text-coffee-darker font-medium text-lg">
            {getCurrentStreakText()}
          </div>
        </div>
      </div>
      <div className="flex-1 flex items-center bg-gradient-to-br from-coffee-light to-chocolate-light rounded-lg px-4 py-3 gap-3">
        <Medal className="h-7 w-7 text-coffee-darker" />
        <div>
          <div className="font-serif text-coffee-darker font-medium text-lg">
            {getBestStreakText()}
          </div>
        </div>
      </div>
      <div className="flex-1 flex items-center bg-gradient-to-br from-coffee-light to-chocolate-light rounded-lg px-4 py-3 gap-3">
        <CalendarDays className="h-7 w-7 text-coffee-darker" />
        <div>
          <div className="font-serif text-coffee-darker font-medium text-lg">
            {getMonthlySegmentsText()}
          </div>
        </div>
      </div>
    </div>
  );
}
