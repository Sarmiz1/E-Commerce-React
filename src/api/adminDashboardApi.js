import { supabase } from "../lib/supabaseClient";

async function runRpc(name, args) {
  const { data, error } = await supabase.rpc(name, args);
  if (error) throw error;
  return data;
}

export const adminDashboardApi = {
  getDashboard: () => runRpc("get_admin_dashboard_optimized"),
  getBuyers: () => runRpc("get_admin_buyers"),
  getDeactivatedBuyers: () => runRpc("get_admin_deactivated_buyer_accounts"),
  getPageActivity: async () => {
    try {
      return await runRpc("get_admin_page_activity");
    } catch (error) {
      // Allow the analytics page to remain usable during a rolling migration.
      if (!["42883", "PGRST202"].includes(error.code)) throw error;
      return {};
    }
  },
  getProducts: ({ filter, page, pageSize, search }) =>
    runRpc("get_admin_products_page", {
      page_limit: pageSize,
      page_offset: (page - 1) * pageSize,
      product_filter: filter,
      search_term: search,
    }),
  getUserGrowth: async (range) => {
    try {
      return await runRpc("get_admin_user_growth", { chart_range: range });
    } catch (error) {
      // The monthly dashboard payload remains a safe fallback until the RPC is deployed.
      if (!["42883", "PGRST202"].includes(error.code)) throw error;
      return [];
    }
  },
  getPaidSalesChart: async (range) => {
    try {
      return await runRpc("get_admin_paid_sales_chart", { chart_range: range });
    } catch (error) {
      // Keep the daily view compatible while the range-aware RPC migration is applied.
      if (range !== "days" || !["42883", "PGRST202"].includes(error.code)) throw error;
      return runRpc("get_admin_paid_sales_chart");
    }
  },
  setOrderStatus: (orderId, status) =>
    runRpc("admin_set_order_status", { order_id: orderId, next_status: status }),
  setProductActive: (productId, active) =>
    runRpc("admin_set_product_active", { product_id: productId, active }),
  setProductModerationStatus: (productId, status) =>
    runRpc("admin_set_product_moderation_status", { product_id: productId, next_status: status }),
  setSellerStatus: (sellerId, status) =>
    runRpc("admin_set_seller_status", { seller_id: sellerId, next_status: status }),
  reviewBuyerReactivation: (buyerId, approve, note = null) =>
    runRpc("admin_review_buyer_reactivation", {
      target_user_id: buyerId,
      approve,
      p_review_note: note,
    }),
  permanentlyDeleteBuyerAccount: (buyerId) =>
    runRpc("admin_permanently_delete_buyer_account", { target_user_id: buyerId }),
  setSupportTicketStatus: (ticketId, status, escalate = false) =>
    runRpc("admin_set_support_ticket_status", {
      ticket_id: ticketId,
      next_status: status,
      escalate,
    }),
  moveHiringCandidate: (candidateId, stage) =>
    runRpc("admin_move_hiring_candidate", {
      candidate_id: candidateId,
      next_stage: stage,
    }),
  getHiring: () => runRpc("get_admin_hiring"),
  createJobOpening: (job) =>
    runRpc("admin_create_job_opening", {
      job_department: job.department,
      job_employment_type: job.employmentType,
      job_location: job.location,
      job_openings: Number(job.openings),
      job_title: job.title,
    }),
  setJobOpeningStatus: (jobId, status) =>
    runRpc("admin_set_job_opening_status", { job_id: jobId, next_status: status }),
  saveIntegration: (integration) =>
    runRpc("admin_upsert_platform_integration", {
      integration_environment: integration.environment,
      integration_id: integration.id || null,
      integration_name: integration.name,
      integration_service: integration.service,
      integration_status: integration.status,
    }),
  deleteIntegration: (integrationId) =>
    runRpc("admin_delete_platform_integration", { integration_id: integrationId }),
  saveSetting: (setting) =>
    runRpc("admin_upsert_platform_setting", {
      setting_key: setting.key,
      setting_value: setting.value,
    }),
  deleteSetting: (settingKey) =>
    runRpc("admin_delete_platform_setting", { setting_key: settingKey }),
  promoteAdmin: async (admin) => {
    const result = await runRpc("admin_promote_user", {
      target_email: admin.email,
      target_name: admin.name,
      promotion_passcode: admin.passcode,
      target_role: admin.role,
    });
    if (!result?.success) throw new Error(result?.message || "Admin promotion failed");
    return result;
  },
  configurePromotionPasscode: async (passcode) => {
    const result = await runRpc("admin_configure_promotion_passcode", {
      current_passcode: passcode.currentPasscode || null,
      new_passcode: passcode.newPasscode,
    });
    if (!result?.success) throw new Error(result?.message || "Passcode update failed");
    return result;
  },
  queueAiQuery: (prompt) =>
    runRpc("admin_queue_ai_query", { query_prompt: prompt }),
};
