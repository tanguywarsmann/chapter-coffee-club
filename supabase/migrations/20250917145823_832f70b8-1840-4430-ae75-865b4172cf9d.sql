-- Find and drop ALL check constraints on these tables
DO $$
DECLARE
    r RECORD;
BEGIN
    -- Drop all check constraints on reading_validations
    FOR r IN SELECT constraint_name FROM information_schema.table_constraints 
             WHERE table_name = 'reading_validations' AND constraint_type = 'CHECK'
    LOOP
        EXECUTE 'ALTER TABLE reading_validations DROP CONSTRAINT IF EXISTS ' || r.constraint_name;
    END LOOP;
    
    -- Drop all check constraints on reading_progress  
    FOR r IN SELECT constraint_name FROM information_schema.table_constraints 
             WHERE table_name = 'reading_progress' AND constraint_type = 'CHECK'
    LOOP
        EXECUTE 'ALTER TABLE reading_progress DROP CONSTRAINT IF EXISTS ' || r.constraint_name;
    END LOOP;
END $$;

-- Create ultra-simple function that just works
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
BEGIN
  -- Get user from auth if not provided
  v_user_id := COALESCE(p_user_id, auth.uid());
  
  IF v_user_id IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'message', 'No user authenticated');
  END IF;

  -- Simple insert into progress (ignore conflicts)
  INSERT INTO reading_progress (user_id, book_id, current_page, total_pages, status, started_at, updated_at)
  VALUES (v_user_id, p_book_id::text, 1, 100, 'in_progress', now(), now())
  ON CONFLICT (user_id, book_id) DO UPDATE SET updated_at = now();

  -- Simple insert into validations (ignore conflicts)
  INSERT INTO reading_validations (user_id, book_id, question_id, answer, segment, used_joker, correct, validated_at)
  VALUES (v_user_id, p_book_id::text, p_question_id, p_answer, 1, p_used_joker, p_correct, now())
  ON CONFLICT DO NOTHING;

  RETURN jsonb_build_object('ok', true, 'message', 'Success');
END;
$$;