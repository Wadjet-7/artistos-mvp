-- ============================================================
-- ArtistOS Phase 17: Admin Panel
-- Run this in your Supabase SQL Editor
-- ============================================================

-- 1. Add is_admin column to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT false;

-- 2. Set Larry's account as admin (the test account)
UPDATE public.profiles SET is_admin = true WHERE email = 'larrywade.art@gmail.com';

-- 3. Admin RLS policies — admins can read ALL rows in key tables
-- This uses a helper function to check admin status

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
  SELECT COALESCE(
    (SELECT is_admin FROM public.profiles WHERE id = auth.uid()),
    false
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Profiles: admins can view all profiles
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
CREATE POLICY "Admins can view all profiles"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id OR public.is_admin());

-- Profiles: admins can update all profiles (change plans, toggle admin)
DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;
CREATE POLICY "Admins can update all profiles"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id OR public.is_admin());

-- Artworks: admins can view all artworks
DROP POLICY IF EXISTS "Admins can view all artworks" ON public.artworks;
CREATE POLICY "Admins can view all artworks"
  ON public.artworks FOR SELECT
  USING (auth.uid() = user_id OR public.is_admin());

-- Invoices: admins can view all invoices
DROP POLICY IF EXISTS "Admins can view all invoices" ON public.invoices;
CREATE POLICY "Admins can view all invoices"
  ON public.invoices FOR SELECT
  USING (auth.uid() = user_id OR public.is_admin());

-- Commissions: admins can view all commissions
DROP POLICY IF EXISTS "Admins can view all commissions" ON public.commissions;
CREATE POLICY "Admins can view all commissions"
  ON public.commissions FOR SELECT
  USING (auth.uid() = user_id OR public.is_admin());

-- Contracts: admins can view all contracts
DROP POLICY IF EXISTS "Admins can view all contracts" ON public.contracts;
CREATE POLICY "Admins can view all contracts"
  ON public.contracts FOR SELECT
  USING (auth.uid() = user_id OR public.is_admin());

-- Viewing rooms: admins can view all
DROP POLICY IF EXISTS "Admins can view all viewing rooms" ON public.viewing_rooms;
CREATE POLICY "Admins can view all viewing rooms"
  ON public.viewing_rooms FOR SELECT
  USING (auth.uid() = user_id OR public.is_admin());

-- Consignments: admins can view all
DROP POLICY IF EXISTS "Admins can view all consignments" ON public.consignments;
CREATE POLICY "Admins can view all consignments"
  ON public.consignments FOR SELECT
  USING (auth.uid() = user_id OR public.is_admin());

-- Exhibitions: admins can view all
DROP POLICY IF EXISTS "Admins can view all exhibitions" ON public.exhibitions;
CREATE POLICY "Admins can view all exhibitions"
  ON public.exhibitions FOR SELECT
  USING (auth.uid() = user_id OR public.is_admin());

-- Contacts: admins can view all
DROP POLICY IF EXISTS "Admins can view all contacts" ON public.contacts;
CREATE POLICY "Admins can view all contacts"
  ON public.contacts FOR SELECT
  USING (auth.uid() = user_id OR public.is_admin());

-- Scheduled posts: admins can view all
DROP POLICY IF EXISTS "Admins can view all scheduled posts" ON public.scheduled_posts;
CREATE POLICY "Admins can view all scheduled posts"
  ON public.scheduled_posts FOR SELECT
  USING (auth.uid() = user_id OR public.is_admin());

-- Expenses: admins can view all
DROP POLICY IF EXISTS "Admins can view all expenses" ON public.expenses;
CREATE POLICY "Admins can view all expenses"
  ON public.expenses FOR SELECT
  USING (auth.uid() = user_id OR public.is_admin());
