
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { saveAs } from "file-saver";
import { Database } from "lucide-react";

export default function ExportSQLButtonFinal() {
  async function exportData() {
    const tables = ["books", "reading_progress", "reading_questions", "reading_validations"] as const;
    let fullSQL = "-- Export SQL pour READ\n\n";

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

    const blob = new Blob([fullSQL], { type: "text/sql;charset=utf-8" });
    saveAs(blob, "read_export.sql");
  }

  return (
    <Button onClick={exportData} variant="outline" className="gap-2">
      <Database className="h-4 w-4" />
      Exporter la base READ (SQL)
    </Button>
  );
}
