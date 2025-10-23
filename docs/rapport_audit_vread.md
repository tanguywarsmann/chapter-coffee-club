# Rapport d'Audit - Stabilité Validation/Joker/Freeze VREAD

**Date**: 2025-01-22  
**Auditeur**: Lovable AI  
**Scope**: Système de validation de lecture, consommation de jokers, stabilité UI

---

## Résumé Exécutif

**Statut Global**: ⚠️ **ÉCARTS CRITIQUES DÉTECTÉS**

Plusieurs points critiques nécessitent correction avant build mobile:
1. **RPC non idempotente**: Pas de verrou advisory, pas d'upsert OR
2. **Joker non atomique côté serveur**: Règle "min segments" absente en backend
3. **Modales superposables**: Risque de gel UI mineur

**Changements recommandés**: Migration SQL + patch Edge Function + améliorations UI mineures

---

## A. BASE DE DONNÉES: RPC et Contraintes

### A.1 Signature Unique de `force_validate_segment_beta`

**Statut**: ⚠️ **ÉCART MODÉRÉ**

**Preuve**:
- Fichier: `supabase/migrations/` (multiples)
- Dernière signature trouvée: `force_validate_segment_beta(p_book_id uuid, p_question_id uuid, p_answer text, p_user_id uuid, p_used_joker boolean, p_correct boolean)`
- Chemin migration la plus récente: `supabase/migrations/20250917132704_9dd99796-2329-4e64-870a-4525e17c061d.sql`

**Constat**:
```sql
-- Extrait ligne 5-15
DROP FUNCTION IF EXISTS public.force_validate_segment_beta(uuid, uuid, text, uuid, boolean, boolean);

CREATE OR REPLACE FUNCTION public.force_validate_segment_beta(
  p_book_id uuid,
  p_question_id uuid,
  p_answer text DEFAULT 'validated'::text,
  p_user_id uuid DEFAULT NULL::uuid,
  p_used_joker boolean DEFAULT false,
  p_correct boolean DEFAULT NULL::boolean
)
```

La fonction existe avec UNE signature claire, mais **il existe de nombreuses migrations successives** qui créent du bruit historique. La dernière version semble consolidée.

**Écart**: Historique de migrations non nettoyé, mais signature actuelle stable.

---

### A.2 Verrou Advisory Transactionnel

**Statut**: ❌ **ÉCART CRITIQUE**

**Preuve**:
- Recherche: `pg_advisory_xact_lock` dans toutes migrations
- Résultat: **AUCUNE OCCURRENCE TROUVÉE**

**Constat**: 
La RPC actuelle n'utilise PAS de verrou advisory pour empêcher les courses de double-clic. Code actuel dans dernière migration:

```sql
-- Pas de verrou, juste des checks conditionnels
IF v_user_id IS NULL THEN
  RETURN jsonb_build_object('ok', false, 'message', 'No user authenticated');
END IF;
```

**Impact**: 
- Deux clics rapides peuvent créer deux validations simultanées
- État incohérent possible si les deux transactions s'entrelacent

**Écart**: CRITIQUE - Nécessite ajout de `SELECT pg_advisory_xact_lock(hashtext(v_user_id::text || p_book_id::text))` en début de fonction.

---

### A.3 Upsert OR sur `reading_validations`

**Statut**: ❌ **ÉCART CRITIQUE**

**Preuve**:
- Fichier: `supabase/migrations/20250917132704_9dd99796-2329-4e64-870a-4525e17c061d.sql`
- Lignes: ~65-85

**Constat**:
La fonction fait un INSERT simple avec `ON CONFLICT DO NOTHING`:

```sql
-- Extrait approximatif
INSERT INTO reading_validations (user_id, book_id, progress_id, question_id, answer, segment, used_joker, correct, validated_at)
VALUES (v_user_id, p_book_id::text, v_progress_id, p_question_id, p_answer, v_segment, p_used_joker, v_is_correct, now())
ON CONFLICT DO NOTHING;
```

**Problème**: 
- `ON CONFLICT DO NOTHING` ignore silencieusement les duplicatas
- Ne met PAS à jour `used_joker` ou `correct` si déjà existant
- Pas de logique OR pour combiner les états

**Upsert attendu**:
```sql
ON CONFLICT (user_id, book_id, segment) DO UPDATE SET
  used_joker = reading_validations.used_joker OR EXCLUDED.used_joker,
  correct = reading_validations.correct OR EXCLUDED.correct,
  progress_id = COALESCE(reading_validations.progress_id, EXCLUDED.progress_id),
  validated_at = now()
```

**Écart**: CRITIQUE - L'upsert OR est absent.

---

### A.4 Mise à jour monotone de `reading_progress.current_page`

**Statut**: ⚠️ **ÉCART MINEUR**

**Preuve**:
- Fichier: Même migration ligne ~55-75
- Code actuel:

```sql
UPDATE reading_progress 
SET updated_at = now(), 
    current_page = GREATEST(current_page, v_segment, 1),
    status = CASE 
      WHEN status = 'to_read' THEN 'in_progress'
      ELSE status
    END
WHERE id = v_progress_id;
```

**Constat**: 
La fonction utilise bien `GREATEST(current_page, v_segment, 1)` ✅  
**Mais** il y a deux endroits dans la fonction (INSERT et UPDATE) avec des logiques légèrement différentes.

**Écart**: MINEUR - La logique est correcte mais pourrait être plus uniforme.

---

### A.5 Index et Schéma

**Statut**: ✅ **CONFORME** (avec note)

**Preuve**:
- Fichier: `supabase/migrations/20250917103817_b669aa07-83a3-4f09-8337-e9de49b54d1b.sql`
- Ligne: 96-97

```sql
CREATE UNIQUE INDEX IF NOT EXISTS reading_validations_user_book_segment_idx
  ON public.reading_validations(user_id, book_id, segment);
```

**Index unique présent** ✅

**Types de colonnes**:
- `reading_validations.book_id`: `text` (selon schéma Supabase)
- `reading_progress.book_id`: `text`
- `books.id`: `text`
- Paramètre RPC `p_book_id`: `uuid`

**Incohérence détectée**: 
La RPC accepte `uuid` mais insère dans une colonne `text`. PostgreSQL fait la conversion automatiquement, mais c'est incohérent.

```sql
-- Ligne ~70 de la RPC
INSERT INTO reading_validations (..., book_id, ...)
VALUES (..., p_book_id::text, ...)  -- Cast explicite
```

**Écart**: MINEUR - Cast explicite présent, mais types incohérents conceptuellement.

---

### A.6 Politiques RLS

**Statut**: ✅ **CONFORME**

**Preuve**: 
- Schéma Supabase fourni montre les policies:

```
Policy Name: Allow insert own validation 
Command: INSERT
Using Expression: (auth.uid() = user_id) AND ...

Policy Name: Allow read own validations 
Command: SELECT
Using Expression: (auth.uid() = user_id)
```

Les policies empêchent bien les écritures concurrentes d'autres utilisateurs ✅

---

## B. EDGE FUNCTION JOKER: Atomicité et Règle Serveur

### B.1 Règle "min segments" côté serveur

**Statut**: ❌ **ÉCART CRITIQUE**

**Preuve**:
- Fichier: `supabase/functions/joker-reveal/index.ts`
- Lignes: 109-110

```typescript
// Calculer les jokers autorisés
const jokersAllowed = Math.floor(bookInfo.expected_segments / 10) + 1;
```

**Problème**: 
Aucune vérification de `expected_segments >= 3` côté serveur.  
La règle "min segments" est appliquée UNIQUEMENT côté client:

- Fichier: `src/utils/jokerConstraints.ts`
- Lignes: 35-46

```typescript
export function canUseJokers(expectedSegments: number = 0): boolean {
  if (!JOKER_MIN_SEGMENTS_ENABLED) {
    debugLog('Joker min segments check: DISABLED by feature flag');
    return true;
  }
  
  if (expectedSegments < JOKER_MIN_SEGMENTS) {
    debugLog(`Joker min segments check: BLOCKED (${expectedSegments} < ${JOKER_MIN_SEGMENTS})`);
    return false;
  }
  
  return true;
}
```

**Écart**: CRITIQUE - Contournable via appel HTTP direct à l'Edge Function.

**Correctif attendu**:
```typescript
// Dans joker-reveal/index.ts ligne ~108
const JOKER_MIN_SEGMENTS = 3;

if (bookInfo.expected_segments < JOKER_MIN_SEGMENTS && body.consume !== false) {
  return new Response(JSON.stringify({ 
    error: "Jokers indisponibles: livre trop court (moins de 3 segments)" 
  }), {
    status: 403, 
    headers: { "content-type": "application/json", ...cors(origin) }
  });
}
```

---

### B.2 Atomicité de la consommation

**Statut**: ⚠️ **ÉCART MODÉRÉ**

**Preuve**:
- Fichier: `supabase/functions/joker-reveal/index.ts`
- Lignes: 127-178

```typescript
// 1. Compte les jokers (SELECT)
const { data: validations, error: validErr } = await supabase
  .from("reading_validations")
  .select("id")
  .eq("progress_id", progressData.id)
  .eq("used_joker", true);

const jokersUsed = validations?.length || 0;
const jokersRemaining = jokersAllowed - jokersUsed;

// 2. Vérifie quota
if (jokersRemaining <= 0 && body.consume !== false) {
  return new Response(JSON.stringify({ error: "Plus aucun joker" }), ...);
}

// 3. Marque l'usage (INSERT)
if (body.consume !== false) {
  const { error: markErr } = await supabase
    .from("reading_validations")
    .insert({
      user_id: userId,
      book_id: bookId,
      progress_id: progressData.id,
      question_id: body.questionId,
      answer: questionAnswer,
      used_joker: true,
      correct: true,
      revealed_answer_at: new Date().toISOString()
    });
}
```

**Problème**: 
Trois opérations séparées (SELECT, vérif, INSERT) sans transaction atomique.  
**Race condition possible**:
- User A: Compte → 1 joker restant
- User A (double-clic): Compte → 1 joker restant en parallèle
- User A: INSERT 1er joker
- User A: INSERT 2e joker → Consomme 2 jokers alors que 1 seul était disponible

**Correctif préféré**: 
Utiliser la RPC `use_joker` (déjà existante, voir `src/services/jokerService.ts` ligne 39-92) OU créer une RPC dédiée qui fait:
```sql
CREATE OR REPLACE FUNCTION consume_joker_and_reveal(...)
RETURNS jsonb AS $$
BEGIN
  -- Verrou
  PERFORM pg_advisory_xact_lock(...);
  
  -- Vérif + Insert atomique
  ...
  
  RETURN jsonb_build_object('answer', v_answer, 'jokers_remaining', ...);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

**Écart**: MODÉRÉ - Risque faible en pratique (rare double-clic simultané) mais non-atomique.

---

### B.3 Impossibilité de "rendre" un joker

**Statut**: ✅ **CONFORME**

**Preuve**: 
Une fois l'INSERT fait (ligne 158-169), il n'y a aucun mécanisme de rollback.  
Le joker est définitivement consommé ✅

---

### B.4 Gestion des courses (double clic)

**Statut**: ⚠️ **ÉCART MODÉRÉ** (même que B.2)

Lié au point B.2 - pas de protection contre double-clic côté serveur.

---

## C. UI: Gels, Doubles Clics, Modales, Annulation Requêtes

### C.1 Boutons désactivés pendant appel

**Statut**: ✅ **CONFORME**

**Preuve**:
- Fichier: `src/components/books/QuizModal.tsx`
- Lignes: 82-95, 414-421

```tsx
const handleSubmit = async () => {
  // Prevent double submissions
  if (inFlightRef.current) {
    console.log("❌ Prevented double submission");
    return;
  }
  inFlightRef.current = true;
  ...
}

<Button 
  onClick={handleSubmit} 
  disabled={!answer.trim() || showAnswerReveal || isRevealing}
  ...
/>
```

Protection via:
1. `inFlightRef.current` pour bloquer pendant l'appel ✅
2. `disabled={!answer.trim() || showAnswerReveal || isRevealing}` ✅
3. `hasCalledComplete.current` pour éviter double `onComplete` ✅

**Conforme**

---

### C.2 Modale unique multi-états

**Statut**: ⚠️ **ÉCART MINEUR**

**Preuve**:
- Fichier: `src/components/books/QuizModal.tsx`
- Lignes: 352-513

```tsx
<Dialog 
  open={!showJokerConfirmation && !showAnswerReveal} 
  onOpenChange={onClose}
>
  {/* Quiz content */}
</Dialog>

<Dialog open={showAnswerReveal} onOpenChange={...}>
  {/* Answer reveal */}
</Dialog>

<Dialog open={showJokerConfirmation} onOpenChange={...}>
  {/* Joker confirmation */}
</Dialog>
```

**Problème**:
Trois `<Dialog>` séparés. Radix UI gère normalement bien les layers, mais il y a un risque de superposition si les états ne sont pas exclusifs.

**États actuels**:
- Quiz: `!showJokerConfirmation && !showAnswerReveal`
- Joker: `showJokerConfirmation`
- Reveal: `showAnswerReveal`

Ces états sont **mutuellement exclusifs en théorie** ✅  
Mais le code n'utilise pas une machine à états explicite (enum).

**Écart**: MINEUR - Fonctionnel mais pourrait être plus robuste avec:
```tsx
enum ModalState { QUIZ, JOKER_CONFIRM, ANSWER_REVEAL, CLOSED }
const [modalState, setModalState] = useState(ModalState.QUIZ);
```

---

### C.3 Annulation requêtes avec AbortController

**Statut**: ❌ **ÉCART MOYEN**

**Preuve**:
- Recherche: `AbortController` dans `src/hooks/useBookQuiz.ts`, `src/components/books/QuizModal.tsx`
- Résultat: **AUCUNE OCCURRENCE**

**Problème**:
Si l'utilisateur ferme la modale pendant un appel API en cours:
```tsx
const handleSubmit = async () => {
  inFlightRef.current = true;
  try {
    const result = await validateReadingSegmentBeta({...}); // Pas annulable
    ...
  } finally {
    inFlightRef.current = false;
  }
}
```

L'appel continue en arrière-plan. Si le composant est démonté avant la fin, il y a un risque de `setState` après unmount (bien que `inFlightRef` reste actif).

**Correctif attendu**:
```tsx
const abortControllerRef = useRef<AbortController | null>(null);

const handleSubmit = async () => {
  // Annuler appel précédent
  abortControllerRef.current?.abort();
  abortControllerRef.current = new AbortController();
  
  try {
    const result = await validateReadingSegmentBeta({
      ...,
      signal: abortControllerRef.current.signal
    });
  } catch (error) {
    if (error.name === 'AbortError') return;
    ...
  }
}

useEffect(() => {
  return () => {
    abortControllerRef.current?.abort();
  };
}, []);
```

**Écart**: MOYEN - Risque de race condition mineure, mais pas bloquant.

---

### C.4 setState après unmount

**Statut**: ✅ **CONFORME** (avec protection partielle)

**Preuve**:
- Fichier: `src/components/books/QuizModal.tsx`
- Lignes: 62-69

```tsx
useEffect(() => {
  hasCalledComplete.current = false;

  // Cleanup on unmount pour éviter race condition
  return () => {
    hasCalledComplete.current = false;
  };
}, [question?.id]);
```

Protection présente via `useRef` qui survit au démontage ✅  
**Mais** pas de cleanup des états (`setAnswer`, `setAttempts`, etc.) si promesse résout après unmount.

**Écart**: TRÈS MINEUR - Risque théorique, peu probable en pratique.

---

### C.5 Erreurs RPC surfacées à l'utilisateur

**Statut**: ✅ **CONFORME**

**Preuve**:
- Fichier: `src/components/books/QuizModal.tsx`
- Lignes: 175-221

```tsx
} catch (error) {
  console.error('❌ Single validation error:', error);
  
  const newAttempts = attempts + 1;
  setAttempts(newAttempts);
  
  // Check if joker can be used...
  if (canUseJoker && newAttempts >= 1) {
    setJokerStartTime(Date.now());
    setShowJokerConfirmation(true);
  } else {
    toast.error(`Réponse incorrecte. Il vous reste ${maxAttempts - newAttempts} tentative(s).`);
  }
}
```

Les erreurs sont bien loggées ET affichées avec `toast.error()` ✅  
L'UI ne bloque jamais complètement.

**Conforme**

---

## CONCLUSION ET PLAN D'ACTION

### Écarts Critiques (Bloquants)

1. **A.2 - Pas de verrou advisory**: Risque de duplicatas validation
2. **A.3 - Upsert OR absent**: États incohérents si retry
3. **B.1 - Règle min segments non appliquée côté serveur**: Contournable

### Écarts Modérés (Non-bloquants mais recommandés)

4. **A.1 - Historique migrations bruyant**: Complexité maintenance
5. **B.2/B.4 - Joker non atomique**: Race condition possible
6. **C.3 - Pas d'AbortController**: Requêtes non annulées

### Écarts Mineurs (Améliorations)

7. **A.4 - Logique UPDATE/INSERT dupliquée**: Peut être unifié
8. **A.5 - Types uuid vs text**: Incohérence conceptuelle
9. **C.2 - Modales multiples**: Pourrait être machine à états

---

## LIVRABLES RECOMMANDÉS

### 1. Migration SQL unique

**Fichier**: `supabase/migrations/20250122_stability_validation_joker.sql`

**Contenu**:
- Drop signatures parasites de `force_validate_segment_beta`
- Recréation avec verrou advisory + upsert OR
- Harmonisation types (text → uuid ou inverse, au choix)
- Commentaires explicatifs

### 2. Patch Edge Function

**Fichier**: `supabase/functions/joker-reveal/index.ts`

**Modifications**:
- Ajout vérification `expected_segments >= 3` (lignes ~108)
- (Optionnel) Appel RPC `use_joker` pour atomicité ou création RPC dédiée

### 3. Patch UI minimal

**Fichiers**:
- `src/components/books/QuizModal.tsx`
- `src/hooks/useBookQuiz.ts`

**Modifications**:
- Ajout `AbortController` dans `handleSubmit`
- (Optionnel) Refactor états modales en enum

### 4. Plan de tests

**Fichier**: `scripts/tests/validation_joker_freeze.md`

**Tests SQL**:
- Idempotence: Appeler RPC 2x avec mêmes params → même résultat
- Monotonie: `current_page` ne doit jamais diminuer
- Verrou: 2 appels simultanés → 1 seul réussit (test avec `pg_sleep`)

**Tests Edge Function**:
- Livre avec `expected_segments=2` → 403 Forbidden
- Double clic rapide → 1 seul joker consommé
- Retry réseau → pas de double consommation

**Tests UI**:
- Double clic bouton "Valider" → 1 seul appel réseau
- Fermeture modale pendant appel → pas de crash
- Navigation arrière pendant quiz → cleanup correct

---

**Prochaine étape recommandée**: Implémenter la migration SQL et le patch Edge Function en priorité (critiques A.2, A.3, B.1).
