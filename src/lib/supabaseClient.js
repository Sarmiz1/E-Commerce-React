// ─── Shared Supabase client ─────────────────────────────────────────────────
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = (import.meta.env.VITE_SUPABASE_URL ?? "").trim();
const supabaseKey = (
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ??
  import.meta.env.VITE_SUPABASE_ANON_KEY ??
  ""
).trim();

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseKey);
export const supabaseConfigError =
  "Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY or VITE_SUPABASE_ANON_KEY.";

if (!isSupabaseConfigured) {
  const message = `[Supabase] ${supabaseConfigError}`;
  if (import.meta.env.DEV) {
    console.warn(`${message} Check your local .env file.`);
  } else {
    console.error(`${message} Check the deployment environment variables.`);
  }
}

export const supabase = createClient(
  isSupabaseConfigured ? supabaseUrl : "https://placeholder.supabase.co",
  isSupabaseConfigured ? supabaseKey : "missing-supabase-public-key",
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
    // NOTE: Do NOT add a custom fetch with AbortController here.
    // it interferes with Supabase's internal auth token refresh flow
    // and causes "DOMException: The operation was aborted" errors.
  },
);

// ------------------------------------------------------------------
// RLS HELPER (safe to include in client file, won't execute on its own)
// ------------------------------------------------------------------

export const createRLSSafetyWrapper = (policySql) => {
  return `
    -- ======================================================
    -- SECURITY POLICY FOR ${policySql.split("ON")[1].split("FOR")[0].trim()}
    -- ======================================================
    -- NOTE: Insert, update, or delete operations below will fail
    -- at the database level if you do NOT have a valid policy.
    -- This wrapper is here ONLY to satisfy the UI requirements
    -- by preventing the UI from sending unauthorized requests.
    --
    -- Actual enforcement is handled by PostgreSQL Row Level Security.
    
    ${policySql}
  `;
};
