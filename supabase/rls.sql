alter table profiles enable row level security;
alter table sessions enable row level security;
alter table signal_observations enable row level security;
alter table vault_entries enable row level security;
alter table couples enable row level security;

drop policy if exists "Own profile" on profiles;
create policy "Own profile" on profiles for all using (auth.uid() = id);

drop policy if exists "Couple sessions" on sessions;
create policy "Couple sessions" on sessions
for all
using (
  couple_id in (
    select id from couples
    where partner_a_id = auth.uid() or partner_b_id = auth.uid()
  )
);

drop policy if exists "Couple vault" on vault_entries;
create policy "Couple vault" on vault_entries
for all
using (
  couple_id in (
    select id from couples
    where partner_a_id = auth.uid() or partner_b_id = auth.uid()
  )
);

drop policy if exists "Couple signal observations" on signal_observations;
create policy "Couple signal observations" on signal_observations
for all
using (
  couple_id in (
    select id from couples
    where partner_a_id = auth.uid() or partner_b_id = auth.uid()
  )
);

drop policy if exists "Couple access" on couples;
create policy "Couple access" on couples
for all
using (partner_a_id = auth.uid() or partner_b_id = auth.uid());
