-- Replace force_validate_segment_beta with cleaner version (no xmax, no ambiguity)
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
  v_segment integer := 0;
  v_progress_id uuid;
  v_id uuid;
BEGIN
  IF p_user_id IS NULL THEN
    RAISE EXCEPTION 'missing_user_id';
  END IF;

  -- 1) segment de la question (fallback 0)
  SELECT rq.segment INTO v_segment
  FROM public.reading_questions rq
  WHERE rq.id = p_question_id;
  v_segment := COALESCE(v_segment, 0);

  -- 2) assurer une ligne de progression (best-effort)
  BEGIN
    SELECT rp.id INTO v_progress_id
    FROM public.reading_progress rp
    WHERE rp.user_id = p_user_id AND rp.book_id = p_book_id::text
    LIMIT 1;

    IF v_progress_id IS NULL THEN
      INSERT INTO public.reading_progress(user_id, book_id, current_page, total_pages, status, started_at, updated_at)
      VALUES (p_user_id, p_book_id::text, 0, 0, 'in_progress', now(), now())
      RETURNING id INTO v_progress_id;
    END IF;
  EXCEPTION WHEN OTHERS THEN
    v_progress_id := NULL;
  END;

  -- 3) UPSERT sans utiliser de colonnes système ni noms ambigus
  INSERT INTO public.reading_validations(
    user_id, book_id, progress_id, question_id, answer, segment, used_joker, correct, validated_at
  )
  VALUES (
    p_user_id, p_book_id::text, v_progress_id, p_question_id, p_answer, v_segment, p_used_joker, p_correct, now()
  )
  ON CONFLICT ON CONSTRAINT reading_validations_user_id_book_id_segment_key
  DO UPDATE SET
    question_id   = EXCLUDED.question_id,
    answer        = EXCLUDED.answer,
    used_joker    = EXCLUDED.used_joker,
    correct       = EXCLUDED.correct,
    progress_id   = COALESCE(public.reading_validations.progress_id, EXCLUDED.progress_id),
    validated_at  = now()
  RETURNING id INTO v_id;

  -- 4) bump progress (best-effort)
  BEGIN
    IF v_segment IS NOT NULL AND v_progress_id IS NOT NULL THEN
      UPDATE public.reading_progress
      SET current_page = GREATEST(COALESCE(current_page, 0), v_segment),
          updated_at   = now(),
          status       = CASE WHEN status = 'completed' THEN 'completed' ELSE 'in_progress' END
      WHERE id = v_progress_id;
    END IF;
  EXCEPTION WHEN OTHERS THEN 
    NULL; 
  END;

  RETURN QUERY
  SELECT v_id AS validation_id, v_progress_id AS progress_id, v_segment AS validated_segment;
END;
$$;

REVOKE ALL ON FUNCTION public.force_validate_segment_beta(uuid, uuid, text, uuid, boolean, boolean) FROM public;
GRANT EXECUTE ON FUNCTION public.force_validate_segment_beta(uuid, uuid, text, uuid, boolean, boolean) TO anon, authenticated;

-- Bêta : pas de RLS qui bloque
ALTER TABLE public.reading_validations DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.reading_progress DISABLE ROW LEVEL SECURITY;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.reading_validations TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.reading_progress TO anon, authenticated;