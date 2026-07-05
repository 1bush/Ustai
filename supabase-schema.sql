-- ============================================
-- SHËRBIME SHTËPIAKE - Skema e databazës Supabase
-- Faza 1: pa pagesa/komision, thjesht lidhje klient-ofrues
-- ============================================

-- Profili i përdoruesit (both klientë dhe ofrues përdorin auth.users)
create table public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  full_name text not null,
  phone text,
  role text not null default 'client' check (role in ('client', 'provider', 'admin')),
  avatar_url text,
  created_at timestamptz default now()
);

-- Kategoritë e shërbimeve (hidraulikë, elektricistë, etj.)
create table public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  icon text, -- emoji ose emër ikone
  created_at timestamptz default now()
);

insert into public.categories (name, icon) values
  ('Hidraulikë', '🔧'),
  ('Elektricistë', '💡'),
  ('Kopshtarë', '🌿'),
  ('Pastrues', '🧹'),
  ('Piktorë', '🎨'),
  ('Marangozë', '🪚');

-- Profili i ofruesit të shërbimit (extend i profiles për providers)
create table public.providers (
  id uuid references public.profiles(id) on delete cascade primary key,
  category_id uuid references public.categories(id) not null,
  bio text,
  location text,
  city text default 'Tiranë',
  years_experience int,
  verified boolean default false,
  rating_avg numeric(2,1) default 0,
  rating_count int default 0,
  created_at timestamptz default now()
);

-- Kërkesat/rezervimet e shërbimit
create table public.service_requests (
  id uuid primary key default gen_random_uuid(),
  client_id uuid references public.profiles(id) not null,
  provider_id uuid references public.providers(id) not null,
  category_id uuid references public.categories(id) not null,
  description text not null,
  address text,
  preferred_date date,
  status text not null default 'pending' check (status in ('pending','accepted','declined','completed','cancelled')),
  created_at timestamptz default now()
);

-- Vlerësimet pas përfundimit të shërbimit
create table public.reviews (
  id uuid primary key default gen_random_uuid(),
  service_request_id uuid references public.service_requests(id) not null,
  provider_id uuid references public.providers(id) not null,
  client_id uuid references public.profiles(id) not null,
  rating int not null check (rating between 1 and 5),
  comment text,
  created_at timestamptz default now()
);

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================

alter table public.profiles enable row level security;
alter table public.providers enable row level security;
alter table public.service_requests enable row level security;
alter table public.reviews enable row level security;
alter table public.categories enable row level security;

-- Categories: publike, lexim i lirë
create policy "categories_read_all" on public.categories for select using (true);

-- Profiles: secili sheh/edito vetëm profilin e vet; të gjithë mund të shohin emrin publik të ofruesve
create policy "profiles_select_own" on public.profiles for select using (true);
create policy "profiles_update_own" on public.profiles for update using (auth.uid() = id);
create policy "profiles_insert_own" on public.profiles for insert with check (auth.uid() = id);

-- Providers: publik për lexim (klientët shfletojnë), edito vetëm nga vetë ofruesi
create policy "providers_select_all" on public.providers for select using (true);
create policy "providers_update_own" on public.providers for update using (auth.uid() = id);
create policy "providers_insert_own" on public.providers for insert with check (auth.uid() = id);

-- Service requests: klienti sheh të vetat, ofruesi sheh ato që i drejtohen atij
create policy "requests_select_own" on public.service_requests for select
  using (auth.uid() = client_id or auth.uid() = provider_id);
create policy "requests_insert_client" on public.service_requests for insert
  with check (auth.uid() = client_id);
create policy "requests_update_involved" on public.service_requests for update
  using (auth.uid() = client_id or auth.uid() = provider_id);

-- Reviews: lexim publik, shkrim vetëm nga klienti i kërkesës
create policy "reviews_select_all" on public.reviews for select using (true);
create policy "reviews_insert_client" on public.reviews for insert
  with check (auth.uid() = client_id);

-- Trigger: përditëso rating_avg te providers kur shtohet review
create or replace function update_provider_rating()
returns trigger as $$
begin
  update public.providers
  set rating_count = rating_count + 1,
      rating_avg = (
        select avg(rating)::numeric(2,1) from public.reviews where provider_id = new.provider_id
      )
  where id = new.provider_id;
  return new;
end;
$$ language plpgsql security definer;

create trigger on_review_created
  after insert on public.reviews
  for each row execute function update_provider_rating();
