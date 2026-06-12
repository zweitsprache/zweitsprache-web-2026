-- Ensure API roles can read SPASS tables.

grant usage on schema public to anon, authenticated;

grant select on table public.spass_gruppen to anon, authenticated;
grant select on table public.spass_items to anon, authenticated;
grant select on table public.spass_tipps to anon, authenticated;
