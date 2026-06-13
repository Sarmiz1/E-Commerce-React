import { supabase } from "../lib/supabaseClient";

async function runRpc(name, args) {
  const { data, error } = await supabase.rpc(name, args);
  if (error) throw error;
  return data;
}

const firstDefined = (...values) => values.find((value) => value !== undefined && value !== null);

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
  saveJobOpening: (job) =>
    runRpc("admin_upsert_job_opening", {
      job_department: job.department,
      job_description: job.description || null,
      job_employment_type: job.employmentType,
      job_id: job.id || null,
      job_is_technical: Boolean(job.isTechnical),
      job_location: job.location,
      job_openings: Number(job.openings),
      job_requirements: job.requirements || [],
      job_responsibilities: job.responsibilities || [],
      job_summary: job.summary || null,
      job_title: job.title,
    }),
  setJobOpeningStatus: (jobId, status) =>
    runRpc("admin_set_job_opening_status", { job_id: jobId, next_status: status }),
  saveCareerQuestion: (question) =>
    runRpc("admin_upsert_career_question", {
      question_id: question.id || null,
      question_job_id: question.jobId,
      question_key: question.key,
      question_label: question.label,
      question_options: question.options || [],
      question_placeholder: question.placeholder || null,
      question_position: Number(question.position || 0),
      question_required: Boolean(question.required),
      application_scope: question.scope || "role",
      question_type: question.type,
    }),
  deleteCareerQuestion: (questionId) =>
    runRpc("admin_delete_career_question", { question_id: questionId }),
  getHiringDocumentUrl: async (documentId) => {
    const { data, error } = await supabase.functions.invoke("careers-application", {
      body: { action: "view", documentId },
    });
    if (error) throw error;
    if (!data?.url) throw new Error(data?.error || "Document link could not be generated");
    return data.url;
  },
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
  getPromoCodes: () => runRpc("get_admin_promo_codes"),
  savePromoCode: (promo) =>
    runRpc("admin_upsert_promo_code", {
      p_code: promo.code,
      p_label: promo.label,
      p_type: promo.type,
      p_value: Number(promo.value || 0),
      p_min_order_cents: Number(promo.minOrderCents || 0),
      p_max_uses: promo.maxUses || null,
      p_starts_at: promo.startsAt || null,
      p_expires_at: promo.expiresAt || null,
      p_is_active: Boolean(promo.isActive),
    }),
  deletePromoCode: (code) =>
    runRpc("admin_delete_promo_code", { p_code: code }),
  getCheckoutPricing: () => runRpc("get_admin_checkout_pricing"),
  saveDeliveryFeeZone: (zone) =>
    runRpc("admin_upsert_delivery_fee_zone", {
      p_id: zone.id || null,
      p_name: zone.name,
      p_description: zone.description || "",
      p_locations: zone.locations || [],
      p_standard_fee_minor: Number(firstDefined(zone.standardFeeMinor, zone.standardfeeMinor, zone.standardfee_minor, 0)),
      p_express_fee_minor: Number(firstDefined(zone.expressFeeMinor, zone.express_fee_minor, 0)),
      p_is_active: zone.isActive ?? zone.is_active ?? true,
      p_sort_order: Number(zone.sortOrder ?? zone.sort_order ?? 0),
    }),
  saveTaxRule: (rule) =>
    runRpc("admin_upsert_tax_rule", {
      p_id: rule.id || null,
      p_country_code: rule.countryCode || rule.country_code || "NG",
      p_country_name: rule.countryName || rule.country_name || "Nigeria",
      p_region: rule.region || "national",
      p_tax_type: rule.taxType || rule.tax_type || "vat",
      p_display_name: rule.displayName || rule.display_name || "V.A.T",
      p_description: rule.description || "",
      p_old_tax_rate: Number(rule.oldTaxRate ?? rule.old_tax_rate ?? 0),
      p_current_tax_rate: Number(rule.currentTaxRate ?? rule.current_tax_rate ?? 0),
      p_applies_to: rule.appliesTo || rule.applies_to || "order_subtotal",
      p_calculation_method: rule.calculationMethod || rule.calculation_method || "percentage",
      p_fixed_amount_minor: Number(rule.fixedAmountMinor ?? rule.fixed_amount_minor ?? 0),
      p_currency: rule.currency || "NGN",
      p_priority: Number(rule.priority ?? 100),
      p_is_active: rule.isActive ?? rule.is_active ?? true,
    }),
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
