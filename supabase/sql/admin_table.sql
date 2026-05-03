-- ═══════════════════════════════════════════════════════════════════════════════
-- ADMIN USERS TABLE
-- Roles: super_admin, support_lead, finance_manager, content_mod
-- ═══════════════════════════════════════════════════════════════════════════════

-- 1. Create a custom ENUM type for the 4 admin roles
CREATE TYPE public.admin_role AS ENUM (
    'super_admin',
    'support_lead',
    'finance_manager',
    'content_mod'
);

-- 2. Create the admin_users table
CREATE TABLE IF NOT EXISTS public.admin_users (
    id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email       TEXT NOT NULL,
    full_name   TEXT,
    role        public.admin_role NOT NULL,
    is_active   BOOLEAN DEFAULT true NOT NULL,
    created_at  TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at  TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Add a comment for documentation
COMMENT ON TABLE public.admin_users IS 'Admin team members with role-based access control';

-- 3. Enable Row Level Security (RLS)
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- ─── SECURITY POLICIES ───────────────────────────────────────────────────────

-- Every admin can view their own profile
CREATE POLICY "Admins can view own profile"
ON public.admin_users FOR SELECT
USING ( auth.uid() = id );

-- Super admins can view ALL admin users
CREATE POLICY "Super admins can view all"
ON public.admin_users FOR SELECT
USING (
    (SELECT role FROM public.admin_users WHERE id = auth.uid()) = 'super_admin'
);

-- Only super admins can insert new admin users
CREATE POLICY "Super admins can insert"
ON public.admin_users FOR INSERT
WITH CHECK (
    (SELECT role FROM public.admin_users WHERE id = auth.uid()) = 'super_admin'
);

-- Only super admins can update admin profiles (change roles, deactivate, etc.)
CREATE POLICY "Super admins can update"
ON public.admin_users FOR UPDATE
USING (
    (SELECT role FROM public.admin_users WHERE id = auth.uid()) = 'super_admin'
);

-- Only super admins can delete admin users
CREATE POLICY "Super admins can delete"
ON public.admin_users FOR DELETE
USING (
    (SELECT role FROM public.admin_users WHERE id = auth.uid()) = 'super_admin'
);

-- ─── AUTO-UPDATE TRIGGER ─────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.handle_admin_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_admin_users_updated
    BEFORE UPDATE ON public.admin_users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_admin_updated_at();

-- ─── SEED YOUR FIRST SUPER ADMIN ─────────────────────────────────────────────
-- Replace 'YOUR_AUTH_USER_UUID' with your actual auth.users UUID
-- and update the email/name accordingly.
--
-- INSERT INTO public.admin_users (id, email, full_name, role)
-- VALUES ('YOUR_AUTH_USER_UUID', 'sarmiz@woosho.ng', 'Sarmiz Okoye', 'super_admin');
