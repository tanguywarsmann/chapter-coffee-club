
import { Button } from "@/components/ui/button"
import { supabase } from "@/lib/supabase"
import { saveAs } from "file-saver"
import { Database } from "@/integrations/supabase/client"

export default function ExportSQLButtonFinal() {
  // Liste des tables à exporter avec typage correct
  const tables = ["books", "reading_progress", "reading_questions", "reading_validations"] as const;
  
  async function exportData() {
    let fullSQL = "-- Export SQL pour READ\n\n";

    for (const table of tables) {
      // Utilisation du typage correct pour la requête Supabase
      const { data, error } = await supabase.from(table).select("*");
      
      if (error) {
        console.error(`Erreur lors de l'export de la table ${table}:`, error);
        continue;
      }

      fullSQL += `-- Table: ${table}\n`;
      
      if (data && data.length > 0) {
        for (const row of data) {
          const columns = Object.keys(row);
          const values = columns.map((key) => {
            const val = row[key];
            if (val === null) return "NULL";
            if (typeof val === "string") return `'${val.replace(/'/g, "''")}'`;
            if (typeof val === "boolean") return val ? "TRUE" : "FALSE";
            if (Array.isArray(val)) return `'{${val.map(item => typeof item === "string" ? `"${item}"` : item).join(",")}}'`;
            return val;
          });
          
          fullSQL += `INSERT INTO ${table} (${columns.join(", ")}) VALUES (${values.join(", ")});\n`;
        }
      } else {
        fullSQL += `-- Aucune donnée trouvée dans la table ${table}\n`;
      }
      
      fullSQL += "\n";
    }

    const blob = new Blob([fullSQL], { type: "text/sql;charset=utf-8" });
    saveAs(blob, "read_export.sql");
  }

  return (
    <Button onClick={exportData} variant="outline" className="gap-2">
      Exporter la base READ (SQL)
    </Button>
  );
}
