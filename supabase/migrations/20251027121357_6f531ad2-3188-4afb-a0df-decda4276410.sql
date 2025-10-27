-- Script SQL corrigé pour valider tous les segments jusqu'à la page 900
DO $$
DECLARE
  v_user_id UUID := '6d0037db-bcb5-41bf-9c1b-67f6f7d2ae57'::UUID;
  v_book_id TEXT := '42828542-4265-4055-8beb-2780a0ca4656';
  v_target_page INT := 900;
  v_segments_to_validate INT := 18;
  v_segment INT;
  v_question_id UUID;
  v_progress_id UUID;
  v_new_validations INT := 0;
  v_existing_validations INT := 0;
BEGIN
  RAISE NOTICE '🚀 Début de la validation...';
  RAISE NOTICE '   Segments à valider: 1 à %', v_segments_to_validate;
  RAISE NOTICE '';

  -- Créer ou récupérer reading_progress AVANT de faire les validations
  INSERT INTO reading_progress (
    user_id, book_id, current_page, total_pages, status, started_at, updated_at
  ) VALUES (
    v_user_id, v_book_id, 1, 1000, 'in_progress',
    NOW() - (v_segments_to_validate || ' hours')::INTERVAL, NOW()
  )
  ON CONFLICT (user_id, book_id)
  DO UPDATE SET updated_at = NOW()
  RETURNING id INTO v_progress_id;

  RAISE NOTICE '📊 reading_progress id: %', v_progress_id;
  RAISE NOTICE '';

  -- Valider les segments
  FOR v_segment IN 1..v_segments_to_validate LOOP
    IF EXISTS (
      SELECT 1 FROM reading_validations
      WHERE user_id = v_user_id AND book_id = v_book_id AND segment = v_segment
    ) THEN
      RAISE NOTICE '   ○ Segment % déjà validé', v_segment;
      v_existing_validations := v_existing_validations + 1;
      CONTINUE;
    END IF;

    -- Récupérer question_id avec conversion UUID
    SELECT id INTO v_question_id
    FROM reading_questions
    WHERE book_id::TEXT = v_book_id AND segment = v_segment
    LIMIT 1;

    IF v_question_id IS NOT NULL THEN
      INSERT INTO reading_validations (
        user_id, book_id, question_id, segment, progress_id, validated_at, correct, used_joker
      ) VALUES (
        v_user_id, v_book_id, v_question_id, v_segment, v_progress_id,
        NOW() - ((v_segments_to_validate - v_segment) || ' hours')::INTERVAL,
        true, false
      );
    ELSE
      INSERT INTO reading_validations (
        user_id, book_id, segment, progress_id, validated_at, correct, used_joker
      ) VALUES (
        v_user_id, v_book_id, v_segment, v_progress_id,
        NOW() - ((v_segments_to_validate - v_segment) || ' hours')::INTERVAL,
        true, false
      );
    END IF;

    RAISE NOTICE '   ✓ Segment % validé', v_segment;
    v_new_validations := v_new_validations + 1;
  END LOOP;

  RAISE NOTICE '';
  RAISE NOTICE '✅ % nouvelles validations créées', v_new_validations;
  RAISE NOTICE '   % validations existantes', v_existing_validations;

  -- Mettre à jour la progression à la page cible
  UPDATE reading_progress 
  SET current_page = v_target_page, updated_at = NOW()
  WHERE user_id = v_user_id AND book_id = v_book_id;

  RAISE NOTICE '📊 reading_progress mis à jour: page %', v_target_page;

  -- Attribuer XP si nouvelles validations
  IF v_new_validations > 0 THEN
    DECLARE
      v_total_xp INT := v_new_validations * 10;
      v_current_xp INT;
    BEGIN
      SELECT COALESCE(xp, 0) INTO v_current_xp 
      FROM user_levels 
      WHERE user_id = v_user_id;

      INSERT INTO user_levels (user_id, xp, last_updated)
      VALUES (v_user_id, v_total_xp, NOW())
      ON CONFLICT (user_id)
      DO UPDATE SET xp = user_levels.xp + v_total_xp, last_updated = NOW();

      RAISE NOTICE '⭐ % XP attribué (% segments × 10 XP)', v_total_xp, v_new_validations;
      RAISE NOTICE '   Total XP: % → %', COALESCE(v_current_xp, 0), COALESCE(v_current_xp, 0) + v_total_xp;
    END;
  END IF;

  RAISE NOTICE '';
  RAISE NOTICE '🎉 TERMINÉ! Utilisateur avancé à la page 900';
END $$;

-- VÉRIFICATION
SELECT 'Validations totales' as metric, COUNT(*)::TEXT as value
FROM reading_validations
WHERE user_id = '6d0037db-bcb5-41bf-9c1b-67f6f7d2ae57'::UUID
  AND book_id = '42828542-4265-4055-8beb-2780a0ca4656'
UNION ALL
SELECT 'Dernier segment', MAX(segment)::TEXT
FROM reading_validations
WHERE user_id = '6d0037db-bcb5-41bf-9c1b-67f6f7d2ae57'::UUID
  AND book_id = '42828542-4265-4055-8beb-2780a0ca4656'
UNION ALL
SELECT 'Page actuelle', current_page::TEXT
FROM reading_progress
WHERE user_id = '6d0037db-bcb5-41bf-9c1b-67f6f7d2ae57'::UUID
  AND book_id = '42828542-4265-4055-8beb-2780a0ca4656'
UNION ALL
SELECT 'XP total', xp::TEXT
FROM user_levels
WHERE user_id = '6d0037db-bcb5-41bf-9c1b-67f6f7d2ae57'::UUID;