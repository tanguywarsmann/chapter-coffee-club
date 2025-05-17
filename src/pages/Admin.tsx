
import { useEffect, useState } from "react";
import { AppHeader } from "@/components/layout/AppHeader";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { AdminGuard } from "@/components/admin/AdminGuard";
import { AdminBookList } from "@/components/admin/AdminBookList";
import { AdminDebugPanel } from "@/components/admin/AdminDebugPanel";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { AlertTriangle, FileText } from "lucide-react";
import { generateCsvExport } from "@/components/admin/utils/csvExport";
import { toast } from "@/hooks/use-toast";
import ExportSQLButtonFinal from "@/components/admin/ExportSQLButtonFinal";

export default function Admin() {
  const [activeTab, setActiveTab] = useState("books");

  const handleExportCsv = async () => {
    try {
      await generateCsvExport();
      toast({
        title: "Export réussi : Le fichier CSV des segments manquants a été téléchargé",
      });
    } catch (error) {
      console.error("Erreur lors de l'export CSV:", error);
      toast({
        title: "Erreur d'export : Impossible de générer le fichier CSV",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    console.log("Admin page initialized");
  }, []);

  return (
    <AuthGuard>
      <AdminGuard>
        <div className="min-h-screen bg-logo-background text-logo-text">
          <AppHeader />
          <main className="container py-6 space-y-6">
            <div className="flex items-center justify-between">
              <h1 className="text-3xl font-serif font-medium text-coffee-darker">Administration</h1>
              <div className="flex gap-3">
                <Button onClick={handleExportCsv} variant="outline" className="gap-2">
                  <FileText className="h-4 w-4" />
                  Exporter les segments manquants
                </Button>
                <ExportSQLButtonFinal />
              </div>
            </div>

            <AdminDebugPanel />

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
                      <span className="w-4 h-4 mr-2">📚</span>
                      Validation des livres
                    </TabsTrigger>
                    <TabsTrigger value="settings" className="flex items-center">
                      <span className="w-4 h-4 mr-2">⚙️</span>
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
