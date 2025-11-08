-- Trigger pour créer user_settings automatiquement lors de la création d'un profil
CREATE OR REPLACE FUNCTION public.create_user_settings()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_settings (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Supprimer l'ancien trigger s'il existe
DROP TRIGGER IF EXISTS trg_create_user_settings ON public.profiles;

-- Créer le nouveau trigger
CREATE TRIGGER trg_create_user_settings
  AFTER INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.create_user_settings();

-- Créer user_settings pour tous les utilisateurs existants qui n'en ont pas
INSERT INTO public.user_settings (user_id)
SELECT id FROM public.profiles
WHERE NOT EXISTS (
  SELECT 1 FROM public.user_settings WHERE user_settings.user_id = profiles.id
)
ON CONFLICT (user_id) DO NOTHING;