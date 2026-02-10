
# Plan : Fix site sans toucher au backend Supabase

## Diagnostic confirme

Le fichier `types.ts` genere ne contient que `book_requests_with_email` dans `Views`. Les vues `books_public`, `books_explore`, et `reading_questions_public` n'existent plus en DB. Toutes les requetes `from('books_public')` etc. echouent au niveau TypeScript.

## Modifications prevues

### 1. `src/services/books/types.d.ts`
- Changer `BookPublicRecord` de `Database["public"]["Views"]["books_public"]["Row"]` vers `Database["public"]["Tables"]["books"]["Row"]` (memes colonnes)

### 2. `src/services/books/bookQueries.ts` (8 requetes)
- Tous les `from('books_public')` deviennent `from('books')` avec `.eq('is_published', true)` ajoute
- Cast `as any` sur les appels `from()` pour contourner le typage strict Supabase qui ne reconnait que les noms de tables/vues du schema genere

### 3. `src/services/bookQueries.ts` (3 requetes)
- `getBookBySlug`, `getBookById`, `getBookExpectedSegments` : `from('books')` + `.eq('is_published', true)`

### 4. `src/hooks/useHomeSearch.ts` (1 requete)
- `from('books')` + `.eq('is_published', true)`

### 5. `src/hooks/useExploreBooks.ts` (1 requete, logique category)
- Remplacer `from('books_explore')` par `from('books')` + `.eq('is_published', true)`
- Supprimer `.eq('category', category)` (n'existe pas sur la table)
- Ajouter le filtrage par category via les tags :
  - `religion` : `.contains('tags', ['Religion'])`
  - `essai` : `.contains('tags', ['Essai'])`
  - `bio` : `.contains('tags', ['Biographie'])`
  - `litterature` : pas de filtre tag cote Supabase, filtrage cote front apres fetch pour exclure les livres ayant Religion/Essai/Biographie dans tags (gere aussi `tags = NULL` qui sont inclus dans litterature)

### 6. `src/services/questionService.ts` (1 requete + guard auth)
- Remplacer `from('reading_questions_public')` par `from('reading_questions')`
- Garder `.select('id, book_slug, segment, question, book_id')` (pas de colonne `answer`)
- Ajouter un check `supabase.auth.getSession()` : si pas de session, retourner `null` (le composant appelant gere deja le cas null)

### 7. `src/services/jokerService.ts` (1 requete)
- Ligne 119 : `from('books_public')` devient `from('books')` + `.eq('is_published', true)`

### 8. `src/services/reading/validationService.ts` (1 requete)
- Ligne 27 : `from('books_public')` devient `from('books')` + `.eq('is_published', true)`

### 9. Check env + smoke test (nouveau)
- Ajouter un utilitaire `src/utils/supabaseHealthCheck.ts` qui :
  - Verifie que `VITE_SUPABASE_URL` et `VITE_SUPABASE_ANON_KEY` sont definis
  - Fait un `SELECT count(*) FROM books WHERE is_published = true` en smoke test
  - Log le resultat en console (URL masquee, count de livres)
  - Exporte une fonction appelable depuis la console ou un composant admin

## Securite

- `answer` jamais selectionne dans `reading_questions`
- `reading_questions` accessible uniquement si session authenticated
- `is_published = true` ajoute sur toutes les requetes books
- Tags NULL geres dans le filtre litterature (inclus par defaut)
- Zero migration SQL

## Resume

| Fichier | Changements |
|---------|-------------|
| `src/services/books/types.d.ts` | 1 type redirige vers Tables |
| `src/services/books/bookQueries.ts` | 8 from() corriges |
| `src/services/bookQueries.ts` | 3 from() corriges |
| `src/hooks/useHomeSearch.ts` | 1 from() corrige |
| `src/hooks/useExploreBooks.ts` | 1 from() + logique category + tags NULL |
| `src/services/questionService.ts` | 1 from() + guard auth |
| `src/services/jokerService.ts` | 1 from() corrige |
| `src/services/reading/validationService.ts` | 1 from() corrige |
| `src/utils/supabaseHealthCheck.ts` | Nouveau fichier : check env + smoke test |

Total : 9 fichiers, 16 requetes corrigees, 0 migration SQL.
