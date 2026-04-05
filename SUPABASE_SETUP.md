# Supabase shared calendar setup

## Chosen backend
- Supabase free tier
- Why: simplest real hosted Postgres + REST option for a 2-person shared calendar, generous enough for light personal use, and easy to wire from Vite without standing up a custom server.

## What is implemented in code
- `useCalendarStorage` no longer assumes `localStorage` directly.
- A calendar store abstraction now sits in `src/services/calendarStore.ts`.
- `local` mode keeps the current single-device behavior.
- `supabase` mode is scaffolded to:
  - load shared day payloads from `calendar_days`
  - upsert updated day payloads back to Supabase
  - keep a local cache so the UI still works during setup
- No live credentials are included.

## Environment variables
Copy `.env.example` to `.env.local` and fill:

```bash
VITE_SYNC_PROVIDER=supabase
VITE_SHARED_CALENDAR_SLUG=family-two-person
VITE_SHARED_CALENDAR_NAME=우리 가족 캘린더
VITE_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
```

## SQL schema
Run this in Supabase SQL editor:

```sql
create table if not exists public.calendar_days (
  calendar_slug text not null,
  date date not null,
  payload jsonb not null,
  updated_at timestamptz not null default timezone('utc', now()),
  primary key (calendar_slug, date)
);

create index if not exists calendar_days_calendar_slug_idx
  on public.calendar_days (calendar_slug);

alter table public.calendar_days enable row level security;

create policy "calendar_days_select_shared"
on public.calendar_days
for select
using (true);

create policy "calendar_days_upsert_shared"
on public.calendar_days
for insert
with check (true);

create policy "calendar_days_update_shared"
on public.calendar_days
for update
using (true)
with check (true);
```

## Important note about auth
Current login/register is still local-browser auth.
That means the new remote data layer is ready, but true two-device two-user account management still needs one human decision:

### Option A: simplest next step
- keep using the local auth screen for demos/testing
- manually create one account per browser/device
- use the same `VITE_SHARED_CALENDAR_SLUG`
- both users share the same remote calendar data

### Option B: production-worthy next step
- migrate auth to Supabase Auth
- then use authenticated RLS instead of the open shared-table policy above

## Security caveat

- With the SQL policy above, the table is effectively shared by slug plus deployed frontend access.
- That is acceptable for low-risk personal testing, but not for sensitive calendars or public multi-user production use.
- If you need stronger guarantees, switch to Supabase Auth plus authenticated RLS before launch.

For a practical 2-user free-tier MVP, Option A is enough to verify shared syncing quickly.

## Recommended first live test
1. Create Supabase project
2. Run the SQL above
3. Fill `.env.local`
4. Start app on device A and B with the same env values
5. Register/login separately on each device
6. Add an event on A
7. Refresh B and verify the event appears from the shared calendar

## Current limitation
- Remote reads happen on load and writes happen on save.
- There is no live websocket subscription yet.
- If you want true real-time cross-tab/device updates without refresh, add Supabase Realtime later.
