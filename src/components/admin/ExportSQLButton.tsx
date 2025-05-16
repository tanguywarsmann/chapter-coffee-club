
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { saveAs } from "file-saver";
import { Database } from "lucide-react";

export function ExportSQLButton() {
  async function exportData() {
    try {
      const tables = ["books", "reading_progress", "reading_questions", "reading_validations"];
      
      let fullSQL = "-- Export SQL pour READ\n\n";
      
      for (const table of tables) {
        const { data, error } = await supabase.from(table).select("*");
        if (error) {
          console.error(`Erreur lors de l'export de la table ${table}:`, error);
          continue;
        }
        
        if (!data || data.length === 0) {
          fullSQL += `-- Table: ${table} (aucune donnée)\n\n`;
          continue;
        }
        
        fullSQL += `-- Table: ${table}\n`;
        for (const row of data) {
          const columns = Object.keys(row);
          const values = columns.map(key => {
            const val = row[key];
            if (val === null) return "NULL";
            if (typeof val === "object") return `'${JSON.stringify(val).replace(/'/g, "''")}'`;
            if (typeof val === "string") return `'${val.replace(/'/g, "''")}'`;
            return val;
          });
          fullSQL += `INSERT INTO ${table} (${columns.join(", ")}) VALUES (${values.join(", ")});\n`;
        }
        fullSQL += `\n`;
      }
      
      const blob = new Blob([fullSQL], { type: "text/sql;charset=utf-8" });
      saveAs(blob, "read_export.sql");
      
      console.log("Export SQL généré avec succès");
    } catch (error) {
      console.error("Erreur lors de la génération de l'export SQL:", error);
    }
  }
  
  return (
    <Button onClick={exportData} variant="outline" className="gap-2">
      <Database className="h-4 w-4" />
      Exporter la base READ (format SQL)
    </Button>
  );
}
