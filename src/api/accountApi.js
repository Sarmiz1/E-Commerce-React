import { supabase } from "../lib/supabaseClient";

export const accountApi = {
  getStatus: async () => {
    const { data, error } = await supabase.rpc("get_customer_account_status");

    if (error) throw error;

    return data;
  },

  requestReactivation: async () => {
    const { data, error } = await supabase.rpc("request_buyer_account_reactivation");

    if (error) throw error;

    return data;
  },

  rejectInactiveBuyerSession: async () => {
    const status = await accountApi.getStatus();

    if (!status || status.isAdmin || status.role !== "buyer" || status.accountStatus !== "inactive") {
      return status;
    }

    const request = await accountApi.requestReactivation();
    await supabase.auth.signOut();

    throw new Error(
      request?.reactivationStatus === "pending"
        ? "This account is inactive. Your reactivation request has been sent for admin review."
        : "This account is inactive. Contact support to request account reactivation.",
    );
  },

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
