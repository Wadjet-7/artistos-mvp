-- ============================================================
-- ArtistOS Supabase Schema
-- Run this in your Supabase SQL Editor (supabase.com > SQL Editor)
-- ============================================================

-- 1. Profiles table (extends auth.users)
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  name text not null default '',
  email text not null default '',
  initials text not null default '',
  plan text not null default 'Starter',
  avatar_url text,
  bio text default '',
  website text default '',
  medium text default '',
  style text default '',
  location text default '',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.profiles enable row level security;

create policy "Users can view own profile"
  on public.profiles for select using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update using (auth.uid() = id);

create policy "Users can insert own profile"
  on public.profiles for insert with check (auth.uid() = id);

-- 2. Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, name, email, initials)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', ''),
    new.email,
    coalesce(new.raw_user_meta_data->>'initials', '')
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 3. Artworks table
create table public.artworks (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  title text not null,
  medium text not null default 'Oil on Canvas',
  tag text not null default '',
  price integer not null default 0,
  status text not null default 'Available',
  dimensions text default '',
  image_url text,
  seed integer,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.artworks enable row level security;

create policy "Users can view own artworks"
  on public.artworks for select using (auth.uid() = user_id);

create policy "Users can insert own artworks"
  on public.artworks for insert with check (auth.uid() = user_id);

create policy "Users can update own artworks"
  on public.artworks for update using (auth.uid() = user_id);

create policy "Users can delete own artworks"
  on public.artworks for delete using (auth.uid() = user_id);

-- 4. Updated_at trigger
create or replace function public.update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger profiles_updated_at
  before update on public.profiles
  for each row execute procedure public.update_updated_at();

create trigger artworks_updated_at
  before update on public.artworks
  for each row execute procedure public.update_updated_at();
