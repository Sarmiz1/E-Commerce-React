import { supabase } from "../../../lib/supabaseClient";
import { getFallbackCareerForm } from "../data/careerApplicationData";

const supabaseUrl = (import.meta.env.VITE_SUPABASE_URL ?? "").trim();
const supabaseKey = (
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY
  ?? import.meta.env.VITE_SUPABASE_ANON_KEY
  ?? ""
).trim();

async function runRpc(name, args, timeoutMs = 3_500) {
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), timeoutMs);

  try {
    const request = supabase.rpc(name, args);
    const { data, error } = await request.abortSignal(controller.signal);
    if (error) throw error;
    return data;
  } finally {
    window.clearTimeout(timeout);
  }
}

export const careersApi = {
  getOpenings: async () => {
    try {
      const openings = await runRpc("get_public_career_openings");
      return {
        roles: Array.isArray(openings) ? openings : [],
        unavailable: false,
      };
    } catch {
      return {
        roles: [],
        unavailable: true,
      };
    }
  },
  getForm: async (jobId) => {
    try {
      return await runRpc("get_public_career_form", { selected_job_id: jobId || null });
    } catch {
      return getFallbackCareerForm(jobId);
    }
  },
  submitApplication: async ({ values, cv, coverLetter, onProgress }) => {
    const { default: axios } = await import("axios");
    const body = new FormData();
    body.append("application", JSON.stringify(values));
    body.append("cv", cv);
    body.append("coverLetter", coverLetter);

    try {
      const response = await axios.post(`${supabaseUrl}/functions/v1/careers-application`, body, {
        headers: { apikey: supabaseKey },
        onUploadProgress: (event) => {
          if (!event.total) return;
          onProgress?.(Math.min(100, Math.round((event.loaded / event.total) * 100)));
        },
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || error.message || "Application could not be submitted");
    }
  },
};
