-- Shared calendar foundation for a free-tier Supabase project.
-- Apply after creating a new Supabase project.

create extension if not exists pgcrypto;

create table if not exists public.calendars (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  owner_user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.calendar_members (
  id uuid primary key default gen_random_uuid(),
  calendar_id uuid not null references public.calendars(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null check (role in ('owner', 'editor', 'viewer')) default 'editor',
  created_at timestamptz not null default timezone('utc', now()),
  unique (calendar_id, user_id)
);

create table if not exists public.calendar_events (
  id uuid primary key default gen_random_uuid(),
  calendar_id uuid not null references public.calendars(id) on delete cascade,
  event_date date not null,
  title text not null,
  description text,
  time_label text,
  is_all_day boolean not null default false,
  visibility text not null default 'calendar' check (visibility in ('calendar', 'private')),
  owner_user_id uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.daily_todos (
  id uuid primary key default gen_random_uuid(),
  calendar_id uuid not null references public.calendars(id) on delete cascade,
  todo_date date not null,
  text text not null,
  completed boolean not null default false,
  owner_user_id uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.day_moods (
  id uuid primary key default gen_random_uuid(),
  calendar_id uuid not null references public.calendars(id) on delete cascade,
  mood_date date not null,
  mood text not null,
  owner_user_id uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists idx_calendar_events_calendar_date on public.calendar_events(calendar_id, event_date);
create index if not exists idx_daily_todos_calendar_date on public.daily_todos(calendar_id, todo_date);
create index if not exists idx_day_moods_calendar_date on public.day_moods(calendar_id, mood_date);

alter table public.calendars enable row level security;
alter table public.calendar_members enable row level security;
alter table public.calendar_events enable row level security;
alter table public.daily_todos enable row level security;
alter table public.day_moods enable row level security;

create policy "calendar members can view calendars"
on public.calendars for select
using (
  exists (
    select 1 from public.calendar_members m
    where m.calendar_id = calendars.id and m.user_id = auth.uid()
  )
  or owner_user_id = auth.uid()
);

create policy "calendar owner can insert calendars"
on public.calendars for insert
with check (owner_user_id = auth.uid());

create policy "calendar owner can update calendars"
on public.calendars for update
using (owner_user_id = auth.uid())
with check (owner_user_id = auth.uid());

create policy "members can view membership"
on public.calendar_members for select
using (
  user_id = auth.uid()
  or exists (
    select 1 from public.calendars c
    where c.id = calendar_members.calendar_id and c.owner_user_id = auth.uid()
  )
);

create policy "owner can manage members"
on public.calendar_members for all
using (
  exists (
    select 1 from public.calendars c
    where c.id = calendar_members.calendar_id and c.owner_user_id = auth.uid()
  )
)
with check (
  exists (
    select 1 from public.calendars c
    where c.id = calendar_members.calendar_id and c.owner_user_id = auth.uid()
  )
);

create policy "members can read events"
on public.calendar_events for select
using (
  exists (
    select 1 from public.calendar_members m
    where m.calendar_id = calendar_events.calendar_id and m.user_id = auth.uid()
  )
  or exists (
    select 1 from public.calendars c
    where c.id = calendar_events.calendar_id and c.owner_user_id = auth.uid()
  )
);

create policy "editors can write events"
on public.calendar_events for all
using (
  exists (
    select 1 from public.calendar_members m
    where m.calendar_id = calendar_events.calendar_id and m.user_id = auth.uid() and m.role in ('owner', 'editor')
  )
  or exists (
    select 1 from public.calendars c
    where c.id = calendar_events.calendar_id and c.owner_user_id = auth.uid()
  )
)
with check (
  exists (
    select 1 from public.calendar_members m
    where m.calendar_id = calendar_events.calendar_id and m.user_id = auth.uid() and m.role in ('owner', 'editor')
  )
  or exists (
    select 1 from public.calendars c
    where c.id = calendar_events.calendar_id and c.owner_user_id = auth.uid()
  )
);

create policy "members can read todos"
on public.daily_todos for select
using (
  exists (
    select 1 from public.calendar_members m
    where m.calendar_id = daily_todos.calendar_id and m.user_id = auth.uid()
  )
  or exists (
    select 1 from public.calendars c
    where c.id = daily_todos.calendar_id and c.owner_user_id = auth.uid()
  )
);

create policy "editors can write todos"
on public.daily_todos for all
using (
  exists (
    select 1 from public.calendar_members m
    where m.calendar_id = daily_todos.calendar_id and m.user_id = auth.uid() and m.role in ('owner', 'editor')
  )
  or exists (
    select 1 from public.calendars c
    where c.id = daily_todos.calendar_id and c.owner_user_id = auth.uid()
  )
)
with check (
  exists (
    select 1 from public.calendar_members m
    where m.calendar_id = daily_todos.calendar_id and m.user_id = auth.uid() and m.role in ('owner', 'editor')
  )
  or exists (
    select 1 from public.calendars c
    where c.id = daily_todos.calendar_id and c.owner_user_id = auth.uid()
  )
);

create policy "members can read moods"
on public.day_moods for select
using (
  exists (
    select 1 from public.calendar_members m
    where m.calendar_id = day_moods.calendar_id and m.user_id = auth.uid()
  )
  or exists (
    select 1 from public.calendars c
    where c.id = day_moods.calendar_id and c.owner_user_id = auth.uid()
  )
);

create policy "editors can write moods"
on public.day_moods for all
using (
  exists (
    select 1 from public.calendar_members m
    where m.calendar_id = day_moods.calendar_id and m.user_id = auth.uid() and m.role in ('owner', 'editor')
  )
  or exists (
    select 1 from public.calendars c
    where c.id = day_moods.calendar_id and c.owner_user_id = auth.uid()
  )
)
with check (
  exists (
    select 1 from public.calendar_members m
    where m.calendar_id = day_moods.calendar_id and m.user_id = auth.uid() and m.role in ('owner', 'editor')
  )
  or exists (
    select 1 from public.calendars c
    where c.id = day_moods.calendar_id and c.owner_user_id = auth.uid()
  )
);
