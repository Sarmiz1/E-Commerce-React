import { supabase } from "../lib/supabaseClient";

export const accountApi = {
  getRole: async (userId) => {
    const { data, error } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", userId)
      .maybeSingle();

    if (error) throw error;

    return data?.role ?? null;
  },

  setRole: async (requestedRole) => {
    const { data, error } = await supabase.rpc("set_public_account_role", {
      requested_role: requestedRole,
    });

    if (error) throw error;

    return data;
  },

  completeSellerOnboarding: async (onboardingData) => {
    const { data, error } = await supabase.rpc("complete_seller_onboarding", {
      seller_onboarding_data: onboardingData,
    });

    if (error) throw error;

    return data;
  },
};
