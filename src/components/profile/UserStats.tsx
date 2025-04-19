
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getUserStats } from "@/mock/stats";
import { BookOpen, Clock } from "lucide-react";

export function UserStats() {
  const stats = getUserStats();
  
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
              <span className="text-sm">Livres terminés</span>
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
      </CardContent>
    </Card>
  );
}
