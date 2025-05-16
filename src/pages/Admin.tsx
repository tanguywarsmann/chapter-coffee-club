import { Button } from "@/components/ui/button"
import { supabase } from "@/integrations/supabase/client"
import { Database } from "lucide-react"

export default function ExportSQLButtonFinal() {
  async function exportData() {
    console.log("click")                             // ← doit s’afficher
    const tables = ["books","reading_progress","reading_questions","reading_validations"] as const
    let fullSQL = "-- Export SQL pour READ\n\n"

    for (const table of tables) {
      const { data, error } = await supabase.from(table as any).select("*")
      if (error || !data) continue

      fullSQL += `-- Table: ${table}\n`
      for (const row of data) {
        const cols = Object.keys(row)
        const vals = cols.map((k)=> {
          const v=row[k]
          if (v===null) return "NULL"
          if (typeof v==="string") return `'${v.replace(/'/g,"''")}'`
          if (typeof v==="boolean") return v?"TRUE":"FALSE"
          if (Array.isArray(v)) return `'${JSON.stringify(v)}'`
          return v
        })
        fullSQL += `INSERT INTO ${table} (${cols.join(", ")}) VALUES (${vals.join(", ")});\n`
      }
      fullSQL += "\n"
    }

    const blob = new Blob([fullSQL],{type:"text/sql;charset=utf-8"})
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement("a")
    a.href = url; a.download = "read_export.sql"; a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <Button onClick={exportData} variant="outline" className="gap-2">
      <Database className="h-4 w-4" />
      Exporter la base READ&nbsp;(SQL)
    </Button>
  )
}
