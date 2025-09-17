-- Fix existing books that have validations but are still marked as to_read
UPDATE reading_progress 
SET status = 'in_progress', updated_at = now()
WHERE status = 'to_read'
  AND EXISTS (
    SELECT 1 FROM reading_validations rv 
    WHERE rv.user_id = reading_progress.user_id 
      AND rv.book_id = reading_progress.book_id 
      AND rv.correct = true
  );