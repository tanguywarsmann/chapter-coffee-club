-- Drop existing function first to change return type
DROP FUNCTION IF EXISTS public.force_validate_segment_beta(uuid, uuid, text, uuid, boolean, boolean);

-- Recreate with fixed ambiguity and new return type
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
  validated_segment integer,
  action text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_segment integer := 0;
  v_progress_id uuid;
BEGIN
  IF p_user_id IS NULL THEN
    RAISE EXCEPTION 'missing_user_id';
  END IF;

  -- Segment de la question (fallback 0)
  SELECT rq.segment INTO v_segment
  FROM public.reading_questions rq
  WHERE rq.id = p_question_id;
  v_segment := COALESCE(v_segment, 0);

  -- Best-effort: créer/obtenir une progression
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

  -- UPSERT sans ambiguïté : on cible la contrainte unique existante
  RETURN QUERY
  WITH up AS (
    INSERT INTO public.reading_validations(
      user_id, book_id, progress_id, question_id, answer, segment, used_joker, correct, validated_at
    )
    VALUES (
      p_user_id, p_book_id::text, v_progress_id, p_question_id, p_answer,
      v_segment, p_used_joker, p_correct, now()
    )
    ON CONFLICT ON CONSTRAINT reading_validations_user_id_book_id_segment_key
    DO UPDATE SET
      question_id   = EXCLUDED.question_id,
      answer        = EXCLUDED.answer,
      used_joker    = EXCLUDED.used_joker,
      correct       = EXCLUDED.correct,
      progress_id   = COALESCE(public.reading_validations.progress_id, EXCLUDED.progress_id),
      validated_at  = now()
    RETURNING id, progress_id, (xmax = 0) AS inserted
  )
  SELECT
    up.id          AS validation_id,
    up.progress_id AS progress_id,
    v_segment      AS validated_segment,
    CASE WHEN up.inserted THEN 'inserted' ELSE 'updated' END AS action
  FROM up;

  -- Best-effort: mise à jour de la progression (non bloquant)
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
END;
$$;

-- Exécution autorisée pour la bêta
REVOKE ALL ON FUNCTION public.force_validate_segment_beta(uuid, uuid, text, uuid, boolean, boolean) FROM public;
GRANT EXECUTE ON FUNCTION public.force_validate_segment_beta(uuid, uuid, text, uuid, boolean, boolean) TO anon, authenticated;