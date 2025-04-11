
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AppHeader } from "@/components/layout/AppHeader";
import { ProfileStats } from "@/components/profile/ProfileStats";
import { ProfileBadges } from "@/components/profile/ProfileBadges";
import { BookGrid } from "@/components/books/BookGrid";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getCompletedBooks, getBooksInProgress } from "@/mock/books";
import { getUserBadges } from "@/mock/badges";
import { getUserStats } from "@/mock/stats";

export default function Profile() {
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is logged in
    const user = localStorage.getItem("user");
    if (!user) {
      navigate("/");
    }
  }, [navigate]);

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      
      <main className="container py-6 space-y-8">
        <div className="flex flex-col md:flex-row items-start gap-6">
          <div className="w-full md:w-3/4 space-y-6">
            <h1 className="text-3xl font-serif font-medium text-coffee-darker">Mon profil</h1>
            
            <ProfileStats stats={getUserStats()} />
            
            <ProfileBadges badges={getUserBadges()} />
            
            <Card className="border-coffee-light">
              <CardHeader>
                <CardTitle className="text-xl font-serif text-coffee-darker">Ma bibliothèque</CardTitle>
                <CardDescription>Gardez une trace de vos livres lus et en cours</CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="completed">
                  <TabsList className="mb-4 bg-muted border-coffee-light">
                    <TabsTrigger value="completed" className="data-[state=active]:bg-coffee-dark data-[state=active]:text-white">
                      Terminés
                    </TabsTrigger>
                    <TabsTrigger value="in-progress" className="data-[state=active]:bg-coffee-dark data-[state=active]:text-white">
                      En cours
                    </TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="completed">
                    <BookGrid books={getCompletedBooks()} />
                  </TabsContent>
                  
                  <TabsContent value="in-progress">
                    <BookGrid books={getBooksInProgress()} />
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
          
          <div className="w-full md:w-1/4 sticky top-20">
            <Card className="border-coffee-light">
              <CardHeader>
                <CardTitle className="text-xl font-serif text-coffee-darker">Statistiques de lecture</CardTitle>
                <CardDescription>Votre activité ce mois-ci</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Temps de lecture quotidien</p>
                    <p className="text-2xl font-medium text-coffee-darker">45 minutes</p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Pages lues ce mois</p>
                    <p className="text-2xl font-medium text-coffee-darker">385 pages</p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Livres terminés ce mois</p>
                    <p className="text-2xl font-medium text-coffee-darker">1 livre</p>
                  </div>
                  
                  <div className="pt-4">
                    <h4 className="text-sm font-medium text-coffee-darker mb-2">Activité mensuelle</h4>
                    <div className="grid grid-cols-7 gap-1">
                      {Array.from({ length: 20 }).map((_, i) => {
                        // Mock activity levels - in a real app this would be actual data
                        const activityLevel = Math.floor(Math.random() * 4);
                        return (
                          <div 
                            key={i} 
                            className={`h-6 rounded-sm ${
                              activityLevel === 0 ? 'bg-coffee-light/30' :
                              activityLevel === 1 ? 'bg-coffee-light' :
                              activityLevel === 2 ? 'bg-coffee-medium' : 'bg-coffee-dark'
                            }`}
                          />
                        );
                      })}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
