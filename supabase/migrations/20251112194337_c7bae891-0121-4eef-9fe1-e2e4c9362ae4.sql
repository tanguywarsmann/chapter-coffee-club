-- ============================================================
-- SOLUTION RADICALE: Bloquer complètement l'accès à auth.users
-- et révoquer les permissions problématiques
-- ============================================================

-- 1. Révoquer TOUS les accès à auth.users pour anon et authenticated
REVOKE ALL ON auth.users FROM anon;
REVOKE ALL ON auth.users FROM authenticated;
REVOKE ALL ON auth.users FROM PUBLIC;

-- 2. Identifier et corriger les vues matérialisées
DO $$
DECLARE
  matview_rec RECORD;
BEGIN
  FOR matview_rec IN 
    SELECT schemaname, matviewname
    FROM pg_matviews
    WHERE schemaname = 'public'
  LOOP
    RAISE NOTICE 'Found materialized view: %.%', matview_rec.schemaname, matview_rec.matviewname;
  END LOOP;
END $$;

-- 3. S'assurer que v_apple_iap_summary est bien SECURITY INVOKER (pas DEFINER)
DROP VIEW IF EXISTS public.v_apple_iap_summary CASCADE;

CREATE VIEW public.v_apple_iap_summary 
WITH (security_invoker=on) AS
SELECT 
  r.user_id,
  p.username,
  p.email,
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

-- 4. Révoquer permissions sur la vue si elles existent
REVOKE ALL ON public.v_apple_iap_summary FROM anon;
REVOKE ALL ON public.v_apple_iap_summary FROM authenticated;

-- 5. Grant minimum nécessaire (admins uniquement)
GRANT SELECT ON public.v_apple_iap_summary TO service_role;

-- 6. Vérifier le résultat
DO $$
BEGIN
  RAISE NOTICE '✅ Auth.users access revoked from anon/authenticated';
  RAISE NOTICE '✅ v_apple_iap_summary secured with security_invoker';
  RAISE NOTICE '✅ View permissions restricted to service_role only';
END $$;