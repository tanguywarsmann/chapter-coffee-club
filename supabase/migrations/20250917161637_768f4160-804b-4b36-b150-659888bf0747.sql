-- Fix the force_validate_segment_beta function to handle null correct values and validate answers
CREATE OR REPLACE FUNCTION public.force_validate_segment_beta(
  p_book_id uuid, 
  p_question_id uuid, 
  p_answer text DEFAULT 'validated'::text, 
  p_user_id uuid DEFAULT NULL::uuid, 
  p_used_joker boolean DEFAULT false, 
  p_correct boolean DEFAULT NULL
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
BEGIN
  -- Get user from auth if not provided
  v_user_id := COALESCE(p_user_id, auth.uid());
  
  IF v_user_id IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'message', 'No user authenticated');
  END IF;

  -- Get the correct answer and segment from reading_questions
  SELECT COALESCE(answer, ''), COALESCE(segment, 0) 
  INTO v_correct_answer, v_segment
  FROM reading_questions
  WHERE id = p_question_id;
  
  -- If question not found, return error
  IF v_correct_answer IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'message', 'Question not found');
  END IF;
  
  -- Determine if answer is correct
  IF p_correct IS NULL THEN
    -- Server-side validation: normalize both answers for comparison
    v_is_correct := LOWER(TRIM(p_answer)) = LOWER(TRIM(v_correct_answer));
  ELSE
    -- Use provided value (for joker usage)
    v_is_correct := p_correct;
  END IF;
  
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
    -- Update existing with max between current and segment (only if answer is correct)
    IF v_is_correct THEN
      UPDATE reading_progress 
      SET updated_at = now(), 
          current_page = GREATEST(current_page, v_segment, 1)
      WHERE id = v_progress_id;
    END IF;
  END IF;

  -- Insert validation with proper segment and correct flag
  INSERT INTO reading_validations (user_id, book_id, progress_id, question_id, answer, segment, used_joker, correct, validated_at)
  VALUES (v_user_id, p_book_id::text, v_progress_id, p_question_id, p_answer, v_segment, p_used_joker, v_is_correct, now())
  ON CONFLICT DO NOTHING;

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