import { supabase } from "../lib/supabaseClient";

const ADMIN_COLUMNS = "id, email, full_name, role, is_active";

export const adminApi = {
  getCurrentAdmin: async (userId) => {
    if (!userId) return null;

    const { data, error } = await supabase
      .from("admin_users")
      .select(ADMIN_COLUMNS)
      .eq("id", userId)
      .maybeSingle();

    if (error) throw error;

    return data?.is_active ? data : null;
  },

  listAdmins: async () => {
    const { data, error } = await supabase
      .from("admin_users")
      .select(ADMIN_COLUMNS)
      .order("created_at", { ascending: true });

    if (error) throw error;

    return data ?? [];
  },

  signIn: async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;

    const admin = await adminApi.getCurrentAdmin(data.user.id);

    if (!admin) {
      await supabase.auth.signOut();
      throw new Error("This account does not have active admin access.");
    }

    return admin;
  },

  requestPasswordReset: async (email) => {
    const siteUrl = import.meta.env.VITE_SITE_URL || window.location.origin;
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${siteUrl}/admin/reset-password`,
    });

    if (error) throw error;

    return true;
  },

  signOut: async () => {
    const { error } = await supabase.auth.signOut();

    if (error) throw error;
  },
};
