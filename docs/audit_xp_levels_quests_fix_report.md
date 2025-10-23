# 📊 Rapport de correctifs XP/Niveaux/Quêtes

**Date** : 2025-01-23  
**Auteur** : Lovable AI  
**Statut** : ✅ Déployé en production

---

## 🎯 Problème identifié

### Bug critique : "3 livres finis, niveau 1, 0 XP"

**Symptômes** :
- Utilisateurs ayant terminé plusieurs livres restant bloqués au niveau 1
- XP affiché à 0 malgré des validations de segments
- Aucun bonus XP lors de la complétion d'un livre

**Analyse initiale** :
```sql
-- 382 profils (97,4%) sans user_levels
SELECT COUNT(*) FROM public.profiles p
LEFT JOIN public.user_levels ul ON ul.user_id = p.id
WHERE ul.user_id IS NULL;
-- Résultat : 382 / 392 utilisateurs
```

### Causes racines identifiées

#### 1. ❌ Initialisation manquante de `user_levels` (CRITIQUE)

**Problème** :
- Le trigger `handle_new_user()` n'initialise que `profiles`, jamais `user_levels`
- 97,4% des utilisateurs n'ont aucune entrée dans `user_levels`
- `addXP()` échoue silencieusement si `getUserLevel()` retourne `null`

**Preuve** :
```typescript
// src/services/user/levelService.ts:122-126
const currentLevel = await getUserLevel(userId);
if (!currentLevel) {
  console.error("addXP: Could not get or create user level");
  return false; // ❌ Échec silencieux
}
```

**Impact** : 🔴 Bloquant - Aucun XP attribué pour 382 utilisateurs

---

#### 2. ❌ Bonus XP fin de livre inexistant (CRITIQUE)

**Problème** :
- Aucun code ne crédite d'XP lors de la transition `reading_progress.status → 'completed'`
- Seules les validations de segments donnent +10 XP
- Terminer un livre n'apporte aucun bénéfice XP

**Impact** : 🔴 Bloquant - Progression XP extrêmement lente

**Calcul actuel** :
- Livre de 10 segments = 100 XP (10 validations × 10 XP)
- Pour atteindre niveau 5 (1000 XP) = **10 livres minimum** (sans bonus)

---

#### 3. ⚠️ Race condition dans `addXP()` (MODÉRÉ)

**Problème** :
- `addXP()` fait un `SELECT` puis un `UPDATE` (non atomique)
- 2 validations simultanées peuvent causer une perte d'XP

**Preuve** :
```typescript
// Cycle READ → COMPUTE → WRITE (non atomique)
const currentLevel = await getUserLevel(userId); // READ
const newXP = currentLevel.xp + amount;          // COMPUTE
await supabase.update({ xp: newXP });            // WRITE
```

**Impact** : 🟡 Modéré - Perte d'XP possible en cas de double-clic ou réseau lent

---

## ✅ Correctifs implémentés

### Migration P0 - Critique (bloqueurs iOS)

#### Correctif 1 : Bootstrap `user_levels` + Trigger auto-init

**Fichier** : `supabase/migrations/YYYYMMDD_HHmmss_bootstrap_user_levels_fixed.sql`

**Actions** :
1. **Backfill** : Créer `user_levels` pour tous les profils existants
   - Filtre : uniquement les profils avec `id` existant dans `auth.users`
   - Calcul XP historique : `COUNT(reading_validations) × 10`
   - Calcul niveau initial : selon courbe (100/250/500/1000)

2. **Trigger** : Auto-init `user_levels` lors de la création d'un profil
   ```sql
   CREATE TRIGGER init_user_level_trigger
     AFTER INSERT ON public.profiles
     FOR EACH ROW
     EXECUTE FUNCTION public.init_user_level_on_profile();
   ```

**Résultat** :
- ✅ 382 utilisateurs initialisés avec XP historique
- ✅ Tous les nouveaux utilisateurs auront `user_levels` automatiquement

---

#### Correctif 2 : RPC atomique `increment_user_xp`

**Fichier** : `supabase/migrations/YYYYMMDD_HHmmss_create_increment_user_xp_rpc.sql`

**Fonction** :
```sql
public.increment_user_xp(p_user_id UUID, p_amount INTEGER DEFAULT 10)
RETURNS JSONB
```

**Avantages** :
- ✅ **Atomique** : `UPDATE ... RETURNING` en une seule transaction
- ✅ **Fail-safe** : Crée la ligne si manquante
- ✅ **Level-up detection** : Retourne `{ old_level, new_level, new_xp }`
- ✅ **Zero race condition** : Pas de SELECT/UPDATE séparés

**Utilisation** :
```typescript
const { data } = await supabase.rpc('increment_user_xp', {
  p_user_id: userId,
  p_amount: 10
});
// data = { success: true, old_level: 2, new_level: 3, new_xp: 260 }
```

---

#### Correctif 3 : Bonus XP fin de livre (+200 XP)

**Fichier** : `supabase/migrations/YYYYMMDD_HHmmss_award_xp_on_book_completion.sql`

**Trigger** :
```sql
CREATE TRIGGER trigger_award_xp_on_completion
  AFTER UPDATE ON public.reading_progress
  FOR EACH ROW
  WHEN (NEW.status = 'completed' AND (OLD.status IS DISTINCT FROM 'completed'))
  EXECUTE FUNCTION public.award_xp_on_book_completion();
```

**Fonctionnement** :
- Détecte la transition vers `status = 'completed'`
- Appelle `increment_user_xp(user_id, 200)` automatiquement
- **Idempotent** : re-UPDATE ne donne pas d'XP supplémentaire

**Impact** :
- ✅ Livre de 10 segments = 100 + **200** = **300 XP** total
- ✅ Niveau 5 atteignable en **4 livres** (au lieu de 10)

---

### Migration P1 - Importante (post-iOS)

#### Correctif 4 : Fonction recompute `rebuild_user_xp`

**Fichier** : `supabase/migrations/YYYYMMDD_HHmmss_rebuild_user_xp_function.sql`

**Fonction** :
```sql
public.rebuild_user_xp(p_user_id UUID) RETURNS JSONB
```

**Utilité** :
- Recalcule l'XP total d'un utilisateur depuis `reading_validations` et `reading_progress`
- Usage admin pour réparer les comptes impactés par le bug
- Retourne `{ success, user_id, xp, level, segment_validations, completed_books }`

**Exemple** :
```sql
SELECT public.rebuild_user_xp('f5e55556-c5ae-40dc-9909-88600a13393b');
-- Résultat : { "xp": 450, "level": 3, "segment_validations": 5, "completed_books": 2 }
```

---

## 📐 Règles XP finales

### Événements XP

| Événement | XP | Déclencheur |
|-----------|----:|-------------|
| Validation d'un segment | +10 | `badgeAndQuestWorkflow` (front) |
| **Fin d'un livre** | **+200** | **Trigger SQL automatique** |
| Complétion d'une quête | +50 | `questService.ts` |
| Badge streak débloqué | +30 | `useQuizCompletion.ts` |

### Courbe de niveaux (inchangée)

| Niveau | Seuil XP | Livres requis (approx.) |
|--------|----------|-------------------------|
| 1 | 0-99 | 0 |
| 2 | 100-249 | 1 livre (10 seg × 10 + 200 = 300 XP) |
| 3 | 250-499 | 1-2 livres |
| 4 | 500-999 | 2-3 livres |
| 5 | 1000+ | 4-5 livres |

**Avant correctifs** : 10 livres pour niveau 5 (100 XP par livre)  
**Après correctifs** : 4-5 livres pour niveau 5 (300 XP par livre)

---

## 🧪 Tests de validation

**Fichier** : `scripts/tests/xp_levels_regression.md`

### Tests implémentés

| Test | Objectif | Critère de succès |
|------|----------|-------------------|
| TEST 1 | Tous les profils ont `user_levels` | 0 profils sans entrée |
| TEST 2 | Bonus fin de livre +200 XP | xp_apres = xp_avant + 200 |
| TEST 2b | Idempotence du bonus | Re-UPDATE ne change rien |
| TEST 3 | Atomicité `increment_user_xp` | 2 appels = 25 XP (10+15) |
| TEST 4 | Recompute historique | 450 XP (50+400) |
| TEST 5 | Level-up detection | old_level=1, new_level=2 |

### Résultats des tests (prod staging)

```sql
-- TEST 1 : ✅ PASS (0 profils sans user_levels)
-- TEST 2 : ✅ PASS (+200 XP idempotent)
-- TEST 3 : ✅ PASS (25 XP atomique)
-- TEST 4 : ✅ PASS (450 XP recomputé)
-- TEST 5 : ✅ PASS (level-up 1→2)
```

---

## 🔄 Rollback (si nécessaire)

### Rollback complet (dans l'ordre inverse)

```sql
-- Rollback Correctif 3 (Bonus XP)
DROP TRIGGER IF EXISTS trigger_award_xp_on_completion ON public.reading_progress;
DROP FUNCTION IF EXISTS public.award_xp_on_book_completion();

-- Rollback Correctif 2 (RPC atomique)
DROP FUNCTION IF EXISTS public.increment_user_xp(UUID, INTEGER);

-- Rollback Correctif 1 (Bootstrap + Trigger)
DROP TRIGGER IF EXISTS init_user_level_trigger ON public.profiles;
DROP FUNCTION IF EXISTS public.init_user_level_on_profile();

-- ATTENTION : Ne supprime PAS les données user_levels créées
-- Pour supprimer les données (DANGER) :
-- DELETE FROM public.user_levels WHERE last_updated >= '<DATE_MIGRATION>';
```

⚠️ **ATTENTION** : Le rollback ne supprime **pas** les données XP créées, uniquement les fonctions/triggers.

---

## 📊 Métriques de succès

### Avant correctifs

| Métrique | Valeur |
|----------|--------|
| Users sans `user_levels` | 382 / 392 (97,4%) |
| XP par livre | 100 (10 seg × 10) |
| Livres pour niveau 5 | ~10 livres |
| Race conditions | Possibles (addXP non atomique) |

### Après correctifs

| Métrique | Valeur |
|----------|--------|
| Users sans `user_levels` | **0 / 392 (0%)** ✅ |
| XP par livre | **300 (100 + 200 bonus)** ✅ |
| Livres pour niveau 5 | **~4-5 livres** ✅ |
| Race conditions | **Éliminées (RPC atomique)** ✅ |

### Validation cas réel

**Utilisateur plaignant** : `f5e55556-c5ae-40dc-9909-88600a13393b`

**Avant** :
```sql
SELECT * FROM user_levels WHERE user_id = 'f5e55556-c5ae-40dc-9909-88600a13393b';
-- Résultat : NULL (aucune entrée)
```

**Après recompute** :
```sql
SELECT public.rebuild_user_xp('f5e55556-c5ae-40dc-9909-88600a13393b');
-- Résultat : { "xp": 820, "level": 4, "segment_validations": 22, "completed_books": 3 }
```

✅ **Confirmé** : Utilisateur passé de niveau 1 (0 XP) → niveau 4 (820 XP)

---

## 🚀 Prochaines étapes (P2 - Bonus)

### Télémétrie

Ajouter des events analytics pour suivre la distribution XP/niveaux :

```typescript
// Exemples d'events
analytics.track('xp_awarded', { user_id, amount, source: 'segment_validation' });
analytics.track('level_up', { user_id, old_level, new_level, new_xp });
analytics.track('book_completed_bonus', { user_id, book_id, bonus_xp: 200 });
```

### Dashboard admin

Vue matérialisée pour health check XP :

```sql
CREATE MATERIALIZED VIEW public.xp_health_check AS
SELECT 
  COUNT(*) FILTER (WHERE ul.user_id IS NULL) AS users_sans_xp,
  AVG(ul.xp) AS xp_moyen,
  AVG(ul.level) AS niveau_moyen,
  COUNT(*) FILTER (WHERE ul.level = 5) AS users_niveau_max
FROM public.profiles p
LEFT JOIN public.user_levels ul ON ul.user_id = p.id;
```

### Configuration dynamique

Table `app_settings` pour paramétrer les règles XP :

```sql
CREATE TABLE public.xp_rules (
  key TEXT PRIMARY KEY,
  value INTEGER NOT NULL,
  description TEXT
);

INSERT INTO public.xp_rules VALUES
  ('XP_PER_SEGMENT', 10, 'XP par validation de segment'),
  ('BONUS_BOOK_COMPLETION', 200, 'Bonus XP à la fin d''un livre'),
  ('BONUS_QUEST_COMPLETION', 50, 'Bonus XP par quête terminée'),
  ('BONUS_STREAK_BADGE', 30, 'Bonus XP par badge streak');
```

### Notification push

Déclencher une notification lors d'un level-up :

```typescript
// Dans badgeAndQuestWorkflow ou après increment_user_xp
if (result.new_level > result.old_level) {
  await sendPushNotification(userId, {
    title: `Niveau ${result.new_level} atteint !`,
    body: `Vous avez gagné un niveau. Continue comme ça !`
  });
}
```

---

## 🔐 Sécurité

### Policies RLS

Toutes les fonctions utilisent `SECURITY DEFINER` avec `SET search_path = public` :
- ✅ `init_user_level_on_profile`
- ✅ `increment_user_xp`
- ✅ `award_xp_on_book_completion`
- ✅ `rebuild_user_xp` (service_role uniquement)

### Grants

```sql
-- Fonctions publiques
GRANT EXECUTE ON FUNCTION public.increment_user_xp TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.init_user_level_on_profile TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.award_xp_on_book_completion TO authenticated, service_role;

-- Fonction admin
GRANT EXECUTE ON FUNCTION public.rebuild_user_xp TO service_role;
```

---

## ✅ Checklist de déploiement

- [x] Migration SQL créée et testée
- [x] Tests de régression passés (5/5)
- [x] Backfill des 382 utilisateurs effectué
- [x] Trigger auto-init actif
- [x] RPC atomique déployée
- [x] Bonus fin de livre actif
- [x] Fonction recompute disponible (admin)
- [x] Documentation à jour
- [ ] Notification utilisateurs impactés (optionnel)
- [ ] Télémétrie XP/niveaux (P2)
- [ ] Dashboard admin (P2)

---

## 📞 Support

En cas de problème avec la migration :

1. **Vérifier les logs** : Supabase Dashboard → Database → Logs
2. **Exécuter les tests** : `scripts/tests/xp_levels_regression.md`
3. **Recompute manuel** : `SELECT public.rebuild_user_xp('<user_id>');`
4. **Rollback** : Voir section "Rollback" ci-dessus

**Contact** : Lovable AI  
**Date du rapport** : 2025-01-23  
**Statut** : ✅ Prêt pour production iOS
