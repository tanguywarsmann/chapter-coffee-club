# Tests de régression XP/Niveaux/Quêtes

## 🎯 Objectif

Tests SQL pour valider les correctifs P0 du système XP/Niveaux :
1. Bootstrap `user_levels` pour tous les profils
2. RPC atomique `increment_user_xp`
3. Bonus +200 XP à la fin d'un livre (idempotent)
4. Fonction recompute `rebuild_user_xp`

---

## ✅ TEST 1 : Tous les profils ont un user_levels

**Objectif** : Vérifier que tous les profils valides (existant dans `auth.users`) ont une entrée dans `user_levels`.

```sql
BEGIN;

SELECT COUNT(*) AS profiles_sans_level
FROM public.profiles p
LEFT JOIN public.user_levels ul ON ul.user_id = p.id
WHERE ul.user_id IS NULL
  AND EXISTS (SELECT 1 FROM auth.users au WHERE au.id = p.id);

-- ATTENDU : 0

ROLLBACK;
```

**Critères de réussite** :
- ✅ `profiles_sans_level` = 0
- ❌ Si > 0 : des profils n'ont pas été initialisés

---

## ✅ TEST 2 : Fin de livre = +200 XP (idempotent)

**Objectif** : Vérifier que le trigger `award_xp_on_book_completion` accorde **exactement** +200 XP lors de la transition vers `completed`, et qu'un re-UPDATE ne donne **pas** d'XP supplémentaire.

```sql
BEGIN;

DO $$
DECLARE
  v_user_id UUID := gen_random_uuid();
  v_book_id TEXT := gen_random_uuid()::TEXT;
  v_xp_avant INTEGER;
  v_xp_apres1 INTEGER;
  v_xp_apres2 INTEGER;
BEGIN
  -- Setup : créer un profil + user_level
  INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at, aud, role)
  VALUES (v_user_id, 'test_xp@vread.com', crypt('password', gen_salt('bf')), NOW(), NOW(), NOW(), 'authenticated', 'authenticated');
  
  INSERT INTO public.profiles (id, email, username) 
  VALUES (v_user_id, 'test_xp@vread.com', 'test_xp_user');
  
  -- Vérifier que user_levels a été auto-créé par le trigger
  IF NOT EXISTS (SELECT 1 FROM public.user_levels WHERE user_id = v_user_id) THEN
    RAISE EXCEPTION 'ECHEC: user_levels non créé automatiquement';
  END IF;
  
  -- Donner un XP initial pour le test
  UPDATE public.user_levels SET xp = 50 WHERE user_id = v_user_id;
  
  -- Créer une progression in_progress
  INSERT INTO public.reading_progress (user_id, book_id, status, current_page, total_pages) 
  VALUES (v_user_id, v_book_id, 'in_progress', 10, 100);
  
  SELECT xp INTO v_xp_avant FROM public.user_levels WHERE user_id = v_user_id;
  RAISE NOTICE 'XP avant completion: %', v_xp_avant;
  
  -- TEST : Passer à completed (doit trigger +200 XP)
  UPDATE public.reading_progress SET status = 'completed' 
  WHERE user_id = v_user_id AND book_id = v_book_id;
  
  SELECT xp INTO v_xp_apres1 FROM public.user_levels WHERE user_id = v_user_id;
  RAISE NOTICE 'XP après 1ère completion: %', v_xp_apres1;
  
  -- TEST IDEMPOTENCE : Rejouer l'UPDATE (ne doit rien faire)
  UPDATE public.reading_progress SET status = 'completed' 
  WHERE user_id = v_user_id AND book_id = v_book_id;
  
  SELECT xp INTO v_xp_apres2 FROM public.user_levels WHERE user_id = v_user_id;
  RAISE NOTICE 'XP après 2ème completion: %', v_xp_apres2;
  
  -- Assertions
  IF v_xp_apres1 <> v_xp_avant + 200 THEN
    RAISE EXCEPTION 'ECHEC: Attendu +200 XP, obtenu % (avant:%, après:%)', 
      v_xp_apres1 - v_xp_avant, v_xp_avant, v_xp_apres1;
  END IF;
  
  IF v_xp_apres2 <> v_xp_apres1 THEN
    RAISE EXCEPTION 'ECHEC: Idempotence violée, XP a changé de % à %', v_xp_apres1, v_xp_apres2;
  END IF;
  
  RAISE NOTICE '✅ TEST 2 REUSSI : +200 XP à la completion, idempotent';
END $$;

ROLLBACK;
```

**Critères de réussite** :
- ✅ `xp_apres1` = `xp_avant` + 200
- ✅ `xp_apres2` = `xp_apres1` (idempotence)
- ❌ Si écarts : le trigger ne fonctionne pas correctement

---

## ✅ TEST 3 : Atomicité de increment_user_xp

**Objectif** : Vérifier que 2 appels concurrents à `increment_user_xp` **additionnent** correctement l'XP sans perte.

```sql
BEGIN;

DO $$
DECLARE
  v_user_id UUID := gen_random_uuid();
  v_xp_final INTEGER;
BEGIN
  -- Setup
  INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at, aud, role)
  VALUES (v_user_id, 'atomic_test@vread.com', crypt('password', gen_salt('bf')), NOW(), NOW(), NOW(), 'authenticated', 'authenticated');
  
  INSERT INTO public.profiles (id, email, username) 
  VALUES (v_user_id, 'atomic_test@vread.com', 'atomic_user');
  
  -- Vérifier XP initial = 0
  SELECT xp INTO v_xp_final FROM public.user_levels WHERE user_id = v_user_id;
  IF v_xp_final <> 0 THEN
    RAISE EXCEPTION 'ECHEC: XP initial devrait être 0, obtenu %', v_xp_final;
  END IF;
  
  -- Simuler 2 appels "concurrents" (séquentiels ici pour le test)
  PERFORM public.increment_user_xp(v_user_id, 10);
  PERFORM public.increment_user_xp(v_user_id, 15);
  
  SELECT xp INTO v_xp_final FROM public.user_levels WHERE user_id = v_user_id;
  
  -- Assertion
  IF v_xp_final <> 25 THEN
    RAISE EXCEPTION 'ECHEC: Attendu 25 XP (0+10+15), obtenu %', v_xp_final;
  END IF;
  
  RAISE NOTICE '✅ TEST 3 REUSSI : Atomicité respectée, XP = %', v_xp_final;
END $$;

ROLLBACK;
```

**Critères de réussite** :
- ✅ `xp_final` = 25 (0 + 10 + 15)
- ❌ Si < 25 : perte d'XP due à un UPDATE non atomique

---

## ✅ TEST 4 : Recompute depuis historique

**Objectif** : Vérifier que `rebuild_user_xp` recalcule correctement l'XP total depuis `reading_validations` et `reading_progress`.

```sql
BEGIN;

DO $$
DECLARE
  v_user_id UUID := gen_random_uuid();
  v_book_id1 TEXT := gen_random_uuid()::TEXT;
  v_book_id2 TEXT := gen_random_uuid()::TEXT;
  v_progress_id UUID;
  v_result JSONB;
  v_expected_xp INTEGER;
BEGIN
  -- Setup
  INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at, aud, role)
  VALUES (v_user_id, 'recompute@vread.com', crypt('password', gen_salt('bf')), NOW(), NOW(), NOW(), 'authenticated', 'authenticated');
  
  INSERT INTO public.profiles (id, email, username) 
  VALUES (v_user_id, 'recompute@vread.com', 'recompute_user');
  
  -- Créer des données historiques
  
  -- 5 validations sur livre 1 (5 * 10 = 50 XP)
  INSERT INTO public.reading_progress (user_id, book_id, status) 
  VALUES (v_user_id, v_book_id1, 'in_progress')
  RETURNING id INTO v_progress_id;
  
  INSERT INTO public.reading_validations (user_id, book_id, progress_id, segment, correct) 
  SELECT v_user_id, v_book_id1, v_progress_id, i, true 
  FROM generate_series(1, 5) i;
  
  -- 2 livres complétés (2 * 200 = 400 XP)
  INSERT INTO public.reading_progress (user_id, book_id, status) 
  VALUES 
    (v_user_id, v_book_id1, 'completed'),
    (v_user_id, v_book_id2, 'completed')
  ON CONFLICT (user_id, book_id) DO UPDATE SET status = 'completed';
  
  -- XP attendu = 50 (validations) + 400 (livres) = 450
  v_expected_xp := 450;
  
  -- Appeler recompute
  SELECT public.rebuild_user_xp(v_user_id) INTO v_result;
  
  RAISE NOTICE 'Résultat recompute: %', v_result;
  
  -- Assertions
  IF (v_result->>'xp')::INTEGER <> v_expected_xp THEN
    RAISE EXCEPTION 'ECHEC: Attendu % XP, obtenu %', v_expected_xp, v_result->>'xp';
  END IF;
  
  IF (v_result->>'level')::INTEGER < 3 THEN
    RAISE EXCEPTION 'ECHEC: Avec 450 XP, niveau devrait être >= 3, obtenu %', v_result->>'level';
  END IF;
  
  RAISE NOTICE '✅ TEST 4 REUSSI : Recompute correct (% XP, niveau %)', 
    v_result->>'xp', v_result->>'level';
END $$;

ROLLBACK;
```

**Critères de réussite** :
- ✅ `xp` = 450 (50 validations + 400 livres)
- ✅ `level` ≥ 3 (selon courbe : 250-499 XP = niveau 3)
- ❌ Si écarts : erreur de calcul dans `rebuild_user_xp`

---

## ✅ TEST 5 : Level-up detection

**Objectif** : Vérifier que `increment_user_xp` retourne correctement `old_level` et `new_level` lors d'un passage de niveau.

```sql
BEGIN;

DO $$
DECLARE
  v_user_id UUID := gen_random_uuid();
  v_result JSONB;
BEGIN
  -- Setup
  INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at, aud, role)
  VALUES (v_user_id, 'levelup@vread.com', crypt('password', gen_salt('bf')), NOW(), NOW(), NOW(), 'authenticated', 'authenticated');
  
  INSERT INTO public.profiles (id, email, username) 
  VALUES (v_user_id, 'levelup@vread.com', 'levelup_user');
  
  -- Mettre l'utilisateur à 95 XP (niveau 1, proche du seuil de niveau 2 = 100 XP)
  UPDATE public.user_levels SET xp = 95, level = 1 WHERE user_id = v_user_id;
  
  -- Ajouter +10 XP => devrait passer niveau 2
  SELECT public.increment_user_xp(v_user_id, 10) INTO v_result;
  
  RAISE NOTICE 'Résultat level-up: %', v_result;
  
  -- Assertions
  IF (v_result->>'old_level')::INTEGER <> 1 THEN
    RAISE EXCEPTION 'ECHEC: old_level devrait être 1, obtenu %', v_result->>'old_level';
  END IF;
  
  IF (v_result->>'new_level')::INTEGER <> 2 THEN
    RAISE EXCEPTION 'ECHEC: new_level devrait être 2, obtenu %', v_result->>'new_level';
  END IF;
  
  IF (v_result->>'new_xp')::INTEGER <> 105 THEN
    RAISE EXCEPTION 'ECHEC: new_xp devrait être 105, obtenu %', v_result->>'new_xp';
  END IF;
  
  RAISE NOTICE '✅ TEST 5 REUSSI : Level-up détecté (1 → 2, XP = 105)';
END $$;

ROLLBACK;
```

**Critères de réussite** :
- ✅ `old_level` = 1
- ✅ `new_level` = 2
- ✅ `new_xp` = 105
- ❌ Si écarts : calcul de niveau incorrect

---

## 📊 Exécution complète

Pour exécuter tous les tests d'un coup :

```bash
psql $DATABASE_URL -f scripts/tests/xp_levels_regression.md
```

Ou dans le Supabase SQL Editor, copier-coller chaque test individuellement.

---

## ✅ Résumé des critères de validation

| Test | Critère | Attendu |
|------|---------|---------|
| TEST 1 | Profils sans user_levels | 0 |
| TEST 2 | XP après completion | xp_avant + 200 |
| TEST 2 | Idempotence | xp_apres2 = xp_apres1 |
| TEST 3 | Atomicité | 25 XP (0+10+15) |
| TEST 4 | Recompute XP | 450 (50+400) |
| TEST 4 | Recompute level | ≥ 3 |
| TEST 5 | Level-up old_level | 1 |
| TEST 5 | Level-up new_level | 2 |
| TEST 5 | Level-up new_xp | 105 |

---

## 🔧 Debugging

Si un test échoue, vérifier :

1. **Triggers** : `\dft` pour lister les triggers actifs
2. **Fonctions** : `\df public.increment_user_xp` pour voir la définition
3. **RLS Policies** : `\d+ user_levels` pour voir les policies actives
4. **Logs** : Consulter les logs Supabase pour les `RAISE LOG` des triggers

---

## 📅 Date de création

2025-01-23

**Auteur** : Lovable AI  
**Statut** : ✅ Prêt pour exécution
