-- Script SQL pour valider tous les segments jusqu'à la page 900
-- User: 6d0037db-bcb5-41bf-9c1b-67f6f7d2ae57
-- Book: 42828542-4265-4055-8beb-2780a0ca4656
-- Target: Page 900

-- ÉTAPE 1: Vérifier le livre et calculer le nombre de segments
DO $$
DECLARE
  v_user_id UUID := '6d0037db-bcb5-41bf-9c1b-67f6f7d2ae57';
  v_book_id TEXT := '42828542-4265-4055-8beb-2780a0ca4656';
  v_target_page INT := 900;
  v_total_pages INT;
  v_pages_per_segment INT := 50; -- Ajuster selon votre configuration
  v_segments_to_validate INT;
  v_book_title TEXT;
  v_segment INT;
  v_question_id UUID;
  v_xp_per_validation INT := 10;
  v_total_xp INT;
BEGIN
  -- Récupérer les infos du livre
  SELECT total_pages, title
  INTO v_total_pages, v_book_title
  FROM books_public
  WHERE id = v_book_id;

  IF v_total_pages IS NULL THEN
    RAISE EXCEPTION 'Livre non trouvé: %', v_book_id;
  END IF;

  RAISE NOTICE '📖 Livre: %', v_book_title;
  RAISE NOTICE '   Total pages: %', v_total_pages;
  RAISE NOTICE '   Page cible: %', v_target_page;

  -- Calculer le nombre de segments à valider
  v_segments_to_validate := CEIL(v_target_page::NUMERIC / v_pages_per_segment);

  IF v_segments_to_validate > CEIL(v_total_pages::NUMERIC / v_pages_per_segment) THEN
    v_segments_to_validate := CEIL(v_total_pages::NUMERIC / v_pages_per_segment);
  END IF;

  RAISE NOTICE '   Segments à valider: %', v_segments_to_validate;

  -- ÉTAPE 2: Insérer toutes les validations manquantes
  FOR v_segment IN 1..v_segments_to_validate LOOP
    -- Vérifier si ce segment a déjà été validé
    IF NOT EXISTS (
      SELECT 1 FROM reading_validations
      WHERE user_id = v_user_id
        AND book_id = v_book_id
        AND segment = v_segment
    ) THEN
      -- Récupérer une question pour ce segment
      SELECT id INTO v_question_id
      FROM reading_questions
      WHERE book_id = v_book_id
        AND segment = v_segment
      LIMIT 1;

      IF v_question_id IS NULL THEN
        -- Si pas de question trouvée, créer une validation sans question
        RAISE NOTICE '⚠️  Pas de question pour segment %, création validation générique', v_segment;

        INSERT INTO reading_validations (
          user_id,
          book_id,
          segment,
          validated_at,
          correct,
          used_joker
        ) VALUES (
          v_user_id,
          v_book_id,
          v_segment,
          NOW() - (v_segments_to_validate - v_segment) * INTERVAL '1 hour', -- Échelonner dans le temps
          true,
          false
        );
      ELSE
        -- Insérer la validation avec la question
        INSERT INTO reading_validations (
          user_id,
          book_id,
          question_id,
          segment,
          validated_at,
          correct,
          used_joker
        ) VALUES (
          v_user_id,
          v_book_id,
          v_question_id,
          v_segment,
          NOW() - (v_segments_to_validate - v_segment) * INTERVAL '1 hour', -- Échelonner dans le temps
          true,
          false
        );
      END IF;

      RAISE NOTICE '✓ Segment % validé', v_segment;
    ELSE
      RAISE NOTICE '○ Segment % déjà validé', v_segment;
    END IF;
  END LOOP;

  -- ÉTAPE 3: Mettre à jour reading_progress
  INSERT INTO reading_progress (
    user_id,
    book_id,
    current_page,
    status,
    started_at,
    updated_at
  ) VALUES (
    v_user_id,
    v_book_id,
    v_target_page,
    CASE
      WHEN v_target_page >= v_total_pages THEN 'completed'::reading_status
      ELSE 'reading'::reading_status
    END,
    NOW() - v_segments_to_validate * INTERVAL '1 hour',
    NOW()
  )
  ON CONFLICT (user_id, book_id)
  DO UPDATE SET
    current_page = v_target_page,
    status = CASE
      WHEN v_target_page >= v_total_pages THEN 'completed'::reading_status
      ELSE 'reading'::reading_status
    END,
    updated_at = NOW();

  RAISE NOTICE '';
  RAISE NOTICE '✅ reading_progress mis à jour: page %', v_target_page;

  -- ÉTAPE 4: Attribuer l'XP
  v_total_xp := v_segments_to_validate * v_xp_per_validation;

  INSERT INTO user_levels (user_id, xp)
  VALUES (v_user_id, v_total_xp)
  ON CONFLICT (user_id)
  DO UPDATE SET
    xp = user_levels.xp + v_total_xp,
    updated_at = NOW();

  RAISE NOTICE '✅ XP attribué: % (% segments × % XP)', v_total_xp, v_segments_to_validate, v_xp_per_validation;

  RAISE NOTICE '';
  RAISE NOTICE '🎉 TERMINÉ! Utilisateur avancé à la page %', v_target_page;
END $$;

-- VÉRIFICATION FINALE
SELECT
  'Validations' as type,
  COUNT(*) as count,
  MAX(segment) as dernier_segment
FROM reading_validations
WHERE user_id = '6d0037db-bcb5-41bf-9c1b-67f6f7d2ae57'
  AND book_id = '42828542-4265-4055-8beb-2780a0ca4656'

UNION ALL

SELECT
  'Progression' as type,
  current_page as count,
  NULL as dernier_segment
FROM reading_progress
WHERE user_id = '6d0037db-bcb5-41bf-9c1b-67f6f7d2ae57'
  AND book_id = '42828542-4265-4055-8beb-2780a0ca4656'

UNION ALL

SELECT
  'XP Total' as type,
  xp as count,
  NULL as dernier_segment
FROM user_levels
WHERE user_id = '6d0037db-bcb5-41bf-9c1b-67f6f7d2ae57';
