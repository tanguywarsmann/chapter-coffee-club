
import { useEffect, useState } from "react";
import { AppHeader } from "@/components/layout/AppHeader";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { AdminGuard } from "@/components/admin/AdminGuard";
import { AdminBookList } from "@/components/admin/AdminBookList";
import { AdminDebugPanel } from "@/components/admin/AdminDebugPanel";
import { UUIDValidationTest } from "@/components/admin/UUIDValidationTest";
import { AdminFormTester } from "@/components/admin/AdminFormTester";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { AlertTriangle, FileText, TestTube, FlaskConical } from "lucide-react";
import { generateCsvExport } from "@/components/admin/utils/csvExport";
import { toast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
import ExportSQLButtonFinal from "@/components/admin/ExportSQLButtonFinal";
import { texts } from "@/i18n/texts";

export default function Admin() {
  const [activeTab, setActiveTab] = useState("books");
  const isMobile = useIsMobile();

  const handleExportCsv = async () => {
    try {
      await generateCsvExport();
      toast({
        title: "Export réussi : le fichier CSV des segments manquants a été téléchargé",
      });
    } catch (error) {
      console.error("Erreur lors de l'export CSV:", error);
      toast({
        title: "Erreur d'export : impossible de générer le fichier CSV",
        variant: "destructive",
      });
    }
  };

  return (
    <AuthGuard>
      <AdminGuard>
        <div className="min-h-screen bg-logo-background text-logo-text">
          <AppHeader />
          <main className="container py-6 space-y-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <h1 className="text-3xl font-serif font-medium text-coffee-darker">{texts.admin}</h1>
              
              {/* Simplified buttons on mobile */}
              {!isMobile && (
                <div className="flex gap-3">
                  <Button onClick={handleExportCsv} variant="outline" className="gap-2">
                    <FileText className="h-4 w-4" />
                    Exporter les segments manquants
                  </Button>
                  <ExportSQLButtonFinal />
                </div>
              )}
              
              {/* Mobile simplified actions */}
              {isMobile && (
                <div className="flex">
                  <Button onClick={handleExportCsv} variant="outline" size="sm" className="w-full">
                    Exporter CSV
                  </Button>
                </div>
              )}
            </div>

            {/* Only render debug panel on desktop */}
            {!isMobile && <AdminDebugPanel />}

            <Card className="border-coffee-light">
              <CardHeader className="pb-3">
                <CardTitle>{texts.adminDashboard}</CardTitle>
                <CardDescription>
                  Gérer les livres et vérifier le statut des questions de validation
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full">
                  <TabsList className="mb-6">
                    <TabsTrigger value="books" className="flex items-center">
                      <span className="w-4 h-4 mr-2">📚</span>
                      {texts.bookValidation}
                    </TabsTrigger>
                    <TabsTrigger value="uuid-test" className="flex items-center">
                      <TestTube className="h-4 w-4 mr-2" />
                      Test UUID
                    </TabsTrigger>
                    <TabsTrigger value="form-tester" className="flex items-center">
                      <FlaskConical className="h-4 w-4 mr-2" />
                      Test Formulaires
                    </TabsTrigger>
                    <TabsTrigger value="settings" className="flex items-center">
                      <span className="w-4 h-4 mr-2">⚙️</span>
                      {texts.settings}
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="books">
                    <AdminBookList />
                  </TabsContent>

                  <TabsContent value="uuid-test">
                    <UUIDValidationTest />
                  </TabsContent>

                  <TabsContent value="form-tester">
                    <AdminFormTester />
                  </TabsContent>

                  <TabsContent value="settings">
                    <div className="p-8 text-center border border-dashed rounded-lg">
                      <AlertTriangle className="w-12 h-12 mx-auto text-amber-500 mb-4" />
                      <h3 className="text-lg font-medium text-coffee-darker mb-2">
                        {texts.sectionUnderDevelopment}
                      </h3>
                      <p className="text-muted-foreground">
                        {texts.adminSettingsAvailableSoon}
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
