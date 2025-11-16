# 🔴 AUDIT CRITIQUE - Stabilité VREAD
**Date:** 16 Novembre 2025  
**Sévérité:** CRITIQUE (P0)

## 📊 SYMPTÔMES OBSERVÉS

1. **Thread bloqué 60 secondes** (répété dans les logs)
2. **Bouton de validation qui ne répond plus** après plusieurs utilisations
3. **Cartes de livres qui disparaissent** de /home
4. **Nécessité de recharger la page** pour restaurer le fonctionnement

## 🔍 CAUSES RACINES

### P0-1: CASCADE DE RE-RENDERS INFINIE
**Fichiers:** `useQuizCompletion.ts`, `useReadingProgress.ts`, `useBookValidation.ts`

**Problème:**
Après validation d'un segment, une cascade de refreshes se déclenche:
```
handleQuizComplete → forceRefresh() → clearAllCaches → 
re-fetch tous les hooks → trigger nouveaux refreshes → BOUCLE INFINIE
```

**Preuve dans le code:**
- `useBookQuiz.ts:108-111` - mutation SWR trop large avec `includes('reading-progress')`
- `useQuizCompletion.ts:43` - `forceRefresh()` global appelé systématiquement
- `useReadingProgress.ts:61-65` - `clearProgressCache` vide TOUS les caches

### P0-2: MUTATION SWR TROP AGRESSIVE
**Fichier:** `src/hooks/useBookQuiz.ts` ligne 108-111

```typescript
// ❌ PROBLÈME: Revalide TOUTES les clés contenant "reading-progress"
mutate((key) => typeof key === 'string' && key.includes('reading-progress'), 
  undefined, 
  { revalidate: true }
);
```

**Impact:** Peut déclencher 10-20+ requêtes Supabase simultanées.

### P0-3: setState APRÈS UNMOUNT
**Fichiers:** `useBookValidation.ts`, `useQuizCompletion.ts`

**Problème:**
Navigation rapide entre pages → composants unmounted → mais setState continue dans les callbacks asynchrones.

**Manque de cleanup dans:**
- `useBookQuiz.prepareAndShowQuestion` (ligne 40-86)
- `useQuizCompletion.handleQuizComplete` (ligne 33-102)

### P0-4: RETRY LOGIC BLOQUANT
**Fichier:** `src/services/reading/progressGetters.ts` lignes 29-54

**Problème:**
```typescript
// Exponential backoff: 1s → 2s → 4s → peut bloquer ~7-15s
await fetchWithRetry(fn, retries - 1, delay * 2);
```

En cas d'échec réseau, bloque le thread pendant plusieurs secondes cumulées.

## 🛠️ CORRECTIONS PRIORITAIRES

### CORRECTION 1: Limiter la portée des mutations SWR
**Fichier:** `src/hooks/useBookQuiz.ts`

```typescript
// ❌ AVANT (ligne 108-111)
mutate((key) => typeof key === 'string' && key.includes('reading-progress'), 
  undefined, 
  { revalidate: true }
);

// ✅ APRÈS - Mutation ciblée uniquement
mutate(['reading-progress', userId]);
mutate(['book-progress', book.id, userId]);
```

### CORRECTION 2: Ajouter cleanup systématique
**Fichier:** `src/hooks/useBookQuiz.ts`

```typescript
useEffect(() => {
  let isMounted = true;
  
  return () => {
    isMounted = false;
    // Cleanup des états en cours
  };
}, []);

// Dans prepareAndShowQuestion:
if (!isMounted) return; // Avant chaque setState
```

### CORRECTION 3: Debounce des refreshes globaux
**Fichier:** `src/hooks/useQuizCompletion.ts`

```typescript
// ❌ AVANT: forceRefresh() immédiat
forceRefresh();

// ✅ APRÈS: debounce pour éviter cascade
const debouncedRefresh = useMemo(
  () => debounce(() => forceRefresh(), 500),
  [forceRefresh]
);
```

### CORRECTION 4: isValidating toujours reset en finally
**Fichier:** `src/hooks/useBookQuiz.ts`

```typescript
try {
  // ... logique validation
} catch (error) {
  console.error("Validation error:", error);
  toast.error("Erreur de validation");
  throw error; // ✅ Propager l'erreur
} finally {
  // ✅ TOUJOURS reset, même en erreur
  if (setIsValidating) setIsValidating(false);
}
```

### CORRECTION 5: Timeout sur requêtes Supabase
**Fichier:** `src/services/reading/progressGetters.ts`

```typescript
// ✅ Timeout de 10s max (déjà implémenté ligne 18-26)
// MAIS: Réduire max retries de 3 à 2
const MAX_RETRIES = 2; // Au lieu de 3
```

## 📝 FICHIERS À MODIFIER

1. **src/hooks/useBookQuiz.ts** (P0-2, P0-3)
   - Ligne 108-111: mutation SWR ciblée
   - Ajouter useEffect cleanup

2. **src/hooks/useQuizCompletion.ts** (P0-1, P0-3)
   - Ligne 43: debounce forceRefresh
   - Ajouter isMounted check

3. **src/hooks/useBookValidation.ts** (P0-3)
   - Ligne 211: vérifier isMounted avant setState

4. **src/services/reading/progressGetters.ts** (P0-4)
   - Ligne 11: MAX_RETRIES = 2 (au lieu de 3)

## ✅ TESTS MANUELS POST-CORRECTION

1. **Validation répétée (10x)**
   - Valider 10 segments d'affilée
   - ✓ Aucun freeze
   - ✓ Bouton toujours réactif

2. **Navigation pendant validation**
   - Lancer validation → naviguer immédiatement
   - ✓ Pas d'erreur console "setState on unmounted"

3. **Erreur réseau simulée**
   - Couper la connexion brièvement pendant validation
   - ✓ Message d'erreur clair
   - ✓ isValidating reset
   - ✓ Retry ne bloque pas >10s

4. **Affichage /home après validations**
   - Valider 5 segments
   - Revenir à /home
   - ✓ Cartes toujours visibles
   - ✓ Progress bar à jour

## 🔒 GARANTIES POST-FIX

- **Thread freeze:** éliminé (mutations ciblées + debounce)
- **Bouton bloqué:** éliminé (finally + cleanup)
- **Cartes disparues:** éliminé (mutations ciblées + fallback UI)
- **setState unmounted:** éliminé (isMounted guards)

## 📌 NOTES TECHNIQUES

- **NE PAS toucher:** logique XP, badges, quêtes, Booky (hors scope)
- **React Query config:** OK (staleTime 5min est correct)
- **Retry logic:** OK avec MAX_RETRIES=2 et timeout 10s
