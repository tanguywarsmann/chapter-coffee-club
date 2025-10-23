# Plan de Tests - Stabilité Validation/Joker/Freeze

**Date**: 2025-01-22  
**Scope**: Tests de régression post-migration pour validation idempotente, joker atomique, et UI stable

---

## A. TESTS SQL (Base de données)

### A.1 Test Idempotence RPC

**Objectif**: Vérifier que deux appels identiques produisent le même résultat sans erreur.

**Prérequis**: 
- User authentifié avec ID `f5e55556-c5ae-40dc-9909-88600a13393b`
- Book existant avec ID `7149d6d5-899c-4bf1-b7ae-2157105fc3ce`
- Question existante avec ID `1d6511a2-e109-4d87-b3a5-0970b9f18b07`

**Script SQL**:
```sql
-- Setup: Nettoyer les validations existantes pour ce test
DELETE FROM reading_validations 
WHERE user_id = 'f5e55556-c5ae-40dc-9909-88600a13393b'::uuid
  AND book_id = '7149d6d5-899c-4bf1-b7ae-2157105fc3ce'::text;

-- Test: Premier appel (création)
SELECT force_validate_segment_beta(
  '7149d6d5-899c-4bf1-b7ae-2157105fc3ce'::uuid,  -- book_id
  '1d6511a2-e109-4d87-b3a5-0970b9f18b07'::uuid,  -- question_id
  'test_answer',                                  -- answer
  'f5e55556-c5ae-40dc-9909-88600a13393b'::uuid,  -- user_id
  false,                                          -- used_joker
  true                                            -- correct
) AS premier_appel;

-- Test: Deuxième appel IDENTIQUE (upsert)
SELECT force_validate_segment_beta(
  '7149d6d5-899c-4bf1-b7ae-2157105fc3ce'::uuid,
  '1d6511a2-e109-4d87-b3a5-0970b9f18b07'::uuid,
  'test_answer',
  'f5e55556-c5ae-40dc-9909-88600a13393b'::uuid,
  false,
  true
) AS deuxieme_appel;

-- Vérification: Compter les validations (doit être = 1)
SELECT COUNT(*) as count_validations
FROM reading_validations
WHERE user_id = 'f5e55556-c5ae-40dc-9909-88600a13393b'::uuid
  AND book_id = '7149d6d5-899c-4bf1-b7ae-2157105fc3ce'::text;
-- ATTENDU: 1

-- Vérification: État de la validation
SELECT segment, used_joker, correct
FROM reading_validations
WHERE user_id = 'f5e55556-c5ae-40dc-9909-88600a13393b'::uuid
  AND book_id = '7149d6d5-899c-4bf1-b7ae-2157105fc3ce'::text;
-- ATTENDU: used_joker=false, correct=true
```

**Critère de succès**: 
- Aucune erreur levée
- `count_validations = 1` (pas de duplicate)
- État final cohérent

---

### A.2 Test Upsert OR (Logique de combinaison)

**Objectif**: Vérifier que l'UPSERT combine correctement les états avec logique OR.

**Scénario**:
1. Validation avec `used_joker=false`, `correct=true`
2. Re-validation avec `used_joker=true`, `correct=true`
3. Résultat attendu: `used_joker=true` (OR combiné)

**Script SQL**:
```sql
-- Setup
DELETE FROM reading_validations 
WHERE user_id = 'f5e55556-c5ae-40dc-9909-88600a13393b'::uuid
  AND book_id = '7149d6d5-899c-4bf1-b7ae-2157105fc3ce'::text;

-- Appel 1: Sans joker
SELECT force_validate_segment_beta(
  '7149d6d5-899c-4bf1-b7ae-2157105fc3ce'::uuid,
  '1d6511a2-e109-4d87-b3a5-0970b9f18b07'::uuid,
  'answer',
  'f5e55556-c5ae-40dc-9909-88600a13393b'::uuid,
  false,  -- used_joker=false
  true
);

-- Appel 2: AVEC joker (sur même segment)
SELECT force_validate_segment_beta(
  '7149d6d5-899c-4bf1-b7ae-2157105fc3ce'::uuid,
  '1d6511a2-e109-4d87-b3a5-0970b9f18b07'::uuid,
  'answer',
  'f5e55556-c5ae-40dc-9909-88600a13393b'::uuid,
  true,   -- used_joker=true
  true
);

-- Vérification
SELECT used_joker, correct
FROM reading_validations
WHERE user_id = 'f5e55556-c5ae-40dc-9909-88600a13393b'::uuid
  AND book_id = '7149d6d5-899c-4bf1-b7ae-2157105fc3ce'::text;
-- ATTENDU: used_joker=true (OR résultat)
```

**Critère de succès**: `used_joker = true` après les deux appels

---

### A.3 Test Monotonie `current_page`

**Objectif**: Vérifier que `current_page` ne décroît jamais.

**Script SQL**:
```sql
-- Setup: Créer progression initiale
DELETE FROM reading_progress WHERE user_id = 'f5e55556-c5ae-40dc-9909-88600a13393b'::uuid;

-- Validation segment 5 (current_page = 5)
SELECT force_validate_segment_beta(
  '7149d6d5-899c-4bf1-b7ae-2157105fc3ce'::uuid,
  '1d6511a2-e109-4d87-b3a5-0970b9f18b07'::uuid,
  'answer',
  'f5e55556-c5ae-40dc-9909-88600a13393b'::uuid,
  false,
  true
);

SELECT current_page FROM reading_progress 
WHERE user_id = 'f5e55556-c5ae-40dc-9909-88600a13393b'::uuid;
-- ATTENDU: current_page >= 5

-- Validation segment 3 (plus ancien - ne doit PAS décrémenter)
SELECT force_validate_segment_beta(
  '7149d6d5-899c-4bf1-b7ae-2157105fc3ce'::uuid,
  'autre-question-segment-3'::uuid,
  'answer',
  'f5e55556-c5ae-40dc-9909-88600a13393b'::uuid,
  false,
  true
);

SELECT current_page FROM reading_progress 
WHERE user_id = 'f5e55556-c5ae-40dc-9909-88600a13393b'::uuid;
-- ATTENDU: current_page = 5 (inchangé, grâce à GREATEST)
```

**Critère de succès**: `current_page` reste à 5 après validation segment 3

---

### A.4 Test Verrou Advisory (Race condition)

**Objectif**: Vérifier que le verrou empêche deux validations simultanées.

**Note**: Test manuel avec deux sessions PostgreSQL simultanées.

**Session 1**:
```sql
BEGIN;
-- Simuler appel lent avec pg_sleep
SELECT force_validate_segment_beta(
  '7149d6d5-899c-4bf1-b7ae-2157105fc3ce'::uuid,
  '1d6511a2-e109-4d87-b3a5-0970b9f18b07'::uuid,
  'answer',
  'f5e55556-c5ae-40dc-9909-88600a13393b'::uuid,
  false,
  true
);
SELECT pg_sleep(5);  -- Garder transaction ouverte 5 sec
COMMIT;
```

**Session 2** (lancée immédiatement après Session 1):
```sql
-- Cette requête DOIT attendre que Session 1 libère le verrou
SELECT force_validate_segment_beta(
  '7149d6d5-899c-4bf1-b7ae-2157105fc3ce'::uuid,
  '1d6511a2-e109-4d87-b3a5-0970b9f18b07'::uuid,
  'answer',
  'f5e55556-c5ae-40dc-9909-88600a13393b'::uuid,
  false,
  true
), clock_timestamp();
```

**Critère de succès**: 
- Session 2 attend ~5 secondes avant de s'exécuter
- Une seule validation créée au final

---

## B. TESTS EDGE FUNCTION (Joker)

### B.1 Test Règle "Min Segments" Côté Serveur

**Objectif**: Vérifier que l'Edge Function bloque les jokers pour livres < 3 segments.

**Setup**:
- Book test avec `expected_segments = 2`
- User authentifié

**Requête HTTP**:
```bash
curl -X POST https://xjumsrjuyzvsixvfwoiz.supabase.co/functions/v1/joker-reveal \
  -H "Authorization: Bearer YOUR_USER_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "bookId": "test-book-2-segments-uuid",
    "questionId": "question-uuid",
    "consume": true
  }'
```

**Réponse attendue**:
```json
{
  "error": "Jokers indisponibles: livre trop court (moins de 3 segments)"
}
```

**Code HTTP attendu**: `403 Forbidden`

**Critère de succès**: Joker refusé côté serveur pour livre < 3 segments

---

### B.2 Test Double Clic Rapide (Atomicité)

**Objectif**: Vérifier qu'un double-clic consomme UN seul joker, pas deux.

**Setup**:
- Book avec `expected_segments = 5` → `jokersAllowed = 1`
- User avec 0 jokers utilisés

**Procédure**:
1. Lancer deux requêtes HTTP **simultanément** (via script Node.js ou curl parallèle)
2. Compter les jokers consommés dans la base

**Script test (Node.js)**:
```javascript
const fetch = require('node-fetch');

const payload = {
  bookId: 'test-book-uuid',
  questionId: 'question-uuid',
  consume: true
};

const headers = {
  'Authorization': 'Bearer YOUR_JWT',
  'Content-Type': 'application/json'
};

// Lancer 2 appels en parallèle
Promise.all([
  fetch('https://xjumsrjuyzvsixvfwoiz.supabase.co/functions/v1/joker-reveal', {
    method: 'POST',
    headers,
    body: JSON.stringify(payload)
  }),
  fetch('https://xjumsrjuyzvsixvfwoiz.supabase.co/functions/v1/joker-reveal', {
    method: 'POST',
    headers,
    body: JSON.stringify(payload)
  })
]).then(async ([res1, res2]) => {
  console.log('Response 1:', await res1.json());
  console.log('Response 2:', await res2.json());
});
```

**Vérification SQL**:
```sql
SELECT COUNT(*) as jokers_consumed
FROM reading_validations
WHERE user_id = 'test-user-uuid'
  AND book_id = 'test-book-uuid'
  AND used_joker = true;
-- ATTENDU: 1 (pas 2)
```

**Critère de succès**: 
- Une seule validation avec `used_joker=true`
- Deuxième appel retourne erreur "Plus aucun joker"

---

### B.3 Test Retry Réseau (Idempotence)

**Objectif**: Vérifier qu'un retry après timeout ne consomme pas de joker supplémentaire.

**Procédure**:
1. Appel initial avec `consume=true`
2. Simuler timeout côté client (fermer connexion avant réponse)
3. Retry immédiat avec mêmes paramètres

**Critère de succès**: 
- Joker consommé une seule fois
- Retry retourne la même réponse (ou erreur appropriée)

**Note**: Ce test nécessite l'atomicité du B.2. Si pas implémentée, ÉCART attendu.

---

## C. TESTS UI (React)

### C.1 Test Double Clic Bouton "Valider"

**Objectif**: Vérifier qu'un double-clic rapide déclenche UN seul appel réseau.

**Procédure manuelle**:
1. Ouvrir DevTools → Network tab
2. Entrer une réponse dans le quiz
3. Double-cliquer rapidement sur "Valider ma réponse"
4. Observer les appels réseau

**Critère de succès**:
- UN seul appel `rpc/force_validate_segment_beta` visible
- Console log: "❌ Prevented double submission" pour le 2e clic

**Procédure automatisée (Playwright)**:
```typescript
test('Double click validation button sends single request', async ({ page }) => {
  await page.goto('/books/some-slug');
  
  // Ouvrir quiz
  await page.click('[data-testid="validate-segment-1"]');
  
  // Entrer réponse
  await page.fill('[data-testid="quiz-answer-input"]', 'test');
  
  // Écouter requêtes réseau
  const requests = [];
  page.on('request', req => {
    if (req.url().includes('force_validate_segment_beta')) {
      requests.push(req);
    }
  });
  
  // Double clic rapide
  const button = page.locator('[data-testid="submit-answer-button"]');
  await button.dblclick();
  
  // Attendre réponse
  await page.waitForTimeout(2000);
  
  // Vérifier
  expect(requests.length).toBe(1);
});
```

---

### C.2 Test Fermeture Modale Pendant Appel

**Objectif**: Vérifier qu'aucun crash ne survient si la modale est fermée pendant validation.

**Procédure manuelle**:
1. Entrer réponse quiz
2. Cliquer "Valider"
3. **Immédiatement** cliquer "Annuler" ou ESC

**Critère de succès**:
- Aucune erreur console "Can't perform a React state update on an unmounted component"
- Modale se ferme proprement
- Requête en cours est annulée (si `AbortController` implémenté) OU se termine silencieusement

**Procédure automatisée**:
```typescript
test('Closing modal during validation does not crash', async ({ page, context }) => {
  await page.goto('/books/some-slug');
  
  // Capturer erreurs console
  const consoleErrors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') consoleErrors.push(msg.text());
  });
  
  // Ouvrir quiz
  await page.click('[data-testid="validate-segment-1"]');
  await page.fill('[data-testid="quiz-answer-input"]', 'test');
  
  // Valider ET fermer immédiatement
  await Promise.all([
    page.click('[data-testid="submit-answer-button"]'),
    page.keyboard.press('Escape')  // Fermeture immédiate
  ]);
  
  await page.waitForTimeout(1000);
  
  // Vérifier absence d'erreurs critiques
  expect(consoleErrors.filter(e => e.includes('unmounted'))).toHaveLength(0);
});
```

---

### C.3 Test Navigation Arrière Pendant Quiz

**Objectif**: Vérifier que la navigation n'entraîne pas de leaks mémoire ou erreurs.

**Procédure manuelle**:
1. Ouvrir quiz
2. Entrer réponse
3. Cliquer "Valider"
4. **Avant réponse** → Bouton Retour navigateur

**Critère de succès**:
- Aucune erreur console
- Cleanup des refs (`inFlightRef`, `hasCalledComplete`)
- Pas de setState après unmount

**Procédure automatisée**:
```typescript
test('Browser back during validation cleans up properly', async ({ page }) => {
  await page.goto('/books/some-slug');
  
  const consoleErrors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') consoleErrors.push(msg.text());
  });
  
  // Ouvrir quiz
  await page.click('[data-testid="validate-segment-1"]');
  await page.fill('[data-testid="quiz-answer-input"]', 'test');
  await page.click('[data-testid="submit-answer-button"]');
  
  // Navigation immédiate (avant réponse)
  await page.goBack();
  
  await page.waitForTimeout(2000);
  
  expect(consoleErrors).toHaveLength(0);
});
```

---

### C.4 Test Modales Superposées

**Objectif**: Vérifier qu'une seule modale est visible à la fois.

**Procédure manuelle**:
1. Ouvrir ValidationModal
2. Confirmer → QuizModal s'ouvre
3. Réponse incorrecte → JokerConfirmationModal
4. Confirmer joker → AnswerRevealModal

**Critère de succès**:
- À chaque étape, **une seule** Dialog visible
- Pas de superposition visuelle
- ESC ferme la modale active (pas plusieurs)

**Vérification visuelle**: Inspecter DOM - un seul `[role="dialog"][data-state="open"]` à la fois.

---

## D. RÉSUMÉ DES CRITÈRES DE RÉUSSITE

| Test | Critique | Attendu | Actuel (estimé) |
|------|----------|---------|-----------------|
| A.1 - Idempotence SQL | ⚠️ | PASS | ⚠️ ÉCART (sans migration) |
| A.2 - Upsert OR | ⚠️ | PASS | ⚠️ ÉCART (sans migration) |
| A.3 - Monotonie | ✅ | PASS | ✅ PASS |
| A.4 - Verrou | ⚠️ | PASS | ⚠️ ÉCART (sans migration) |
| B.1 - Min segments serveur | ⚠️ | PASS | ❌ ÉCART |
| B.2 - Double clic joker | ⚠️ | PASS | ⚠️ ÉCART PROBABLE |
| B.3 - Retry joker | ⚠️ | PASS | ⚠️ ÉCART |
| C.1 - Double clic UI | ✅ | PASS | ✅ PASS |
| C.2 - Fermeture modale | ✅ | PASS | ⚠️ MINEUR (sans AbortController) |
| C.3 - Navigation back | ✅ | PASS | ✅ PASS |
| C.4 - Modales uniques | ✅ | PASS | ✅ PASS |

**Légende**:
- ✅ PASS: Fonctionne comme attendu
- ⚠️ ÉCART: Nécessite correctif (migrations/patches)
- ❌ ÉCART: Non implémenté

**Après migration/patches**: Tous doivent être ✅ PASS
