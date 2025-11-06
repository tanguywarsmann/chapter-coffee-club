import { Button } from "@/components/ui/button"
import { supabase } from "@/integrations/supabase/client"
import { saveAs } from "file-saver"
import { useAuth } from "@/contexts/AuthContext"
import { useEffect, useState } from "react"
import { toast } from "sonner"

export default function ExportPage() {
  const { user } = useAuth()
  const [isAdmin, setIsAdmin] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function checkAdminStatus() {
      if (!user) {
        setIsLoading(false)
        return
      }

      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('is_admin')
          .eq('id', user.id)
          .single()

        if (error) {
          console.error('Error checking admin status:', error)
          toast.error("Erreur lors de la vérification des permissions")
          return
        }

        setIsAdmin(data?.is_admin || false)
      } catch (error) {
        console.error('Error checking admin status:', error)
        toast.error("Erreur lors de la vérification des permissions")
      } finally {
        setIsLoading(false)
      }
    }

    checkAdminStatus()
  }, [user])

  async function exportData() {
    if (!isAdmin) {
      toast.error("Accès non autorisé - Seuls les administrateurs peuvent exporter les données")
      return
    }
    const tables = ["books", "reading_progress", "reading_questions", "reading_validations"] as const
    let fullSQL = "-- Export SQL pour VREAD\n\n"

    for (const table of tables) {
      const { data, error } = await supabase.from(table as any).select("*")
      if (error || !data) {
        console.error(`Erreur sur ${table}`, error)
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
          if (Array.isArray(val)) return `'${JSON.stringify(val)}'`
          return val
        })
        fullSQL += `INSERT INTO ${table} (${columns.join(", ")}) VALUES (${values.join(", ")});\n`
      }
      fullSQL += `\n`
    }

    const blob = new Blob([fullSQL], { type: "text/sql;charset=utf-8" })
    saveAs(blob, "read_export.sql")
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-6 bg-white text-black">
        <h1 className="text-2xl font-bold">Vérification des permissions...</h1>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-6 bg-white text-black">
        <h1 className="text-2xl font-bold">Accès non autorisé</h1>
        <p>Vous devez être connecté pour accéder à cette page.</p>
      </div>
    )
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-6 bg-white text-black">
        <h1 className="text-2xl font-bold">Accès non autorisé</h1>
        <p>Seuls les administrateurs peuvent exporter les données.</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-6 bg-white text-black">
      <h1 className="text-2xl font-bold">Export de la base VREAD</h1>
      <Button onClick={exportData}>Exporter la base VREAD (SQL)</Button>
    </div>
  )
}
