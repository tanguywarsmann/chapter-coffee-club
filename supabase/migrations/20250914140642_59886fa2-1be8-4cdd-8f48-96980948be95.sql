-- Complete VREAD notification system
begin;

-- Types de notifications
do $$
begin
  if not exists (select 1 from pg_type where typname = 'notification_type') then
    create type public.notification_type as enum (
      'friend_finished','laurier_received','streak_nudge','streak_kept','streak_lost','weekly_digest'
    );
  else
    -- Add new values if they don't exist
    if not exists (select 1 from pg_enum where enumlabel='streak_nudge' and enumtypid='notification_type'::regtype) then
      alter type public.notification_type add value 'streak_nudge';
    end if;
    if not exists (select 1 from pg_enum where enumlabel='streak_kept' and enumtypid='notification_type'::regtype) then
      alter type public.notification_type add value 'streak_kept';
    end if;
    if not exists (select 1 from pg_enum where enumlabel='streak_lost' and enumtypid='notification_type'::regtype) then
      alter type public.notification_type add value 'streak_lost';
    end if;
    if not exists (select 1 from pg_enum where enumlabel='weekly_digest' and enumtypid='notification_type'::regtype) then
      alter type public.notification_type add value 'weekly_digest';
    end if;
  end if;
end$$;

-- Enhanced notifications table
do $$
begin
  if not exists (select 1 from information_schema.tables where table_name = 'notifications') then
    create table public.notifications (
      id uuid primary key default gen_random_uuid(),
      recipient_id uuid not null references public.profiles(id) on delete cascade,
      actor_id uuid references public.profiles(id) on delete cascade,
      type public.notification_type not null,
      progress_id uuid references public.reading_progress(id) on delete cascade,
      book_id text,
      book_title text,
      meta jsonb,
      created_at timestamptz not null default now(),
      read_at timestamptz
    );
    alter table public.notifications enable row level security;
    create index idx_notif_rec on public.notifications(recipient_id, created_at desc);
  else
    -- Add missing columns if they don't exist
    if not exists (select 1 from information_schema.columns where table_name = 'notifications' and column_name = 'meta') then
      alter table public.notifications add column meta jsonb;
    end if;
  end if;
end$$;

-- RLS policies for notifications
drop policy if exists "notif_select_own" on public.notifications;
create policy "notif_select_own" on public.notifications for select using (auth.uid() = recipient_id);
drop policy if exists "notif_update_read_own" on public.notifications;
create policy "notif_update_read_own" on public.notifications for update using (auth.uid() = recipient_id) with check (auth.uid() = recipient_id);

-- Réglages utilisateurs
create table if not exists public.user_settings (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  tz text default 'Europe/Paris',
  quiet_start smallint default 22,  -- 0-23
  quiet_end smallint default 8,
  nudge_hour smallint default 20,   -- heure de rappel, conseillé 18-21
  enable_streak boolean default true,
  enable_social boolean default true,
  enable_digest boolean default true,
  daily_push_cap smallint default 3,
  updated_at timestamptz not null default now()
);
alter table public.user_settings enable row level security;

-- RLS for user settings
drop policy if exists "settings_crud_own" on public.user_settings;
create policy "settings_crud_own" on public.user_settings for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Activity likes (lauriers) - ensure it exists with proper structure
do $$
begin
  if not exists (select 1 from information_schema.tables where table_name = 'activity_likes') then
    create table public.activity_likes (
      id uuid primary key default gen_random_uuid(),
      progress_id uuid not null references public.reading_progress(id) on delete cascade,
      liker_id uuid not null references public.profiles(id) on delete cascade,
      created_at timestamptz not null default now(),
      unique (progress_id, liker_id)
    );
    alter table public.activity_likes enable row level security;
  end if;
end$$;

-- RLS policies for activity likes
drop policy if exists "likes_select_all" on public.activity_likes;
create policy "likes_select_all" on public.activity_likes for select using (auth.role() = 'authenticated');
drop policy if exists "likes_insert_own" on public.activity_likes;
create policy "likes_insert_own" on public.activity_likes for insert with check (auth.uid() = liker_id);
drop policy if exists "likes_delete_own" on public.activity_likes;
create policy "likes_delete_own" on public.activity_likes for delete using (auth.uid() = liker_id);

-- Updated trigger functions
create or replace function public.notify_laurier_received() returns trigger
language plpgsql security definer set search_path = public as $$
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
  values (target_user, new.liker_id, 'laurier_received', new.progress_id, b_id, b_title);
  
  return new;
end $$;

drop trigger if exists trg_activity_laurier on public.activity_likes;
create trigger trg_activity_laurier
after insert on public.activity_likes
for each row execute procedure public.notify_laurier_received();

create or replace function public.notify_followers_on_completion() returns trigger
language plpgsql security definer set search_path = public as $$
declare 
  b_title text;
begin
  if new.status = 'completed' and coalesce(old.status,'') <> 'completed' then
    select title into b_title from public.books where id = new.book_id;
    
    insert into public.notifications(recipient_id, actor_id, type, progress_id, book_id, book_title)
    select f.follower_id, new.user_id, 'friend_finished', new.id, new.book_id, b_title
    from public.followers f
    where f.following_id = new.user_id and f.follower_id <> new.user_id;
  end if;
  
  return new;
end $$;

drop trigger if exists trg_notify_completion on public.reading_progress;
create trigger trg_notify_completion
after update on public.reading_progress
for each row when (old.status is distinct from new.status)
execute procedure public.notify_followers_on_completion();

commit;