-- Étape 1: Sauvegarde (filet de sécurité)
create table if not exists public._backup_reading_questions as
select * from public.reading_questions
where false; -- crée la structure vide si besoin

insert into public._backup_reading_questions
select * from public.reading_questions
on conflict do nothing;

-- Étape 2: La vue existe déjà et est correcte (sans answer), on la recrée pour être sûr
create or replace view public.reading_questions_public as
select id, book_slug, segment, question, book_id
from public.reading_questions;

-- Étape 3: RLS / GRANT / Index (sécurité & perfs)
-- Sécurité : activer RLS sur la table source
alter table public.reading_questions enable row level security;

-- Policy de lecture de lignes
drop policy if exists rq_select on public.reading_questions;
create policy rq_select on public.reading_questions
for select using (true);

-- La vue est publique pour anon/authenticated :
grant select on public.reading_questions_public to anon, authenticated;

-- Retirer les GRANT direct sur la table aux clients :
revoke select on public.reading_questions from anon, authenticated;

-- Index d'accès par (slug, segment) sur la table source
create index if not exists idx_reading_questions_book_slug_segment
on public.reading_questions (book_slug, segment);

-- Étape 5: Vérifs "books" - s'assurer que les livres sont publiés
update public.books set is_published=true where is_published is distinct from true;

-- Commentaires pour éviter la confusion
comment on table public.reading_questions is 'Source des questions (contient `answer`). Ne pas requêter côté client.';
comment on view  public.reading_questions_public is 'Vue publique sans `answer`. À utiliser côté client.';