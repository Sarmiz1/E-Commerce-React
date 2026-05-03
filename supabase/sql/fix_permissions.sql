-- Run this in your Supabase SQL Editor to fix the "Permission denied for view seller_public" error

GRANT SELECT ON TABLE public.seller_public TO anon, authenticated;

-- Also ensure the schema is accessible (usually it is, but just in case)
GRANT USAGE ON SCHEMA public TO anon, authenticated;
