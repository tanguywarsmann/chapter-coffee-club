-- Migration 1/2: Ajouter la nouvelle valeur d'enum
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum 
    WHERE enumtypid = 'notification_type'::regtype 
    AND enumlabel = 'booky_received'
  ) THEN
    ALTER TYPE notification_type ADD VALUE 'booky_received';
  END IF;
END $$;