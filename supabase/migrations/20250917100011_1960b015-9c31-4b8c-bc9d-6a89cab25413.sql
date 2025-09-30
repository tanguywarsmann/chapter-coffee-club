-- BETA: Create authentication-free validation function
CREATE OR REPLACE FUNCTION public.force_validate_segment_beta(
  p_book_id uuid, 
  p_question_id uuid, 
  p_answer text,
  p_user_id uuid DEFAULT '00000000-0000-0000-0000-000000000000'::uuid
)
RETURNS TABLE(validation_id uuid, progress_id uuid)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user uuid := COALESCE(p_user_id, '00000000-0000-0000-0000-000000000000'::uuid);
  v_progress_id uuid;
  v_segment int;
  v_validation_id uuid;
BEGIN
  -- Use provided user_id or default dummy user for BETA mode
  
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

  -- Validation is ALWAYS created (prioritaire)
  INSERT INTO public.reading_validations(
    user_id, 
    book_id, 
    progress_id, 
    question_id, 
    answer, 
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
    now(),
    true, -- Always mark as correct for beta mode
    false -- Default joker to false
  )
  RETURNING id INTO v_validation_id;

  -- Best-effort progress bump
  BEGIN
    SELECT segment INTO v_segment 
    FROM public.reading_questions 
    WHERE id = p_question_id;
    
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

-- Grant permissions
REVOKE ALL ON FUNCTION public.force_validate_segment_beta(uuid, uuid, text, uuid) FROM public;
GRANT EXECUTE ON FUNCTION public.force_validate_segment_beta(uuid, uuid, text, uuid) TO anon;
GRANT EXECUTE ON FUNCTION public.force_validate_segment_beta(uuid, uuid, text, uuid) TO authenticated;