-- =====================================================
-- VALIDATION VREAD : Logique flexible de validation des réponses
-- =====================================================

-- 1) Fonction normalize_text : normalise une chaîne pour comparaison
CREATE OR REPLACE FUNCTION public.normalize_text(str TEXT)
RETURNS TEXT
LANGUAGE plpgsql IMMUTABLE
SET search_path = public
AS $$
BEGIN
  IF str IS NULL THEN RETURN ''; END IF;
  
  -- trim + minuscules + suppression accents + ponctuation → espaces + réduction espaces multiples
  RETURN TRIM(regexp_replace(
    regexp_replace(
      LOWER(
        translate(
          TRIM(str),
          'àâäáãåéèêëíìîïóòôöõúùûüýÿñçœæÀÂÄÁÃÅÉÈÊËÍÌÎÏÓÒÔÖÕÚÙÛÜÝŸÑÇŒÆ',
          'aaaaaaeeeeiiiioooooouuuuyyncoeAAAAAAEEEEIIIIOOOOOUUUUYYNCOE'
        )
      ),
      '[.,!?;:''"''()\[\]{}\/\\—–\-…]+',
      ' ',
      'g'
    ),
    '\s+',
    ' ',
    'g'
  ));
END;
$$;

-- 2) Fonction is_valid_answer : vérifie si la réponse utilisateur correspond à la réponse attendue
CREATE OR REPLACE FUNCTION public.is_valid_answer(user_input TEXT, expected TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql IMMUTABLE
SET search_path = public
AS $$
DECLARE
  normalized_input TEXT;
  normalized_expected TEXT;
  token TEXT;
  tokens TEXT[];
BEGIN
  -- Retourne false si expected est vide/null
  IF expected IS NULL OR TRIM(expected) = '' THEN
    RETURN FALSE;
  END IF;
  
  -- Cas spécial : réponse "libre" = toujours valide
  IF LOWER(TRIM(expected)) = 'libre' THEN
    RETURN TRUE;
  END IF;
  
  -- Retourne false si user_input est vide/null
  IF user_input IS NULL OR TRIM(user_input) = '' THEN
    RETURN FALSE;
  END IF;
  
  normalized_input := normalize_text(user_input);
  normalized_expected := normalize_text(expected);
  
  -- Cas a) Égalité exacte après normalisation
  IF normalized_input = normalized_expected THEN
    RETURN TRUE;
  END IF;
  
  -- Découper en tokens (split sur espaces)
  tokens := regexp_split_to_array(normalized_input, '\s+');
  
  -- Vérifier chaque token
  FOREACH token IN ARRAY tokens LOOP
    IF token = '' THEN CONTINUE; END IF;
    
    -- Cas b) Token exactement égal à expected
    IF token = normalized_expected THEN
      RETURN TRUE;
    END IF;
    
    -- Cas c) Variantes singulier/pluriel (seulement si expected >= 3 caractères)
    IF LENGTH(normalized_expected) >= 3 THEN
      -- Token = expected + 's' (ex: sandwich → sandwichs)
      IF token = normalized_expected || 's' THEN RETURN TRUE; END IF;
      
      -- Token = expected + 'x' (ex: chateau → chateaux)
      IF token = normalized_expected || 'x' THEN RETURN TRUE; END IF;
      
      -- Token = expected sans 's' final (ex: sandwichs → sandwich)
      IF normalized_expected LIKE '%s' AND token = LEFT(normalized_expected, -1) THEN
        RETURN TRUE;
      END IF;
      
      -- Token = expected sans 'x' final (ex: chateaux → chateau)
      IF normalized_expected LIKE '%x' AND token = LEFT(normalized_expected, -1) THEN
        RETURN TRUE;
      END IF;
    END IF;
  END LOOP;
  
  RETURN FALSE;
END;
$$;

-- 3) Mise à jour de force_validate_segment_beta pour utiliser is_valid_answer
CREATE OR REPLACE FUNCTION public.force_validate_segment_beta(p_book_id uuid, p_question_id uuid, p_answer text DEFAULT 'validated'::text, p_user_id uuid DEFAULT NULL::uuid, p_used_joker boolean DEFAULT false, p_correct boolean DEFAULT NULL::boolean)
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
    -- ✨ NOUVELLE LOGIQUE : utilise is_valid_answer au lieu de comparaison stricte
    v_is_correct := is_valid_answer(p_answer, v_correct_answer);
  ELSE
    -- Use provided value (for joker usage)
    v_is_correct := p_correct;
  END IF;
  
  -- CRITICAL FIX: Only process if answer is correct OR joker is used
  IF NOT v_is_correct AND NOT p_used_joker THEN
    -- Return failure without creating any records
    RETURN jsonb_build_object(
      'ok', false,
      'segment', v_segment,
      'correct', false,
      'message', 'Answer is incorrect and no joker used'
    );
  END IF;
  
  -- Try to get existing progress and current status
  SELECT id, status INTO v_progress_id, v_current_status
  FROM reading_progress 
  WHERE user_id = v_user_id AND book_id = p_book_id::text;
  
  IF v_progress_id IS NULL THEN
    -- Create new progress with correct segment and status
    INSERT INTO reading_progress (user_id, book_id, current_page, total_pages, status, started_at, updated_at)
    VALUES (v_user_id, p_book_id::text, GREATEST(v_segment, 1), 1000, 'in_progress', now(), now())
    RETURNING id INTO v_progress_id;
  ELSE
    -- Update existing progress (only if validation succeeds)
    UPDATE reading_progress 
    SET updated_at = now(), 
        current_page = GREATEST(current_page, v_segment, 1),
        -- CRITICAL FIX: Update status to in_progress when user starts validating
        status = CASE 
          WHEN status = 'to_read' THEN 'in_progress'
          ELSE status
        END
    WHERE id = v_progress_id;
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