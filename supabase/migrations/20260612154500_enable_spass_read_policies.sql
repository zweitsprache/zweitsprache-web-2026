-- Ensure SPASS tables are readable from public pages (anon/authenticated).

alter table spass_gruppen enable row level security;
alter table spass_items enable row level security;
alter table spass_tipps enable row level security;

drop policy if exists "Allow read on spass_gruppen" on spass_gruppen;
drop policy if exists "Allow read on spass_items" on spass_items;
drop policy if exists "Allow read on spass_tipps" on spass_tipps;

create policy "Allow read on spass_gruppen"
  on spass_gruppen
  for select
  using (true);

create policy "Allow read on spass_items"
  on spass_items
  for select
  using (true);

create policy "Allow read on spass_tipps"
  on spass_tipps
  for select
  using (true);
