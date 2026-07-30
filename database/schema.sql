create extension if not exists pgcrypto;

create table if not exists app_users (
  id uuid primary key default gen_random_uuid(),
  email text not null check (char_length(email) between 3 and 320),
  password_hash text not null check (char_length(password_hash) >= 20),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists app_users_email_unique_idx on app_users (lower(email));

create table if not exists sessions (
  token_hash char(64) primary key,
  user_id uuid not null references app_users(id) on delete cascade,
  expires_at timestamptz not null,
  created_at timestamptz not null default now()
);

create index if not exists sessions_user_id_idx on sessions (user_id);
create index if not exists sessions_expires_at_idx on sessions (expires_at);

create table if not exists profiles (
  id uuid primary key references app_users(id) on delete cascade,
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
  on profiles (birthday_month, birthday_day, city_key)
  where visibility = 'active' and onboarding_complete = true;

create table if not exists reactions (
  actor_id uuid not null references profiles(id) on delete cascade,
  target_id uuid not null references profiles(id) on delete cascade,
  decision text not null check (decision in ('interested', 'pass')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (actor_id, target_id),
  check (actor_id <> target_id)
);

create index if not exists reactions_reverse_lookup_idx
  on reactions (target_id, actor_id, decision);

create table if not exists connections (
  id uuid primary key default gen_random_uuid(),
  user_low uuid not null references profiles(id) on delete cascade,
  user_high uuid not null references profiles(id) on delete cascade,
  connected_at timestamptz not null default now(),
  unique (user_low, user_high),
  check (user_low < user_high)
);

create index if not exists connections_user_low_idx on connections (user_low);
create index if not exists connections_user_high_idx on connections (user_high);

create table if not exists reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid not null references app_users(id) on delete cascade,
  target_id uuid not null references app_users(id) on delete cascade,
  reason text not null check (reason in ('harassment', 'false_information', 'unsafe_behavior', 'spam', 'other')),
  details text not null default '' check (char_length(details) <= 500),
  created_at timestamptz not null default now(),
  status text not null default 'open' check (status in ('open', 'reviewing', 'resolved')),
  check (reporter_id <> target_id)
);

create index if not exists reports_pair_idx on reports (reporter_id, target_id);

create or replace function set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists app_users_set_updated_at on app_users;
create trigger app_users_set_updated_at
before update on app_users
for each row execute function set_updated_at();

drop trigger if exists profiles_set_updated_at on profiles;
create trigger profiles_set_updated_at
before update on profiles
for each row execute function set_updated_at();

drop trigger if exists reactions_set_updated_at on reactions;
create trigger reactions_set_updated_at
before update on reactions
for each row execute function set_updated_at();
