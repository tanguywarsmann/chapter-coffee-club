
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

  return (
    <div className="flex flex-col md:flex-row gap-4 mb-6">
      <div className="flex-1 flex items-center bg-gradient-to-br from-coffee-light to-chocolate-light rounded-lg px-4 py-3 gap-3">
        <Flame className="h-8 w-8 text-orange-500" />
        <div>
          <div className="font-serif text-coffee-darker font-medium text-lg">
            {currentStreak > 0
              ? <>🔥 Tu lis depuis <b>{currentStreak}</b> jour{currentStreak > 1 ? "s" : ""} d'affilée !</>
              : <>Aucune série de lecture en cours</>
            }
          </div>
        </div>
      </div>
      <div className="flex-1 flex items-center bg-gradient-to-br from-coffee-light to-chocolate-light rounded-lg px-4 py-3 gap-3">
        <Medal className="h-7 w-7 text-coffee-darker" />
        <div>
          <div className="font-serif text-coffee-darker font-medium text-lg">
            🏅 Ton record : <b>{bestStreak}</b> jour{bestStreak > 1 ? "s" : ""} consécutifs
          </div>
        </div>
      </div>
      <div className="flex-1 flex items-center bg-gradient-to-br from-coffee-light to-chocolate-light rounded-lg px-4 py-3 gap-3">
        <CalendarDays className="h-7 w-7 text-coffee-darker" />
        <div>
          <div className="font-serif text-coffee-darker font-medium text-lg">
            {monthlySegments} segment{monthlySegments !== 1 ? "s" : ""} validé{monthlySegments !== 1 ? "s" : ""} ce mois-ci
          </div>
        </div>
      </div>
    </div>
  );
}
