export const SAMPLE_LEADS = [
  { id: 1, name: "Aisha Mwangi", company: "NovaTech Solutions", role: "CTO", email: "a.mwangi@novatech.io", value: "$84,000", stage: "Proposal", probability: 72, industry: "FinTech", size: "250–500", lastContact: "2 days ago", notes: "Expressed strong interest in enterprise tier. Key blocker: legal review of data residency clause.", tags: ["Hot Lead", "Enterprise"], initials: "AM", color: "#3b82f6" },
  { id: 2, name: "Kofi Mensah", company: "PulseRetail Ltd", role: "VP Operations", email: "k.mensah@pulseretail.com", value: "$31,500", stage: "Discovery", probability: 38, industry: "Retail", size: "50–250", lastContact: "Today", notes: "Budget constrained but eager. Exploring whether starter plan covers their use case.", tags: ["Warm", "SMB"], initials: "KM", color: "#10b981" },
  { id: 3, name: "Fatima Al-Hassan", company: "Horizon Logistics", role: "CEO", email: "f.hassan@horizonlog.ae", value: "$220,000", stage: "Negotiation", probability: 88, industry: "Logistics", size: "500+", lastContact: "Yesterday", notes: "Final pricing discussion. Wants 3-year deal with custom SLA. Decision by end of month.", tags: ["High Value", "Urgent"], initials: "FA", color: "#c49a00" },
];

export const STAGE_CONFIG = {
  Discovery:   { color: "#60a5fa", bg: "rgba(96,165,250,0.12)" },
  Proposal:    { color: "#c49a00", bg: "rgba(196,154,0,0.12)" },
  Negotiation: { color: "#10b981", bg: "rgba(16,185,129,0.12)" },
  Closed:      { color: "#059669", bg: "rgba(5,150,105,0.12)" },
};

export function buildSystemPrompt(dashData) {
  const { stats, orders, products, customers, reviews } = dashData || {};
  const pl = (products || []).slice(0, 8).map(p => `• ${p.name} — ₦${(p.price||0).toLocaleString()} | ${p.stock} stock | ${p.sales} sold`).join('\n');
  const ol = (orders || []).slice(0, 5).map(o => `• ${o.id} — ${o.customer} | ₦${(o.amount||0).toLocaleString()} | ${o.status}`).join('\n');
  const cl = (customers || []).slice(0, 5).map(c => `• ${c.name} — ${c.orders} orders | ₦${(c.spent||0).toLocaleString()} | ${c.tag}`).join('\n');

  return `You are Woosho AI, an elite Sales Intelligence Co-Pilot for e-commerce sellers. You help sellers grow revenue, close deals, and optimize operations with data-driven advice.

SELLER STORE DATA — Ade's Store:
Revenue: ₦${(stats?.totalRevenue?.value||0).toLocaleString()} (${stats?.totalRevenue?.change>0?'+':''}${stats?.totalRevenue?.change||0}%)
Orders Today: ${stats?.ordersToday?.value||0} | Total: ${stats?.totalOrders?.value||0}
Active Products: ${stats?.activeProducts?.value||0} | Conversion: ${stats?.conversionRate?.value||0}%
Pending Payout: ₦${(stats?.pendingPayout?.value||0).toLocaleString()}

PRODUCTS:\n${pl||'None'}
RECENT ORDERS:\n${ol||'None'}
TOP CUSTOMERS:\n${cl||'None'}

CAPABILITIES: Sales strategy, objection handling (SPIN/MEDDIC), email/LinkedIn drafts, deal analysis, competitive battlecards, pricing strategy, inventory optimization, customer segmentation, forecasting.

STYLE: Confident, data-driven, specific. Use **bold** headers, bullet lists. Keep responses tight and actionable. Reference seller's real data when relevant.`;
}

export function buildFallbackInsights(lead) {
  const score = lead.probability >= 80 ? 85 : lead.probability >= 50 ? 68 : 45;
  return {
    dealScore: score,
    scoreLabel: score >= 80 ? "Exceptional" : score >= 60 ? "Strong" : "Fair",
    winFactors: ["Clear budget authority", "Expressed urgency", "Product-market fit"],
    risks: ["Legal review pending", "Competitor evaluation"],
    nextActions: ["Send revised proposal", "Schedule exec call", "Share case study"],
    talkingPoints: ["ROI timeline", "Security compliance", "Success stories"],
    competitorAngle: "Emphasize superior onboarding speed and dedicated CSM.",
    closingTimeline: lead.probability >= 80 ? "1–2 weeks" : "3–4 weeks",
  };
}
