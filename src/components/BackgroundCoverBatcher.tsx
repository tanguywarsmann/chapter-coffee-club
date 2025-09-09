import { useEffect, useRef, useState } from 'react'
import { listBooksNeedingCover } from '@/utils/coverQueue'
import { generateAndSaveCover } from '@/utils/generateCover'
import { supabase } from '@/integrations/supabase/client'
import { useAuth } from '@/contexts/AuthContext'

// Verrou simple en localStorage pour éviter plusieurs batchs concurrents sur la même session.
// En plus, on enregistre un "heartbeat" pour libérer le lock si l'onglet est fermé.
const LOCK_KEY = 'autoCoverBatchLock'
const HEARTBEAT_KEY = 'autoCoverBatchLastBeat'
const LOCK_TTL_MS = 90_000 // 1 min 30
const HEARTBEAT_EVERY_MS = 20_000

function now() { return Date.now() }

function acquireLock(): boolean {
  try {
    const raw = localStorage.getItem(LOCK_KEY)
    const last = raw ? parseInt(raw, 10) : 0
    if (!last || now() - last > LOCK_TTL_MS) {
      localStorage.setItem(LOCK_KEY, String(now()))
      return true
    }
    return false
  } catch { return true }
}

function renewLock() {
  try {
    localStorage.setItem(LOCK_KEY, String(now()))
    localStorage.setItem(HEARTBEAT_KEY, String(now()))
  } catch {}
}

function releaseLock() {
  try {
    localStorage.removeItem(LOCK_KEY)
    localStorage.removeItem(HEARTBEAT_KEY)
  } catch {}
}

export default function BackgroundCoverBatcher({
  enabled = true,
  batchSize = 20,
  delayBetweenBatchesMs = 2500,
  concurrency = 3,
  variant = 'all' as const,
}: {
  enabled?: boolean
  batchSize?: number
  delayBetweenBatchesMs?: number
  concurrency?: number
  variant?: 'all' | 'ot' | 'nt' | 'talmud' | 'other'
}) {
  const { isAdmin } = useAuth()
  const [running, setRunning] = useState(false)
  const [progress, setProgress] = useState({ done: 0, total: 0 })
  const hb = useRef<number | null>(null)

  useEffect(() => {
    if (!enabled || !isAdmin) return
    let cancelled = false

    async function run() {
      // 1) Vérifie session supabase (doit être authenticated + admin)
      const { data: { user } } = await supabase.auth.getUser()
      if (!user || !isAdmin) return

      // 2) essaie de prendre le verrou
      if (!acquireLock()) return
      setRunning(true)

      // heartbeat (renouvelle le lock régulièrement)
      hb.current = window.setInterval(renewLock, HEARTBEAT_EVERY_MS)

      try {
        while (!cancelled) {
          // 3) récupère un lot à traiter
          const toProcess = await listBooksNeedingCover(batchSize, variant)
          if (toProcess.length === 0) break
          setProgress({ done: 0, total: toProcess.length })

          // 4) traite en pool
          let i = 0, done = 0
          const next = async () => {
            if (i >= toProcess.length) return
            const b = toProcess[i++]
            try { 
              await generateAndSaveCover(b)
              console.log(`✅ Cover generated for: ${b.title}`)
            }
            catch (e) { 
              console.warn(`❌ Failed to generate cover for ${b.title}:`, e)
            }
            finally { 
              done++
              setProgress({ done, total: toProcess.length })
              renewLock()
              await next()
            }
          }
          await Promise.all(Array.from({ length: Math.min(concurrency, toProcess.length) }, next))

          console.log(`📦 Batch completed: ${done}/${toProcess.length} covers generated`)

          // 5) enchaine jusqu'à épuisement
          await new Promise(r => setTimeout(r, delayBetweenBatchesMs))
        }
        
        console.log('🎉 All covers generated successfully!')
      } finally {
        setRunning(false)
        if (hb.current) window.clearInterval(hb.current)
        releaseLock()
      }
    }

    // lance au montage
    run()
    return () => {
      cancelled = true
      if (hb.current) window.clearInterval(hb.current)
      releaseLock()
    }
  }, [enabled, batchSize, delayBetweenBatchesMs, concurrency, variant, isAdmin])

  // composant silencieux (pas d'UI), mais tu peux afficher un mini état si tu veux
  if (running && progress.total > 0) {
    console.log(`🔄 Auto-cover batch running: ${progress.done}/${progress.total}`)
  }

  return null
}