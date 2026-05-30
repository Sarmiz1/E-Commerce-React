import { supabase } from "../lib/supabaseClient";

async function runRpc(name, args) {
  const { data, error } = await supabase.rpc(name, args);
  if (error) throw error;
  return data;
}

export const adminDashboardApi = {
  getDashboard: () => runRpc("get_admin_dashboard"),
  getProducts: () => runRpc("get_admin_products"),
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
  setSellerStatus: (sellerId, status) =>
    runRpc("admin_set_seller_status", { seller_id: sellerId, next_status: status }),
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
  queueAiQuery: (prompt) =>
    runRpc("admin_queue_ai_query", { query_prompt: prompt }),
};
