import { supabase } from '@/integrations/supabase/client'

type Variant = 'ot' | 'nt' | 'talmud' | 'other'

function detectVariant(book: any): Variant {
  const tags = (book?.tags || []).map((t: string) => (t || '').toLowerCase())
  const author = (book?.author || '').toLowerCase()
  if (tags.includes('ancien testament') || author.includes('bible - ancien testament')) return 'ot'
  if (tags.includes('nouveau testament') || author.includes('bible - nouveau testament')) return 'nt'
  if (tags.includes('talmud') || tags.includes('bavli') || tags.includes('yerushalmi') || author.includes('talmud')) return 'talmud'
  return 'other'
}

const PALETTE: Record<Variant, { bg: string; title: string; icon: string | null }> = {
  ot:     { bg: '#FCF7ED', title: '#5A3921', icon: '📜' },
  nt:     { bg: '#F6FAFF', title: '#2E4159', icon: '🕊' },
  talmud: { bg: '#F7F6F1', title: '#4B4436', icon: '✡︎' },
  other:  { bg: '#F5F5F5', title: '#222222', icon: null },
}

function pastelFromString(s: string) {
  let h = 0; for (let i=0;i<s.length;i++) h = (h*31 + s.charCodeAt(i)) >>> 0
  return `hsl(${h%360} 70% 95%)`
}

function wrap(ctx: CanvasRenderingContext2D, text: string, maxWidth: number, font: string) {
  ctx.font = font
  const words = (text || 'Sans titre').split(/\s+/)
  const lines:string[] = []; let line = ''
  for (const w of words) {
    const test = line ? `${line} ${w}` : w
    if (ctx.measureText(test).width > maxWidth && line) { lines.push(line); line = w }
    else line = test
  }
  if (line) lines.push(line)
  return lines
}

function slugify(s: string) {
  return (s || '')
    .toLowerCase()
    .normalize('NFD').replace(/\p{Diacritic}/gu, '')
    .replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
}

export async function generateAndSaveCover(book: any) {
  const W=512, H=768
  const canvas = document.createElement('canvas')
  canvas.width=W; canvas.height=H
  const ctx = canvas.getContext('2d')!

  const variant = detectVariant(book)
  const pal = PALETTE[variant]
  const bg = variant==='other' ? pastelFromString(book.title||book.slug||book.id) : pal.bg

  // Fond
  ctx.fillStyle = bg; ctx.fillRect(0,0,W,H)

  // Titre (auto-size simple)
  let size = 30
  let font = `600 ${size}px system-ui, -apple-system, Segoe UI, Roboto, serif`
  let lines = wrap(ctx, book.title, W-72, font)
  while (lines.length > 3 && size > 18) {
    size -= 2; font = `600 ${size}px system-ui, -apple-system, Segoe UI, Roboto, serif`
    lines = wrap(ctx, book.title, W-72, font)
  }

  ctx.fillStyle = pal.title; ctx.textAlign='center'; ctx.textBaseline='middle'
  ctx.font = font
  const lh = size + 8, total = lines.length*lh, startY = H/2 - total/2
  lines.forEach((line, i)=> ctx.fillText(line, W/2, startY + i*lh))

  // Icône
  if (pal.icon) { ctx.font = '20px system-ui, -apple-system, Segoe UI, Roboto, serif'; ctx.fillText(pal.icon, W/2, H-28) }

  // JPEG
  const blob: Blob = await new Promise((res, rej)=>canvas.toBlob(b=>b?res(b):rej(new Error('toBlob null')),'image/jpeg',0.9))

  // Upload
  const slug = slugify(book.slug || book.title || book.id)
  const path = `auto/${slug}.jpg`
  const { error: upErr } = await supabase.storage.from('covers').upload(path, blob, { upsert: true, contentType: 'image/jpeg' })
  if (upErr) throw upErr

  // URL publique + update
  const { data: pub } = supabase.storage.from('covers').getPublicUrl(path)
  const url = pub?.publicUrl
  const { error: updErr } = await supabase.from('books').update({ cover_url: url }).eq('id', book.id)
  if (updErr) throw updErr

  return url
}

export async function listBooksNeedingCover(limit=500, variantFilter: Variant|'all'='all') {
  // URL fake vread.fr => à régénérer
  const isFake = (u?: string)=> !!u && /(^https?:\/\/(www\.)?vread\.fr\/)/i.test(u)
  // fetch en plusieurs pages si besoin
  const { data, error } = await supabase
    .from('books')
    .select('id,title,slug,author,tags,cover_url')
    .limit(limit)
  if (error) throw error
  return (data||[]).filter(b=>{
    const v = detectVariant(b)
    const need = !b.cover_url || isFake(b.cover_url)
    return need && (variantFilter==='all' || v===variantFilter)
  })
}