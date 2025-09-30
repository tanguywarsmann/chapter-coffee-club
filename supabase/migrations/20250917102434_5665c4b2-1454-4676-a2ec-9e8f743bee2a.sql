-- ⚠️ Remplace toute version précédente pour repartir propre
create or replace function public.force_validate_segment_beta(
  p_book_id uuid,
  p_question_id uuid,
  p_answer text,
  p_user_id uuid
)
returns table(validation_id uuid, progress_id uuid, segment integer)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_segment integer := 0;
  v_progress_id uuid;
  v_validation_id uuid;
begin
  -- 0) Sécurité bêta: pas d'auth, on exige p_user_id depuis le front
  if p_user_id is null then
    raise exception 'missing_user_id';
  end if;

  -- 1) Segment: on tente de le lire, fallback à 0 (grâce au DEFAULT, ça passera)
  select rq.segment into v_segment
  from public.reading_questions rq
  where rq.id = p_question_id;

  v_segment := coalesce(v_segment, 0);

  -- 2) Best-effort progression (peut échouer sans bloquer)
  begin
    select id into v_progress_id
    from public.reading_progress
    where user_id = p_user_id and book_id = p_book_id
    limit 1;

    if v_progress_id is null then
      insert into public.reading_progress(user_id, book_id, current_page, total_pages, status, started_at, updated_at)
      values (p_user_id, p_book_id, 0, 0, 'in_progress', now(), now())
      returning id into v_progress_id;
    end if;
  exception when others then
    v_progress_id := null;
  end;

  -- 3) Insertion validation (ne doit pas planter grâce aux defaults du §A)
  insert into public.reading_validations(
    user_id, book_id, progress_id, question_id, answer, segment
  )
  values (
    p_user_id, p_book_id, v_progress_id, p_question_id, p_answer, v_segment
  )
  returning id into v_validation_id;

  return query select v_validation_id, v_progress_id, v_segment;
end;
$$;

revoke all on function public.force_validate_segment_beta(uuid, uuid, text, uuid) from public;
grant execute on function public.force_validate_segment_beta(uuid, uuid, text, uuid) to anon, authenticated;