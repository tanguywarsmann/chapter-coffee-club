import { Button } from "@/components/ui/button"
import { supabase } from "@/lib/supabase"
import { saveAs } from "file-saver"

export default function ExportSQLButtonV2() {
  async function exportData() {
    const tables = ["books", "reading_progress", "reading_questions", "reading_validations"]

    let fullSQL = "-- Export SQL pour READ\n\n"

    for (const table of tables) {
      const { data, error } = await supabase.from(table as any).select("*")
      if (error) {
        console.error("Erreur export", error)
        continue
      }

      fullSQL += `-- Table: ${table}\n`
      for (const row of data) {
        const columns = Object.keys(row)
        const values = columns.map((key) => {
          const val = row[key]
          if (val === null) return "NULL"
          if (typeof val === "string") return `'${val.replace(/'/g, "''")}'`
          if (typeof val === "boolean") return val ? "TRUE" : "FALSE"
          return val
        })
        fullSQL += `INSERT INTO ${table} (${columns.join(", ")}) VALUES (${values.join(", ")});\n`
      }
      fullSQL += `\n`
    }

    const blob = new Blob([fullSQL], { type: "text/sql;charset=utf-8" })
    saveAs(blob, "read_export.sql")
  }

  return (
    <Button onClick={exportData}>
      Exporter la base READ (format SQL)
    </Button>
  )
}
