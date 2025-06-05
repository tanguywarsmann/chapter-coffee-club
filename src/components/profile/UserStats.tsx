
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getTotalPagesRead, getBooksReadCount, getAveragePagesPerWeek } from "@/services/reading/statsService";
import { BookOpen, Clock } from "lucide-react";

export function UserStats() {
  const [stats, setStats] = useState({
    booksRead: 0,
    totalPages: 0,
    readingHours: 0, // Optionnel
    avgPagesPerWeek: 0,
  });

  useEffect(() => {
    const user = localStorage.getItem("user");
    const parsed = user ? JSON.parse(user) : null;
    if (!parsed?.id) return;

    async function fetchStats() {
      const [booksRead, totalPages, avgPagesPerWeek] = await Promise.all([
        getBooksReadCount(parsed.id),
        getTotalPagesRead(parsed.id),
        getAveragePagesPerWeek(parsed.id)
      ]);
      setStats({
        booksRead,
        totalPages,
        readingHours: 0, // Si vous voulez calculer les heures, à adapter.
        avgPagesPerWeek,
      });
    }
    fetchStats();
  }, []);

  // Fonction pour obtenir le texte des livres avec bon accord
  const getBooksText = () => {
    if (stats.booksRead === 0) return "Aucun livre terminé";
    if (stats.booksRead === 1) return "Livre terminé";
    return "Livres terminés";
  };

  // Fonction pour obtenir le texte des pages avec bon accord
  const getPagesText = () => {
    if (stats.avgPagesPerWeek === 0) return "Tu ne lis aucune page par semaine";
    if (stats.avgPagesPerWeek === 1) return "Tu lis 1 page par semaine";
    return `Tu lis ${stats.avgPagesPerWeek} pages par semaine`;
  };

  return (
    <Card className="border-coffee-light">
      <CardHeader>
        <CardTitle className="text-xl font-serif text-coffee-darker flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-coffee-dark" />
          Mes statistiques globales
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-1">
            <div className="flex items-center text-muted-foreground">
              <BookOpen className="h-4 w-4 mr-1" />
              <span className="text-sm">{getBooksText()}</span>
            </div>
            <p className="text-2xl font-medium text-coffee-darker">{stats.booksRead}</p>
          </div>
          <div className="space-y-1">
            <div className="flex items-center text-muted-foreground">
              <BookOpen className="h-4 w-4 mr-1" />
              <span className="text-sm">Pages lues</span>
            </div>
            <p className="text-2xl font-medium text-coffee-darker">{stats.totalPages}</p>
          </div>
          <div className="space-y-1">
            <div className="flex items-center text-muted-foreground">
              <Clock className="h-4 w-4 mr-1" />
              <span className="text-sm">Temps de lecture</span>
            </div>
            <p className="text-2xl font-medium text-coffee-darker">{stats.readingHours}h</p>
          </div>
        </div>
        <div className="mt-6 text-center text-base text-coffee-dark font-serif">
          📈 En moyenne, {getPagesText()}
        </div>
      </CardContent>
    </Card>
  );
}
