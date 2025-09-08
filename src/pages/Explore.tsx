import { useEffect, useState } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { BookCard } from '@/components/books/BookCard'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { AppHeader } from "@/components/layout/AppHeader";
import { WelcomeModal } from "@/components/onboarding/WelcomeModal";

type Category = 'litterature' | 'religion' | 'essai' | 'bio'

export default function Explore() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()

  const allowed: Category[] = ['litterature','religion','essai','bio']
  const paramCat = searchParams.get('cat') as Category
  const initialCat: Category = allowed.includes(paramCat) ? paramCat : 'litterature'

  const [category, setCategory] = useState<Category>(initialCat)
  const [books, setBooks] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [showWelcome, setShowWelcome] = useState(() => {
    const onboardingFlag = localStorage.getItem("onboardingDone");
    return !onboardingFlag;
  });
  const pageSize = 24

  // Mémoriser la catégorie dans l'URL sans provoquer de boucle
  useEffect(() => {
    const params = new URLSearchParams()
    params.set('cat', category)
    navigate({ search: params.toString() }, { replace: true })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category])

  useEffect(() => {
    fetchBooks()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category, page])

  async function fetchBooks() {
    setLoading(true)
    setError(null)
    const from = (page - 1) * pageSize
    const to = from + pageSize - 1

    try {
      let q = supabase
        .from('books')
        .select('*')
        .eq('is_published', true)
        .order('created_at', { ascending: false })
        .range(from, to)

      if (category === 'religion') {
        q = q.contains('tags', ['Religion'])
      } else if (category === 'essai') {
        q = q.contains('tags', ['Essai'])
      } else if (category === 'bio') {
        // Version supabase-js v2
        q = q.overlaps('tags', ['Biographie', 'Autobiographie'])
        // Fallback si overlaps n'est pas supporté dans ton bundle:
        // q = q.or('tags.ov.{Biographie,Autobiographie}')
      } else {
        // Littérature par défaut: exclure explicitement Religion, Essai, Bio
        q = q
          .not('tags','cs',['Religion'])
          .not('tags','cs',['Essai'])
          .not('tags','cs',['Biographie'])
          .not('tags','cs',['Autobiographie'])
      }

      const { data, error } = await q
      console.debug('[Explore] cat=', category, 'page=', page, 'rows=', data?.length, 'error=', error)
      if (error) throw error
      setBooks(data || [])
    } catch (e: any) {
      console.error('[Explore] fetchBooks failed:', e)
      setError(e.message ?? 'Erreur inconnue')
      setBooks([])
    } finally {
      setLoading(false)
    }
  }

  const getCategoryLabel = (cat: Category) => {
    switch (cat) {
      case 'litterature': return 'Littérature';
      case 'religion': return 'Religion';
      case 'essai': return 'Essai';
      case 'bio': return 'Bio';
      default: return 'Littérature';
    }
  };

  const Tab = ({ value, label }: { value: Category; label: string }) => {
    const active = category === value
    return (
      <button
        onClick={() => { setCategory(value); setPage(1) }}
        className={`px-4 py-2 text-sm rounded-lg transition-colors ${
          active 
            ? 'bg-neutral text-neutral-foreground font-medium' 
            : 'text-muted-foreground hover:bg-muted hover:text-foreground'
        }`}
        aria-pressed={active}
      >
        {label}
      </button>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      <WelcomeModal open={showWelcome} onClose={() => setShowWelcome(false)} />
      <main className="mx-auto w-full px-4 max-w-none py-6 space-y-6">
        <div className="space-y-4">
          <h1 className="text-3xl font-serif font-medium text-coffee-darker">Explorer</h1>

          <div className="inline-flex items-center gap-1 rounded-xl border border-border p-1 mb-6">
            <Tab value="litterature" label="Littérature" />
            <Tab value="religion" label="Religion" />
            <Tab value="essai" label="Essai" />
            <Tab value="bio" label="Bio" />
          </div>
        </div>

        {loading && <p className="text-sm text-muted-foreground">Chargement des livres…</p>}
        {error && <p className="text-sm text-destructive">{error}</p>}
        {!loading && !error && books.length === 0 && (
          <p className="text-sm text-muted-foreground">Aucun livre dans cette catégorie.</p>
        )}

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {books.map(b => <BookCard key={b.id} book={b} />)}
        </div>

        <div className="flex items-center justify-center gap-3 mt-6">
          <button
            className="px-3 py-2 rounded-lg border border-border disabled:opacity-40 hover:bg-muted transition-colors"
            disabled={page === 1}
            onClick={() => setPage(p => Math.max(1, p - 1))}
          >
            Précédent
          </button>
          <span className="text-sm text-muted-foreground">Page {page}</span>
          <button
            className="px-3 py-2 rounded-lg border border-border hover:bg-muted transition-colors"
            onClick={() => setPage(p => p + 1)}
          >
            Suivant
          </button>
        </div>
      </main>
    </div>
  )
}