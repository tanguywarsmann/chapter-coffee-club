# Proposition de Patch - Règle Joker "≥ 3 segments"

## 📋 Résumé

**Patch**: Implémentation de la contrainte "les jokers ne sont utilisables que sur les livres avec au moins 3 segments"

**Stratégie**: Déploiement progressif avec feature flag et rollback immédiat

**Impact estimé**: Blocage des jokers sur livres 1-2 segments (minorité présumée)

## 🎯 Modifications Proposées

### 1. Point Unique de Configuration

#### `src/utils/jokerConstraints.ts` (déjà créé)
```typescript
export const JOKER_MIN_SEGMENTS = 3;
export const JOKER_MIN_SEGMENTS_ENABLED = 
  import.meta.env.VITE_JOKER_MIN_SEGMENTS_ENABLED === 'true';

export function canUseJokers(expectedSegments: number): boolean {
  return expectedSegments >= JOKER_MIN_SEGMENTS;
}

export function calculateJokersAllowed(expectedSegments: number): number {
  if (JOKER_MIN_SEGMENTS_ENABLED && !canUseJokers(expectedSegments)) {
    return 0;
  }
  return Math.floor(expectedSegments / 10) + 1;
}
```

### 2. Modifications Frontend

#### A. Hook `useJokersInfo.ts`
```diff
+ import { calculateJokersAllowed } from '@/utils/jokerConstraints';

- const allowed = Math.floor(expectedSegments / 10) + 1;
+ const allowed = calculateJokersAllowed(expectedSegments);
```

#### B. Composant `JokerConfirmationModal.tsx`
```diff
+ import { canUseJokers, getJokerDisabledMessage } from '@/utils/jokerConstraints';

export function JokerConfirmationModal({
  // ... props existantes
+ expectedSegments = 0,
}: JokerConfirmationModalProps) {
+ const canUse = canUseJokers(expectedSegments);
+ const disabledMessage = getJokerDisabledMessage(expectedSegments);

  return (
    <Dialog>
      {/* ... contenu existant */}
+     {!canUse && (
+       <div className="p-4 bg-amber-50 border border-amber-200 rounded">
+         <p className="text-sm text-amber-800">{disabledMessage}</p>
+       </div>
+     )}
      
      <DialogFooter>
        <Button 
          onClick={onConfirm}
-         disabled={jokersRemaining <= 0 || isUsingJoker}
+         disabled={!canUse || jokersRemaining <= 0 || isUsingJoker}
        >
-         {isUsingJoker ? "Utilisation..." : "Utiliser un Joker"}
+         {!canUse ? "Jokers indisponibles" : 
+          isUsingJoker ? "Utilisation..." : "Utiliser un Joker"}
        </Button>
      </DialogFooter>
    </Dialog>
  );
}
```

#### C. Composant `QuizModal.tsx`
```diff
+ import { canUseJokers } from '@/utils/jokerConstraints';

// Dans handleSubmit après réponse incorrecte
- const canUseJoker = actualJokersRemaining > 0 && !isUsingJoker;
+ const canUseJoker = canUseJokers(expectedSegments) && 
+                     actualJokersRemaining > 0 && !isUsingJoker;
```

### 3. Modifications Backend

#### A. RPC Database `use_joker`
```sql
CREATE OR REPLACE FUNCTION public.use_joker(
  p_book_id TEXT,
  p_user_id UUID,
  p_segment INTEGER
) RETURNS TABLE (
  jokers_remaining INTEGER,
  success BOOLEAN,
  message TEXT
) AS $$
DECLARE
  v_expected_segments INTEGER;
  v_constraint_enabled BOOLEAN := current_setting('app.joker_min_segments_enabled', true)::BOOLEAN;
  v_min_segments INTEGER := current_setting('app.joker_min_segments', true)::INTEGER;
  -- ... autres variables
BEGIN
  -- Récupérer expected_segments
  SELECT expected_segments INTO v_expected_segments
  FROM books WHERE id = p_book_id;
  
  IF v_expected_segments IS NULL THEN
    RETURN QUERY SELECT 0, FALSE, 'Livre introuvable ou segments non définis'::TEXT;
    RETURN;
  END IF;
  
  -- NOUVELLE CONTRAINTE
  IF v_constraint_enabled AND v_expected_segments < v_min_segments THEN
    RETURN QUERY SELECT 0, FALSE, 
      format('Jokers non disponibles pour les livres de moins de %s segments', v_min_segments)::TEXT;
    RETURN;
  END IF;
  
  -- ... reste de la logique existante inchangée
END; $$;
```

#### B. Configuration Database
```sql
-- Variables de configuration (modifiables sans redéploiement)
ALTER DATABASE postgres SET app.joker_min_segments_enabled = 'false';
ALTER DATABASE postgres SET app.joker_min_segments = '3';
```

#### C. Edge Function `joker-reveal/index.ts`
```diff
+ const JOKER_MIN_SEGMENTS_ENABLED = Deno.env.get("JOKER_MIN_SEGMENTS_ENABLED") === 'true';
+ const JOKER_MIN_SEGMENTS = parseInt(Deno.env.get("JOKER_MIN_SEGMENTS") || "3");

// Après récupération des données du livre
+ if (JOKER_MIN_SEGMENTS_ENABLED && bookData.expected_segments < JOKER_MIN_SEGMENTS) {
+   return new Response(JSON.stringify({ 
+     error: `Jokers non disponibles pour les livres de moins de ${JOKER_MIN_SEGMENTS} segments`,
+     expectedSegments: bookData.expected_segments,
+     minimumRequired: JOKER_MIN_SEGMENTS
+   }), { 
+     status: 400,
+     headers: { ...corsHeaders, 'Content-Type': 'application/json' }
+   });
+ }
```

## 🚀 Plan de Déploiement Progressif

### Phase 1: Soft Launch (Jour 1-3)
```bash
# Variables d'environnement
VITE_JOKER_MIN_SEGMENTS_ENABLED=true
VITE_JOKER_MIN_SEGMENTS=3
JOKER_MIN_SEGMENTS_ENABLED=false  # Backend reste permissif
JOKER_MIN_SEGMENTS=3
```

**Comportement**:
- ✅ UI affiche les messages de contrainte
- ✅ Boutons joker grisés sur livres < 3 segments  
- ❌ Backend permet encore l'utilisation (double sécurité)
- 📊 Logs de toutes les tentatives bloquées côté UI

### Phase 2: Backend Warning (Jour 4-7) 
```bash
# Ajout logs backend sans blocage
JOKER_MIN_SEGMENTS_ENABLED=false  # Toujours permissif
JOKER_MIN_SEGMENTS_WARNING=true   # Nouveau flag pour logs
```

**Comportement**:
- ✅ UI bloque complètement
- ⚠️ Backend log les utilisations qui seraient bloquées
- ❌ Backend permet encore (surveillance)

### Phase 3: Enforcement Complet (Jour 8+)
```bash
# Activation complète
JOKER_MIN_SEGMENTS_ENABLED=true   # Backend bloque
```

**Comportement**:
- ✅ UI et Backend bloquent complètement
- 📊 Monitoring impact utilisateurs
- 🔄 Rollback possible en < 5 minutes

## 🔄 Stratégie de Rollback

### Rollback Immédiat (< 5 minutes)
```bash
# Désactivation par variables d'environnement
export VITE_JOKER_MIN_SEGMENTS_ENABLED=false
export JOKER_MIN_SEGMENTS_ENABLED=false

# Redéploiement automatique
```

### Rollback Base de Données (< 15 minutes)
```sql
-- Restauration configuration DB
ALTER DATABASE postgres SET app.joker_min_segments_enabled = 'false';

-- Ou rollback de la fonction use_joker vers version précédente
```

### Rollback Complet (< 1 heure)
```bash
# Revert du commit principal
git revert <commit-hash>

# Suppression des logs temporaires 
git clean -fd

# Redéploiement complet
```

## 📊 Métriques de Surveillance

### Pré-Déploiement (Baseline)
- [ ] Utilisations joker/jour par tranche de segments
- [ ] Erreurs API joker (taux baseline)
- [ ] Temps de réponse moyen Edge Function

### Post-Déploiement (Monitoring)
- [ ] Erreurs 400 "jokers non disponibles" (volume attendu)
- [ ] Tentatives UI bloquées vs backend calls
- [ ] Impact satisfaction utilisateur (support, feedback)
- [ ] Performance API (pas de dégradation > 20%)

### Critères de Rollback Automatique
```bash
# Si erreurs > 5% du trafic joker pendant 10 minutes
if (joker_errors_rate > 0.05 for 10min) then rollback;

# Si temps réponse > 5s pendant 5 minutes  
if (joker_response_time > 5s for 5min) then rollback;

# Si > 50 tickets support/heure mentionnant "joker"
if (support_tickets_joker > 50/hour) then rollback;
```

## 🎯 Tests de Validation

### Tests Automatisés (CI/CD)
```typescript
// tests/joker-constraints.test.ts
describe('Joker Constraints', () => {
  test('allows jokers on books with 3+ segments', () => {
    expect(canUseJokers(3)).toBe(true);
    expect(canUseJokers(10)).toBe(true);
  });
  
  test('blocks jokers on books with < 3 segments', () => {
    process.env.VITE_JOKER_MIN_SEGMENTS_ENABLED = 'true';
    expect(canUseJokers(1)).toBe(false);
    expect(canUseJokers(2)).toBe(false);
  });
  
  test('calculates jokers correctly with constraints', () => {
    process.env.VITE_JOKER_MIN_SEGMENTS_ENABLED = 'true';
    expect(calculateJokersAllowed(2)).toBe(0);  // Blocked
    expect(calculateJokersAllowed(3)).toBe(1);  // Allowed
    expect(calculateJokersAllowed(15)).toBe(2); // Allowed
  });
});
```

### Tests e2e (Playwright)
```typescript
// tests/joker-flow.spec.ts
test('joker constraint blocks small books', async ({ page }) => {
  // Setup: livre avec 2 segments
  await setupTestBook({ id: 'test-2seg', expected_segments: 2 });
  
  // Navigation vers livre
  await page.goto('/books/test-2seg');
  
  // Déclencher validation avec réponse incorrecte
  await page.click('[data-testid="validate-segment"]');
  await page.fill('[data-testid="quiz-answer"]', 'wrong answer');
  await page.click('[data-testid="submit-answer"]');
  
  // Vérifier que le joker est désactivé
  const jokerButton = page.locator('[data-testid="joker-button"]');
  await expect(jokerButton).toBeDisabled();
  await expect(jokerButton).toContainText('Jokers indisponibles');
});
```

## 📋 Checklist Pré-Déploiement

### Code Review
- [ ] Feature flags correctement implémentés partout
- [ ] Aucune logique hardcodée (tout configurable)
- [ ] Messages UX clairs et informatifs
- [ ] Tests automatisés passent en CI/CD
- [ ] Performance non dégradée (benchmarks)

### Infrastructure
- [ ] Variables d'environnement configurées correctement
- [ ] Monitoring alerts configurés
- [ ] Rollback scripts testés en staging
- [ ] Documentation équipe support mise à jour

### Communication
- [ ] Changelog préparé (impact utilisateur minimal)
- [ ] FAQ équipe support (cas d'usage bloqués)
- [ ] Métriques baseline collectées

## 🔒 Sécurité et Résilience

### Validation Double
- Frontend ET Backend vérifient la contrainte
- Pas de bypass possible côté client uniquement
- Edge Function indépendante de l'état UI

### Gestion d'Erreurs
- Messages d'erreur non techniques pour utilisateur final
- Logs détaillés pour debug sans exposition données sensibles
- Fallback gracieux si configuration indisponible

### Monitoring
- Alerts en temps réel sur métriques critiques
- Dashboard impact utilisateur
- Capacité de rollback sans interruption service

---

**Status**: ✅ Prêt pour validation humaine et déploiement pilote

**Risque estimé**: 🟡 Modéré (impact utilisateur limité, rollback rapide possible)

**Effort déploiement**: 🟢 Faible (feature flags, pas de migration DB complexe)