BEGIN;

DO $$
DECLARE
  v_uid uuid;
  v_bid text;
  v_xp_before int;
  v_xp_after1 int;
  v_xp_after2 int;
  v_awards_before int;
  v_awards_after1 int;
  v_awards_after2 int;
BEGIN
  -- 1) Sélectionner un utilisateur existant
  SELECT id INTO v_uid
  FROM auth.users
  ORDER BY created_at DESC
  LIMIT 1;

  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'Aucun utilisateur dans auth.users. Créez-en un puis relancez.';
  END IF;

  -- 2) Choisir un livre existant QUE ce user n'a pas encore dans reading_progress
  SELECT b.id INTO v_bid
  FROM public.books b
  WHERE NOT EXISTS (
    SELECT 1
    FROM public.reading_progress rp
    WHERE rp.user_id = v_uid
      AND rp.book_id = b.id
  )
  ORDER BY b.created_at DESC NULLS LAST
  LIMIT 1;

  IF v_bid IS NULL THEN
    RAISE EXCEPTION 'Aucun livre disponible non lu pour ce user. Créez un livre ou choisissez un autre user.';
  END IF;

  -- 3) S'assurer que profile + user_levels existent (idempotent)
  INSERT INTO public.profiles (id, email) VALUES (v_uid, 'xp-smoke@vread.test')
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO public.user_levels (user_id, xp, level, last_updated)
  VALUES (v_uid, 0, 1, NOW())
  ON CONFLICT (user_id) DO NOTHING;

  -- 4) Vérifier qu'aucun award n'existe déjà pour (user, book)
  SELECT COUNT(*) INTO v_awards_before
  FROM public.book_completion_awards
  WHERE user_id = v_uid AND book_id = v_bid;

  IF v_awards_before <> 0 THEN
    RAISE EXCEPTION 'Un award existe déjà pour ce couple (user, book). Choisissez un autre livre.';
  END IF;

  -- 5) Créer une progression puis la compléter
  INSERT INTO public.reading_progress (user_id, book_id, status, current_page, total_pages)
  VALUES (v_uid, v_bid, 'in_progress', 10, 100);

  SELECT COALESCE(xp,0) INTO v_xp_before
  FROM public.user_levels
  WHERE user_id = v_uid;

  UPDATE public.reading_progress
  SET status = 'completed'
  WHERE user_id = v_uid AND book_id = v_bid;

  SELECT xp INTO v_xp_after1
  FROM public.user_levels
  WHERE user_id = v_uid;

  SELECT COUNT(*) INTO v_awards_after1
  FROM public.book_completion_awards
  WHERE user_id = v_uid AND book_id = v_bid;

  -- 6) Rejouer (idempotence : ne doit rien ajouter)
  UPDATE public.reading_progress
  SET status = 'completed'
  WHERE user_id = v_uid AND book_id = v_bid;

  SELECT xp INTO v_xp_after2
  FROM public.user_levels
  WHERE user_id = v_uid;

  SELECT COUNT(*) INTO v_awards_after2
  FROM public.book_completion_awards
  WHERE user_id = v_uid AND book_id = v_bid;

  -- 7) Assertions
  IF v_xp_after1 <> v_xp_before + 200 THEN
    RAISE EXCEPTION 'ECHEC: attendu +200 XP (avant:% → après1:%)', v_xp_before, v_xp_after1;
  END IF;

  IF v_xp_after2 <> v_xp_after1 THEN
    RAISE EXCEPTION 'ECHEC: idempotence violée (après1:% ≠ après2:%)', v_xp_after1, v_xp_after2;
  END IF;

  IF v_awards_after1 <> 1 THEN
    RAISE EXCEPTION 'ECHEC: award attendu = 1 après 1ère completion, obtenu %', v_awards_after1;
  END IF;

  IF v_awards_after2 <> 1 THEN
    RAISE EXCEPTION 'ECHEC: award doit rester = 1 après 2ème update, obtenu %', v_awards_after2;
  END IF;

  RAISE NOTICE '✅ PASS: +200 XP appliqué une seule fois (awards %→%→%), XP %→%→%',
    v_awards_before, v_awards_after1, v_awards_after2,
    v_xp_before, v_xp_after1, v_xp_after2;
END $$;

ROLLBACK;
