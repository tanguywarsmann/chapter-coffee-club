import { Button } from "@/components/ui/button"
import { saveAs } from "file-saver"

export function ExportSQLButton() {
  function handleClick() {
    const blob = new Blob(["Test export SQL"], { type: "text/plain;charset=utf-8" })
    saveAs(blob, "test-export.txt")
  }

  return (
    <Button onClick={handleClick}>
      Test Export SQL
    </Button>
  )
}
