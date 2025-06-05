
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  getTotalPagesRead, 
  getBooksReadCount, 
  getValidatedSegmentsCount, 
  getEstimatedReadingTime,
  getReaderProfileMessage,
  getAveragePagesPerWeek
} from "@/services/reading/statsService";
import { BookOpen, Clock, Award } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

export function ReadingStats() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    booksRead: 0,
    segmentsValidated: 0,
    totalPages: 0,
    readingTime: 0,
    avgPagesPerWeek: 0,
    profileMessage: ""
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      if (!user?.id) return;
      
      setIsLoading(true);
      
      try {
        const [booksRead, totalPages, segmentsValidated, readingTime, avgPagesPerWeek] = await Promise.all([
          getBooksReadCount(user.id),
          getTotalPagesRead(user.id),
          getValidatedSegmentsCount(user.id),
          getEstimatedReadingTime(user.id),
          getAveragePagesPerWeek(user.id)
        ]);
        
        const profileMessage = getReaderProfileMessage(booksRead, segmentsValidated, readingTime);
        
        setStats({
          booksRead,
          segmentsValidated,
          totalPages,
          readingTime,
          avgPagesPerWeek,
          profileMessage
        });
      } catch (error) {
        console.error("Erreur lors de la récupération des statistiques:", error);
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchStats();
  }, [user?.id]);

  const formatReadingTime = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    
    if (hours === 0) return `${mins} min`;
    if (mins === 0) return `${hours} h`;
    return `${hours} h ${mins} min`;
  };

  // Fonction pour obtenir le texte des livres avec bon accord
  const getBooksText = () => {
    if (stats.booksRead === 0) return "Aucun livre terminé";
    if (stats.booksRead === 1) return "Livre terminé";
    return "Livres terminés";
  };

  return (
    <Card className="border-coffee-light">
      <CardHeader className="pb-2">
        <CardTitle className="text-xl font-serif text-coffee-darker flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-coffee-dark" />
          Mes statistiques de lecture
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center py-6">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-coffee-light border-t-coffee-dark" />
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
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
                  <span className="text-sm">Temps de lecture estimé</span>
                </div>
                <p className="text-2xl font-medium text-coffee-darker">{formatReadingTime(stats.readingTime)}</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <div className="flex items-center text-muted-foreground">
                  <Award className="h-4 w-4 mr-1" />
                  <span className="text-sm">Validations de segments</span>
                </div>
                <p className="text-2xl font-medium text-coffee-darker">{stats.segmentsValidated}</p>
              </div>
              <div className="space-y-1">
                <div className="flex items-center text-muted-foreground">
                  <BookOpen className="h-4 w-4 mr-1" />
                  <span className="text-sm">Moyenne hebdomadaire</span>
                </div>
                <p className="text-2xl font-medium text-coffee-darker">{stats.avgPagesPerWeek} pages/sem</p>
              </div>
            </div>
            
            <div className="mt-6 py-3 text-center bg-coffee-lightest rounded-lg">
              <p className="text-coffee-dark font-serif text-lg italic">
                {stats.profileMessage}
              </p>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
