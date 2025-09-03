-- Supprimer les politiques dupliquées sur reading_progress
DROP POLICY IF EXISTS "Users can view own reading progress" ON reading_progress;
DROP POLICY IF EXISTS "Users can insert own reading progress" ON reading_progress;
DROP POLICY IF EXISTS "Users can update own reading progress" ON reading_progress;

-- Garder uniquement les politiques principales plus claires
-- Les politiques "Allow read/insert/update/delete access to own progress" et 
-- "Users can view reading progress based on relationships" restent actives