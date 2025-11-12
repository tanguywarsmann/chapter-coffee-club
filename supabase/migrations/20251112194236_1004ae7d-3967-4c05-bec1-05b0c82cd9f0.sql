-- ============================================================
-- CORRECTION CRITIQUE: Exposition auth.users - Apple Privacy Compliance
-- Objectif: Supprimer toute exposition de auth.users via les vues publiques
-- ============================================================

-- 1. Supprimer la vue v_apple_iap_summary qui expose potentiellement auth.users
DROP VIEW IF EXISTS public.v_apple_iap_summary CASCADE;

-- 2. Recréer v_apple_iap_summary de manière sécurisée
-- Utilise uniquement profiles (pas auth.users) pour les données utilisateur
CREATE VIEW public.v_apple_iap_summary AS
SELECT 
  r.user_id,
  p.username,
  p.email,  -- Vient de profiles, pas de auth.users
  p.created_at,
  r.product_id,
  r.transaction_id,
  r.purchase_date,
  r.expires_date,
  CASE 
    WHEN r.expires_date IS NULL THEN 'lifetime'
    WHEN r.expires_date > NOW() THEN 'active'
    ELSE 'expired'
  END as subscription_status
FROM public.apple_iap_receipts r
LEFT JOIN public.profiles p ON p.id = r.user_id;

-- 3. Sécuriser profiles_public en s'assurant qu'elle n'expose QUE les données publiques
-- Cette vue ne doit montrer que username et avatar (pas email ni données sensibles)
DROP VIEW IF EXISTS public.profiles_public CASCADE;

CREATE VIEW public.profiles_public AS
SELECT 
  id,
  username,
  avatar_url,
  created_at,
  -- Exclure: email, is_admin, is_premium, premium_since, premium_type
  -- Ces données ne doivent JAMAIS être publiques
  NULL::boolean as is_admin,  -- Masquer complètement
  updated_at
FROM public.profiles
WHERE username IS NOT NULL 
  AND username != '';

-- 4. Ajouter RLS sur les vues pour double sécurité
ALTER VIEW public.v_apple_iap_summary SET (security_invoker = on);
ALTER VIEW public.profiles_public SET (security_invoker = on);

-- 5. Vérifier qu'aucune autre vue n'expose auth.users
DO $$
DECLARE
  auth_exposure TEXT;
BEGIN
  -- Cette requête vérifie si des vues accèdent directement à auth.users
  SELECT string_agg(viewname, ', ') INTO auth_exposure
  FROM pg_views
  WHERE schemaname = 'public'
    AND (
      definition ILIKE '%auth.users%'
      OR definition ILIKE '%auth.email%'
    );
  
  IF auth_exposure IS NOT NULL THEN
    RAISE WARNING 'SECURITY: Views still exposing auth.users: %', auth_exposure;
  ELSE
    RAISE NOTICE 'SECURITY: No views exposing auth.users ✓';
  END IF;
END $$;

-- 6. Documentation de sécurité
COMMENT ON VIEW public.v_apple_iap_summary IS 'Apple IAP summary - Uses profiles table only (not auth.users) - Apple privacy compliant';
COMMENT ON VIEW public.profiles_public IS 'Public profiles view - Safe for PostgREST API - No PII exposed - Apple privacy compliant';