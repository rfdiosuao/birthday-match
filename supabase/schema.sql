create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  nickname text not null check (char_length(nickname) between 2 and 20),
  birthday_month smallint not null check (birthday_month between 1 and 12),
  birthday_day smallint not null check (birthday_day between 1 and 31),
  city_name text not null check (char_length(city_name) between 2 and 30),
  city_key text not null check (char_length(city_key) between 1 and 30),
  bio text not null check (char_length(bio) between 20 and 160),
  celebration_style text not null check (celebration_style in ('quiet', 'explore', 'lively')),
  budget_level text not null check (budget_level in ('under_100', '100_300', '300_600', 'flexible')),
  group_size text not null check (group_size in ('two', 'small', 'medium')),
  gender text not null check (gender in ('woman', 'man', 'nonbinary', 'private')),
  group_preference text not null check (group_preference in ('any', 'women_only', 'men_only')),
  activities text[] not null check (cardinality(activities) between 1 and 5),
  contact_kind text not null check (contact_kind in ('wechat', 'email', 'phone')),
  contact_value text not null check (char_length(contact_value) between 3 and 80),
  is_adult boolean not null check (is_adult = true),
  safety_accepted boolean not null check (safety_accepted = true),
  visibility text not null default 'active' check (visibility in ('active', 'paused')),
  onboarding_complete boolean not null default true
);

create index if not exists profiles_birthday_city_idx
  on public.profiles (birthday_month, birthday_day, city_key)
  where visibility = 'active' and onboarding_complete = true;

create table if not exists public.reactions (
  actor_id uuid not null references public.profiles(id) on delete cascade,
  target_id uuid not null references public.profiles(id) on delete cascade,
  decision text not null check (decision in ('interested', 'pass')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (actor_id, target_id),
  check (actor_id <> target_id)
);

create index if not exists reactions_reverse_lookup_idx
  on public.reactions (target_id, actor_id, decision);

create table if not exists public.connections (
  id uuid primary key default gen_random_uuid(),
  user_low uuid not null references public.profiles(id) on delete cascade,
  user_high uuid not null references public.profiles(id) on delete cascade,
  connected_at timestamptz not null default now(),
  unique (user_low, user_high),
  check (user_low < user_high)
);

create index if not exists connections_user_low_idx on public.connections (user_low);
create index if not exists connections_user_high_idx on public.connections (user_high);

create table if not exists public.reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid not null references auth.users(id) on delete cascade,
  target_id uuid not null references auth.users(id) on delete cascade,
  reason text not null check (reason in ('harassment', 'false_information', 'unsafe_behavior', 'spam', 'other')),
  details text not null default '' check (char_length(details) <= 500),
  created_at timestamptz not null default now(),
  status text not null default 'open' check (status in ('open', 'reviewing', 'resolved')),
  check (reporter_id <> target_id)
);

create index if not exists reports_pair_idx on public.reports (reporter_id, target_id);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

drop trigger if exists reactions_set_updated_at on public.reactions;
create trigger reactions_set_updated_at
before update on public.reactions
for each row execute function public.set_updated_at();

alter table public.profiles enable row level security;
alter table public.reactions enable row level security;
alter table public.connections enable row level security;
alter table public.reports enable row level security;

drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own" on public.profiles
for select to authenticated using ((select auth.uid()) = id);

drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own" on public.profiles
for insert to authenticated with check ((select auth.uid()) = id);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own" on public.profiles
for update to authenticated
using ((select auth.uid()) = id)
with check ((select auth.uid()) = id);

drop policy if exists "profiles_delete_own" on public.profiles;
create policy "profiles_delete_own" on public.profiles
for delete to authenticated using ((select auth.uid()) = id);

drop policy if exists "reactions_select_own" on public.reactions;
create policy "reactions_select_own" on public.reactions
for select to authenticated using ((select auth.uid()) = actor_id);

drop policy if exists "connections_select_member" on public.connections;
create policy "connections_select_member" on public.connections
for select to authenticated
using ((select auth.uid()) = user_low or (select auth.uid()) = user_high);

drop policy if exists "reports_insert_own" on public.reports;
create policy "reports_insert_own" on public.reports
for insert to authenticated with check ((select auth.uid()) = reporter_id);

create or replace function public.get_birthday_candidates()
returns table (
  id uuid,
  nickname text,
  birthday_month smallint,
  birthday_day smallint,
  city_name text,
  bio text,
  celebration_style text,
  budget_level text,
  group_size text,
  activities text[],
  shared_activities text[],
  compatibility integer
)
language sql
stable
security definer
set search_path = ''
as $$
  with me as (
    select * from public.profiles where id = auth.uid() and onboarding_complete = true
  ), eligible as (
    select
      candidate.*,
      array(
        select unnest(candidate.activities)
        intersect
        select unnest(me.activities)
      ) as shared
    from public.profiles candidate
    cross join me
    where candidate.id <> me.id
      and candidate.visibility = 'active'
      and candidate.onboarding_complete = true
      and candidate.birthday_month = me.birthday_month
      and candidate.birthday_day = me.birthday_day
      and candidate.city_key = me.city_key
      and (me.group_preference = 'any' or (me.group_preference = 'women_only' and candidate.gender = 'woman') or (me.group_preference = 'men_only' and candidate.gender = 'man'))
      and (candidate.group_preference = 'any' or (candidate.group_preference = 'women_only' and me.gender = 'woman') or (candidate.group_preference = 'men_only' and me.gender = 'man'))
      and not exists (
        select 1 from public.reactions r where r.actor_id = me.id and r.target_id = candidate.id
      )
      and not exists (
        select 1 from public.connections c
        where (c.user_low = me.id and c.user_high = candidate.id)
           or (c.user_low = candidate.id and c.user_high = me.id)
      )
      and not exists (
        select 1 from public.reports report
        where (report.reporter_id = me.id and report.target_id = candidate.id)
           or (report.reporter_id = candidate.id and report.target_id = me.id)
      )
  )
  select
    eligible.id,
    eligible.nickname,
    eligible.birthday_month,
    eligible.birthday_day,
    eligible.city_name,
    eligible.bio,
    eligible.celebration_style,
    eligible.budget_level,
    eligible.group_size,
    eligible.activities,
    eligible.shared,
    least(
      100,
      20
      + case when eligible.celebration_style = me.celebration_style then 28 else 0 end
      + case when eligible.budget_level = me.budget_level or eligible.budget_level = 'flexible' or me.budget_level = 'flexible' then 20 else 0 end
      + case when eligible.group_size = me.group_size then 12 else 0 end
      + least(cardinality(eligible.shared) * 8, 32)
    )::integer as compatibility
  from eligible
  cross join me
  order by compatibility desc, eligible.created_at asc
  limit 30;
$$;

create or replace function public.respond_to_candidate(p_target_id uuid, p_decision text)
returns table (matched boolean, connection_id uuid)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_me public.profiles%rowtype;
  v_target public.profiles%rowtype;
  v_connection_id uuid;
  v_low uuid;
  v_high uuid;
begin
  if auth.uid() is null then
    raise exception 'authentication required';
  end if;
  if p_decision not in ('interested', 'pass') then
    raise exception 'invalid decision';
  end if;
  if p_target_id = auth.uid() then
    raise exception 'cannot react to self';
  end if;

  select * into v_me from public.profiles where id = auth.uid() and onboarding_complete = true;
  select * into v_target from public.profiles where id = p_target_id and onboarding_complete = true and visibility = 'active';

  if v_me.id is null or v_target.id is null
    or v_me.birthday_month <> v_target.birthday_month
    or v_me.birthday_day <> v_target.birthday_day
    or v_me.city_key <> v_target.city_key then
    raise exception 'candidate is not eligible';
  end if;

  if (v_me.group_preference = 'women_only' and v_target.gender <> 'woman')
    or (v_me.group_preference = 'men_only' and v_target.gender <> 'man')
    or (v_target.group_preference = 'women_only' and v_me.gender <> 'woman')
    or (v_target.group_preference = 'men_only' and v_me.gender <> 'man') then
    raise exception 'group preferences are not compatible';
  end if;

  if exists (
    select 1 from public.reports report
    where (report.reporter_id = v_me.id and report.target_id = v_target.id)
       or (report.reporter_id = v_target.id and report.target_id = v_me.id)
  ) then
    raise exception 'candidate is unavailable';
  end if;

  insert into public.reactions (actor_id, target_id, decision)
  values (v_me.id, v_target.id, p_decision)
  on conflict (actor_id, target_id)
  do update set decision = excluded.decision, updated_at = now();

  if p_decision = 'interested' and exists (
    select 1 from public.reactions
    where actor_id = v_target.id and target_id = v_me.id and decision = 'interested'
  ) then
    if v_me.id < v_target.id then
      v_low := v_me.id;
      v_high := v_target.id;
    else
      v_low := v_target.id;
      v_high := v_me.id;
    end if;

    insert into public.connections (user_low, user_high)
    values (v_low, v_high)
    on conflict (user_low, user_high) do nothing
    returning id into v_connection_id;

    if v_connection_id is null then
      select c.id into v_connection_id
      from public.connections c
      where c.user_low = v_low and c.user_high = v_high;
    end if;

    return query select true, v_connection_id;
    return;
  end if;

  return query select false, null::uuid;
end;
$$;

create or replace function public.get_my_connections()
returns table (
  id uuid,
  connected_at timestamptz,
  other_user_id uuid,
  nickname text,
  birthday_month smallint,
  birthday_day smallint,
  city_name text,
  contact_kind text,
  contact_value text
)
language sql
stable
security definer
set search_path = ''
as $$
  select
    c.id,
    c.connected_at,
    other.id,
    other.nickname,
    other.birthday_month,
    other.birthday_day,
    other.city_name,
    other.contact_kind,
    other.contact_value
  from public.connections c
  join public.profiles other
    on other.id = case when c.user_low = auth.uid() then c.user_high else c.user_low end
  where c.user_low = auth.uid() or c.user_high = auth.uid()
  order by c.connected_at desc;
$$;

revoke all on function public.get_birthday_candidates() from public;
revoke all on function public.respond_to_candidate(uuid, text) from public;
revoke all on function public.get_my_connections() from public;

grant execute on function public.get_birthday_candidates() to authenticated;
grant execute on function public.respond_to_candidate(uuid, text) to authenticated;
grant execute on function public.get_my_connections() to authenticated;

grant select, insert, update, delete on public.profiles to authenticated;
grant select on public.reactions to authenticated;
grant select on public.connections to authenticated;
grant insert on public.reports to authenticated;
