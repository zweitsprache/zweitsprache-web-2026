-- Gruppen (5 Stück: Selbstgesteuert, Produktiv, ...)
create table spass_gruppen (
  id smallint primary key,
  kuerzel char(2) not null,
  titel text not null,
  beschreibung text not null,
  sortierung smallint not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Items (23 Aussagen, verteilt auf die Gruppen)
create table spass_items (
  id integer primary key,
  gruppe_id smallint not null references spass_gruppen(id) on delete cascade,
  item text not null,
  sortierung smallint not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_spass_items_gruppe on spass_items(gruppe_id);

-- Tipps (je ~50 pro Item, Ziel: 1000 total)
create table spass_tipps (
  id bigserial primary key,
  item_id integer not null references spass_items(id) on delete cascade,
  nr smallint not null,
  kurztitel text not null,
  grundlage text not null,
  wirkung text not null,
  umsetzung text not null,
  praxisbeispiel text,
  wichtig text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint uq_spass_tipps_item_nr unique (item_id, nr)
);

create index idx_spass_tipps_item on spass_tipps(item_id);

-- Enable RLS
alter table spass_gruppen enable row level security;
alter table spass_items enable row level security;
alter table spass_tipps enable row level security;

-- Permissive policies (same pattern as existing tables)
create policy "Allow all on spass_gruppen" on spass_gruppen for all using (true) with check (true);
create policy "Allow all on spass_items" on spass_items for all using (true) with check (true);
create policy "Allow all on spass_tipps" on spass_tipps for all using (true) with check (true);
