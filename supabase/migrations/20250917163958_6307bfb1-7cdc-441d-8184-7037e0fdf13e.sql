-- Create a function to safely update reading progress status 
CREATE OR REPLACE FUNCTION fix_reading_progress_status()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  updated_count integer := 0;
  rec record;
BEGIN
  -- Update books that have validations but are still marked as to_read
  FOR rec IN (
    SELECT DISTINCT rp.id, rp.user_id, rp.book_id
    FROM reading_progress rp
    WHERE rp.status = 'to_read'
      AND EXISTS (
        SELECT 1 FROM reading_validations rv 
        WHERE rv.user_id = rp.user_id 
          AND rv.book_id = rp.book_id 
          AND rv.correct = true
      )
  ) LOOP
    -- Update each record individually to avoid trigger conflicts
    UPDATE reading_progress 
    SET status = 'in_progress'::reading_status, 
        updated_at = now()
    WHERE id = rec.id;
    
    updated_count := updated_count + 1;
  END LOOP;
  
  RETURN updated_count;
END;
$function$;

-- Execute the function
SELECT fix_reading_progress_status() as books_updated;