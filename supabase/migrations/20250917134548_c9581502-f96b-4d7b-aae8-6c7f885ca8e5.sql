-- Create atomic validation function that handles both progress and validation
CREATE OR REPLACE FUNCTION public.force_validate_segment_beta(
  p_book_id uuid,
  p_question_id uuid,
  p_answer text,
  p_user_id uuid,
  p_used_joker boolean DEFAULT false,
  p_correct boolean DEFAULT true
)
RETURNS TABLE(
  validation_id uuid,
  progress_id uuid,
  validated_segment integer
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_segment integer;
  v_progress_id uuid;
  v_validation_id uuid;
BEGIN
  IF p_user_id IS NULL OR p_book_id IS NULL OR p_question_id IS NULL THEN
    RAISE EXCEPTION 'missing_required_arg';
  END IF;

  SELECT rq.segment INTO v_segment
  FROM public.reading_questions rq
  WHERE rq.id = p_question_id;

  v_segment := COALESCE(v_segment, 0);

  -- 1) Upsert progression (retourne toujours un progress_id)
  INSERT INTO public.reading_progress AS rp
    (user_id, book_id, current_page, total_pages, status, started_at, updated_at)
  VALUES
    (p_user_id, p_book_id::text, v_segment, 0, 'in_progress', now(), now())
  ON CONFLICT (user_id, book_id)
  DO UPDATE SET
    current_page = GREATEST(COALESCE(rp.current_page,0), EXCLUDED.current_page),
    updated_at   = now()
  RETURNING rp.id INTO v_progress_id;

  -- 2) Upsert validation (idempotent sur (user_id, book_id, segment))
  INSERT INTO public.reading_validations AS rv
    (user_id, book_id, progress_id, question_id, answer, segment, used_joker, correct, validated_at)
  VALUES
    (p_user_id, p_book_id::text, v_progress_id, p_question_id, p_answer, v_segment,
     COALESCE(p_used_joker,false), COALESCE(p_correct,true), now())
  ON CONFLICT ON CONSTRAINT reading_validations_user_id_book_id_segment_key
  DO UPDATE SET
    question_id  = EXCLUDED.question_id,
    answer       = EXCLUDED.answer,
    used_joker   = EXCLUDED.used_joker,
    correct      = EXCLUDED.correct,
    progress_id  = COALESCE(rv.progress_id, EXCLUDED.progress_id),
    validated_at = now()
  RETURNING rv.id INTO v_validation_id;

  RETURN QUERY SELECT v_validation_id, v_progress_id, v_segment;
END;
$$;

GRANT EXECUTE ON FUNCTION public.force_validate_segment_beta(uuid,uuid,text,uuid,boolean,boolean) TO anon, authenticated;