import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "../../../Store/useThemeStore";
import { useDashboard } from "../context/DashboardContext";
import { SAMPLE_LEADS, STAGE_CONFIG, buildSystemPrompt, buildFallbackInsights } from "./salesData";
import { fetchAIResponse, fetchInsights } from "./aiEngine";

// ─── Formatted content renderer ──────────────────────────────────────────────
function RenderContent({ text, colors }) {
  return text.split("\n").map((line, i) => {
    if (/^\*\*(.+?)\*\*$/.test(line))
      return <div key={i} className="font-bold mt-2 first:mt-0" style={{ color: colors.text.primary, fontSize: 13 }}>{line.slice(2, -2)}</div>;
    if (/\*\*/.test(line)) {
      const parts = line.split(/\*\*(.+?)\*\*/g);
      return <div key={i}>{parts.map((p, j) => j % 2 ? <strong key={j}>{p}</strong> : p)}</div>;
    }
    if (/^[-•] /.test(line))
      return <div key={i} className="pl-3.5 mb-0.5 relative"><span className="absolute left-0">•</span>{line.slice(2)}</div>;
    if (/^\d+\./.test(line))
      return <div key={i} className="pl-4 mb-0.5">{line}</div>;
    if (!line.trim()) return <div key={i} className="h-1.5" />;
    return <div key={i}>{line}</div>;
  });
}

// ─── Lead Card ───────────────────────────────────────────────────────────────
function LeadCard({ lead, active, onClick, colors, isDark }) {
  const sc = STAGE_CONFIG[lead.stage] || {};
  return (
    <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
      onClick={onClick}
      className="p-2.5 sm:p-3 rounded-xl mb-1.5 cursor-pointer transition-all"
      style={{ border: `1px solid ${active ? colors.cta.primary : colors.border.default}`, background: active ? (isDark ? "rgba(144,171,255,0.08)" : "rgba(0,80,212,0.05)") : colors.surface.elevated }}>
      <div className="flex gap-2 items-center min-w-0">
        <div className="w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-bold text-white flex-shrink-0" style={{ background: lead.color }}>{lead.initials}</div>
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-xs truncate" style={{ color: colors.text.primary }}>{lead.name}</div>
          <div className="text-[11px] truncate" style={{ color: colors.text.tertiary }}>{lead.company}</div>
        </div>
        <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full flex-shrink-0" style={{ background: sc.bg, color: sc.color }}>{lead.stage}</span>
      </div>
      <div className="flex justify-between items-center mt-2">
        <span className="text-xs font-bold" style={{ color: colors.text.accent }}>{lead.value}</span>
        <span className="text-[11px]" style={{ color: colors.text.tertiary }}>{lead.probability}%</span>
      </div>
      <div className="h-[3px] rounded-full mt-1" style={{ background: `linear-gradient(to right, ${sc.color || colors.cta.primary} ${lead.probability}%, ${colors.border.default} ${lead.probability}%)` }} />
    </motion.div>
  );
}

// ─── Insight Panel ───────────────────────────────────────────────────────────
function InsightPanel({ lead, insights, insightsLoading, colors, isDark, onAction }) {
  const sc = (score) => score >= 80 ? colors.brand.neonGreen : score >= 60 ? colors.brand.gold : colors.brand.orange;
  return (
    <div className="flex-1 overflow-y-auto p-2 space-y-2">
      {/* Lead Context */}
      <div className="rounded-xl p-3" style={{ background: colors.surface.elevated, border: `1px solid ${colors.border.subtle}` }}>
        <div className="text-[10px] font-bold uppercase tracking-wider mb-2" style={{ color: colors.text.tertiary }}>Lead Context</div>
        <div className="flex items-center gap-2.5 mb-3">
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-bold text-white flex-shrink-0" style={{ background: lead.color }}>{lead.initials}</div>
          <div className="min-w-0">
            <div className="font-semibold text-[13px] truncate" style={{ color: colors.text.primary }}>{lead.name}</div>
            <div className="text-[11px]" style={{ color: colors.text.tertiary }}>{lead.role} · {lead.company}</div>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-1.5">
          {[["Value", lead.value], ["Stage", lead.stage], ["Industry", lead.industry], ["Size", lead.size], ["Last Contact", lead.lastContact]].map(([k, v]) => (
            <div key={k} className="rounded-lg p-1.5" style={{ background: colors.surface.tertiary }}>
              <div className="text-[9px]" style={{ color: colors.text.tertiary }}>{k}</div>
              <div className="text-[11px] font-semibold truncate" style={{ color: colors.text.primary }}>{v}</div>
            </div>
          ))}
        </div>
        <div className="mt-2 text-[11px] leading-relaxed p-2 rounded-lg italic" style={{ background: colors.surface.tertiary, color: colors.text.secondary }}>"{lead.notes}"</div>
      </div>

      {insightsLoading ? (
        <div className="rounded-xl p-5 text-center" style={{ background: colors.surface.elevated, border: `1px solid ${colors.border.subtle}` }}>
          <div className="flex items-center justify-center gap-2">
            <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }} className="w-4 h-4 rounded-full border-2 border-t-transparent" style={{ borderColor: `${colors.cta.primary} transparent ${colors.cta.primary} ${colors.cta.primary}` }} />
            <span className="text-xs" style={{ color: colors.text.tertiary }}>Analyzing deal...</span>
          </div>
        </div>
      ) : insights ? (<>
        {/* Score */}
        <div className="rounded-xl p-3" style={{ background: colors.surface.elevated, border: `1px solid ${colors.border.subtle}` }}>
          <div className="text-[10px] font-bold uppercase tracking-wider mb-2" style={{ color: colors.text.tertiary }}>Deal Score</div>
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-full flex flex-col items-center justify-center" style={{ border: `3px solid ${sc(insights.dealScore)}`, background: isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.02)" }}>
              <span className="text-base font-black" style={{ color: sc(insights.dealScore) }}>{insights.dealScore}</span>
              <span className="text-[8px]" style={{ color: colors.text.tertiary }}>/100</span>
            </div>
            <div>
              <div className="font-bold text-sm" style={{ color: colors.text.primary }}>{insights.scoreLabel}</div>
              <div className="text-[11px]" style={{ color: colors.text.tertiary }}>Close: {insights.closingTimeline}</div>
            </div>
          </div>
        </div>
        {/* Win/Risk/Actions */}
        {[
          ["Win Factors", insights.winFactors, colors.brand.neonGreen],
          ["Risks", insights.risks, colors.brand.orange],
          ["Next Actions", insights.nextActions, colors.cta.primary, true],
          ["Talking Points", insights.talkingPoints, colors.brand.gold],
        ].map(([title, items, dotColor, clickable]) => (
          <div key={title} className="rounded-xl p-3" style={{ background: colors.surface.elevated, border: `1px solid ${colors.border.subtle}` }}>
            <div className="text-[10px] font-bold uppercase tracking-wider mb-1.5" style={{ color: colors.text.tertiary }}>{title}</div>
            {(items || []).map((item, i) => (
              <div key={i} className="flex items-start gap-1.5 mb-1 text-[12px] leading-snug" style={{ color: colors.text.secondary }}>
                <div className="w-1 h-1 rounded-full mt-1.5 flex-shrink-0" style={{ background: dotColor }} />
                {clickable ? <span className="cursor-pointer hover:underline" style={{ color: colors.text.accent }} onClick={() => onAction(item)}>{item}</span> : item}
              </div>
            ))}
          </div>
        ))}
        <div className="rounded-xl p-3 mb-2" style={{ background: colors.surface.elevated, border: `1px solid ${colors.border.subtle}` }}>
          <div className="text-[10px] font-bold uppercase tracking-wider mb-1" style={{ color: colors.text.tertiary }}>Competitor Angle</div>
          <div className="text-[12px] leading-relaxed" style={{ color: colors.text.secondary }}>{insights.competitorAngle}</div>
        </div>
      </>) : null}
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// ─── MAIN COMPONENT ─────────────────────────────────────────────────────────
// ═════════════════════════════════════════════════════════════════════════════
export default function SalesAssistant() {
  const { colors, isDark } = useTheme();
  const dashData = useDashboard();

  const [messages, setMessages] = useState([
    { role: "assistant", content: "Welcome back. I'm synced with your store data — revenue, products, orders, and customer insights.\n\nSelect a lead from the pipeline, or ask me:\n• **Sales Strategy** — objection handling, pricing, deal analysis\n• **Store Insights** — performance trends, inventory alerts\n• **Outreach** — email drafts, follow-ups, LinkedIn messages\n• **Forecasting** — revenue projections, demand planning\n\nWhat would you like to tackle?", ts: new Date() }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [activeLead, setActiveLead] = useState(SAMPLE_LEADS[0]);
  const [insights, setInsights] = useState(null);
  const [insightsLoading, setInsightsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("chat");
  const [isMobile, setIsMobile] = useState(false);
  const chatEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check(); window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" }); }, [messages, loading]);

  const systemPrompt = useMemo(() => buildSystemPrompt(dashData), [dashData.stats, dashData.products, dashData.orders]);

  // Generate insights for active lead
  const genInsights = useCallback(async (lead) => {
    setInsightsLoading(true); setInsights(null);
    try { setInsights(await fetchInsights(systemPrompt, lead)); }
    catch { setInsights(buildFallbackInsights(lead)); }
    finally { setInsightsLoading(false); }
  }, [systemPrompt]);

  useEffect(() => { genInsights(activeLead); }, [activeLead]);

  // Send message
  const sendMessage = async () => {
    const text = input.trim();
    if (!text || loading) return;
    const userMsg = { role: "user", content: text, ts: new Date() };
    const newMsgs = [...messages, userMsg];
    setMessages(newMsgs); setInput(""); setLoading(true);
    if (inputRef.current) inputRef.current.style.height = "auto";
    try {
      const ctx = `[Lead: ${activeLead.name} (${activeLead.role} @ ${activeLead.company}) | ${activeLead.value} | ${activeLead.stage} | ${activeLead.probability}%]\n\n`;
      const apiMsgs = newMsgs.map(m => ({ role: m.role, content: m === userMsg ? ctx + m.content : m.content }));
      const reply = await fetchAIResponse(systemPrompt, apiMsgs);
      setMessages(prev => [...prev, { role: "assistant", content: reply, ts: new Date() }]);
    } catch {
      setMessages(prev => [...prev, { role: "assistant", content: `Here's a quick take on ${activeLead.name}'s deal:\n\n**Status:** ${activeLead.stage} stage | ${activeLead.probability}% probability\n**Recommendation:** ${activeLead.probability >= 70 ? 'Push for close — this deal is hot.' : 'Nurture with value-adds and case studies.'}\n\n_Connect to the internet for full AI analysis._`, ts: new Date() }]);
    } finally { setLoading(false); }
  };

  const quickPrompts = useMemo(() => [
    `Analyze ${activeLead.name}'s deal`, "Draft follow-up email", "Handle pricing objection",
    "Write LinkedIn message", "Suggest upsell opportunities", "Weekly forecast",
  ], [activeLead]);

  const panelVisible = (p) => !isMobile || activeTab === p;

  const TABS = [["pipeline", "Pipeline"], ["chat", "Chat"], ["insights", "Insights"]];

  return (
    <div className="flex flex-col h-full overflow-hidden" style={{ background: colors.surface.primary, color: colors.text.primary }}>
      <style>{`
        .sa-scroll::-webkit-scrollbar { width: 3px; }
        .sa-scroll::-webkit-scrollbar-thumb { background: ${colors.border.strong}; border-radius: 2px; }
        .sa-scroll::-webkit-scrollbar-track { background: transparent; }
        @keyframes sa-bounce { 0%,80%,100%{transform:scale(0.7);opacity:.4} 40%{transform:scale(1.1);opacity:1} }
      `}</style>

      {/* Mobile Tabs */}
      {isMobile && (
        <div className="flex flex-shrink-0" style={{ borderBottom: `1px solid ${colors.border.default}`, background: colors.surface.secondary }}>
          {TABS.map(([id, label]) => (
            <button key={id} onClick={() => setActiveTab(id)}
              className="flex-1 py-2.5 text-xs font-semibold transition-colors"
              style={{ color: activeTab === id ? colors.cta.primary : colors.text.tertiary, borderBottom: `2px solid ${activeTab === id ? colors.cta.primary : "transparent"}` }}>
              {label}
            </button>
          ))}
        </div>
      )}

      {/* Body */}
      <div className="flex flex-1 min-h-0 overflow-hidden">

        {/* ── Left: Pipeline ── */}
        {panelVisible("pipeline") && (
          <div className="flex flex-col flex-shrink-0 overflow-hidden" style={{ width: isMobile ? "100%" : 240, borderRight: isMobile ? "none" : `1px solid ${colors.border.default}`, background: colors.surface.secondary }}>
            <div className="p-3 flex-shrink-0" style={{ borderBottom: `1px solid ${colors.border.subtle}` }}>
              <div className="text-[10px] font-bold uppercase tracking-wider" style={{ color: colors.text.tertiary }}>Pipeline · {SAMPLE_LEADS.length} Leads</div>
              <div className="text-[11px]" style={{ color: colors.text.tertiary }}>
                Total: ${SAMPLE_LEADS.reduce((a, l) => a + parseInt(l.value.replace(/[$,]/g, "")), 0).toLocaleString()}
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-2 sa-scroll">
              {SAMPLE_LEADS.map(l => <LeadCard key={l.id} lead={l} active={activeLead.id === l.id} onClick={() => setActiveLead(l)} colors={colors} isDark={isDark} />)}
              <div className="mt-3 px-1">
                <div className="text-[10px] font-bold uppercase tracking-wider mb-2" style={{ color: colors.text.tertiary }}>Quick Actions</div>
                {["Generate outreach sequence", "Analyze all deals", "Weekly forecast"].map((a, i) => (
                  <div key={i} onClick={() => { setInput(a); if (isMobile) setActiveTab("chat"); }}
                    className="p-2 rounded-lg mb-1 cursor-pointer text-xs transition-colors hover:opacity-80"
                    style={{ border: `1px solid ${colors.border.subtle}`, color: colors.text.accent, background: colors.surface.elevated }}>
                    → {a}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── Center: Chat ── */}
        {panelVisible("chat") && (
          <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-3 sm:p-4 sa-scroll">
              {messages.map((msg, i) => (
                <div key={i} className={`flex gap-2.5 mb-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
                  <div className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0"
                    style={{ background: msg.role === "user" ? colors.cta.primary : (isDark ? colors.surface.tertiary : colors.surface.tertiary), color: msg.role === "user" ? "#fff" : colors.text.secondary }}>
                    {msg.role === "user" ? "Y" : "W"}
                  </div>
                  <div className="max-w-[80%] min-w-0">
                    <div className="px-3 py-2.5 text-[13px] leading-relaxed"
                      style={{
                        borderRadius: msg.role === "user" ? "14px 4px 14px 14px" : "4px 14px 14px 14px",
                        background: msg.role === "user" ? colors.cta.primary : colors.surface.elevated,
                        color: msg.role === "user" ? colors.cta.primaryText : colors.text.primary,
                        border: msg.role === "user" ? "none" : `1px solid ${colors.border.subtle}`,
                      }}>
                      <RenderContent text={msg.content} colors={colors} />
                    </div>
                    <div className={`text-[10px] mt-1 ${msg.role === "user" ? "text-right" : ""}`} style={{ color: colors.text.tertiary }}>
                      {msg.ts?.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </div>
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex gap-2.5 mb-3">
                  <div className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0" style={{ background: colors.surface.tertiary, color: colors.text.secondary }}>W</div>
                  <div className="flex gap-1.5 items-center px-3 py-2.5 rounded-2xl" style={{ background: colors.surface.elevated, border: `1px solid ${colors.border.subtle}` }}>
                    {[0, 1, 2].map(i => <div key={i} className="w-1.5 h-1.5 rounded-full" style={{ background: colors.text.tertiary, animation: `sa-bounce 1.2s infinite ${i * 0.2}s` }} />)}
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Input */}
            <div className="flex-shrink-0 p-3" style={{ borderTop: `1px solid ${colors.border.default}`, background: colors.surface.secondary }}>
              <div className="flex gap-1.5 overflow-x-auto mb-2 pb-1 sa-scroll">
                {quickPrompts.map((p, i) => (
                  <button key={i} onClick={() => { setInput(p); inputRef.current?.focus(); }}
                    className="whitespace-nowrap px-2.5 py-1 rounded-full text-[11px] transition-colors hover:opacity-80 flex-shrink-0"
                    style={{ border: `1px solid ${colors.border.default}`, color: colors.text.secondary, background: "transparent" }}>
                    {p}
                  </button>
                ))}
              </div>
              <div className="flex gap-2 items-end">
                <textarea ref={inputRef} rows={1} value={input}
                  className="flex-1 resize-none rounded-xl px-3 py-2 text-sm outline-none sa-scroll"
                  style={{ border: `1px solid ${colors.border.default}`, background: colors.surface.elevated, color: colors.text.primary, maxHeight: 100, fontFamily: "inherit" }}
                  placeholder={`Ask about ${activeLead.name} or any sales task...`}
                  onChange={e => { setInput(e.target.value); e.target.style.height = "auto"; e.target.style.height = Math.min(e.target.scrollHeight, 100) + "px"; }}
                  onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
                />
                <motion.button whileTap={{ scale: 0.92 }} onClick={sendMessage} disabled={!input.trim() || loading}
                  className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors"
                  style={{ background: input.trim() && !loading ? colors.cta.primary : colors.border.strong, color: input.trim() && !loading ? colors.cta.primaryText : colors.text.tertiary }}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none"><path d="M22 2L11 13M22 2L15 22L11 13L2 9L22 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                </motion.button>
              </div>
              <div className="text-[10px] text-center mt-1.5" style={{ color: colors.text.tertiary }}>Woosho AI · Context: {activeLead.name}</div>
            </div>
          </div>
        )}

        {/* ── Right: Insights ── */}
        {panelVisible("insights") && (
          <div className="flex flex-col flex-shrink-0 overflow-hidden" style={{ width: isMobile ? "100%" : 260, borderLeft: isMobile ? "none" : `1px solid ${colors.border.default}`, background: colors.surface.secondary }}>
            <div className="p-3 flex-shrink-0" style={{ borderBottom: `1px solid ${colors.border.subtle}` }}>
              <div className="text-[10px] font-bold uppercase tracking-wider" style={{ color: colors.text.tertiary }}>Deal Intelligence</div>
              <div className="text-[11px]" style={{ color: colors.text.tertiary }}>Auto-analyzed</div>
            </div>
            <InsightPanel lead={activeLead} insights={insights} insightsLoading={insightsLoading} colors={colors} isDark={isDark}
              onAction={(a) => { setInput(`Help me: ${a}`); if (isMobile) setActiveTab("chat"); }} />
          </div>
        )}
      </div>
    </div>
  );
}