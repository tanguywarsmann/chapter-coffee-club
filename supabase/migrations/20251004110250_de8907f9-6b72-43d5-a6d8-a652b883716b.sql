-- Migration 2/2: Renommer les tables, fonctions et mettre à jour les notifications (version finale)

-- 1. Mettre à jour toutes les notifications existantes
UPDATE public.notifications 
SET type = 'booky_received'::notification_type
WHERE type::text = 'laurier_received';

-- 2. Renommer la table feed_lauriers en feed_bookys
ALTER TABLE IF EXISTS public.feed_lauriers RENAME TO feed_bookys;

-- 3. Renommer les index
ALTER INDEX IF EXISTS idx_feed_lauriers_event RENAME TO idx_feed_bookys_event;
ALTER INDEX IF EXISTS idx_feed_lauriers_liker RENAME TO idx_feed_bookys_liker;
ALTER INDEX IF EXISTS idx_feed_lauriers_seed_tag RENAME TO idx_feed_bookys_seed_tag;

-- 4. Supprimer tous les triggers qui utilisent l'ancienne fonction
DROP TRIGGER IF EXISTS notify_laurier_received ON public.activity_likes;
DROP TRIGGER IF EXISTS trg_activity_laurier ON public.activity_likes;

-- 5. Supprimer l'ancienne fonction
DROP FUNCTION IF EXISTS public.notify_laurier_received();

-- 6. Créer la nouvelle fonction pour les notifications Booky
CREATE OR REPLACE FUNCTION public.notify_booky_received()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
declare 
  target_user uuid; 
  b_id text; 
  b_title text;
begin
  select rp.user_id, rp.book_id, b.title into target_user, b_id, b_title
  from public.reading_progress rp 
  join public.books b on b.id = rp.book_id
  where rp.id = new.progress_id;
  
  if target_user is null or target_user = new.liker_id then 
    return new; 
  end if;

  insert into public.notifications(recipient_id, actor_id, type, progress_id, book_id, book_title)
  values (target_user, new.liker_id, 'booky_received', new.progress_id, b_id, b_title);
  
  return new;
end $function$;

-- 7. Créer le nouveau trigger
CREATE TRIGGER notify_booky_received
  AFTER INSERT ON public.activity_likes
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_booky_received();

-- 8. Supprimer l'ancienne fonction feed_get_v1
DROP FUNCTION IF EXISTS public.feed_get_v1(integer, integer, uuid);
DROP FUNCTION IF EXISTS public.feed_get_v1(integer, integer);

-- 9. Créer la nouvelle fonction feed_get_v1 avec le nom de colonne mis à jour
CREATE OR REPLACE FUNCTION public.feed_get_v1(p_limit integer DEFAULT 100, p_offset integer DEFAULT 0, p_viewer uuid DEFAULT NULL::uuid)
 RETURNS TABLE(id uuid, created_at timestamp with time zone, event_type text, segment integer, actor_id uuid, actor_name text, actor_avatar_url text, book_id uuid, book_title text, bookys_count bigint, liked_by_me boolean)
 LANGUAGE sql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  select
    e.id,
    e.created_at,
    e.event_type,
    e.segment,
    e.actor_id,
    coalesce(
      nullif(to_jsonb(p)->>'full_name',''),
      nullif(to_jsonb(p)->>'display_name',''),
      nullif(to_jsonb(p)->>'username',''),
      nullif(to_jsonb(p)->>'name',''),
      p.id::text
    ) as actor_name,
    coalesce(
      to_jsonb(p)->>'avatar_url',
      to_jsonb(p)->>'avatar',
      to_jsonb(p)->>'image_url',
      to_jsonb(p)->>'picture'
    ) as actor_avatar_url,
    e.book_id,
    coalesce(
      to_jsonb(b)->>'title',
      to_jsonb(b)->>'name',
      to_jsonb(b)->>'book_title'
    ) as book_title,
    (select count(*) from public.feed_bookys l where l.event_id = e.id) as bookys_count,
    case
      when p_viewer is not null
       and exists (select 1 from public.feed_bookys l where l.event_id = e.id and l.liker_id::text = p_viewer::text)
      then true else false
    end as liked_by_me
  from public.feed_events e
  join public.profiles p on p.id::text = e.actor_id::text
  left join public.books    b on b.id::text = e.book_id::text
  order by e.created_at desc
  limit p_limit offset p_offset;
$function$;

-- 10. Accorder les permissions
REVOKE ALL ON FUNCTION public.feed_get_v1(int,int,uuid) FROM public;
GRANT EXECUTE ON FUNCTION public.feed_get_v1(int,int,uuid) TO anon, authenticated;