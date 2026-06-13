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
const readErrorContext = async (context) => {
  if (!context) return null;
  if (typeof context.json === "function") return context.json();
  if (typeof context.text === "function") {
    const text = await context.text();
    try {
      return JSON.parse(text);
    } catch {
      return { message: text };
    }
  }
  if (typeof context === "object") return context;
  return null;
};

export const handleResponse = async (queryPromise) => {
  const { data, error } = await queryPromise;

  if (error) {
    console.error("Supabase API Error:", error);
    if (error.context) {
      try {
        const details = await readErrorContext(error.context);
        throw new Error(details?.error || details?.message || error.message || "Supabase Request failed");
      } catch (contextError) {
        if (contextError?.message && contextError.message !== "Unexpected end of JSON input") {
          throw contextError;
        }
      }
    }
    // Mimic the old axios error format 
    throw new Error(error.message || error.details || "Supabase Request failed");
  }

  return data;
};


// Simplified

// export const handleResponse = async (queryPromise) => {
//   const { data, error } = await queryPromise;

//   if (error) {
//     throw new Error(error.message || "Request failed");
//   }

//   return data;
// };
