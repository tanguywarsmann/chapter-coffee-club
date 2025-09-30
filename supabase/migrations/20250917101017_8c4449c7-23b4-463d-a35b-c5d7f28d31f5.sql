-- Fix: Update force_validate_segment_beta to properly use authenticated user
CREATE OR REPLACE FUNCTION public.force_validate_segment_beta(
  p_book_id uuid, 
  p_question_id uuid, 
  p_answer text,
  p_user_id uuid DEFAULT null
)
RETURNS TABLE(validation_id uuid, progress_id uuid)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user uuid := COALESCE(p_user_id, auth.uid());
  v_progress_id uuid;
  v_segment int := 0; -- Default to 0 if not found
  v_validation_id uuid;
BEGIN
  -- Ensure we have a valid user
  IF v_user IS NULL THEN
    RAISE EXCEPTION 'User not authenticated';
  END IF;

  -- Get segment from question first (required for insert)
  SELECT segment INTO v_segment 
  FROM public.reading_questions 
  WHERE id = p_question_id;
  
  -- If no segment found, default to 0
  IF v_segment IS NULL THEN
    v_segment := 0;
  END IF;
  
  -- Best-effort progression (don't fail if this breaks)
  BEGIN
    SELECT id INTO v_progress_id
    FROM public.reading_progress
    WHERE user_id = v_user AND book_id = p_book_id::text
    LIMIT 1;

    IF v_progress_id IS NULL THEN
      INSERT INTO public.reading_progress(user_id, book_id, current_page, total_pages, status, started_at, updated_at)
      VALUES (v_user, p_book_id::text, 0, 0, 'in_progress', now(), now())
      RETURNING id INTO v_progress_id;
    END IF;
  EXCEPTION WHEN OTHERS THEN
    v_progress_id := NULL;
  END;

  -- UPSERT validation (insert or update if exists)
  INSERT INTO public.reading_validations(
    user_id, 
    book_id, 
    progress_id, 
    question_id, 
    answer, 
    segment,
    validated_at,
    correct,
    used_joker
  )
  VALUES (
    v_user, 
    p_book_id::text, 
    v_progress_id, 
    p_question_id, 
    p_answer, 
    v_segment,
    now(),
    true, -- Always mark as correct for beta mode
    false -- Default joker to false
  )
  ON CONFLICT (user_id, book_id, segment)
  DO UPDATE SET
    question_id = EXCLUDED.question_id,
    answer = EXCLUDED.answer,
    validated_at = EXCLUDED.validated_at,
    correct = EXCLUDED.correct,
    progress_id = EXCLUDED.progress_id
  RETURNING id INTO v_validation_id;

  -- Best-effort progress bump
  BEGIN
    IF v_segment IS NOT NULL AND v_progress_id IS NOT NULL THEN
      UPDATE public.reading_progress
      SET current_page = GREATEST(COALESCE(current_page,0), (v_segment + 1) * 20),
          updated_at = now(),
          status = CASE WHEN status='completed' THEN 'completed' ELSE 'in_progress' END
      WHERE id = v_progress_id;
    END IF;
  EXCEPTION WHEN OTHERS THEN 
    -- Ignore progress update errors
    NULL; 
  END;

  RETURN QUERY SELECT v_validation_id, v_progress_id;
END;
$$;