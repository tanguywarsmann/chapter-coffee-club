import { useEffect, useState } from 'react'
import { BookCard } from '@/components/books/BookCard'
import { useSearchParams, useNavigate, useLocation } from 'react-router-dom'
import { AppHeader } from "@/components/layout/AppHeader";
import { SearchBar } from "@/components/books/SearchBar";
import { useTranslation } from "@/i18n/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { BookPlus } from "lucide-react";
import { BookGridSkeleton } from "@/components/ui/book-grid-skeleton";
import { ExploreCategory, useExploreBooks } from "@/hooks/useExploreBooks";

export default function Explore() {
  const { t } = useTranslation();
  const { isPremium } = useAuth();
  const [searchParams] = useSearchParams()
  const location = useLocation()
  const navigate = useNavigate()

  const allowed: ExploreCategory[] = ['litterature','religion','essai','bio']
  const paramCat = searchParams.get('cat') as ExploreCategory
  const initialCat: ExploreCategory = allowed.includes(paramCat) ? paramCat : 'litterature'
  const initialQ = (searchParams.get('q') ?? '').trim()

  const [category, setCategory] = useState<ExploreCategory>(initialCat)
  const [q, setQ] = useState(initialQ)
  const [page, setPage] = useState(1)

  const {
    data,
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
  } = useExploreBooks({ category, query: q, page });
  const books = data ?? [];

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
    const paramCat = params.get('cat') as ExploreCategory
    const nextCat: ExploreCategory = allowed.includes(paramCat) ? paramCat : 'litterature'
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

  const getCategoryLabel = (cat: ExploreCategory) => {
    return t.explore.categories[cat] || t.explore.categories.litterature;
  };

  const Tab = ({ value, label }: { value: ExploreCategory; label: string }) => {
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

  const showInitialSkeleton = isLoading && !data;
  const showInlineLoading = isFetching && !!books.length;
  const errorMessage = error instanceof Error ? error.message : (typeof error === "string" ? error : null);

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
                isSearching={isFetching}
              />
            </div>
          </div>
        </div>

        {showInlineLoading && <p className="text-sm text-muted-foreground">Chargement des livres…</p>}
        {isError && !books.length && (
          <div className="flex flex-col gap-2">
            <p className="text-sm text-destructive">
              {errorMessage || "Impossible de charger les livres pour le moment."}
            </p>
            <button
              className="text-sm text-coffee-dark underline"
              onClick={() => refetch()}
            >
              Réessayer
            </button>
          </div>
        )}
        {!showInitialSkeleton && !isLoading && !isError && books.length === 0 && (
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
