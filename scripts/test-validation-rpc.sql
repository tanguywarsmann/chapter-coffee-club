-- Test script for force_validate_segment_beta RPC
-- Replace the UUIDs below with actual values from your database

-- Test 1: Valid validation (should succeed)
SELECT public.force_validate_segment_beta(
  'replace-with-actual-book-uuid'::uuid,     -- p_book_id
  'replace-with-actual-question-uuid'::uuid, -- p_question_id
  'test answer',                              -- p_answer
  'replace-with-actual-user-uuid'::uuid,     -- p_user_id
  false,                                      -- p_used_joker
  true                                        -- p_correct
);

-- Test 2: Missing parameters (should return error gracefully)
SELECT public.force_validate_segment_beta(
  NULL,                                       -- p_book_id (NULL)
  'replace-with-actual-question-uuid'::uuid, -- p_question_id
  'test answer',                              -- p_answer
  'replace-with-actual-user-uuid'::uuid,     -- p_user_id
  false,                                      -- p_used_joker
  true                                        -- p_correct
);

-- Test 3: Invalid question ID (should return error gracefully)
SELECT public.force_validate_segment_beta(
  'replace-with-actual-book-uuid'::uuid,     -- p_book_id
  gen_random_uuid(),                          -- p_question_id (random UUID)
  'test answer',                              -- p_answer
  'replace-with-actual-user-uuid'::uuid,     -- p_user_id
  false,                                      -- p_used_joker
  true                                        -- p_correct
);

-- Test 4: Duplicate validation (should upsert gracefully)
SELECT public.force_validate_segment_beta(
  'replace-with-actual-book-uuid'::uuid,     -- p_book_id
  'replace-with-actual-question-uuid'::uuid, -- p_question_id
  'updated answer',                           -- p_answer (different answer)
  'replace-with-actual-user-uuid'::uuid,     -- p_user_id
  true,                                       -- p_used_joker (changed)
  true                                        -- p_correct
);

-- Helper queries to get actual UUIDs for testing:
-- SELECT id FROM books LIMIT 1;
-- SELECT id FROM reading_questions LIMIT 1;
-- SELECT id FROM profiles LIMIT 1;