-- Workshops table
create table workshops (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  subtitle text,
  about text,
  created_at timestamptz not null default now()
);

-- Durchführungen table (children of Workshops, 1:n)
create table durchfuehrungen (
  id uuid primary key default gen_random_uuid(),
  workshop_id uuid not null references workshops(id) on delete cascade,
  ort text,
  created_at timestamptz not null default now()
);

-- Termine table (children of Durchführungen, 1:n)
create table termine (
  id uuid primary key default gen_random_uuid(),
  durchfuehrung_id uuid not null references durchfuehrungen(id) on delete cascade,
  start_datetime timestamptz not null,
  end_datetime timestamptz not null,
  created_at timestamptz not null default now()
);

-- Lernziele table (children of Workshops, 1:n)
create table lernziele (
  id uuid primary key default gen_random_uuid(),
  workshop_id uuid not null references workshops(id) on delete cascade,
  text text not null,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

-- Inhalte table (children of Workshops, 1:n)
create table inhalte (
  id uuid primary key default gen_random_uuid(),
  workshop_id uuid not null references workshops(id) on delete cascade,
  text text not null,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

-- Voraussetzungen table (children of Workshops, 1:n)
create table voraussetzungen (
  id uuid primary key default gen_random_uuid(),
  workshop_id uuid not null references workshops(id) on delete cascade,
  text text not null,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

-- Enable RLS
alter table workshops enable row level security;
alter table durchfuehrungen enable row level security;
alter table termine enable row level security;
alter table lernziele enable row level security;
alter table inhalte enable row level security;
alter table voraussetzungen enable row level security;

-- Allow public read/write for now (adjust for auth later)
create policy "Allow all on workshops" on workshops for all using (true) with check (true);
create policy "Allow all on durchfuehrungen" on durchfuehrungen for all using (true) with check (true);
create policy "Allow all on termine" on termine for all using (true) with check (true);
create policy "Allow all on lernziele" on lernziele for all using (true) with check (true);
create policy "Allow all on inhalte" on inhalte for all using (true) with check (true);
create policy "Allow all on voraussetzungen" on voraussetzungen for all using (true) with check (true);

create index idx_lernziele_workshop_id on lernziele(workshop_id);
create index idx_inhalte_workshop_id on inhalte(workshop_id);
create index idx_voraussetzungen_workshop_id on voraussetzungen(workshop_id);
create index idx_durchfuehrungen_workshop_id on durchfuehrungen(workshop_id);

-- Flat view for JetEngine listings: one row per Durchführung
create or replace view durchfuehrungen_flat as
select
  d.id as durchfuehrung_id,
  a.id as workshop_id,
  a.title as workshop_title,
  d.created_at,
  t.next_start,
  t.next_end,
  t.termin_count
from durchfuehrungen d
join workshops a on a.id = d.workshop_id
left join lateral (
  select
    min(start_datetime) filter (where start_datetime >= now()) as next_start,
    min(end_datetime) filter (where start_datetime >= now()) as next_end,
    count(*)::int as termin_count
  from termine
  where durchfuehrung_id = d.id
) t on true
order by t.next_start asc nulls last;

-- Pages table for Puck page builder
create table pages (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  data jsonb not null default '{}'::jsonb,
  published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Enable RLS
alter table pages enable row level security;

-- Allow public read/write for now (adjust for auth later)
create policy "Allow all on pages" on pages for all using (true) with check (true);

-- Auto-update updated_at on change
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger pages_updated_at
  before update on pages
  for each row
  execute function update_updated_at();

-- Courses table
create table courses (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  subtitle text,
  about text,
  cover_image_url text,
  published boolean not null default false,
  created_at timestamptz not null default now()
);

-- Modules table (children of Courses, 1:n)
create table modules (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references courses(id) on delete cascade,
  title text not null,
  description text,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

-- Module Lernziele table (children of Modules, 1:n)
create table module_lernziele (
  id uuid primary key default gen_random_uuid(),
  module_id uuid not null references modules(id) on delete cascade,
  text text not null,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

-- Lessons table (children of Modules, 1:n)
create table lessons (
  id uuid primary key default gen_random_uuid(),
  module_id uuid not null references modules(id) on delete cascade,
  title text not null,
  data jsonb,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

-- Indexes
create index idx_modules_course_id on modules(course_id);
create index idx_module_lernziele_module_id on module_lernziele(module_id);
create index idx_lessons_module_id on lessons(module_id);

-- Enable RLS
alter table courses enable row level security;
alter table modules enable row level security;
alter table module_lernziele enable row level security;
alter table lessons enable row level security;

-- Permissive policies (same pattern as existing tables)
create policy "Allow all on courses" on courses for all using (true) with check (true);
create policy "Allow all on modules" on modules for all using (true) with check (true);
create policy "Allow all on module_lernziele" on module_lernziele for all using (true) with check (true);
create policy "Allow all on lessons" on lessons for all using (true) with check (true);
