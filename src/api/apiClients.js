// src/api/apiClients.js

/**
 * ============================================================================
 * SUPABASE GLOBAL RESPONSE HANDLER
 * ============================================================================
 * Supabase returns responses as { data, error }. 
 * The rest of this React codebase was built to expect direct arrays/objects,
 * and to `catch()` standard JS Errors (from Axios).
 * 
 * This wrapper bridges the gap. It unwraps the Supabase `data` on success,
 * and cleanly throws a real Javascript `Error` if the DB query fails.
 */
export const handleResponse = async (queryPromise) => {
  const { data, error } = await queryPromise;

  if (error) {
    console.error("Supabase API Error:", error);
    // Mimic the old axios error format 
    throw new Error(error.message || error.details || "Supabase Request failed");
  }

  return data;
};