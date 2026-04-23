import { useState, useEffect, useRef, useCallback } from "react";

const PALETTE = {
  light: {
    brand: { electricBlue: "#3b82f6", electricBlueAlt: "#60a5fa", neonGreen: "#10b981", gold: "#c49a00", orange: "#e54f00" },
    surface: { primary: "#FFFFFF", secondary: "#F5F6F7", tertiary: "#ECEDEF", elevated: "#FFFFFF" },
    border: { default: "#E2E4E9", subtle: "#F0F1F3", strong: "#C8CBD4" },
    text: { primary: "#0E0E10", secondary: "#4B5563", tertiary: "#9CA3AF", inverse: "#FFFFFF", accent: "#0050d4", accentGreen: "#00915a" },
    state: { success: "#059669", successBg: "#ECFDF5", error: "#DC2626", errorBg: "#FEF2F2", warning: "#C49A00", warningBg: "#FFFBEB" },
    cta: { primary: "#0050d4", primaryHover: "#0041ac", primaryText: "#FFFFFF", secondary: "#F5F6F7", secondaryHover: "#ECEDEF", secondaryText: "#0E0E10" },
  },
  dark: {
    brand: { electricBlue: "#60a5fa", electricBlueAlt: "#3b82f6", neonGreen: "#34d399", gold: "#FFD700", orange: "#FF5E00" },
    surface: { primary: "#0E0E10", secondary: "#131315", tertiary: "#19191C", elevated: "#1F1F23" },
    border: { default: "#2C2C30", subtle: "#1F1F23", strong: "#48474A" },
    text: { primary: "#F5F6F7", secondary: "#9CA3AF", tertiary: "#6B7280", inverse: "#0E0E10", accent: "#90abff", accentGreen: "#00FF94" },
    state: { success: "#00FF94", successBg: "rgba(0,255,148,0.12)", error: "#FF5E00", errorBg: "rgba(255,94,0,0.12)", warning: "#FFD700", warningBg: "rgba(255,215,0,0.12)" },
    cta: { primary: "#90abff", primaryHover: "#a8bfff", primaryText: "#0E0E10", secondary: "#19191C", secondaryHover: "#232328", secondaryText: "#F5F6F7" },
  },
};

const SAMPLE_LEADS = [
  { id: 1, name: "Aisha Mwangi", company: "NovaTech Solutions", role: "CTO", email: "a.mwangi@novatech.io", phone: "+234 803 212 4455", value: "$84,000", stage: "Proposal", probability: 72, industry: "FinTech", size: "250–500", lastContact: "2 days ago", notes: "Expressed strong interest in enterprise tier. Key blocker: legal review of data residency clause.", tags: ["Hot Lead", "Enterprise"], initials: "AM", color: "#0050d4" },
  { id: 2, name: "Kofi Mensah", company: "PulseRetail Ltd", role: "VP Operations", email: "k.mensah@pulseretail.com", phone: "+233 24 456 7890", value: "$31,500", stage: "Discovery", probability: 38, industry: "Retail", size: "50–250", lastContact: "Today", notes: "Budget constrained but eager. Exploring whether starter plan covers their use case.", tags: ["Warm", "SMB"], initials: "KM", color: "#10b981" },
  { id: 3, name: "Fatima Al-Hassan", company: "Horizon Logistics", role: "CEO", email: "f.hassan@horizonlog.ae", phone: "+971 50 333 9900", value: "$220,000", stage: "Negotiation", probability: 88, industry: "Logistics", size: "500+", lastContact: "Yesterday", notes: "Final pricing discussion. Wants 3-year deal with custom SLA. Decision by end of month.", tags: ["High Value", "Urgent"], initials: "FA", color: "#c49a00" },
];

const STAGE_CONFIG = {
  Discovery:   { color: "#60a5fa", bg: "rgba(96,165,250,0.12)", step: 1 },
  Proposal:    { color: "#c49a00", bg: "rgba(196,154,0,0.12)",  step: 2 },
  Negotiation: { color: "#10b981", bg: "rgba(16,185,129,0.12)", step: 3 },
  Closed:      { color: "#059669", bg: "rgba(5,150,105,0.12)",  step: 4 },
};

const SYSTEM_PROMPT = `You are Woosho, an elite AI Sales Intelligence Assistant. You help sales professionals close deals faster with razor-sharp insights, empathy, and strategic advice. 

Your capabilities include:
- Crafting personalized outreach messages and follow-up sequences
- Handling objections with proven frameworks (SPIN, Challenger, MEDDIC)
- Analyzing deal health and suggesting next best actions
- Role-playing as prospects for sales practice
- Identifying buying signals and red flags
- Generating competitive battlecards on the fly
- Suggesting pricing strategies and negotiation tactics
- Drafting proposals, emails, call scripts, and LinkedIn messages

Style: Confident, direct, and data-driven. When giving advice, be specific—no generic tips. Reference the prospect's context when available. Use bullet points for action lists. Keep responses tight and actionable unless asked to elaborate.

When generating insights, always structure your longer responses with clear sections. For the current lead's context, tailor every response to their specific situation.`;

export default function SalesAssistant() {
  const [theme, setTheme] = useState("dark");
  const [messages, setMessages] = useState([
    { role: "assistant", content: "Welcome back. I'm Woosho, your sales intelligence co-pilot. Select a lead from the pipeline or ask me anything — objection handling, email drafts, deal strategy, or competitive analysis. Let's close some deals.", ts: new Date() }
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
  const P = PALETTE[theme];

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const generateInsights = useCallback(async (lead) => {
    setInsightsLoading(true);
    setInsights(null);
    try {
      const prompt = `Analyze this sales opportunity and return ONLY a JSON object (no markdown, no backticks):
Lead: ${lead.name}, ${lead.role} at ${lead.company}
Deal: ${lead.value} | Stage: ${lead.stage} | Probability: ${lead.probability}%
Industry: ${lead.industry} | Company size: ${lead.size}
Notes: ${lead.notes}

Return this exact JSON shape:
{
  "dealScore": <number 1-100>,
  "scoreLabel": "<Weak|Fair|Strong|Exceptional>",
  "winFactors": ["<factor1>","<factor2>","<factor3>"],
  "risks": ["<risk1>","<risk2>"],
  "nextActions": ["<action1>","<action2>","<action3>"],
  "talkingPoints": ["<point1>","<point2>","<point3>"],
  "competitorAngle": "<one sentence>",
  "closingTimeline": "<e.g. 2-3 weeks>"
}`;
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model: "claude-sonnet-4-20250514", max_tokens: 1000, system: SYSTEM_PROMPT, messages: [{ role: "user", content: prompt }] }),
      });
      const data = await res.json();
      const text = data.content?.map(b => b.text || "").join("").replace(/```json|```/g, "").trim();
      setInsights(JSON.parse(text));
    } catch {
      setInsights({ dealScore: 70, scoreLabel: "Strong", winFactors: ["Clear budget authority","Expressed urgency","Product-market fit"], risks: ["Legal review pending","Competitor evaluation"], nextActions: ["Send revised proposal","Schedule exec call","Share case study"], talkingPoints: ["ROI timeline","Security compliance","Customer success stories"], competitorAngle: "Emphasize superior onboarding speed and dedicated CSM.", closingTimeline: "2–3 weeks" });
    } finally {
      setInsightsLoading(false);
    }
  }, []);

  useEffect(() => { generateInsights(activeLead); }, [activeLead]);

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || loading) return;
    const userMsg = { role: "user", content: text, ts: new Date() };
    const newMsgs = [...messages, userMsg];
    setMessages(newMsgs);
    setInput("");
    setLoading(true);
    try {
      const context = `Current lead context:\nName: ${activeLead.name} (${activeLead.role} @ ${activeLead.company})\nDeal value: ${activeLead.value} | Stage: ${activeLead.stage} | Probability: ${activeLead.probability}%\nNotes: ${activeLead.notes}\n\n`;
      const apiMsgs = newMsgs.map(m => ({ role: m.role, content: m.role === "user" && m === userMsg ? context + m.content : m.content }));
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model: "claude-sonnet-4-20250514", max_tokens: 1000, system: SYSTEM_PROMPT, messages: apiMsgs }),
      });
      const data = await res.json();
      const reply = data.content?.map(b => b.text || "").join("") || "I couldn't get a response. Please try again.";
      setMessages(prev => [...prev, { role: "assistant", content: reply, ts: new Date() }]);
    } catch {
      setMessages(prev => [...prev, { role: "assistant", content: "Connection issue. Please check your network and try again.", ts: new Date() }]);
    } finally {
      setLoading(false);
    }
  };

  const quickPrompts = [
    "Draft a follow-up email",
    "Handle pricing objection",
    "What are the next steps?",
    "Write a LinkedIn message",
    "Identify red flags",
    "Competitor battlecard",
  ];

  const s = {
    wrap: { display:"flex", flexDirection:"column", height:"100vh", background: P.surface.primary, fontFamily:"'DM Sans', system-ui, sans-serif", color: P.text.primary, overflow:"hidden" },
    header: { display:"flex", alignItems:"center", justifyContent:"space-between", padding:"0 20px", height:56, borderBottom:`1px solid ${P.border.default}`, background: P.surface.secondary, flexShrink:0, zIndex:10 },
    logo: { display:"flex", alignItems:"center", gap:10 },
    logoMark: { width:32, height:32, borderRadius:8, background: P.cta.primary, display:"flex", alignItems:"center", justifyContent:"center" },
    logoText: { fontWeight:700, fontSize:17, letterSpacing:"-0.3px", color: P.text.primary },
    logoSub: { fontSize:11, color: P.text.tertiary, letterSpacing:"0.5px", textTransform:"uppercase" },
    headerRight: { display:"flex", alignItems:"center", gap:8 },
    themeBtn: { padding:"6px 12px", borderRadius:6, border:`1px solid ${P.border.default}`, background:"transparent", color: P.text.secondary, cursor:"pointer", fontSize:13, fontWeight:500 },
    statusDot: { width:8, height:8, borderRadius:"50%", background: P.brand.neonGreen },
    statusText: { fontSize:12, color: P.text.tertiary },
    body: { display:"flex", flex:1, overflow:"hidden" },
    mobileTabs: { display:"flex", borderBottom:`1px solid ${P.border.default}`, background: P.surface.secondary },
    mobileTab: (active) => ({ flex:1, padding:"10px 0", textAlign:"center", fontSize:13, fontWeight: active ? 600 : 400, color: active ? P.cta.primary : P.text.tertiary, borderBottom: active ? `2px solid ${P.cta.primary}` : "2px solid transparent", cursor:"pointer", background:"transparent", border:"none", borderBottomWidth:2, borderBottomStyle:"solid", borderBottomColor: active ? P.cta.primary : "transparent" }),
    leftPanel: { width: isMobile ? "100%" : 272, borderRight:`1px solid ${P.border.default}`, display:"flex", flexDirection:"column", background: P.surface.secondary, overflow:"hidden", flexShrink:0 },
    panelHead: { padding:"14px 16px 10px", borderBottom:`1px solid ${P.border.subtle}`, flexShrink:0 },
    panelTitle: { fontSize:11, fontWeight:600, letterSpacing:"0.8px", textTransform:"uppercase", color: P.text.tertiary, marginBottom:2 },
    panelScroll: { flex:1, overflowY:"auto", padding:"8px 10px" },
    leadCard: (active) => ({ padding:"10px 12px", borderRadius:8, border:`1px solid ${active ? P.cta.primary : P.border.default}`, background: active ? (theme==="dark" ? "rgba(144,171,255,0.08)" : "rgba(0,80,212,0.05)") : P.surface.elevated, cursor:"pointer", marginBottom:6, transition:"all 0.15s" }),
    leadAvatar: (color) => ({ width:34, height:34, borderRadius:"50%", background: color, display:"flex", alignItems:"center", justifyContent:"center", fontSize:12, fontWeight:700, color:"#fff", flexShrink:0 }),
    stagePill: (stage) => ({ padding:"2px 7px", borderRadius:20, fontSize:10, fontWeight:600, background: STAGE_CONFIG[stage]?.bg || "rgba(100,100,100,0.1)", color: STAGE_CONFIG[stage]?.color || P.text.tertiary }),
    centrePanel: { flex:1, display:"flex", flexDirection:"column", overflow:"hidden" },
    chatArea: { flex:1, overflowY:"auto", padding:"16px 20px" },
    bubble: (role) => ({ display:"flex", gap:10, marginBottom:14, flexDirection: role==="user" ? "row-reverse" : "row", alignItems:"flex-start" }),
    bubbleAvatar: (role) => ({ width:30, height:30, borderRadius:"50%", background: role==="user" ? P.cta.primary : (theme==="dark" ? "#1F1F23" : "#ECEDEF"), display:"flex", alignItems:"center", justifyContent:"center", fontSize:11, fontWeight:700, color: role==="user" ? "#fff" : P.text.secondary, flexShrink:0 }),
    bubbleContent: (role) => ({ maxWidth:"78%", padding:"10px 13px", borderRadius: role==="user" ? "16px 4px 16px 16px" : "4px 16px 16px 16px", background: role==="user" ? P.cta.primary : P.surface.elevated, color: role==="user" ? P.cta.primaryText : P.text.primary, fontSize:14, lineHeight:1.6, border: role==="user" ? "none" : `1px solid ${P.border.subtle}` }),
    bubbleTs: { fontSize:10, color: P.text.tertiary, marginTop:3 },
    inputRow: { padding:"12px 16px", borderTop:`1px solid ${P.border.default}`, background: P.surface.secondary, flexShrink:0 },
    quickRow: { display:"flex", gap:6, overflowX:"auto", marginBottom:10, paddingBottom:2 },
    quickBtn: { whiteSpace:"nowrap", padding:"4px 11px", borderRadius:20, border:`1px solid ${P.border.default}`, background:"transparent", color: P.text.secondary, fontSize:12, cursor:"pointer" },
    inputWrap: { display:"flex", gap:8, alignItems:"flex-end" },
    textarea: { flex:1, resize:"none", border:`1px solid ${P.border.default}`, borderRadius:10, padding:"9px 13px", background: P.surface.elevated, color: P.text.primary, fontSize:14, lineHeight:1.5, outline:"none", fontFamily:"inherit", maxHeight:120 },
    sendBtn: (active) => ({ width:40, height:40, borderRadius:10, border:"none", background: active ? P.cta.primary : P.border.strong, color: active ? P.cta.primaryText : P.text.tertiary, cursor: active ? "pointer" : "default", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, transition:"background 0.15s" }),
    rightPanel: { width: isMobile ? "100%" : 280, borderLeft:`1px solid ${P.border.default}`, display:"flex", flexDirection:"column", background: P.surface.secondary, overflow:"hidden", flexShrink:0 },
    insightCard: { margin:"6px 10px", padding:"12px", borderRadius:8, background: P.surface.elevated, border:`1px solid ${P.border.subtle}` },
    insightLabel: { fontSize:10, fontWeight:600, letterSpacing:"0.7px", textTransform:"uppercase", color: P.text.tertiary, marginBottom:6 },
    scoreRing: (score) => { const c = score>=80 ? P.brand.neonGreen : score>=60 ? P.brand.gold : P.brand.orange; return { width:64, height:64, borderRadius:"50%", border:`4px solid ${c}`, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", background: theme==="dark" ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.03)" }; },
    dot: { width:5, height:5, borderRadius:"50%", background: P.brand.neonGreen, marginRight:7, flexShrink:0, marginTop:5 },
    riskDot: { width:5, height:5, borderRadius:"50%", background: P.brand.orange, marginRight:7, flexShrink:0, marginTop:5 },
    actionDot: { width:5, height:5, borderRadius:"50%", background: P.cta.primary, marginRight:7, flexShrink:0, marginTop:5 },
    listItem: { display:"flex", alignItems:"flex-start", marginBottom:6, fontSize:12.5, color: P.text.secondary, lineHeight:1.45 },
    probBar: (pct, stage) => { const color = STAGE_CONFIG[stage]?.color || P.cta.primary; return { height:3, borderRadius:2, background:`linear-gradient(to right, ${color} ${pct}%, ${P.border.default} ${pct}%)` }; },
    loader: { display:"flex", gap:5, alignItems:"center", padding:"10px 13px", background: P.surface.elevated, border:`1px solid ${P.border.subtle}`, borderRadius:"4px 16px 16px 16px" },
    loaderDot: (i) => ({ width:7, height:7, borderRadius:"50%", background: P.text.tertiary, animation:"bounce 1.2s infinite", animationDelay:`${i*0.2}s` }),
  };

  const formatContent = (text) => {
    const lines = text.split("\n");
    return lines.map((line, i) => {
      if (line.startsWith("**") && line.endsWith("**")) return <div key={i} style={{fontWeight:600, marginTop:i>0?8:0, color: P.text.primary}}>{line.slice(2,-2)}</div>;
      if (line.startsWith("- ") || line.startsWith("• ")) return <div key={i} style={{paddingLeft:12, marginBottom:2, position:"relative"}}><span style={{position:"absolute",left:0}}>•</span>{line.slice(2)}</div>;
      if (/^\d+\./.test(line)) return <div key={i} style={{paddingLeft:16, marginBottom:2}}>{line}</div>;
      if (line.trim()==="") return <div key={i} style={{height:6}}/>;
      return <div key={i}>{line}</div>;
    });
  };

  const panelVisible = (panel) => {
    if (!isMobile) return true;
    return activeTab === panel;
  };

  const LeadCard = ({ lead }) => (
    <div style={s.leadCard(activeLead.id === lead.id)} onClick={() => setActiveLead(lead)}>
      <div style={{display:"flex", gap:9, alignItems:"center"}}>
        <div style={s.leadAvatar(lead.color)}>{lead.initials}</div>
        <div style={{flex:1, minWidth:0}}>
          <div style={{fontWeight:600, fontSize:13, marginBottom:1, color: P.text.primary, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis"}}>{lead.name}</div>
          <div style={{fontSize:11, color: P.text.tertiary, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis"}}>{lead.company}</div>
        </div>
        <span style={s.stagePill(lead.stage)}>{lead.stage}</span>
      </div>
      <div style={{display:"flex", justifyContent:"space-between", alignItems:"center", marginTop:8}}>
        <span style={{fontSize:13, fontWeight:700, color: P.text.accent}}>{lead.value}</span>
        <span style={{fontSize:11, color: P.text.tertiary}}>{lead.probability}%</span>
      </div>
      <div style={s.probBar(lead.probability, lead.stage)}/>
    </div>
  );

  const InsightPanel = () => (
    <div style={{flex:1, overflowY:"auto"}}>
      <div style={{...s.insightCard, marginTop:10}}>
        <div style={s.insightLabel}>Lead Context</div>
        <div style={{display:"flex", alignItems:"center", gap:10}}>
          <div style={s.leadAvatar(activeLead.color)}>{activeLead.initials}</div>
          <div>
            <div style={{fontWeight:600, fontSize:13, color: P.text.primary}}>{activeLead.name}</div>
            <div style={{fontSize:11, color: P.text.tertiary}}>{activeLead.role} · {activeLead.company}</div>
          </div>
        </div>
        <div style={{marginTop:10, display:"grid", gridTemplateColumns:"1fr 1fr", gap:6}}>
          {[["Value", activeLead.value],["Stage", activeLead.stage],["Industry", activeLead.industry],["Size", activeLead.size],["Last Contact", activeLead.lastContact]].map(([k,v])=>(
            <div key={k} style={{background: P.surface.tertiary, borderRadius:6, padding:"5px 8px"}}>
              <div style={{fontSize:10, color: P.text.tertiary}}>{k}</div>
              <div style={{fontSize:12, fontWeight:600, color: P.text.primary, marginTop:1}}>{v}</div>
            </div>
          ))}
        </div>
        <div style={{marginTop:8, fontSize:11.5, color: P.text.secondary, lineHeight:1.5, padding:"6px 8px", background: P.surface.tertiary, borderRadius:6, fontStyle:"italic"}}>"{activeLead.notes}"</div>
      </div>

      {insightsLoading ? (
        <div style={{...s.insightCard, textAlign:"center", padding:"20px"}}>
          <div style={{fontSize:12, color: P.text.tertiary}}>Analyzing deal...</div>
        </div>
      ) : insights ? (<>
        <div style={s.insightCard}>
          <div style={s.insightLabel}>Deal Intelligence Score</div>
          <div style={{display:"flex", alignItems:"center", gap:14}}>
            <div style={s.scoreRing(insights.dealScore)}>
              <span style={{fontSize:18, fontWeight:700, color: insights.dealScore>=80 ? P.brand.neonGreen : insights.dealScore>=60 ? P.brand.gold : P.brand.orange}}>{insights.dealScore}</span>
              <span style={{fontSize:9, color: P.text.tertiary}}>/ 100</span>
            </div>
            <div>
              <div style={{fontWeight:700, fontSize:14, color: P.text.primary}}>{insights.scoreLabel}</div>
              <div style={{fontSize:11, color: P.text.tertiary}}>Timeline: {insights.closingTimeline}</div>
              <div style={{fontSize:11, color: P.text.tertiary, marginTop:2}}>Win Probability: {activeLead.probability}%</div>
            </div>
          </div>
        </div>

        <div style={s.insightCard}>
          <div style={s.insightLabel}>Win Factors</div>
          {insights.winFactors?.map((f,i)=>(
            <div key={i} style={s.listItem}><div style={s.dot}/>{f}</div>
          ))}
        </div>

        <div style={s.insightCard}>
          <div style={s.insightLabel}>Risk Signals</div>
          {insights.risks?.map((r,i)=>(
            <div key={i} style={s.listItem}><div style={s.riskDot}/>{r}</div>
          ))}
        </div>

        <div style={s.insightCard}>
          <div style={s.insightLabel}>Next Best Actions</div>
          {insights.nextActions?.map((a,i)=>(
            <div key={i} style={s.listItem}>
              <div style={s.actionDot}/>
              <span style={{cursor:"pointer", color: P.text.accent}} onClick={()=>{ setInput(`Help me ${a.toLowerCase()}`); if(isMobile) setActiveTab("chat"); }}>{a}</span>
            </div>
          ))}
        </div>

        <div style={s.insightCard}>
          <div style={s.insightLabel}>Talking Points</div>
          {insights.talkingPoints?.map((t,i)=>(
            <div key={i} style={s.listItem}><div style={{...s.dot, background: P.brand.gold}}/>{t}</div>
          ))}
        </div>

        <div style={{...s.insightCard, marginBottom:14}}>
          <div style={s.insightLabel}>Competitor Angle</div>
          <div style={{fontSize:12.5, color: P.text.secondary, lineHeight:1.5}}>{insights.competitorAngle}</div>
        </div>
      </>) : null}
    </div>
  );

  return (
    <div style={s.wrap}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap');
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width:4px; height:4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: ${P.border.strong}; border-radius:2px; }
        @keyframes bounce { 0%,80%,100%{transform:scale(0.8);opacity:.5} 40%{transform:scale(1.2);opacity:1} }
        @keyframes fadeIn { from{opacity:0;transform:translateY(6px)} to{opacity:1;transform:translateY(0)} }
        .bubble-enter { animation: fadeIn 0.2s ease; }
      `}</style>

      {/* Header */}
      <div style={s.header}>
        <div style={s.logo}>
          <div style={s.logoMark}>
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M9 2L16 6.5V11.5L9 16L2 11.5V6.5L9 2Z" fill="white" fillOpacity="0.9"/>
              <circle cx="9" cy="9" r="3" fill={P.cta.primary}/>
            </svg>
          </div>
          <div>
            <div style={s.logoText}>Woosho</div>
            <div style={s.logoSub}>Sales Intelligence</div>
          </div>
        </div>
        <div style={s.headerRight}>
          <div style={{...s.statusDot}}/>
          <span style={s.statusText}>AI Active</span>
          <button style={s.themeBtn} onClick={() => setTheme(t => t==="dark"?"light":"dark")}>
            {theme==="dark" ? "☀ Light" : "☾ Dark"}
          </button>
        </div>
      </div>

      {/* Mobile Tabs */}
      {isMobile && (
        <div style={s.mobileTabs}>
          {[["pipeline","Pipeline"],["chat","Chat"],["insights","Insights"]].map(([id,label])=>(
            <button key={id} style={s.mobileTab(activeTab===id)} onClick={()=>setActiveTab(id)}>{label}</button>
          ))}
        </div>
      )}

      {/* Body */}
      <div style={s.body}>
        {/* Left: Pipeline */}
        {panelVisible("pipeline") && (
          <div style={{...s.leftPanel, display: panelVisible("pipeline") ? "flex" : "none"}}>
            <div style={s.panelHead}>
              <div style={s.panelTitle}>Pipeline · {SAMPLE_LEADS.length} Leads</div>
              <div style={{fontSize:11, color: P.text.tertiary}}>
                Total: ${SAMPLE_LEADS.reduce((a,l)=>a+parseInt(l.value.replace(/[$,]/g,"")),0).toLocaleString()}
              </div>
            </div>
            <div style={s.panelScroll}>
              {SAMPLE_LEADS.map(l => <LeadCard key={l.id} lead={l}/>)}

              <div style={{padding:"10px 2px"}}>
                <div style={s.panelTitle}>Stage Pipeline</div>
                {Object.entries(STAGE_CONFIG).map(([stage, cfg])=>{
                  const count = SAMPLE_LEADS.filter(l=>l.stage===stage).length;
                  return (
                    <div key={stage} style={{display:"flex", alignItems:"center", gap:8, marginBottom:6}}>
                      <div style={{width:8, height:8, borderRadius:"50%", background:cfg.color, flexShrink:0}}/>
                      <div style={{flex:1, fontSize:12, color: P.text.secondary}}>{stage}</div>
                      <div style={{fontSize:12, fontWeight:600, color: P.text.primary}}>{count}</div>
                    </div>
                  );
                })}
              </div>

              <div style={{marginTop:4, padding:"10px 0 2px"}}>
                <div style={s.panelTitle}>Quick Actions</div>
                {["Generate outreach sequence","Analyze all deals","Weekly forecast report"].map((a,i)=>(
                  <div key={i} onClick={()=>{ setInput(a); if(isMobile) setActiveTab("chat"); }} style={{padding:"8px 10px", borderRadius:6, border:`1px solid ${P.border.subtle}`, marginBottom:5, cursor:"pointer", fontSize:12, color: P.text.accent, background: P.surface.elevated}}>
                    → {a}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Centre: Chat */}
        {panelVisible("chat") && (
          <div style={{...s.centrePanel}}>
            <div style={s.chatArea}>
              {messages.map((msg, i) => (
                <div key={i} style={s.bubble(msg.role)} className="bubble-enter">
                  <div style={s.bubbleAvatar(msg.role)}>
                    {msg.role==="assistant" ? "W" : "Y"}
                  </div>
                  <div>
                    <div style={s.bubbleContent(msg.role)}>
                      {formatContent(msg.content)}
                    </div>
                    <div style={{...s.bubbleTs, textAlign: msg.role==="user" ? "right" : "left"}}>
                      {msg.ts?.toLocaleTimeString([], {hour:"2-digit", minute:"2-digit"})}
                    </div>
                  </div>
                </div>
              ))}
              {loading && (
                <div style={{display:"flex", gap:10, marginBottom:14}}>
                  <div style={s.bubbleAvatar("assistant")}>W</div>
                  <div style={s.loader}>
                    {[0,1,2].map(i=><div key={i} style={s.loaderDot(i)}/>)}
                  </div>
                </div>
              )}
              <div ref={chatEndRef}/>
            </div>

            <div style={s.inputRow}>
              <div style={s.quickRow}>
                {quickPrompts.map((p,i)=>(
                  <button key={i} style={s.quickBtn} onClick={()=>{setInput(p); inputRef.current?.focus();}}>
                    {p}
                  </button>
                ))}
              </div>
              <div style={s.inputWrap}>
                <textarea
                  ref={inputRef}
                  rows={1}
                  value={input}
                  style={s.textarea}
                  placeholder={`Ask about ${activeLead.name} or any sales task...`}
                  onChange={e=>{setInput(e.target.value); e.target.style.height="auto"; e.target.style.height=Math.min(e.target.scrollHeight,120)+"px";}}
                  onKeyDown={e=>{ if(e.key==="Enter" && !e.shiftKey){ e.preventDefault(); sendMessage(); }}}
                />
                <button style={s.sendBtn(!!input.trim() && !loading)} onClick={sendMessage} disabled={!input.trim()||loading}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path d="M22 2L11 13M22 2L15 22L11 13L2 9L22 2Z" stroke={!!input.trim()&&!loading ? P.cta.primaryText : P.text.tertiary} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
              </div>
              <div style={{marginTop:6, fontSize:11, color: P.text.tertiary, textAlign:"center"}}>
                Woosho AI · Powered by Claude · Context: {activeLead.name}
              </div>
            </div>
          </div>
        )}

        {/* Right: Insights */}
        {panelVisible("insights") && (
          <div style={s.rightPanel}>
            <div style={s.panelHead}>
              <div style={s.panelTitle}>Deal Intelligence</div>
              <div style={{fontSize:11, color: P.text.tertiary}}>Auto-analyzed</div>
            </div>
            <InsightPanel/>
          </div>
        )}
      </div>
    </div>
  );
}