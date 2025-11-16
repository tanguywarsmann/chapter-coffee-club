# 🔒 AUDIT GLOBAL STABILITÉ VREAD - LONGUES SESSIONS

**Date:** 16 Novembre 2025  
**Objectif:** Éliminer les freezes et bugs lors de longues sessions (validation morte, cartes disparues, déconnexion bloquée)

---

## 📊 CARTOGRAPHIE DES HOOKS ET SERVICES CRITIQUES

### Hooks de données (React Query / SWR)

| Hook | Fichier | Type cache | Dépendance auth | État actuel |
|------|---------|------------|-----------------|-------------|
| `useReadingProgress` | `src/hooks/useReadingProgress.ts` | État local + React Query invalidation | ✅ userId | ✅ Retry logic OK, améliorer error UI |
| `useCurrentReading` | `src/hooks/useCurrentReading.ts` | État local | ✅ userId | ⚠️ Pas de retry, toast simple |
| `useReadingList` | `src/hooks/useReadingList.ts` | React Query | ✅ userId | ⚠️ Error handling basique |
| `useReadingListBooks` | `src/hooks/useReadingListBooks.ts` | React Query + cache mémoire | ✅ userId | ✅ Bon cache, mais error UI manquante |
| `useBookDetailProgress` | `src/hooks/useBookDetailProgress.ts` | État local | ✅ userId | ❌ Toast générique, pas de retry |
| `useBookQuiz` | `src/hooks/useBookQuiz.ts` | État local | ✅ userId | ✅ Bon cleanup isMounted, error handling OK |
| `useQuizCompletion` | `src/hooks/useQuizCompletion.ts` | État local | ✅ userId | ✅ Bon cleanup, intégré avec badgeWorkflow |

### Services Supabase

| Service | Fichier | Appels directs Supabase | Gestion erreur |
|---------|---------|-------------------------|----------------|
| `progressGetters` | `src/services/reading/progressGetters.ts` | ❌ via helpers | ✅ Retry + timeout |
| `questionService` | `src/services/questionService.ts` | ❌ via helpers | ⚠️ Basique |
| `bookyService` | `src/lib/booky.ts` | ✅ Oui (user_companion) | ⚠️ Basique |
| `badgeAndQuestWorkflow` | `src/services/reading/badgeAndQuestWorkflow.ts` | ❌ via helpers | ✅ Try/catch |
| `bookysService` | `src/services/social/bookysService.ts` | ✅ Oui (activity_likes) | ⚠️ Throw error |

### Contexte Auth

| Élément | Fichier | État | Notes |
|---------|---------|------|-------|
| `AuthContext` | `src/contexts/AuthContext.tsx` | ✅ Cleanup OK | ⚠️ Session expiry pas gérée explicitement |
| Auth subscription | Ligne 147-152 | ✅ Cleanup présent | ✅ Bon |
| `fetchUserStatus` | Ligne 51-95 | ⚠️ Error silencieuse | Retourne defaults mais ne propage pas l'erreur |
| Client Supabase | `src/integrations/supabase/client.ts` | ✅ Singleton | ✅ Safe storage fallback |

---

## 🐛 PROBLÈMES IDENTIFIÉS

### P1 - Erreurs Supabase silencieuses
**Symptôme:** Après un certain temps, les hooks ne chargent plus rien sans indication claire.

**Cause:** 
- Erreurs réseau ou auth expirée non propagées
- Pas de gestionnaire centralisé d'erreur Supabase
- Les composants affichent juste "loading" ou un état vide

**Solution:**
- ✅ Créer `src/services/supabaseErrorHandler.ts`
- ✅ Intégrer dans tous les services critiques
- ✅ Ajouter détection JWT expiré / invalid token

### P2 - Pas d'UI de fallback en cas d'erreur
**Symptôme:** Cartes de livres qui disparaissent = page vide.

**Cause:**
- `useCurrentReading`, `useBookDetailProgress`, etc. ne montrent rien en erreur
- Utilisateur pense que l'app est cassée → reload

**Solution:**
- ✅ Ajouter composant `<ErrorFallback>` réutilisable avec bouton "Réessayer"
- ✅ Intégrer dans `CurrentReadingCard`, listes de livres, etc.

### P3 - Sessions longues et refresh token
**Symptôme:** Après ~1h de session, la validation ou la déconnexion ne marchent plus.

**Cause:**
- Le token JWT Supabase expire (durée standard: 1h)
- Supabase devrait auto-refresh mais erreurs pas gérées
- `AuthContext` ne détecte pas explicitement les erreurs d'auth expirée

**Solution:**
- ✅ Ajouter détection explicite dans `supabaseErrorHandler`
- ✅ Si JWT expiré détecté → forcer `signOut()` propre + redirection
- ⚠️ À tester manuellement sur session >1h

### P4 - Hooks qui ne "reset" pas après erreur
**Symptôme:** Après une erreur réseau, hook reste dans état invalide.

**Cause:**
- Certains hooks ne clearent pas leur état après erreur
- Pas de mécanisme "retry" accessible pour l'utilisateur

**Solution:**
- ✅ S'assurer que chaque hook expose un `refetch` / `retry`
- ✅ Ajouter bouton "Réessayer" dans les UI de fallback

---

## ✅ CORRECTIONS IMPLÉMENTÉES

### 1. Gestionnaire d'erreurs centralisé
**Fichier:** `src/services/supabaseErrorHandler.ts`

```typescript
export function handleSupabaseError(context: string, error: any): SupabaseErrorInfo {
  // Détection JWT expiré, invalid token, etc.
  // Log structuré
  // Retourne info typée pour le caller
}
```

### 2. Composant ErrorFallback réutilisable
**Fichier:** `src/components/ui/ErrorFallback.tsx`

- Affiche message d'erreur clair
- Bouton "Réessayer" qui trigger un callback
- Variante compact pour petits composants

### 3. Amélioration des hooks critiques

#### `useBookDetailProgress`
- ✅ Gestion erreur propre avec `handleSupabaseError`
- ✅ Expose état `error` et fonction `retry`
- ✅ UI de fallback dans composants utilisant ce hook

#### `useReadingProgress`
- ✅ Améliorer retry logic existant
- ✅ Détecter erreurs auth expirée

#### `AuthContext`
- ✅ Détecter session invalide/expirée dans `onAuthStateChange`
- ✅ Forcer signOut propre si token invalide détecté

### 4. UI de fallback dans composants critiques

#### `CurrentReadingCard`
- ✅ Afficher ErrorFallback si `useCurrentReading` échoue
- ✅ Bouton retry qui re-fetch

#### Pages `/home`, `/books/:slug`
- ✅ Wrapper avec ErrorBoundary
- ✅ Fallback si hooks de données échouent

---

## 📋 PROTOCOLE DE TEST LONGUE SESSION

### Test 1: Lecture intensive (15-20 min)
1. Se connecter avec compte test
2. Valider 10 segments sur un livre
3. Naviguer entre `/home`, page livre, `/explore`
4. **Vérifier:**
   - ✅ Cartes restent affichées
   - ✅ Validation reste réactive
   - ✅ Aucun reload nécessaire
   - ✅ Logs console propres (pas d'erreur silencieuse)

### Test 2: Pause puis reprise (5 min pause)
1. Ouvrir l'app, valider 2 segments
2. Laisser l'app ouverte 5 minutes sans toucher
3. Revenir, valider un segment
4. **Vérifier:**
   - ✅ Validation fonctionne immédiatement
   - ✅ Cartes se rechargent proprement
   - ✅ Pas d'erreur Supabase silencieuse

### Test 3: Session longue (>1h)
⚠️ **À faire manuellement** (simulation difficile)

1. Laisser l'app ouverte >1h (JWT expire normalement après 60 min)
2. Essayer de valider un segment
3. **Comportement attendu:**
   - Si token expiré: message clair + redirection login
   - Si auto-refresh OK: validation fonctionne normalement

### Test 4: Déconnexion après longue session
1. Après tests 1+2, cliquer "Déconnexion"
2. **Vérifier:**
   - ✅ Redirection propre vers login
   - ✅ Pas d'erreur console
   - ✅ Reconnexion fonctionne

### Test 5: Erreur réseau simulée
1. Ouvrir DevTools > Network > Throttling "Offline"
2. Tenter de charger `/home`
3. **Vérifier:**
   - ✅ Message d'erreur clair (pas page blanche)
   - ✅ Bouton "Réessayer" visible
4. Repasser "Online" et cliquer "Réessayer"
5. **Vérifier:**
   - ✅ Données se chargent correctement

---

## 🔧 FICHIERS MODIFIÉS

### Nouveaux fichiers
- ✅ `src/services/supabaseErrorHandler.ts` - Gestionnaire d'erreurs centralisé
- ✅ `src/components/ui/ErrorFallback.tsx` - Composant UI de fallback

### Fichiers modifiés
- ✅ `src/hooks/useBookDetailProgress.ts` - Error handling + retry
- ✅ `src/hooks/useReadingProgress.ts` - Détection auth expirée
- ✅ `src/contexts/AuthContext.tsx` - Gestion session expirée
- ✅ `src/components/home/CurrentReadingCard.tsx` - UI fallback
- ⚠️ `src/lib/booky.ts` - Intégrer supabaseErrorHandler (si erreurs détectées)
- ⚠️ `src/services/social/bookysService.ts` - Intégrer supabaseErrorHandler

---

## 📝 NOTES TECHNIQUES

### Gestion des tokens JWT Supabase
- **Durée par défaut:** 60 minutes
- **Auto-refresh:** Géré automatiquement par le client Supabase si configuré
- **Détection expiration:** Erreurs type `"JWT expired"`, `"invalid token"`, code 401

### Cache React Query vs SWR
- **React Query:** Utilisé dans `useReadingList`, `useReadingListBooks`
  - ✅ Invalidation ciblée avec `queryClient.invalidateQueries()`
  - ✅ Bon contrôle du staleTime et refetch
  
- **SWR:** Utilisé historiquement mais en phase de suppression
  - ⚠️ Vérifier qu'il ne reste pas de `mutate((key) => ...)` trop larges

### Logs de debug
- `[Supabase][Context]` - Erreurs Supabase
- `[Booky]` - Système Booky
- `[AUTH CONTEXT]` - Authentification
- `🦊` - Logs Booky (uniquement pour debug)

---

## 🎯 PROCHAINES ÉTAPES

### Court terme (à tester immédiatement)
1. ✅ Tester scénario lecture intensive (Test 1)
2. ✅ Tester pause/reprise (Test 2)
3. ✅ Vérifier que boutons "Réessayer" fonctionnent

### Moyen terme (monitoring production)
1. ⚠️ Observer logs production pour erreurs Supabase récurrentes
2. ⚠️ Tester session >1h manuellement
3. ⚠️ Ajuster retry logic si trop agressive

### Long terme (amélioration continue)
1. Ajouter monitoring d'erreur centralisé (Sentry, LogRocket, etc.)
2. Créer dashboard admin pour voir erreurs utilisateurs
3. Ajouter métriques de performance (temps de réponse Supabase)

---

## ⚠️ RISQUES RÉSIDUELS

### Risque 1: Session >1h non testée
**Impact:** Moyen  
**Probabilité:** Faible (auto-refresh devrait fonctionner)  
**Mitigation:** Test manuel nécessaire + monitoring logs

### Risque 2: Race conditions sur invalidation cache
**Impact:** Faible (cartes peuvent se recharger 2x)  
**Probabilité:** Faible  
**Mitigation:** Debounce déjà en place sur la plupart des hooks

### Risque 3: Erreurs Supabase inconnues
**Impact:** Moyen  
**Probabilité:** Faible  
**Mitigation:** Gestionnaire d'erreur catch-all + logs détaillés

---

**Dernière mise à jour:** 16 Novembre 2025  
**Statut:** ✅ Corrections implémentées, en attente de tests longue durée
