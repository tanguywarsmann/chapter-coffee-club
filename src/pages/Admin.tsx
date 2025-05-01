
import { useEffect, useState } from "react";
import { AppHeader } from "@/components/layout/AppHeader";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { AdminGuard } from "@/components/admin/AdminGuard";
import { AdminBookList } from "@/components/admin/AdminBookList";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookOpen, AlertTriangle, Settings } from "lucide-react";

export default function Admin() {
  const [activeTab, setActiveTab] = useState("books");

  return (
    <AuthGuard>
      <AdminGuard>
        <div className="min-h-screen bg-logo-background text-logo-text">
          <AppHeader />
          
          <main className="container py-6 space-y-6">
            <div className="flex items-center justify-between">
              <h1 className="text-3xl font-serif font-medium text-coffee-darker">Administration</h1>
            </div>
            
            <Card className="border-coffee-light">
              <CardHeader className="pb-3">
                <CardTitle>Tableau de bord administrateur</CardTitle>
                <CardDescription>
                  Gérez les livres et vérifiez l'état des questions de validation
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full">
                  <TabsList className="mb-6">
                    <TabsTrigger value="books" className="flex items-center">
                      <BookOpen className="w-4 h-4 mr-2" />
                      Validation des livres
                    </TabsTrigger>
                    <TabsTrigger value="settings" className="flex items-center">
                      <Settings className="w-4 h-4 mr-2" />
                      Paramètres
                    </TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="books">
                    <AdminBookList />
                  </TabsContent>
                  
                  <TabsContent value="settings">
                    <div className="p-8 text-center border border-dashed rounded-lg">
                      <AlertTriangle className="w-12 h-12 mx-auto text-amber-500 mb-4" />
                      <h3 className="text-lg font-medium text-coffee-darker mb-2">
                        Section en développement
                      </h3>
                      <p className="text-muted-foreground">
                        Les paramètres d'administration seront disponibles prochainement
                      </p>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </main>
        </div>
      </AdminGuard>
    </AuthGuard>
  );
}
