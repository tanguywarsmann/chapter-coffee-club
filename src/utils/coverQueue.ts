import { supabase } from '@/integrations/supabase/client'

export type Variant = 'ot' | 'nt' | 'talmud' | 'other' | 'all'

// Même logique de variant que dans generateCover.ts
export function detectVariant(book: any): Exclude<Variant, 'all'> {
  const tags = (book?.tags || []).map((t: string) => (t || '').toLowerCase())
  const author = (book?.author || '').toLowerCase()
  if (tags.includes('ancien testament') || author.includes('bible - ancien testament')) return 'ot'
  if (tags.includes('nouveau testament') || author.includes('bible - nouveau testament')) return 'nt'
  if (tags.includes('talmud') || tags.includes('bavli') || tags.includes('yerushalmi') || author.includes('talmud')) return 'talmud'
  return 'other'
}

export function isFakeCover(url?: string) {
  if (!url) return true
  try {
    const h = new URL(url).hostname
    return /(^|\.)vread\.fr$/i.test(h)
  } catch { return true }
}

export async function listBooksNeedingCover(limit = 100, variant: Variant = 'all') {
  const { data, error } = await supabase
    .from('books')
    .select('id,title,slug,author,tags,cover_url')
    .limit(limit)
  if (error) throw error

  return (data || []).filter(b => {
    const need = isFakeCover(b.cover_url) || !b.cover_url
    if (!need) return false
    const v = detectVariant(b)
    return variant === 'all' ? true : v === variant
  })
}