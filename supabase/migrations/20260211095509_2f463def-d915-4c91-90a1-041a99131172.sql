
-- ============================================================
-- PHASE 2 : Corriger le RPC force_validate_segment_beta
-- Changer ON CONFLICT DO NOTHING en DO UPDATE SET progress_id
-- ============================================================

CREATE OR REPLACE FUNCTION public.force_validate_segment_beta(
  p_book_id uuid,
  p_question_id uuid,
  p_answer text DEFAULT 'validated'::text,
  p_user_id uuid DEFAULT NULL::uuid,
  p_used_joker boolean DEFAULT false,
  p_correct boolean DEFAULT NULL::boolean
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_user_id uuid;
  v_progress_id uuid;
  v_segment integer;
  v_correct_answer text;
  v_is_correct boolean;
  v_current_status text;
BEGIN
  v_user_id := COALESCE(p_user_id, auth.uid());
  
  IF v_user_id IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'message', 'No user authenticated');
  END IF;

  SELECT COALESCE(answer, ''), COALESCE(segment, 0) 
  INTO v_correct_answer, v_segment
  FROM reading_questions
  WHERE id = p_question_id;
  
  IF v_correct_answer IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'message', 'Question not found');
  END IF;
  
  IF p_correct IS NULL THEN
    v_is_correct := is_valid_answer(p_answer, v_correct_answer);
  ELSE
    v_is_correct := p_correct;
  END IF;
  
  IF NOT v_is_correct AND NOT p_used_joker THEN
    RETURN jsonb_build_object(
      'ok', false,
      'segment', v_segment,
      'correct', false,
      'message', 'Answer is incorrect and no joker used'
    );
  END IF;
  
  SELECT id, status INTO v_progress_id, v_current_status
  FROM reading_progress 
  WHERE user_id = v_user_id AND book_id = p_book_id::text;
  
  IF v_progress_id IS NULL THEN
    INSERT INTO reading_progress (user_id, book_id, current_page, total_pages, status, started_at, updated_at)
    VALUES (v_user_id, p_book_id::text, GREATEST(v_segment, 1), 1000, 'in_progress', now(), now())
    RETURNING id INTO v_progress_id;
  ELSE
    UPDATE reading_progress 
    SET updated_at = now(), 
        current_page = GREATEST(current_page, v_segment, 1),
        status = CASE 
          WHEN status = 'to_read' THEN 'in_progress'
          ELSE status
        END
    WHERE id = v_progress_id;
  END IF;

  -- FIX: ON CONFLICT now updates progress_id when it was NULL
  INSERT INTO reading_validations (user_id, book_id, progress_id, question_id, answer, segment, used_joker, correct, validated_at)
  VALUES (v_user_id, p_book_id::text, v_progress_id, p_question_id, p_answer, v_segment, p_used_joker, v_is_correct, now())
  ON CONFLICT (user_id, book_id, segment)
  DO UPDATE SET progress_id = EXCLUDED.progress_id
  WHERE reading_validations.progress_id IS NULL;

  RETURN jsonb_build_object(
    'ok', v_is_correct, 
    'segment', v_segment,
    'progress_id', v_progress_id, 
    'validation_id', gen_random_uuid(),
    'correct', v_is_correct,
    'message', CASE 
      WHEN v_is_correct THEN 'Answer is correct' 
      ELSE 'Answer is incorrect' 
    END
  );
END;
$function$;
