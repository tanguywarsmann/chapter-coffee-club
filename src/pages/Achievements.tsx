import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AppHeader } from "@/components/layout/AppHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/types/badge";
import { getUserBadges } from "@/mock/badges";
import { Award, BookOpen, Clock, Zap } from "lucide-react";
import { StreakCard } from "@/components/achievements/StreakCard";
import { getUserStreak } from "@/services/streakService";

export default function Achievements() {
  const navigate = useNavigate();
  const badges = getUserBadges();
  const userId = localStorage.getItem("user");
  const streak = getUserStreak(userId || "user123");

  useEffect(() => {
    if (!userId) {
      navigate("/");
    }
  }, [navigate, userId]);

  // Mocked badges that are still locked
  const lockedBadges: Omit<Badge, "dateEarned">[] = [
    {
      id: "locked1",
      name: "Lecteur Assidu",
      description: "Lire pendant 30 jours consécutifs",
      icon: "🔥",
      color: "orange-100"
    },
    {
      id: "locked2",
      name: "Explorateur Littéraire",
      description: "Lire des livres dans 5 catégories différentes",
      icon: "🧭",
      color: "blue-100"
    },
    {
      id: "locked3",
      name: "Marathonien",
      description: "Lire 10 livres en un mois",
      icon: "🏃",
      color: "green-100"
    },
    {
      id: "locked4",
      name: "Expert en Classiques",
      description: "Lire 10 classiques de la littérature",
      icon: "📜",
      color: "coffee-light"
    },
    {
      id: "locked5",
      name: "Lecteur Nocturne",
      description: "Lire plus de 3 heures après 22h",
      icon: "🌙",
      color: "purple-100"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      
      <main className="container py-6 space-y-8">
        <h1 className="text-3xl font-serif font-medium text-coffee-darker">Récompenses et défis</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="md:col-span-2">
            <StreakCard 
              currentStreak={streak.current_streak} 
              longestStreak={streak.longest_streak} 
            />
          </div>
          
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
          
          <div className="bg-gradient-to-br from-coffee-light to-chocolate-light rounded-lg p-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-coffee-darker">Série actuelle</p>
              <p className="text-3xl font-bold text-coffee-darker">12j</p>
            </div>
            <Zap className="h-8 w-8 text-coffee-darker" />
          </div>
        </div>
        
        <Card className="border-coffee-light">
          <CardHeader>
            <CardTitle className="text-xl font-serif text-coffee-darker">Badges</CardTitle>
            <CardDescription>Collectionnez des badges en relevant des défis de lecture</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="earned">
              <TabsList className="mb-6 bg-muted border-coffee-light">
                <TabsTrigger value="earned" className="data-[state=active]:bg-coffee-dark data-[state=active]:text-white">
                  Badges obtenus ({badges.length})
                </TabsTrigger>
                <TabsTrigger value="locked" className="data-[state=active]:bg-coffee-dark data-[state=active]:text-white">
                  À débloquer ({lockedBadges.length})
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="earned">
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                  {badges.map(badge => (
                    <div key={badge.id} className="flex flex-col items-center text-center space-y-3">
                      <div className={`w-24 h-24 rounded-full bg-${badge.color} flex items-center justify-center shadow-md`}>
                        <span className="text-4xl">{badge.icon}</span>
                      </div>
                      <div className="space-y-1">
                        <h3 className="font-medium text-coffee-darker">{badge.name}</h3>
                        <p className="text-xs text-muted-foreground">{badge.description}</p>
                        <p className="text-xs font-medium text-coffee-medium mt-1">Obtenu le {badge.dateEarned}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>
              
              <TabsContent value="locked">
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                  {lockedBadges.map(badge => (
                    <div key={badge.id} className="flex flex-col items-center text-center space-y-3 opacity-70">
                      <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center shadow-sm relative">
                        <span className="text-4xl grayscale">{badge.icon}</span>
                        <div className="absolute inset-0 rounded-full bg-coffee-dark/20 flex items-center justify-center">
                          <span className="text-xl">🔒</span>
                        </div>
                      </div>
                      <div className="space-y-1">
                        <h3 className="font-medium text-coffee-darker">{badge.name}</h3>
                        <p className="text-xs text-muted-foreground">{badge.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
        
        <Card className="border-coffee-light">
          <CardHeader>
            <CardTitle className="text-xl font-serif text-coffee-darker">Défis actuels</CardTitle>
            <CardDescription>Des défis pour vous motiver à lire plus</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="border border-coffee-light rounded-lg p-4">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-medium text-coffee-darker text-lg">Lecture quotidienne</h3>
                    <p className="text-sm text-muted-foreground">Lisez tous les jours pendant 7 jours consécutifs</p>
                  </div>
                  <div className="bg-coffee-light rounded-full px-3 py-1 text-xs font-medium text-coffee-darker">
                    En cours
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Progression</span>
                    <span className="font-medium text-coffee-darker">5/7 jours</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-coffee-dark" style={{ width: '71.4%' }}></div>
                  </div>
                </div>
              </div>
              
              <div className="border border-coffee-light rounded-lg p-4">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-medium text-coffee-darker text-lg">Explorateur de genres</h3>
                    <p className="text-sm text-muted-foreground">Lisez des livres de 3 catégories différentes</p>
                  </div>
                  <div className="bg-coffee-light rounded-full px-3 py-1 text-xs font-medium text-coffee-darker">
                    En cours
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Progression</span>
                    <span className="font-medium text-coffee-darker">2/3 catégories</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-coffee-dark" style={{ width: '66.7%' }}></div>
                  </div>
                </div>
              </div>
              
              <div className="border border-coffee-light rounded-lg p-4">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-medium text-coffee-darker text-lg">Marathon de pages</h3>
                    <p className="text-sm text-muted-foreground">Lisez 500 pages en un mois</p>
                  </div>
                  <div className="bg-coffee-light rounded-full px-3 py-1 text-xs font-medium text-coffee-darker">
                    En cours
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Progression</span>
                    <span className="font-medium text-coffee-darker">385/500 pages</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-coffee-dark" style={{ width: '77%' }}></div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
