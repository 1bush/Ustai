-- ============================================
-- SHTESA: rezervime të përsëritura, certifikime, të preferuar
-- ============================================

-- Rezervim i përsëritur (Helpling-style: mban të njëjtin ofrues çdo javë/muaj)
alter table public.service_requests
  add column recurring_frequency text default 'none' check (recurring_frequency in ('none','weekly','biweekly','monthly'));

-- Certifikime/trajnime të ofruesit (Urban Company-style trust building)
alter table public.providers
  add column certifications text;

-- Ofruesit e preferuar të klientit (për "rezervo përsëri" të shpejtë)
create table public.favorites (
  client_id uuid references public.profiles(id) on delete cascade,
  provider_id uuid references public.providers(id) on delete cascade,
  created_at timestamptz default now(),
  primary key (client_id, provider_id)
);

alter table public.favorites enable row level security;

create policy "favorites_select_own" on public.favorites for select
  using (auth.uid() = client_id);
create policy "favorites_insert_own" on public.favorites for insert
  with check (auth.uid() = client_id);
create policy "favorites_delete_own" on public.favorites for delete
  using (auth.uid() = client_id);
