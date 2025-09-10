import { useState } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { AuthGuard } from "@/components/auth/AuthGuard";
import { AdminGuard } from "@/components/admin/AdminGuard";
import AdminLayout from '@/components/admin/AdminLayout';

type Step = {
  key: string
  label: string
  run: () => Promise<void>
}

export default function AdminAudit() {
  const [logs, setLogs] = useState<string[]>([])
  const [status, setStatus] = useState<'idle'|'running'|'ok'|'fail'>('idle')

  function log(line: string) {
    setLogs(prev => [...prev, line])
    console.debug('[AUDIT]', line)
  }

  async function genTestJPEGBlob(title: string) {
    const W = 512, H = 768
    const c = document.createElement('canvas')
    c.width = W; c.height = H
    const ctx = c.getContext('2d')
    if (!ctx) throw new Error('Canvas 2D non dispo')
    // fond pastel fixe
    ctx.fillStyle = '#F6FAFF'
    ctx.fillRect(0,0,W,H)
    // titre
    ctx.fillStyle = '#2E4159'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.font = '600 28px system-ui, -apple-system, Segoe UI, Roboto, serif'
    // wrap ultra-simple
    const lines = []
    const words = (title || 'Audit Cover').split(/\s+/)
    let line = ''
    for (const w of words) {
      const test = line ? `${line} ${w}` : w
      if (ctx.measureText(test).width > (W-72) && line) { lines.push(line); line = w }
      else line = test
    }
    if (line) lines.push(line)
    const lh = 36
    const startY = H/2 - (lines.length*lh)/2
    lines.forEach((ln, i)=> ctx.fillText(ln, W/2, startY + i*lh))
    // icône
    ctx.font = '20px system-ui, -apple-system, Segoe UI, Roboto, serif'
    ctx.fillText('🕊', W/2, H-28)

    const blob: Blob = await new Promise((res, rej) =>
      c.toBlob(b => b ? res(b) : rej(new Error('toBlob null')), 'image/jpeg', 0.9)
    )
    return blob
  }

  function slugify(s: string) {
    return (s || '')
      .toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
  }

  async function runAudit() {
    setLogs([]); setStatus('running')

    const steps: Step[] = [
      {
        key: 'auth',
        label: 'Vérification session admin',
        run: async () => {
          const { data: { user }, error } = await supabase.auth.getUser()
          if (error) throw error
          if (!user) throw new Error('Pas de session')
          const isAdmin = user.user_metadata?.is_admin === true
          if (!isAdmin) throw new Error('Utilisateur non admin (is_admin=false)')
          log(`OK admin: ${user.email || user.id}`)
        }
      },
      {
        key: 'select_books',
        label: 'Lecture books (RLS SELECT)',
        run: async () => {
          const { data, error } = await supabase
            .from('books')
            .select('id,title,cover_url')
            .limit(1)
          if (error) throw error
          if (!data || !data.length) log('Aucun livre trouvé (ce n\'est pas une erreur si la base est vide)')
          else log(`OK lecture books: ${data[0].title}`)
        }
      },
      {
        key: 'gen_jpeg',
        label: 'Génération JPEG (Canvas)',
        run: async () => {
          const blob = await genTestJPEGBlob('Audit Cover')
          if (!blob || blob.size < 1000) throw new Error('JPEG trop petit ou vide')
          log(`OK JPEG: ${(blob.size/1024).toFixed(1)} kB`)
        }
      },
      {
        key: 'upload_storage',
        label: 'Upload Storage (covers/auto)',
        run: async () => {
          const blob = await genTestJPEGBlob('Audit Cover')
          const path = `auto/audit-${Date.now()}.jpg`
          const up = await supabase.storage.from('covers')
            .upload(path, blob, { upsert: true, contentType: 'image/jpeg' })
          if (up.error) throw up.error
          log(`OK upload: ${path}`)
          // on stocke le chemin sur window pour l'étape suivante
          ;(window as any).__audit_path = path
        }
      },
      {
        key: 'update_book',
        label: 'Update DB cover_url (rollback)',
        run: async () => {
          // on prend un livre arbitraire (le premier), on sauvegarde son cover_url, on fait un update, puis rollback
          const { data, error } = await supabase
            .from('books')
            .select('id,cover_url,title')
            .limit(1)
          if (error) throw error
          if (!data || !data.length) { log('Pas de livre à mettre à jour → on saute cette étape'); return }
          const b = data[0]
          const prev = b.cover_url
          const { data: pub } = supabase.storage.from('covers').getPublicUrl((window as any).__audit_path)
          const url = pub?.publicUrl
          if (!url) throw new Error('URL publique introuvable')

          // update
          const upd = await supabase.from('books').update({ cover_url: url }).eq('id', b.id)
          if (upd.error) throw upd.error
          log(`OK update cover_url sur: ${b.title}`)

          // rollback
          const rb = await supabase.from('books').update({ cover_url: prev }).eq('id', b.id)
          if (rb.error) throw rb.error
          log('OK rollback cover_url')
        }
      },
      {
        key: 'cleanup',
        label: 'Nettoyage (delete fichier test)',
        run: async () => {
          const p = (window as any).__audit_path as string | undefined
          if (!p) { log('Skip nettoyage (pas de path enregistré)'); return }
          const del = await supabase.storage.from('covers').remove([p])
          if (del.error) throw del.error
          log('OK suppression fichier test')
        }
      }
    ]

    try {
      for (const s of steps) {
        log(`→ ${s.label}`)
        await s.run()
      }
      setStatus('ok')
      log('✅ Audit terminé : TOUT OK')
    } catch (e:any) {
      setStatus('fail')
      log(`❌ Échec: ${e.message || e.toString()}`)
    }
  }

  return (
    <AuthGuard>
      <AdminGuard>
        <AdminLayout>
          <div className="max-w-3xl mx-auto p-6">
            <h1 className="text-2xl font-semibold mb-2">Audit Supabase (Admin)</h1>
            <p className="text-sm text-muted-foreground mb-4">
              Vérifie RLS (lecture), génération JPEG, Storage (upload/remove) et update DB (avec rollback).
            </p>

            <div className="flex items-center gap-2 mb-4">
              <button
                className="border rounded px-3 py-2 text-sm"
                onClick={runAudit}
                disabled={status === 'running'}
              >
                {status === 'running' ? 'Audit en cours...' : 'Lancer l\'audit'}
              </button>
            </div>

            <div className="text-sm p-3 rounded border bg-muted/50 whitespace-pre-wrap">
              {logs.length ? logs.join('\n') : '—'}
            </div>

            {status === 'ok' && (
              <div className="mt-3 text-green-700 text-sm">Tout est opérationnel ✅</div>
            )}
            {status === 'fail' && (
              <div className="mt-3 text-red-700 text-sm">Audit en échec. Regarde les logs ci-dessus.</div>
            )}
          </div>
        </AdminLayout>
      </AdminGuard>
    </AuthGuard>
  )
}