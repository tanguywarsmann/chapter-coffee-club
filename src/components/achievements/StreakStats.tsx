
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

  const formatStreakText = (streak: number, label: string) => {
    if (streak === 0) return `Aucune ${label.toLowerCase()}`;
    if (streak === 1) return `${streak} jour`;
    return `${streak} jours`;
  };

  const formatMonthlyText = (count: number) => {
    if (count === 0) return "Aucune validation ce mois";
    if (count === 1) return "1 validation ce mois";
    return `${count} validations ce mois`;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Série actuelle */}
      <div className="bg-white/80 backdrop-blur-sm border border-coffee-light/30 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-300">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-gradient-to-br from-orange-100 to-red-100 rounded-xl">
            <Flame className="h-7 w-7 text-orange-600" />
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-medium text-coffee-medium uppercase tracking-wide mb-1">
              Série Actuelle
            </h3>
            <p className="text-2xl font-serif font-semibold text-coffee-darker">
              {formatStreakText(currentStreak, "série")}
            </p>
          </div>
        </div>
      </div>

      {/* Record personnel */}
      <div className="bg-white/80 backdrop-blur-sm border border-coffee-light/30 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-300">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-gradient-to-br from-amber-100 to-yellow-100 rounded-xl">
            <Medal className="h-7 w-7 text-amber-600" />
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-medium text-coffee-medium uppercase tracking-wide mb-1">
              Record Personnel
            </h3>
            <p className="text-2xl font-serif font-semibold text-coffee-darker">
              {formatStreakText(bestStreak, "record")}
            </p>
          </div>
        </div>
      </div>

      {/* Activité mensuelle */}
      <div className="bg-white/80 backdrop-blur-sm border border-coffee-light/30 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-300">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-xl">
            <CalendarDays className="h-7 w-7 text-blue-600" />
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-medium text-coffee-medium uppercase tracking-wide mb-1">
              Ce Mois-ci
            </h3>
            <p className="text-2xl font-serif font-semibold text-coffee-darker">
              {formatMonthlyText(monthlySegments)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
