-- 1) Bêta: on neutralise les blocages courants côté validations
alter table public.reading_validations disable row level security;
grant select, insert, update, delete on public.reading_validations to anon, authenticated;

-- 2) Rendre la table tolérante (NOT NULL → nullable + defaults)
do $$
begin
  -- SEGMENT
  if exists (
    select 1 from information_schema.columns
    where table_schema='public' and table_name='reading_validations' and column_name='segment'
  ) then
    alter table public.reading_validations
      alter column segment drop not null,
      alter column segment set default 0;
  end if;

  -- PROGRESS_ID
  if exists (
    select 1 from information_schema.columns
    where table_schema='public' and table_name='reading_validations' and column_name='progress_id'
  ) then
    alter table public.reading_validations
      alter column progress_id drop not null;
  end if;

  -- CORRECT
  if exists (
    select 1 from information_schema.columns
    where table_schema='public' and table_name='reading_validations' and column_name='correct'
  ) then
    alter table public.reading_validations
      alter column correct set default true;
  end if;

  -- USED_JOKER
  if exists (
    select 1 from information_schema.columns
    where table_schema='public' and table_name='reading_validations' and column_name='used_joker'
  ) then
    alter table public.reading_validations
      alter column used_joker set default false;
  end if;

  -- VALIDATED_AT / CREATED_AT selon ton schéma
  if exists (
    select 1 from information_schema.columns
    where table_schema='public' and table_name='reading_validations' and column_name='validated_at'
  ) then
    alter table public.reading_validations
      alter column validated_at set default now();
  end if;

  if exists (
    select 1 from information_schema.columns
    where table_schema='public' and table_name='reading_validations' and column_name='created_at'
  ) then
    alter table public.reading_validations
      alter column created_at set default now();
  end if;
end$$;