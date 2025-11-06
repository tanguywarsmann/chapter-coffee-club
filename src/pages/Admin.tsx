import { useEffect, useState } from "react";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { AdminGuard } from "@/components/admin/AdminGuard";
import AdminLayout from "@/components/admin/AdminLayout";
import { AdminBookList } from "@/components/admin/AdminBookList";
import { AdminDebugPanel } from "@/components/admin/AdminDebugPanel";
import { BlogAdminPanel } from "@/components/admin/BlogAdminPanel";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { AlertTriangle, FileText, Database } from "lucide-react";
import { generateCsvExport } from "@/components/admin/utils/csvExport";
import { toast } from "sonner";
import { useIsMobile } from "@/hooks/use-mobile";
import ExportSQLButtonFinal from "@/components/admin/ExportSQLButtonFinal";
import { texts } from "@/i18n/texts";
import { supabase } from "@/integrations/supabase/client";
import { VercelWebhook } from "@/components/admin/VercelWebhook";
import BackgroundCoverBatcher from "@/components/BackgroundCoverBatcher";

export default function Admin() {
  const [activeTab, setActiveTab] = useState("books");
  const isMobile = useIsMobile();

  const handleExportCsv = async () => {
    try {
      await generateCsvExport();
      toast.success("le fichier CSV des segments manquants a été téléchargé", {
        description: "Export réussi"
      });
    } catch (error) {
      console.error("Erreur lors de l'export CSV:", error);
      toast.error("impossible de générer le fichier CSV", {
        description: "Erreur d'export"
      });
    }
  };

  const handleExportFullData = async () => {
    try {
      const tables = ["books", "reading_progress", "reading_questions", "reading_validations"] as const;
      let fullSQL = "-- Export SQL pour VREAD\n\n";

      for (const table of tables) {
        const { data, error } = await supabase.from(table as any).select("*");
        if (error || !data) {
          console.error(`Erreur sur ${table}`, error);
          continue;
        }

        fullSQL += `-- Table: ${table}\n`;
        for (const row of data) {
          const columns = Object.keys(row);
          const values = columns.map((key) => {
            const val = row[key];
            if (val === null) return "NULL";
            if (typeof val === "string") return `'${val.replace(/'/g, "''")}'`;
            if (typeof val === "boolean") return val ? "TRUE" : "FALSE";
            if (Array.isArray(val)) return `'${JSON.stringify(val)}'`;
            return val;
          });
          fullSQL += `INSERT INTO ${table} (${columns.join(", ")}) VALUES (${values.join(", ")});\n`;
        }
        fullSQL += `\n`;
      }

      // Using native download method instead of file-saver
      const blob = new Blob([fullSQL], { type: "text/sql;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "read_export.sql";
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      
      toast.success("le fichier SQL a été téléchargé", {
        description: "Export complet réussi"
      });
    } catch (error) {
      console.error("Erreur lors de l'export complet:", error);
      toast.error("impossible de générer le fichier SQL complet", {
        description: "Erreur d'export"
      });
    }
  };

  return (
    <AuthGuard>
      <AdminGuard>
        <AdminLayout>
          <div className="min-h-screen bg-logo-background text-logo-text">
            <main className="mx-auto w-full px-4 max-w-none py-6 space-y-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <h1 className="text-3xl font-serif font-medium text-coffee-darker">{texts.admin}</h1>
              
              {/* Simplified buttons on mobile */}
              {!isMobile && (
                <div className="flex gap-3">
                  <Button onClick={handleExportCsv} variant="outline" className="gap-2">
                    <FileText className="h-4 w-4" />
                    Exporter les segments manquants
                  </Button>
                  <Button onClick={handleExportFullData} variant="outline" className="gap-2">
                    <Database className="h-4 w-4" />
                    {texts.exportData}
                  </Button>
                  <ExportSQLButtonFinal />
                </div>
              )}
              
              {/* Mobile simplified actions */}
              {isMobile && (
                <div className="flex gap-2">
                  <Button onClick={handleExportCsv} variant="outline" size="sm">
                    CSV
                  </Button>
                  <Button onClick={handleExportFullData} variant="outline" size="sm">
                    SQL
                  </Button>
                </div>
              )}
            </div>

            {/* Only render debug panel on desktop */}
            {!isMobile && <AdminDebugPanel />}
            
            {/* Add Vercel webhook configuration */}
            <VercelWebhook />

            <Card className="border-coffee-light">
              <CardHeader className="pb-3">
                <CardTitle>{texts.adminDashboard}</CardTitle>
                <CardDescription>
                  Gérer les livres, articles de blog et vérifier le statut des questions de validation
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full">
                  <TabsList className="mb-6">
                    <TabsTrigger value="books" className="flex items-center">
                      <span className="w-4 h-4 mr-2">📚</span>
                      {texts.bookValidation}
                    </TabsTrigger>
                    <TabsTrigger value="blog" className="flex items-center">
                      <span className="w-4 h-4 mr-2">📝</span>
                      Blog
                    </TabsTrigger>
                    <TabsTrigger value="settings" className="flex items-center">
                      <span className="w-4 h-4 mr-2">⚙️</span>
                      {texts.settings}
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="books">
                    <AdminBookList />
                  </TabsContent>

                  <TabsContent value="blog">
                    <BlogAdminPanel />
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
            
            {/* Batch auto-cover generator - runs in background for admins */}
            <BackgroundCoverBatcher
              enabled={true}
              batchSize={20}
              concurrency={3}
              delayBetweenBatchesMs={2000}
              variant="all"
            />
          </div>
        </AdminLayout>
      </AdminGuard>
    </AuthGuard>
  );
}
