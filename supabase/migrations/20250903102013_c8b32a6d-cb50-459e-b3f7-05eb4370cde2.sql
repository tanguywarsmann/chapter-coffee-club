-- Corriger les fonctions SECURITY DEFINER en ajoutant SET search_path
CREATE OR REPLACE FUNCTION public.get_public_profile(target_id uuid)
 RETURNS TABLE(id uuid, username text, avatar_url text, created_at timestamp with time zone)
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT p.id, p.username, p.avatar_url, p.created_at
  FROM public.profiles p
  WHERE p.id = target_id
$function$;

CREATE OR REPLACE FUNCTION public.get_public_profiles_for_ids(ids uuid[])
 RETURNS TABLE(id uuid, username text, avatar_url text, created_at timestamp with time zone)
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT p.id, p.username, p.avatar_url, p.created_at
  FROM public.profiles p
  WHERE p.id = ANY(ids)
$function$;

CREATE OR REPLACE FUNCTION public.get_public_profile_safe(target_user_id uuid)
 RETURNS TABLE(id uuid, username text, avatar_url text, created_at timestamp with time zone)
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT p.id, p.username, p.avatar_url, p.created_at
  FROM public.profiles p
  WHERE p.id = target_user_id
    AND p.username IS NOT NULL 
    AND p.username != '';
$function$;

CREATE OR REPLACE FUNCTION public.get_all_public_profiles(profile_limit integer DEFAULT 55)
 RETURNS TABLE(id uuid, username text, avatar_url text, created_at timestamp with time zone)
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT p.id, p.username, p.avatar_url, p.created_at
  FROM public.profiles p
  WHERE p.username IS NOT NULL 
    AND p.username != ''
  ORDER BY p.created_at DESC
  LIMIT profile_limit;
$function$;