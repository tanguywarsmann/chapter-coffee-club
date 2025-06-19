
import { useEffect, useState } from "react";
import { Flame, Medal, CalendarDays, Sparkles } from "lucide-react";
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
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      {/* Série actuelle avec design premium */}
      <div className="group relative">
        {/* Effet de lueur d'arrière-plan */}
        <div className="absolute inset-0 bg-gradient-to-br from-orange-200/20 to-red-200/20 rounded-3xl blur-xl transform group-hover:scale-105 transition-transform duration-500" />
        
        <div className="relative bg-white/60 backdrop-blur-md border border-white/40 rounded-3xl p-8 shadow-2xl hover:shadow-3xl transition-all duration-500 group-hover:-translate-y-1">
          {/* Icône avec effet brillant */}
          <div className="flex items-center gap-6">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-orange-400 to-red-500 rounded-2xl blur-sm opacity-30 scale-110" />
              <div className="relative p-4 bg-gradient-to-br from-orange-100 to-red-100 rounded-2xl border border-orange-200/50">
                <Flame className="h-8 w-8 text-orange-600" />
              </div>
              {/* Particules décoratives */}
              <div className="absolute -top-1 -right-1">
                <Sparkles className="h-4 w-4 text-orange-400 animate-pulse" />
              </div>
            </div>
            
            <div className="flex-1">
              <h3 className="text-sm font-serif font-medium text-coffee-medium uppercase tracking-wider mb-2">
                Série Actuelle
              </h3>
              <p className="text-2xl font-serif font-semibold text-coffee-darker leading-tight">
                {formatStreakText(currentStreak, "série")}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Record personnel */}
      <div className="group relative">
        <div className="absolute inset-0 bg-gradient-to-br from-amber-200/20 to-yellow-200/20 rounded-3xl blur-xl transform group-hover:scale-105 transition-transform duration-500" />
        
        <div className="relative bg-white/60 backdrop-blur-md border border-white/40 rounded-3xl p-8 shadow-2xl hover:shadow-3xl transition-all duration-500 group-hover:-translate-y-1">
          <div className="flex items-center gap-6">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-amber-400 to-yellow-500 rounded-2xl blur-sm opacity-30 scale-110" />
              <div className="relative p-4 bg-gradient-to-br from-amber-100 to-yellow-100 rounded-2xl border border-amber-200/50">
                <Medal className="h-8 w-8 text-amber-600" />
              </div>
              <div className="absolute -top-1 -right-1">
                <Sparkles className="h-4 w-4 text-amber-400 animate-pulse" />
              </div>
            </div>
            
            <div className="flex-1">
              <h3 className="text-sm font-serif font-medium text-coffee-medium uppercase tracking-wider mb-2">
                Record Personnel
              </h3>
              <p className="text-2xl font-serif font-semibold text-coffee-darker leading-tight">
                {formatStreakText(bestStreak, "record")}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Activité mensuelle */}
      <div className="group relative">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-200/20 to-indigo-200/20 rounded-3xl blur-xl transform group-hover:scale-105 transition-transform duration-500" />
        
        <div className="relative bg-white/60 backdrop-blur-md border border-white/40 rounded-3xl p-8 shadow-2xl hover:shadow-3xl transition-all duration-500 group-hover:-translate-y-1">
          <div className="flex items-center gap-6">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-2xl blur-sm opacity-30 scale-110" />
              <div className="relative p-4 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-2xl border border-blue-200/50">
                <CalendarDays className="h-8 w-8 text-blue-600" />
              </div>
              <div className="absolute -top-1 -right-1">
                <Sparkles className="h-4 w-4 text-blue-400 animate-pulse" />
              </div>
            </div>
            
            <div className="flex-1">
              <h3 className="text-sm font-serif font-medium text-coffee-medium uppercase tracking-wider mb-2">
                Ce Mois-ci
              </h3>
              <p className="text-2xl font-serif font-semibold text-coffee-darker leading-tight">
                {formatMonthlyText(monthlySegments)}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
