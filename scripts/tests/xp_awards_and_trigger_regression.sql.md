# Tests de Régression XP : Awards & Trigger Hardening

Ce fichier contient les tests SQL pour valider le durcissement XP/Niveaux, notamment :
- ✅ Idempotence des awards de fin de livre (+200 XP une seule fois par user+book)
- ✅ Garde-fou trigger profiles → user_levels (vérification auth.users)
- ✅ Atomicité de `increment_user_xp`
- ✅ Santé/qualité des données

**⚠️ Tous les tests sont en `BEGIN...ROLLBACK` : aucune donnée réelle n'est modifiée.**

---

## TEST A — Idempotence Awards (+200 XP une seule fois)

**Objectif** : Vérifier qu'un livre complété plusieurs fois n'octroie le bonus qu'une seule fois.

```sql
BEGIN;

-- Récupérer un utilisateur existant
WITH u AS (SELECT id AS uid FROM auth.users LIMIT 1),
     b AS (SELECT gen_random_uuid()::text AS bid)

-- S'assurer que le profil existe (ne touche pas auth.users)
, ensure_profile AS (
  INSERT INTO public.profiles (id, email)
  SELECT (SELECT uid FROM u), 'test+awards@vread.com'
  ON CONFLICT (id) DO NOTHING
  RETURNING id
)

-- XP avant
SELECT 
  ul.xp AS xp_avant,
  'User: ' || (SELECT uid FROM u)::text AS context
FROM public.user_levels ul 
WHERE ul.user_id = (SELECT uid FROM u);

-- Créer une progression et passer à completed (déclenche +200 si jamais attribué)
INSERT INTO public.reading_progress (user_id, book_id, status, current_page, total_pages)
SELECT (SELECT uid FROM u), (SELECT bid FROM b), 'in_progress', 10, 100;

UPDATE public.reading_progress
SET status = 'completed'
WHERE user_id = (SELECT uid FROM u) 
  AND book_id = (SELECT bid FROM b);

-- XP après première completion
SELECT 
  ul.xp AS xp_apres_1,
  'Attendu: xp_avant + 200' AS expected
FROM public.user_levels ul 
WHERE ul.user_id = (SELECT uid FROM u);

-- Rejouer la transition completed (même livre) → pas d'XP supplémentaire
UPDATE public.reading_progress
SET status = 'in_progress', current_page = 50
WHERE user_id = (SELECT uid FROM u) 
  AND book_id = (SELECT bid FROM b);

UPDATE public.reading_progress
SET status = 'completed'
WHERE user_id = (SELECT uid FROM u) 
  AND book_id = (SELECT bid FROM b);

-- XP après deuxième completion
SELECT 
  ul.xp AS xp_apres_2,
  'Attendu: xp_apres_1 (inchangé, idempotent)' AS expected
FROM public.user_levels ul 
WHERE ul.user_id = (SELECT uid FROM u);

-- Vérifier la table awards
SELECT COUNT(*) AS awards_count, 'Attendu: 1 seul award' AS expected
FROM public.book_completion_awards
WHERE user_id = (SELECT uid FROM u) 
  AND book_id = (SELECT bid FROM b);

ROLLBACK;
```

**✅ Critère d'acceptation** : 
- `xp_apres_1 = xp_avant + 200`
- `xp_apres_2 = xp_apres_1` (inchangé)
- `awards_count = 1`

---

## TEST B — Trigger Profile : Pas d'insert si auth.users inexistant

**Objectif** : Vérifier que le trigger ne crée pas de `user_levels` pour un profil orphelin (sans entrée dans `auth.users`).

```sql
BEGIN;

-- Simuler un profil orphelin (pas dans auth.users)
WITH bogus AS (
  SELECT gen_random_uuid() AS orphan_id
)
INSERT INTO public.profiles (id, email) 
SELECT orphan_id, 'orphan@vread.com' 
FROM bogus;

-- Vérifier que user_levels n'a PAS été créé (garde-fou OK)
WITH bogus AS (
  SELECT id AS orphan_id 
  FROM public.profiles 
  WHERE email = 'orphan@vread.com'
)
SELECT 
  EXISTS (
    SELECT 1 
    FROM public.user_levels ul
    WHERE ul.user_id = (SELECT orphan_id FROM bogus)
  ) AS user_levels_created_for_orphan,
  'Attendu: false (trigger a bloqué la création)' AS expected;

ROLLBACK;
```

**✅ Critère d'acceptation** : 
- `user_levels_created_for_orphan = false`

---

## TEST C — Atomicité increment_user_xp (sanity check)

**Objectif** : Vérifier que `increment_user_xp` est bien atomique et cumule correctement les XP.

```sql
BEGIN;

WITH u AS (SELECT id AS uid FROM auth.users LIMIT 1)

-- XP avant
SELECT 
  ul.xp AS xp_avant,
  'User: ' || (SELECT uid FROM u)::text AS context
FROM public.user_levels ul 
WHERE ul.user_id = (SELECT uid FROM u);

-- Appels successifs
SELECT public.increment_user_xp((SELECT uid FROM u), 10) AS call_1;
SELECT public.increment_user_xp((SELECT uid FROM u), 15) AS call_2;

-- XP après
SELECT 
  ul.xp AS xp_final,
  'Attendu: xp_avant + 25' AS expected
FROM public.user_levels ul 
WHERE ul.user_id = (SELECT uid FROM u);

ROLLBACK;
```

**✅ Critère d'acceptation** : 
- `xp_final = xp_avant + 25`
- Les deux appels retournent `success: true`

---

## TEST D — Santé/Qualité des Données

**Objectif** : Requêtes de monitoring pour détecter les anomalies.

```sql
-- Profils orphelins (sans auth.users)
SELECT COUNT(*) AS orphan_profiles,
       'Attendu: 0 ou très peu' AS expected
FROM public.profiles p
LEFT JOIN auth.users au ON au.id = p.id
WHERE au.id IS NULL;

-- Profils valides sans user_levels
SELECT COUNT(*) AS valid_profiles_without_levels,
       'Attendu: 0' AS expected
FROM public.profiles p
JOIN auth.users au ON au.id = p.id
LEFT JOIN public.user_levels ul ON ul.user_id = p.id
WHERE ul.user_id IS NULL;

-- Awards vs completed books (cohérence)
SELECT 
  COUNT(DISTINCT rp.user_id, rp.book_id) AS completed_books,
  (SELECT COUNT(*) FROM public.book_completion_awards) AS awards_count,
  'Les deux devraient être proches' AS note
FROM public.reading_progress rp
WHERE rp.status = 'completed';

-- Vue de santé (utilise xp_health_check)
SELECT * FROM public.xp_health_check;
```

**✅ Critère d'acceptation** : 
- `orphan_profiles ≈ 0`
- `valid_profiles_without_levels = 0`
- `completed_books ≈ awards_count` (à quelques unités près)

---

## 🚀 Exécution des Tests

### Option 1 : Via SQL Editor Supabase
1. Ouvrir l'éditeur SQL : https://supabase.com/dashboard/project/{project_id}/sql/new
2. Copier-coller chaque bloc de test
3. Exécuter et vérifier les résultats

### Option 2 : Via psql
```bash
psql $DATABASE_URL -f scripts/tests/xp_awards_and_trigger_regression.sql.md
```

### Option 3 : Tests individuels
Chaque test est autonome et peut être exécuté séparément.

---

## 📊 Résultats Attendus

| Test | Métrique | Valeur Attendue |
|------|----------|-----------------|
| A | `xp_apres_1` | `xp_avant + 200` |
| A | `xp_apres_2` | `xp_apres_1` (inchangé) |
| A | `awards_count` | `1` |
| B | `user_levels_created_for_orphan` | `false` |
| C | `xp_final` | `xp_avant + 25` |
| D | `orphan_profiles` | `≈ 0` |
| D | `valid_profiles_without_levels` | `0` |

---

## 🔍 Debugging

Si un test échoue :

1. **Test A échoue** → Vérifier que `award_xp_on_book_completion` utilise bien `book_completion_awards`
2. **Test B échoue** → Vérifier le trigger `init_user_level_on_profile` avec `EXISTS (SELECT 1 FROM auth.users...)`
3. **Test C échoue** → Vérifier que `increment_user_xp` fait bien un `UPDATE` atomique avec `xp = xp + p_amount`
4. **Test D échoue** → Exécuter `REFRESH MATERIALIZED VIEW public.xp_health_check;` puis relancer

---

## ✅ Validation Finale

Une fois tous les tests passés :
```sql
-- Rafraîchir la vue de santé
REFRESH MATERIALIZED VIEW public.xp_health_check;

-- Vérifier les métriques globales
SELECT 
  profiles_orphelins,
  profils_valides_sans_level,
  xp_moyen,
  niveau_moyen,
  last_refreshed
FROM public.xp_health_check;
```

**DoD** : Tous les tests en vert + `profils_valides_sans_level = 0`.
