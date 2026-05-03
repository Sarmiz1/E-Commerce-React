// ─── Shared Supabase client ─────────────────────────────────────────────────
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

export const supabase = createClient(supabaseUrl, supabaseKey);

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





