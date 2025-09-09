# Audit Joker - Règle "≥ 3 segments"

## 📋 Résumé Exécutif

**Objectif**: Analyser la faisabilité d'imposer la règle "un Joker n'est utilisable que si le livre compte au moins 3 segments" sans régression.

**Statut**: ⚠️ **MODIFICATION NÉCESSAIRE** - Le système actuel permet l'utilisation de jokers sur les livres avec 1-2 segments.

**Formule actuelle**: `Math.floor(expected_segments / 10) + 1`
- Livres 1-10 segments → 1 joker autorisé
- Livres 11-20 segments → 2 jokers autorisés

**Impact de la règle**: Les livres avec 1-2 segments ne devraient plus pouvoir utiliser de jokers.

---

## 🗺️ Cartographie du Code Joker

### 1. Composants Frontend

#### 🎯 Composants UI Principaux
- **`src/components/books/JokerConfirmationModal.tsx`**
  - Rôle: Modale de confirmation d'utilisation de joker
  - Entrées: `jokersUsed`, `jokersAllowed`, `jokersRemaining`, `segment`
  - Sorties: Appel `onConfirm()` ou `onCancel()`
  - Dépendances: Aucune DB directe

- **`src/components/books/QuizModal.tsx`**
  - Rôle: Interface de quiz avec logique joker intégrée
  - Entrées: `expectedSegments`, `jokersRemaining`, `isUsingJoker`
  - Sorties: Appel `useJokerAndReveal()`, analytics tracking
  - Dépendances: `jokerService`, `useJokersInfo`, analytics

- **`src/components/books/CorrectAnswerReveal.tsx`**
  - Rôle: Affichage de la réponse révélée via joker
  - Impact: Minimal (affichage uniquement)

#### 🔧 Hooks et Services
- **`src/hooks/useJokersInfo.ts`**
  - Rôle: Calcul et gestion d'état des jokers
  - Calcul: `Math.floor(expectedSegments / 10) + 1`
  - Dépendances: `getRemainingJokers()`
  - ⚠️ **Point critique**: Aucune vérification minimum de segments

- **`src/services/jokerService.ts`**
  - Rôle: Interface vers Edge Function joker-reveal
  - Fonctions: `useJokerAndReveal()`, `useJokerAtomically()`, `getRemainingJokers()`
  - Dépendances: Supabase client, Edge Function

- **`src/utils/jokerUtils.ts`**
  - Rôle: Utilitaires de calcul joker
  - Calcul: `calculateJokersAllowed()` = `Math.floor(expectedSegments / 10) + 1`
  - Fonctions: `getUsedJokersCount()`, `getJokersInfo()`

### 2. Backend et Base de Données

#### 🗄️ Fonction RPC Database
- **`public.use_joker(p_book_id, p_user_id, p_segment)`**
  - Localisation: `supabase/migrations/20250709173808-*.sql`
  - Calcul: `v_jokers_allowed := FLOOR(v_expected_segments / 10) + 1`
  - Vérifications:
    - ✅ Livre existe et expected_segments disponible
    - ✅ Progress_id valide
    - ✅ Jokers restants > 0
    - ✅ Segment pas déjà validé
    - ❌ **MANQUE**: Vérification expected_segments ≥ 3

#### 🌐 Edge Function
- **`supabase/functions/joker-reveal/index.ts`**
  - Rôle: Révélation des réponses avec consommation joker
  - Processus:
    1. Authentification utilisateur
    2. Résolution book_slug → book_id
    3. Appel RPC `use_joker` (si `consume=true`)
    4. Récupération réponse correcte
    5. Mise à jour `reading_validations`
  - ⚠️ **Point critique**: Aucune vérification segments ≥ 3

#### 🔐 Trigger de Contrainte
- **`check_joker_usage()` trigger**
  - Rôle: Vérification des limites joker avant insertion/update
  - Calcul: Même formule `FLOOR(v_expected_segments / 10) + 1`
  - ❌ **MANQUE**: Contrainte minimum segments

### 3. Analytics et Tracking
- **`src/services/analytics/jokerAnalytics.ts`**
  - Fonctions: `trackJokerUsed()`, `trackAnswerRevealed()`
  - Impact: Métrique uniquement, pas de logique métier

---

## 📊 Flux de Données

### Schema du Flux Principal

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   books.        │    │   useJokersInfo  │    │ JokerConfirm    │
│expected_segments├───▶│ calculateAllowed ├───▶│    Modal        │
│                 │    │                  │    │                 │
└─────────────────┘    └──────────────────┘    └─────────────────┘
                                │                        │
                                ▼                        ▼
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│  QuizModal      │    │   jokerService   │    │   Edge Function │
│ useJokerReveal  ├───▶│ useJokerAtomic   ├───▶│  joker-reveal   │
│                 │    │                  │    │                 │
└─────────────────┘    └──────────────────┘    └─────────────────┘
                                                         │
                                                         ▼
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│reading_         │    │    use_joker     │    │   check_joker   │
│validations      │◄───┤      RPC         │◄───│  _usage trigger │
│                 │    │                  │    │                 │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

### Points d'Entrée expected_segments

1. **Source de vérité**: `books.expected_segments` (nullable)
2. **Propagation**:
   - `books_public` view → Frontend
   - `useJokersInfo` hook
   - Edge Function via book lookup
   - RPC `use_joker` via book lookup

### Types et Nullabilité

- **Database**: `expected_segments: number | null`
- **Frontend**: Généralement traité comme `number` avec fallback 0
- **Problème**: Gestion incohérente des valeurs null/undefined

---

## 🧪 Scénarios de Test

### Configuration de Test Recommandée

#### Livre A (2 segments)
```sql
-- Livre test avec 2 segments
INSERT INTO books (id, title, slug, expected_segments, total_pages, author) 
VALUES ('test-book-2seg', 'Livre Test 2 Segments', 'test-2-segments', 2, 60, 'Auteur Test');
```
**Comportement actuel**: 1 joker autorisé (incorrect selon nouvelle règle)
**Comportement attendu**: 0 joker autorisé

#### Livre B (3 segments)
```sql
-- Livre test avec 3 segments  
INSERT INTO books (id, title, slug, expected_segments, total_pages, author) 
VALUES ('test-book-3seg', 'Livre Test 3 Segments', 'test-3-segments', 3, 90, 'Auteur Test');
```
**Comportement actuel**: 1 joker autorisé (correct)
**Comportement attendu**: 1 joker autorisé (inchangé)

#### Livre C (10 segments)
```sql
-- Livre test avec 10 segments
INSERT INTO books (id, title, slug, expected_segments, total_pages, author) 
VALUES ('test-book-10seg', 'Livre Test 10 Segments', 'test-10-segments', 10, 300, 'Auteur Test');
```
**Comportement actuel**: 1 joker autorisé (correct)
**Comportement attendu**: 1 joker autorisé (inchangé)

### Plan de Test Manuel

#### Pour chaque livre test:

1. **Test UI**:
   - Ouvrir page livre `/books/[slug]`
   - Vérifier affichage jokers dans `BookProgressBar`
   - Tenter validation segment avec réponse incorrecte
   - Observer si `JokerConfirmationModal` s'affiche
   - Vérifier texte "Jokers restants: X / Y"

2. **Test API**:
   - Appel direct `supabase.rpc('use_joker', {...})`
   - Appel Edge Function `/functions/v1/joker-reveal`
   - Vérifier réponses et codes d'erreur

3. **Test Database**:
   - Requête directe `SELECT * FROM use_joker(...)`
   - Vérification contraintes trigger

---

## 🚨 Analyse de Risques

### Risques Critiques

#### 1. Couplage Multi-Niveaux
- **Impact**: Modification nécessaire à 6+ endroits
- **Risque**: Incohérence si un point est oublié
- **Mitigation**: Point unique de vérification

#### 2. Gestion expected_segments Null
- **Impact**: `expected_segments = null` pourrait causer des erreurs
- **Localisation**: Books sans `expected_segments` défini
- **Mitigation**: Valeur par défaut et validation

#### 3. Rétrocompatibilité
- **Impact**: Utilisateurs ayant des jokers "acquis" sur livres < 3 segments
- **Risque**: Frustration utilisateur si jokers perdus
- **Mitigation**: Grandfathering ou migration progressive

#### 4. Caches et États
- **Impact**: `useJokersInfo` peut avoir des états cached incorrects
- **Risque**: UI affichant anciens calculs
- **Mitigation**: Invalidation cache lors du changement

### Risques Modérés

- **Analytics**: Métriques joker pourront être impactées (acceptable)
- **Tests e2e**: Potentiels failures si tests supposent jokers sur petits livres
- **Performance**: Impact négligeable (1 vérification additionnelle)

---

## 🔒 Garde-fous Manquants

### Backend (Critique)
1. **RPC `use_joker`**: Aucune vérification `expected_segments >= 3`
2. **Edge Function `joker-reveal`**: Pas de validation minimum segments
3. **Trigger `check_joker_usage`**: Manque contrainte minimum

### Frontend (Important)  
1. **`useJokersInfo`**: Calcul sans vérification minimum
2. **`JokerConfirmationModal`**: Pas de désactivation si < 3 segments
3. **`QuizModal`**: Logique joker sans garde-fou

### UX (Modéré)
1. **Messages d'erreur**: Pas de texte explicatif pour limite segments
2. **Indicateurs visuels**: Aucun hint sur pourquoi joker indisponible

---

## 🎯 Go/No-Go Decision

### ✅ **GO - Modification Recommandée**

**Justifications**:
1. **Logique métier cohérente**: Jokers sur très petits livres n'ont pas de sens
2. **Impact utilisateur limité**: Peu de livres concernés (présumé)
3. **Implémentation maîtrisable**: Points de modification identifiés
4. **Réversibilité**: Changement facilement rollbackable

**Conditions préalables**:
1. Vérification nombre de livres avec `expected_segments IN (1, 2)`
2. Analyse utilisateurs actifs sur ces livres
3. Communication utilisateurs si impact important

---

## 🔧 Proposition de Patch

### 1. Point Unique de Vérification

```typescript
// src/utils/jokerConstraints.ts (NOUVEAU)
export const JOKER_MIN_SEGMENTS = 3;

export function canUseJokers(expectedSegments: number): boolean {
  return expectedSegments >= JOKER_MIN_SEGMENTS;
}

export function calculateJokersAllowed(expectedSegments: number): number {
  if (!canUseJokers(expectedSegments)) {
    return 0;
  }
  return Math.floor(expectedSegments / 10) + 1;
}
```

### 2. Modifications Frontend

#### `src/hooks/useJokersInfo.ts`
```typescript
import { canUseJokers, calculateJokersAllowed } from '@/utils/jokerConstraints';

// Remplacer calcul existant
const allowed = calculateJokersAllowed(expectedSegments);
```

#### `src/components/books/JokerConfirmationModal.tsx`
```typescript
// Ajouter props pour désactivation
interface JokerConfirmationModalProps {
  // ... props existantes
  canUseJokers?: boolean;
  disabledReason?: string;
}

// Dans le composant
<Button 
  onClick={onConfirm}
  disabled={!canUseJokers || jokersRemaining <= 0 || isUsingJoker}
  className="..."
>
  {!canUseJokers ? "Jokers indisponibles" : /* texte normal */}
</Button>
```

### 3. Modifications Backend

#### Base de Données RPC
```sql
-- Mise à jour fonction use_joker
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
  -- ... autres variables
BEGIN
  -- Récupérer expected_segments
  SELECT expected_segments INTO v_expected_segments
  FROM books WHERE id = p_book_id;
  
  -- NOUVELLE VÉRIFICATION
  IF v_expected_segments < 3 THEN
    RETURN QUERY SELECT 0, FALSE, 'Jokers non disponibles pour les livres de moins de 3 segments'::TEXT;
    RETURN;
  END IF;
  
  -- ... reste de la logique existante
END; $$;
```

#### Edge Function
```typescript
// supabase/functions/joker-reveal/index.ts
// Après récupération expected_segments

const expectedSegments = bookData.expected_segments || 0;
if (expectedSegments < 3) {
  return new Response(JSON.stringify({ 
    error: "Jokers non disponibles pour les livres de moins de 3 segments" 
  }), { 
    status: 400,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}
```

### 4. Feature Flag (Recommandé)

```typescript
// src/utils/featureFlags.ts
export const JOKER_MIN_SEGMENTS_ENABLED = 
  import.meta.env.VITE_JOKER_MIN_SEGMENTS_ENABLED === 'true';

// Usage dans le code
if (JOKER_MIN_SEGMENTS_ENABLED && !canUseJokers(expectedSegments)) {
  // Nouvelle logique
} else {
  // Logique existante
}
```

---

## 📈 Plan de Déploiement

### Phase 1: Soft Warning (3-7 jours)
- Déployer avec feature flag désactivé
- Logs d'alerte quand joker utilisé sur livre < 3 segments  
- Monitoring impact utilisateurs

### Phase 2: UI Warning (3-7 jours)
- Activer warnings UI uniquement
- Bouton joker grisé avec message explicatif
- Backend reste permissif

### Phase 3: Enforcement Complet
- Activation feature flag complet
- Blocage backend effectif
- Monitoring erreurs et feedback

### Rollback d'Urgence
```bash
# Désactivation immédiate
export VITE_JOKER_MIN_SEGMENTS_ENABLED=false
# Redéploiement < 5 minutes
```

---

## 📋 Checklist de Validation

### Avant Déploiement
- [ ] Tests manuels sur 3 cas de livres (2, 3, 10 segments)
- [ ] Vérification aucune régression sur livres ≥ 3 segments  
- [ ] Tests API Edge Function avec nouveaux cas d'erreur
- [ ] Validation UX des messages d'erreur
- [ ] Plan de communication utilisateurs prêt

### Après Déploiement
- [ ] Monitoring logs erreurs joker
- [ ] Métriques utilisation joker avant/après
- [ ] Feedback utilisateurs sur forums/support
- [ ] Vérification performance (temps réponse API)

---

## 🔄 Plan de Rollback

### Rollback Immédiat (< 10 minutes)
```typescript
// Changement d'une seule variable
export const JOKER_MIN_SEGMENTS_ENABLED = false;
```

### Rollback Base de Données (< 30 minutes)
```sql
-- Retour à l'ancienne fonction use_joker
-- (Backup automatique de la fonction avant modification)
```

### Rollback Complet (< 1 heure)
- Revert commit principal
- Nettoyage logs debug
- Communication utilisateurs

---

## 🔍 Métriques de Suivi

### Métriques Pré-Déploiement
- Nombre livres avec expected_segments ∈ {1, 2}
- Utilisations joker/semaine sur ces livres
- Taux d'erreur API joker baseline

### Métriques Post-Déploiement  
- Erreurs 400 "jokers non disponibles"
- Réduction utilisation joker globale
- Temps réponse API joker-reveal
- Feedback support client

---

*Audit réalisé le 2025-01-09*  
*Prochaine révision recommandée: après déploiement + 1 semaine*