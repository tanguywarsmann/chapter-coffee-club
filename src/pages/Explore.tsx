import { useEffect, useMemo, useState } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { BookCard } from '@/components/books/BookCard'
import { useSearchParams, useNavigate, useLocation } from 'react-router-dom'
import { AppHeader } from "@/components/layout/AppHeader";
import { SearchBar } from "@/components/books/SearchBar";
import { useTranslation } from "@/i18n/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { BookPlus } from "lucide-react";
import { BookGridSkeleton } from "@/components/ui/book-grid-skeleton";

type Category = 'litterature' | 'religion' | 'essai' | 'bio'

export default function Explore() {
  const { t } = useTranslation();
  const { isPremium } = useAuth();
  const [searchParams] = useSearchParams()
  const location = useLocation()
  const navigate = useNavigate()

  const allowed: Category[] = ['litterature','religion','essai','bio']
  const paramCat = searchParams.get('cat') as Category
  const initialCat: Category = allowed.includes(paramCat) ? paramCat : 'litterature'
  const initialQ = (searchParams.get('q') ?? '').trim()

  const [category, setCategory] = useState<Category>(initialCat)
  const [q, setQ] = useState(initialQ)
  const [books, setBooks] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const pageSize = 24

  // Mémoriser la catégorie et la recherche dans l'URL sans provoquer de boucle
  useEffect(() => {
    const params = new URLSearchParams(searchParams)
    params.set('cat', category)
    if (q) params.set('q', q)
    else params.delete('q')
    navigate({ search: params.toString() }, { replace: true })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category, q])

  useEffect(() => {
    const params = new URLSearchParams(location.search)
    const paramCat = params.get('cat') as Category
    const nextCat: Category = allowed.includes(paramCat) ? paramCat : 'litterature'
    const nextQuery = (params.get('q') ?? '').trim()

    let shouldResetPage = false
    setCategory(prev => {
      if (prev !== nextCat) {
        shouldResetPage = true
        return nextCat
      }
      return prev
    })
    setQ(prev => {
      if (prev !== nextQuery) {
        shouldResetPage = true
        return nextQuery
      }
      return prev
    })
    if (shouldResetPage) {
      setPage(1)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.search])

  useEffect(() => {
    let mounted = true;
    const abortController = new AbortController();

    const runFetch = async () => {
      if (mounted) {
        await fetchBooks();
      }
    };

    runFetch();

    return () => {
      mounted = false;
      abortController.abort();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category, page, q])

  async function fetchBooks(retryCount = 0) {
    const MAX_RETRIES = 2;
    const RETRY_DELAY = 1000; // 1 second

    setLoading(true)
    setError(null)
    const from = (page - 1) * pageSize
    const to = from + pageSize - 1

    try {
      let query = supabase
        .from('books_explore')
        .select('*')
        .eq('category', category)
        .order('created_at', { ascending: false })
        .range(from, to)

      if (q && q.length >= 2) {
        query = query.or(`title.ilike.%${q}%,author.ilike.%${q}%`)
      }

      const { data, error } = await query
      console.debug('[Explore] cat=', category, 'page=', page, 'q=', q, 'rows=', data?.length, 'error=', error)

      if (error) throw error

      setBooks(data || [])
      setError(null) // Clear any previous errors on success
    } catch (e: any) {
      console.error('[Explore] fetchBooks failed:', e)

      // RESILIENCE FIX: Retry on connection errors (likely from Profile page exhausting pool)
      if (retryCount < MAX_RETRIES && (
        e.message?.includes('connection') ||
        e.message?.includes('timeout') ||
        e.message?.includes('network') ||
        e.code === 'PGRST301' // PostgREST connection error
      )) {
        console.warn(`[Explore] Retrying (${retryCount + 1}/${MAX_RETRIES}) after ${RETRY_DELAY}ms...`);
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY * (retryCount + 1)));
        return fetchBooks(retryCount + 1);
      }

      setError(e.message ?? 'Erreur inconnue')
      setBooks([])
    } finally {
      setLoading(false)
    }
  }

  const getCategoryLabel = (cat: Category) => {
    return t.explore.categories[cat] || t.explore.categories.litterature;
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

  const showInitialSkeleton = useMemo(() => loading && books.length === 0 && !error, [loading, books.length, error]);
  const showInlineLoading = loading && books.length > 0;

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      
      <main className="max-w-6xl mx-auto px-4 py-8 md:py-12 space-y-8">
        <div className="space-y-4">
          <h1 className="text-3xl md:text-4xl font-serif font-bold text-coffee-darker">Explorer</h1>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            {/* Onglets catégories */}
            <div className="inline-flex items-center gap-1 rounded-xl border border-border p-1 order-2 sm:order-1">
              <Tab value="litterature" label="Littérature" />
              <Tab value="religion" label="Religion" />
              <Tab value="essai" label="Essai" />
              <Tab value="bio" label="Bio" />
            </div>

            {/* Barre de recherche à droite sur desktop, au-dessus sur mobile */}
            <div className="order-1 sm:order-2 w-full sm:max-w-md" role="search" aria-label="Recherche de livres">
              <SearchBar
                onSearch={(value) => { setQ(value.trim()); setPage(1); }}
                placeholder="Titre ou auteur…"
                isSearching={loading}
              />
            </div>
          </div>
        </div>

        {showInlineLoading && <p className="text-sm text-muted-foreground">Chargement des livres…</p>}
        {error && <p className="text-sm text-destructive">{error}</p>}
        {!showInitialSkeleton && !loading && !error && books.length === 0 && (
          <div className="text-center py-12 space-y-4">
            <p className="text-lg text-muted-foreground">
              {q.length > 0 
                ? "Ce livre n'est pas disponible." 
                : "Aucun livre dans cette catégorie."}
            </p>
            {q.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Voulez-vous l'ajouter ?</p>
                <Button 
                  onClick={() => navigate(isPremium ? '/request-book' : '/premium')}
                  className="bg-coffee-dark hover:bg-coffee-darker"
                >
                  <BookPlus className="h-4 w-4 mr-2" />
                  Demander ce livre
                </Button>
              </div>
            )}
          </div>
        )}

        {showInitialSkeleton ? (
          <BookGridSkeleton count={10} showTitle={false} />
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {books.map(b => <BookCard key={b.id} book={b} />)}
          </div>
        )}

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
