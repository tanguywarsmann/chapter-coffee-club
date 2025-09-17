-- Fonction améliorée qui récupère vraiment le segment de la question
CREATE OR REPLACE FUNCTION public.force_validate_segment_beta(
  p_book_id uuid,
  p_question_id uuid,
  p_answer text DEFAULT 'validated',
  p_user_id uuid DEFAULT NULL,
  p_used_joker boolean DEFAULT false,
  p_correct boolean DEFAULT true
) 
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id uuid;
  v_progress_id uuid;
  v_segment integer;
BEGIN
  -- Get user from auth if not provided
  v_user_id := COALESCE(p_user_id, auth.uid());
  
  IF v_user_id IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'message', 'No user authenticated');
  END IF;

  -- Récupérer le vrai segment depuis reading_questions
  SELECT COALESCE(segment, 0) INTO v_segment
  FROM reading_questions
  WHERE id = p_question_id;
  
  -- Si pas trouvé, utiliser 0
  v_segment := COALESCE(v_segment, 0);
  
  -- Try to get existing progress or create new one
  SELECT id INTO v_progress_id 
  FROM reading_progress 
  WHERE user_id = v_user_id AND book_id = p_book_id::text;
  
  IF v_progress_id IS NULL THEN
    -- Create new progress with correct segment
    INSERT INTO reading_progress (user_id, book_id, current_page, total_pages, status, started_at, updated_at)
    VALUES (v_user_id, p_book_id::text, GREATEST(v_segment, 1), 1000, 'in_progress', now(), now())
    RETURNING id INTO v_progress_id;
  ELSE
    -- Update existing with max between current and segment
    UPDATE reading_progress 
    SET updated_at = now(), 
        current_page = GREATEST(current_page, v_segment, 1)
    WHERE id = v_progress_id;
  END IF;

  -- Insert validation with proper segment
  INSERT INTO reading_validations (user_id, book_id, progress_id, question_id, answer, segment, used_joker, correct, validated_at)
  VALUES (v_user_id, p_book_id::text, v_progress_id, p_question_id, p_answer, v_segment, p_used_joker, p_correct, now())
  ON CONFLICT DO NOTHING;

  RETURN jsonb_build_object(
    'ok', true, 
    'segment', v_segment,
    'progress_id', v_progress_id, 
    'validation_id', gen_random_uuid()
  );
END;
$$;