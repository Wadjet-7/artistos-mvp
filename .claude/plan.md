# Phase 1: Wire Up Supabase Backend (Auth + Portfolio)

## Overview
Replace fake auth and mock portfolio data with real Supabase backend. All other pages continue using mock data unchanged.

---

## Prerequisites (User must do manually)

1. **Create a Supabase project** at https://supabase.com
2. **Copy the Project URL and Anon Key** from Settings > API
3. **Create a Storage Bucket** called `artworks` (public, 25MB file limit, allowed MIME: image/jpeg, image/png, image/tiff, image/webp)
4. **Run the SQL** (provided below) in the Supabase SQL Editor to create tables and policies

---

## Implementation Steps

### Step 1: Install Supabase SDK
- Add `@supabase/supabase-js` to package.json dependencies
- User runs `npm install`

### Step 2: Create Supabase Client (`src/lib/supabase.js`)
- New file that initializes the Supabase client using `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` environment variables
- Create `.env` file with placeholder values for the user to fill in

### Step 3: Create Database Schema (SQL)
**`profiles` table** (extends auth.users):
- `id` (uuid, FK to auth.users)
- `name`, `email`, `initials`, `plan`, `avatar_url`
- `bio`, `website`, `medium`, `style`, `location`
- RLS: users can read/update only their own profile
- Trigger: auto-create profile on user signup

**`artworks` table**:
- `id` (uuid, auto-generated)
- `user_id` (uuid, FK to profiles)
- `title`, `medium`, `tag`, `price`, `status`, `dimensions`
- `image_url` (nullable — stores Supabase Storage public URL)
- `seed` (integer — kept as fallback for artworks without images)
- `created_at`, `updated_at`
- RLS: users can CRUD only their own artworks

**Storage policies** for `artworks` bucket:
- Authenticated users can upload to their own folder (`user_id/filename`)
- Public read access for all artwork images

### Step 4: Rewrite AuthContext (`src/context/AuthContext.jsx`)
- Replace localStorage-based auth with Supabase auth
- `signup()` → `supabase.auth.signUp()` + insert profile
- `login()` → `supabase.auth.signInWithPassword()`
- `logout()` → `supabase.auth.signOut()`
- `updateUser()` → update profiles table
- Listen to `onAuthStateChange` for session management
- Load profile data from `profiles` table on auth state change
- Keep the same context API shape: `{ user, login, signup, logout, updateUser }`
- `user` object retains same shape: `{ name, email, initials, plan, avatar, id }`

### Step 5: Update Login Page (`src/pages/Login.jsx`)
- `login()` now returns a promise — add `await` and error handling
- Display real Supabase error messages (wrong password, no account, etc.)
- Remove fake `setTimeout` delay

### Step 6: Update Signup Page (`src/pages/Signup.jsx`)
- `signup()` now returns a promise — add `await` and error handling
- Display real Supabase error messages (email taken, weak password, etc.)
- Remove fake `setTimeout` delay

### Step 7: Rewrite Portfolio Page (`src/pages/Portfolio.jsx`)
- **Data loading**: Replace `useState(initialArtworks)` with `useEffect` that fetches from Supabase `artworks` table
- **Add loading state**: Show skeleton/spinner while fetching
- **Real file upload**: Add `<input type="file">` to the upload drop zone, handle file selection and drag-and-drop
- **Form submission**: "Add Artwork" button now:
  1. Uploads image to Supabase Storage (`artworks/{user_id}/{filename}`)
  2. Gets the public URL
  3. Inserts a row into the `artworks` table
  4. Refreshes the artwork list
- **Image display**: ArtworkCard shows real image via `<img>` when `image_url` exists, falls back to canvas `paintAbstract` when only `seed` exists
- **Delete artwork**: Add delete functionality (optional, nice-to-have)
- Keep all existing UI (filter pills, hover overlays, badges) exactly the same

### Step 8: Update Settings Page (`src/pages/Settings.jsx`)
- Load profile data from Supabase `profiles` table
- "Save changes" → update profiles table via Supabase
- All fields (bio, website, medium, style, location) now persist

### Step 9: Seed Initial Data
- Provide SQL insert for the 5 mock artworks so the portfolio isn't empty
- These artworks will use `seed` field (no image_url) and render via canvas fallback

### Step 10: Update Layout.jsx
- Use user's real first name in the dashboard greeting (already does this, but verify it works with Supabase user)

---

## Files Changed

| File | Action | Description |
|---|---|---|
| `package.json` | EDIT | Add @supabase/supabase-js dependency |
| `.env` | NEW | Supabase URL + anon key |
| `src/lib/supabase.js` | NEW | Supabase client initialization |
| `src/context/AuthContext.jsx` | REWRITE | Supabase auth + profile loading |
| `src/pages/Login.jsx` | EDIT | Async login, real error messages |
| `src/pages/Signup.jsx` | EDIT | Async signup, real error messages |
| `src/pages/Portfolio.jsx` | REWRITE | Real DB queries + file uploads |
| `src/pages/Settings.jsx` | EDIT | Profile persistence to Supabase |

**Files NOT changed**: All other pages, Sidebar, Layout, Modal, mockData.js, App.jsx, index.css, tailwind.config.js

---

## SQL Schema (to run in Supabase SQL Editor)

```sql
-- Profiles table
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

-- Auto-create profile on signup
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

-- Artworks table
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
```

---

## Verification Plan

1. Start dev server — no compilation errors
2. Visit signup page — create real account with email/password
3. Verify redirect to dashboard with real user name
4. Navigate to Portfolio — see seeded artworks (canvas fallback)
5. Click "Add Artwork" — fill form, upload a JPG image
6. Verify artwork appears in grid with real image
7. Refresh page — artwork persists (database-backed)
8. Navigate to Settings — update bio, save, refresh, verify it persists
9. Logout — verify redirect to login
10. Login with same credentials — verify dashboard shows real name
11. Check all other pages still work with mock data (no regressions)
