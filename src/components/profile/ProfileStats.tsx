
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, Clock, Award, CalendarDays } from "lucide-react";

interface ProfileStatsProps {
  stats: {
    booksRead: number;
    booksInProgress: number;
    totalPages: number;
    streak: number;
    badgesEarned: number;
    readingHours: number;
  };
}

export function ProfileStats({ stats }: ProfileStatsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Card className="border-coffee-light">
        <CardHeader className="pb-2">
          <CardTitle className="text-xl font-serif text-coffee-darker">Statistiques générales</CardTitle>
          <CardDescription>Votre parcours de lecture</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col space-y-1">
              <span className="text-sm text-muted-foreground">Livre{stats.booksRead > 1 ? "s" : ""} terminé{stats.booksRead > 1 ? "s" : ""}</span>
              <div className="flex items-center">
                <BookOpen className="h-4 w-4 mr-1 text-coffee-dark" />
                <span className="text-2xl font-medium text-coffee-darker">{stats.booksRead}</span>
              </div>
            </div>
            <div className="flex flex-col space-y-1">
              <span className="text-sm text-muted-foreground">En cours</span>
              <div className="flex items-center">
                <BookOpen className="h-4 w-4 mr-1 text-coffee-dark" />
                <span className="text-2xl font-medium text-coffee-darker">{stats.booksInProgress}</span>
              </div>
            </div>
            <div className="flex flex-col space-y-1">
              <span className="text-sm text-muted-foreground">Pages lues</span>
              <span className="text-2xl font-medium text-coffee-darker">{stats.totalPages}</span>
            </div>
            <div className="flex flex-col space-y-1">
              <span className="text-sm text-muted-foreground">Badge{stats.badgesEarned > 1 ? "s" : ""} gagné{stats.badgesEarned > 1 ? "s" : ""}</span>
              <div className="flex items-center">
                <Award className="h-4 w-4 mr-1 text-coffee-dark" />
                <span className="text-2xl font-medium text-coffee-darker">{stats.badgesEarned}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card className="border-coffee-light">
        <CardHeader className="pb-2">
          <CardTitle className="text-xl font-serif text-coffee-darker">Activité récente</CardTitle>
          <CardDescription>Vos habitudes de lecture</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col space-y-1">
              <span className="text-sm text-muted-foreground">Série actuelle</span>
              <div className="flex items-center">
                <CalendarDays className="h-4 w-4 mr-1 text-coffee-dark" />
                <span className="text-2xl font-medium text-coffee-darker">{stats.streak} jour{stats.streak > 1 ? "s" : ""}</span>
              </div>
            </div>
            <div className="flex flex-col space-y-1">
              <span className="text-sm text-muted-foreground">Temps de lecture</span>
              <div className="flex items-center">
                <Clock className="h-4 w-4 mr-1 text-coffee-dark" />
                <span className="text-2xl font-medium text-coffee-darker">{stats.readingHours}h</span>
              </div>
            </div>
          </div>
          
          <div className="mt-4">
            <h4 className="text-sm font-medium text-coffee-darker mb-2">Cette semaine</h4>
            <div className="grid grid-cols-7 gap-1">
              {Array.from({ length: 7 }).map((_, i) => {
                // Mock activity levels - in a real app this would be actual data
                const activityLevel = Math.floor(Math.random() * 4);
                return (
                  <div 
                    key={i} 
                    className={`h-8 rounded-sm ${
                      activityLevel === 0 ? 'bg-coffee-light/30' :
                      activityLevel === 1 ? 'bg-coffee-light' :
                      activityLevel === 2 ? 'bg-coffee-medium' : 'bg-coffee-dark'
                    }`}
                  />
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
