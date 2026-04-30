-- Base tables: angebote, durchfuehrungen, termine
-- Note: 20260326120000 renames angebote -> workshops and angebot_id -> workshop_id.
-- This migration must run first so that rename migration can succeed on a fresh DB.

create table if not exists angebote (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  subtitle text,
  created_at timestamptz not null default now()
);

create table if not exists durchfuehrungen (
  id uuid primary key default gen_random_uuid(),
  angebot_id uuid not null references angebote(id) on delete cascade,
  created_at timestamptz not null default now()
);

create table if not exists termine (
  id uuid primary key default gen_random_uuid(),
  durchfuehrung_id uuid not null references durchfuehrungen(id) on delete cascade,
  start_datetime timestamptz not null,
  end_datetime timestamptz not null,
  created_at timestamptz not null default now()
);

-- Enable RLS
alter table angebote enable row level security;
alter table durchfuehrungen enable row level security;
alter table termine enable row level security;

-- Policies (angebote policy is renamed to "Allow all on workshops" in 20260326120000)
create policy "Allow all on angebote" on angebote for all using (true) with check (true);
create policy "Allow all on durchfuehrungen" on durchfuehrungen for all using (true) with check (true);
create policy "Allow all on termine" on termine for all using (true) with check (true);

-- Index (dropped and recreated with new name in 20260326120000)
create index idx_durchfuehrungen_angebot_id on durchfuehrungen(angebot_id);
