import { useEffect, useMemo, useState } from 'react'
import { generateAndSaveCover, listBooksNeedingCover } from '@/utils/generateCover'
import { useAuth } from '@/contexts/AuthContext'
import { toast } from 'sonner'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { ArrowLeft, RefreshCw, Play } from 'lucide-react'
import { AuthGuard } from "@/components/auth/AuthGuard";
import { AdminGuard } from "@/components/admin/AdminGuard";
import AdminLayout from "@/components/admin/AdminLayout";

type Variant = 'ot' | 'nt' | 'talmud' | 'other' | 'all'

export default function AdminAutoCovers() {
  const { user } = useAuth()
  const [variant, setVariant] = useState<Variant>('all')
  const [books, setBooks] = useState<any[]>([])
  const [running, setRunning] = useState(false)
  const [done, setDone] = useState(0)
  const [failed, setFailed] = useState<{id:string; title:string; error:string}[]>([])
  const [limit, setLimit] = useState(500)

  useEffect(()=>{ load() },[variant, limit])
  async function load() {
    try {
      const data = await listBooksNeedingCover(limit, variant==='all' ? 'all' : variant as any)
      setBooks(data); setDone(0); setFailed([])
    } catch (e:any) {
      toast.error(e.message)
    }
  }

  async function runBatch() {
    if (!books.length) { 
      toast('Rien à faire')
      return
    }
    setRunning(true); setDone(0); setFailed([])
    // petite pool de concurrence
    const POOL = 4
    let i = 0
    const next = async () => {
      if (i >= books.length) return
      const b = books[i++]
      try {
        await generateAndSaveCover(b)
      } catch (e:any) {
        setFailed(prev => [...prev, { id: b.id, title: b.title, error: e.message || 'err' }])
      } finally {
        setDone(prev => prev + 1)
        await next()
      }
    }
    await Promise.all(Array.from({length: Math.min(POOL, books.length)}, next))
    setRunning(false)
    toast.success(`Batch terminé : ${books.length - failed.length} OK, ${failed.length} erreurs`)
  }

  const progress = useMemo(()=> books.length? Math.round(done*100/books.length) : 0, [done, books.length])

  return (
    <AuthGuard>
      <AdminGuard>
        <AdminLayout>
          <div className="max-w-4xl mx-auto p-6 space-y-6">
            <div>
              <h1 className="text-h1 font-medium mb-2">Auto-covers (JPEG)</h1>
              <p className="text-body-sm text-muted-foreground">
                Génère de vraies couvertures pour les livres sans image (ou fausse URL).
              </p>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Configuration</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div className="space-y-2">
                    <Label>Groupe</Label>
                    <Select value={variant} onValueChange={(value: Variant) => setVariant(value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Tous</SelectItem>
                        <SelectItem value="ot">Ancien Testament</SelectItem>
                        <SelectItem value="nt">Nouveau Testament</SelectItem>
                        <SelectItem value="talmud">Talmud</SelectItem>
                        <SelectItem value="other">Autres</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Limite</Label>
                    <Input 
                      type="number" 
                      min={1} 
                      max={2000} 
                      value={limit}
                      onChange={e=>setLimit(parseInt(e.target.value||'500',10))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>&nbsp;</Label>
                    <div className="flex gap-2">
                      <Button onClick={load} variant="outline" className="flex-1">
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Rafraîchir
                      </Button>
                      <Button 
                        onClick={runBatch} 
                        disabled={!books.length || running} 
                        className="flex-1"
                      >
                        <Play className="h-4 w-4 mr-2" />
                        {running ? `En cours…` : `Générer ${books.length}`}
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="text-body-sm text-muted-foreground">
                  {books.length} livres à traiter — {done}/{books.length} effectués ({progress}%)
                </div>

                {running && (
                  <div className="mt-4">
                    <Progress value={progress} className="w-full" />
                  </div>
                )}
              </CardContent>
            </Card>

            {!!failed.length && (
              <Alert variant="destructive">
                <AlertDescription>
                  <div className="font-medium mb-2">Échecs ({failed.length})</div>
                  <ul className="list-disc ml-5 space-y-1">
                    {failed.slice(0,10).map(f => (
                      <li key={f.id} className="text-sm">
                        {f.title} — {f.error}
                      </li>
                    ))}
                  </ul>
                </AlertDescription>
              </Alert>
            )}

            {books.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Aperçu des livres</CardTitle>
                  <CardDescription>
                    Premiers {Math.min(10, books.length)} livres de la liste
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {books.slice(0,10).map(b=>(
                      <div key={b.id} className="border rounded-lg p-3">
                        <div className="text-body font-medium">{b.title}</div>
                        <div className="text-caption text-muted-foreground">{b.slug}</div>
                        <div className="text-caption text-muted-foreground">
                          {b.author} {b.tags?.length ? `• ${b.tags.join(', ')}` : ''}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </AdminLayout>
      </AdminGuard>
    </AuthGuard>
  )
}