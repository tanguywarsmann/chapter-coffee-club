-- Script SQL SIMPLIFIÉ pour valider tous les segments jusqu'à la page 900
-- User: 6d0037db-bcb5-41bf-9c1b-67f6f7d2ae57
-- Book: 42828542-4265-4055-8beb-2780a0ca4656

-- Ce script crée directement toutes les validations nécessaires

DO $$
DECLARE
  v_user_id UUID := '6d0037db-bcb5-41bf-9c1b-67f6f7d2ae57';
  v_book_id UUID := '42828542-4265-4055-8beb-2780a0ca4656';
  v_target_page INT := 900;
  v_segments_to_validate INT := 18; -- 900 / 50 = 18 segments
  v_segment INT;
  v_question_id UUID;
  v_new_validations INT := 0;
  v_existing_validations INT := 0;
BEGIN
  RAISE NOTICE '🚀 Début de la validation...';
  RAISE NOTICE '   Segments à valider: 1 à %', v_segments_to_validate;
  RAISE NOTICE '';

  -- Créer toutes les validations
  FOR v_segment IN 1..v_segments_to_validate LOOP
    -- Vérifier si existe déjà
    IF EXISTS (
      SELECT 1 FROM reading_validations
      WHERE user_id = v_user_id
        AND book_id = v_book_id
        AND segment = v_segment
    ) THEN
      RAISE NOTICE '   ○ Segment % déjà validé', v_segment;
      v_existing_validations := v_existing_validations + 1;
      CONTINUE;
    END IF;

    -- Trouver une question pour ce segment
    SELECT id INTO v_question_id
    FROM reading_questions
    WHERE book_id = v_book_id
      AND segment = v_segment
    LIMIT 1;

    -- Insérer la validation
    IF v_question_id IS NOT NULL THEN
      INSERT INTO reading_validations (
        user_id, book_id, question_id, segment, validated_at, correct, used_joker
      ) VALUES (
        v_user_id,
        v_book_id,
        v_question_id,
        v_segment,
        NOW() - ((v_segments_to_validate - v_segment) || ' hours')::INTERVAL,
        true,
        false
      );
    ELSE
      -- Pas de question, validation générique
      INSERT INTO reading_validations (
        user_id, book_id, segment, validated_at, correct, used_joker
      ) VALUES (
        v_user_id,
        v_book_id,
        v_segment,
        NOW() - ((v_segments_to_validate - v_segment) || ' hours')::INTERVAL,
        true,
        false
      );
    END IF;

    RAISE NOTICE '   ✓ Segment % validé', v_segment;
    v_new_validations := v_new_validations + 1;
  END LOOP;

  RAISE NOTICE '';
  RAISE NOTICE '✅ % nouvelles validations créées', v_new_validations;
  RAISE NOTICE '   % validations existantes', v_existing_validations;
  RAISE NOTICE '';

  -- Mettre à jour reading_progress
  INSERT INTO reading_progress (
    user_id, book_id, current_page, status, started_at, updated_at
  ) VALUES (
    v_user_id, v_book_id, v_target_page, 'reading',
    NOW() - (v_segments_to_validate || ' hours')::INTERVAL, NOW()
  )
  ON CONFLICT (user_id, book_id)
  DO UPDATE SET
    current_page = v_target_page,
    updated_at = NOW();

  RAISE NOTICE '📊 reading_progress mis à jour: page %', v_target_page;
  RAISE NOTICE '';

  -- Attribuer l'XP
  IF v_new_validations > 0 THEN
    DECLARE
      v_total_xp INT := v_new_validations * 10;
      v_current_xp INT;
    BEGIN
      -- Récupérer l'XP actuel
      SELECT COALESCE(xp, 0) INTO v_current_xp
      FROM user_levels
      WHERE user_id = v_user_id;

      -- Mettre à jour ou insérer
      INSERT INTO user_levels (user_id, xp, updated_at)
      VALUES (v_user_id, v_total_xp, NOW())
      ON CONFLICT (user_id)
      DO UPDATE SET
        xp = user_levels.xp + v_total_xp,
        updated_at = NOW();

      RAISE NOTICE '⭐ % XP attribué (% segments × 10 XP)', v_total_xp, v_new_validations;
      RAISE NOTICE '   Total XP: % → %', COALESCE(v_current_xp, 0), COALESCE(v_current_xp, 0) + v_total_xp;
    END;
  END IF;

  RAISE NOTICE '';
  RAISE NOTICE '🎉 TERMINÉ! Utilisateur avancé à la page 900';
END $$;

-- VÉRIFICATION
SELECT
  '📊 VÉRIFICATION FINALE' as titre,
  '' as valeur;

SELECT
  '   Validations totales' as metric,
  COUNT(*)::TEXT as value
FROM reading_validations
WHERE user_id = '6d0037db-bcb5-41bf-9c1b-67f6f7d2ae57'
  AND book_id = '42828542-4265-4055-8beb-2780a0ca4656'

UNION ALL

SELECT
  '   Dernier segment' as metric,
  MAX(segment)::TEXT as value
FROM reading_validations
WHERE user_id = '6d0037db-bcb5-41bf-9c1b-67f6f7d2ae57'
  AND book_id = '42828542-4265-4055-8beb-2780a0ca4656'

UNION ALL

SELECT
  '   Page actuelle' as metric,
  current_page::TEXT as value
FROM reading_progress
WHERE user_id = '6d0037db-bcb5-41bf-9c1b-67f6f7d2ae57'
  AND book_id = '42828542-4265-4055-8beb-2780a0ca4656'

UNION ALL

SELECT
  '   XP total' as metric,
  xp::TEXT as value
FROM user_levels
WHERE user_id = '6d0037db-bcb5-41bf-9c1b-67f6f7d2ae57';
