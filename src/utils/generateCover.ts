import { supabase } from '@/integrations/supabase/client'

/**
 * Génère une image simple avec le titre, sauvegarde dans Supabase Storage
 * et met à jour books.cover_url
 */
export async function generateAndSaveCover(book: any) {
  // Créer un canvas
  const canvas = document.createElement('canvas')
  canvas.width = 512
  canvas.height = 768
  const ctx = canvas.getContext('2d')!
  
  // Fond crème
  ctx.fillStyle = '#fdfaf6'
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  
  // Titre
  ctx.fillStyle = '#5a3921'
  ctx.font = 'bold 28px serif'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  
  const lines = wrapText(ctx, book.title, 440)
  lines.forEach((line, i) => {
    ctx.fillText(line, canvas.width/2, canvas.height/2 + i*34 - (lines.length-1)*17)
  })
  
  // Icône discrète en bas (colombe unicode)
  ctx.font = '20px serif'
  ctx.fillText('🕊', canvas.width/2, canvas.height - 30)
  
  // Export en JPEG
  const blob: Blob = await new Promise(res => 
    canvas.toBlob(b => res(b!), 'image/jpeg', 0.85)
  )

  // Slug pour le fichier
  const slug = (book.slug || book.title || 'cover')
    .toLowerCase()
    .normalize('NFD').replace(/\p{Diacritic}/gu,'')
    .replace(/[^a-z0-9]+/g,'-').replace(/(^-|-$)/g,'')
  const path = `auto/${slug}.jpg`

  // Upload vers Supabase Storage
  const { error: upErr } = await supabase.storage.from('covers')
    .upload(path, blob, { contentType: 'image/jpeg', upsert: true })
  if (upErr) throw upErr

  // Obtenir URL publique
  const { data: pub } = supabase.storage.from('covers').getPublicUrl(path)
  const url = pub?.publicUrl

  // Mettre à jour la base
  const { error: updErr } = await supabase
    .from('books')
    .update({ cover_url: url })
    .eq('id', book.id)
  if (updErr) throw updErr

  return url
}

/** Coupe un texte long en plusieurs lignes */
function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number) {
  const words = text.split(' ')
  const lines: string[] = []
  let line = ''
  for (let i = 0; i < words.length; i++) {
    const testLine = line + words[i] + ' '
    const { width } = ctx.measureText(testLine)
    if (width > maxWidth && i > 0) {
      lines.push(line.trim())
      line = words[i] + ' '
    } else {
      line = testLine
    }
  }
  lines.push(line.trim())
  return lines
}