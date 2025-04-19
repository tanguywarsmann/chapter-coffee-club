
import { Award, BookOpen, Clock } from "lucide-react";
import { getUserBadges } from "@/mock/badges";

export function StatsCards() {
  const badges = getUserBadges();

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="bg-gradient-to-br from-coffee-light to-chocolate-light rounded-lg p-4 flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-coffee-darker">Badges obtenus</p>
          <p className="text-3xl font-bold text-coffee-darker">{badges.length}</p>
        </div>
        <Award className="h-8 w-8 text-coffee-darker" />
      </div>
      
      <div className="bg-gradient-to-br from-coffee-light to-chocolate-light rounded-lg p-4 flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-coffee-darker">Livres terminés</p>
          <p className="text-3xl font-bold text-coffee-darker">3</p>
        </div>
        <BookOpen className="h-8 w-8 text-coffee-darker" />
      </div>
      
      <div className="bg-gradient-to-br from-coffee-light to-chocolate-light rounded-lg p-4 flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-coffee-darker">Temps de lecture</p>
          <p className="text-3xl font-bold text-coffee-darker">48h</p>
        </div>
        <Clock className="h-8 w-8 text-coffee-darker" />
      </div>
    </div>
  );
}
