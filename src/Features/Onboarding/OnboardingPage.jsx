// src/pages/Onboarding/OnboardingPage.jsx
//
// ── WooSho Unified Onboarding ────────────────────────────────────────────────
//
//  FLOW:  Auth → /onboarding → Role Select → Buyer or Seller steps → Dashboard
//
//  ROLE SELECTION:  "What do you want to do on Woosho?"
//    ┌──────────────────┐   ┌──────────────────┐
//    │  🛍 Shop as Buyer│   │  🏪 Start Selling │
//    └──────────────────┘   └──────────────────┘
//
//  BUYER FLOW  (4 steps)
//    1. Your Profile   — name, avatar, username
//    2. What You Love  — categories, vibe, budget
//    3. Your Address   — default delivery address
//    4. Payment Setup  — save card (skippable)
//
//  SELLER FLOW  (5 steps)
//    1. Store Identity  — name, slug, category, description
//    2. Contact Details — phone, email, country/city
//    3. Store Branding  — logo, banner, accent colour
//    4. Selling Style   — what you sell, regions, fulfillment
//    5. Payout Setup    — bank details (skippable)
//
// ── Supabase tables ──────────────────────────────────────────────────────────
//  profiles         — exists post-auth, role updated here
//  seller_profiles  — created on seller onboarding completion
//  buyer_profiles   — created on buyer onboarding completion
//  addresses        — delivery / business addresses
//
// ── Route guard (src/routes/index.jsx) ───────────────────────────────────────
//  <ProtectedRoute>           — requires auth
//    <OnboardedRedirect>      — redirects completed users to /account
//      <OnboardingPage />
//    </OnboardedRedirect>
//  </ProtectedRoute>
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabaseClient";

// ─── WooSho Design Tokens + Global Styles ────────────────────────────────────
const GLOBAL_STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,300;12..96,400;12..96,500;12..96,600;12..96,700;12..96,800&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,300&family=JetBrains+Mono:wght@400;500;600&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  .ob-root {
    /* Base palette */
    --bg:           #060B14;
    --bg-1:         #0C1322;
    --bg-2:         #111B2E;
    --bg-3:         #18243A;
    --bg-4:         #1E2D47;
    --border:       rgba(255,255,255,0.055);
    --border-2:     rgba(255,255,255,0.09);
    --border-3:     rgba(255,255,255,0.16);
    /* Brand amber — seller */
    --amber:        #F5A623;
    --amber-l:      #FFC85C;
    --amber-d:      #C47E0A;
    --amber-bg:     rgba(245,166,35,0.08);
    --amber-border: rgba(245,166,35,0.28);
    /* Buyer teal */
    --teal:         #2DD4BF;
    --teal-l:       #5EEAD4;
    --teal-bg:      rgba(45,212,191,0.08);
    --teal-border:  rgba(45,212,191,0.28);
    /* Semantic */
    --green:        #10B981;
    --green-bg:     rgba(16,185,129,0.09);
    --green-border: rgba(16,185,129,0.28);
    --red:          #F87171;
    /* Text */
    --text:         #E8E4DA;
    --text-2:       #9199A8;
    --text-3:       #49566A;
    /* Typography */
    --font-d:       'Bricolage Grotesque', sans-serif;
    --font-b:       'DM Sans', sans-serif;
    --font-m:       'JetBrains Mono', monospace;

    font-family: var(--font-b);
    background: var(--bg);
    color: var(--text);
    min-height: 100vh;
    overflow-x: hidden;
  }

  /* ── Form primitives ── */
  .ob-input {
    width: 100%;
    background: var(--bg-3);
    border: 1.5px solid var(--border-2);
    border-radius: 10px;
    padding: 11px 14px;
    font-family: var(--font-b);
    font-size: 14px;
    color: var(--text);
    outline: none;
    transition: border-color .18s, box-shadow .18s, background .18s;
    -webkit-appearance: none;
  }
  .ob-input::placeholder { color: var(--text-3); }
  .ob-input:focus {
    border-color: var(--role-accent, rgba(245,166,35,.5));
    background: var(--bg-4);
    box-shadow: 0 0 0 3px rgba(var(--role-accent-rgb, 245,166,35), .1);
  }
  .ob-input option { background: var(--bg-3); }

  .ob-textarea {
    width: 100%;
    background: var(--bg-3);
    border: 1.5px solid var(--border-2);
    border-radius: 10px;
    padding: 11px 14px;
    font-family: var(--font-b);
    font-size: 14px;
    color: var(--text);
    outline: none;
    resize: vertical;
    min-height: 88px;
    line-height: 1.65;
    transition: border-color .18s, box-shadow .18s;
  }
  .ob-textarea::placeholder { color: var(--text-3); }
  .ob-textarea:focus { border-color: var(--role-accent, rgba(245,166,35,.5)); box-shadow: 0 0 0 3px rgba(245,166,35,.08); }

  .ob-label        { display: block; font-size: 12.5px; font-weight: 500; color: var(--text-2); margin-bottom: 6px; font-family: var(--font-b); }
  .ob-label-opt::after { content: ' — optional'; font-weight: 400; color: var(--text-3); font-size: 11px; }
  .ob-error        { font-size: 11.5px; color: var(--red); margin-top: 4px; font-weight: 500; }

  /* ── Chips ── */
  .ob-chip {
    display: inline-flex; align-items: center; gap: 5px;
    padding: 6px 13px; border-radius: 99px; font-size: 12.5px; font-weight: 500;
    cursor: pointer; user-select: none; transition: all .15s;
    border: 1.5px solid var(--border-2); background: var(--bg-2); color: var(--text-2);
  }
  .ob-chip:hover { border-color: var(--border-3); color: var(--text); }
  .ob-chip.buyer-selected  { background: var(--teal-bg); border-color: var(--teal-border); color: var(--teal); }
  .ob-chip.seller-selected { background: var(--amber-bg); border-color: var(--amber-border); color: var(--amber); }

  /* ── Toggle cards ── */
  .ob-toggle {
    border: 1.5px solid var(--border-2); border-radius: 12px;
    padding: 14px 16px; cursor: pointer; transition: all .18s; background: var(--bg-2); text-align: left;
    width: 100%;
  }
  .ob-toggle:hover { border-color: var(--border-3); }
  .ob-toggle.buyer-selected  { border-color: var(--teal-border); background: var(--teal-bg); }
  .ob-toggle.seller-selected { border-color: var(--amber-border); background: var(--amber-bg); }

  /* ── Upload zone ── */
  .ob-drop {
    border: 1.5px dashed var(--border-2); border-radius: 12px; cursor: pointer;
    transition: border-color .2s, background .2s; position: relative; overflow: hidden;
  }
  .ob-drop:hover, .ob-drop.over { border-color: rgba(245,166,35,.4); background: rgba(245,166,35,.03); }
  .ob-drop.buyer:hover, .ob-drop.buyer.over { border-color: rgba(45,212,191,.4); background: rgba(45,212,191,.03); }

  /* ── Buttons ── */
  .ob-btn-primary {
    display: inline-flex; align-items: center; gap: 8px;
    padding: 11px 22px; border: none; border-radius: 10px; cursor: pointer;
    font-family: var(--font-b); font-size: 13.5px; font-weight: 600;
    transition: filter .15s, transform .1s, opacity .15s; white-space: nowrap;
    background: var(--role-accent, var(--amber)); color: #0B0800;
  }
  .ob-btn-primary.buyer  { background: var(--teal); color: #031210; }
  .ob-btn-primary.seller { background: var(--amber); color: #0B0800; }
  .ob-btn-primary:hover  { filter: brightness(1.12); }
  .ob-btn-primary:active { transform: scale(.97); }
  .ob-btn-primary:disabled { opacity: .45; cursor: not-allowed; transform: none; filter: none; }

  .ob-btn-ghost {
    display: inline-flex; align-items: center; gap: 7px;
    padding: 10px 18px; background: transparent; color: var(--text-2);
    border: 1.5px solid var(--border-2); border-radius: 10px;
    font-family: var(--font-b); font-size: 13px; font-weight: 500; cursor: pointer;
    transition: all .15s;
  }
  .ob-btn-ghost:hover { background: var(--bg-3); color: var(--text); border-color: var(--border-3); }

  .ob-btn-skip {
    background: none; border: none; color: var(--text-3);
    font-family: var(--font-b); font-size: 13px; font-weight: 500; cursor: pointer;
    transition: color .15s; padding: 10px 4px;
    text-decoration: underline; text-underline-offset: 3px;
  }
  .ob-btn-skip:hover { color: var(--text-2); }

  /* ── Step cards ── */
  .ob-step-card { border: 1px solid var(--border); border-radius: 16px; overflow: hidden; background: var(--bg-1); transition: border-color .25s; }
  .ob-step-card.active.buyer  { border-color: rgba(45,212,191,.22); }
  .ob-step-card.active.seller { border-color: rgba(245,166,35,.2); }
  .ob-step-card.done          { border-color: rgba(16,185,129,.18); }

  /* ── Role selection cards ── */
  .ob-role-card {
    border: 1.5px solid var(--border-2); border-radius: 20px; cursor: pointer;
    background: var(--bg-1); transition: all .22s; position: relative; overflow: hidden;
    padding: 36px 32px 32px;
  }
  .ob-role-card::before {
    content: ''; position: absolute; inset: 0; opacity: 0;
    transition: opacity .3s; pointer-events: none;
  }
  .ob-role-card.buyer::before  { background: radial-gradient(ellipse at top left, rgba(45,212,191,.07) 0%, transparent 65%); }
  .ob-role-card.seller::before { background: radial-gradient(ellipse at top right, rgba(245,166,35,.07) 0%, transparent 65%); }
  .ob-role-card:hover::before, .ob-role-card.selected::before { opacity: 1; }
  .ob-role-card:hover { transform: translateY(-3px); }
  .ob-role-card.buyer:hover, .ob-role-card.buyer.selected   { border-color: rgba(45,212,191,.4); box-shadow: 0 16px 48px rgba(45,212,191,.08); }
  .ob-role-card.seller:hover, .ob-role-card.seller.selected { border-color: rgba(245,166,35,.4); box-shadow: 0 16px 48px rgba(245,166,35,.08); }
  .ob-role-card.selected { transform: translateY(-5px); }

  /* ── Scrollbar ── */
  .ob-scroll::-webkit-scrollbar { width: 4px; }
  .ob-scroll::-webkit-scrollbar-thumb { background: var(--border-2); border-radius: 99px; }

  /* ── Keyframes ── */
  @keyframes ob-spin   { to { transform: rotate(360deg); } }
  @keyframes ob-pulse  { 0%,100%{opacity:1} 50%{opacity:.35} }
  @keyframes ob-float  { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-6px)} }
  @keyframes ob-check  { 0%{stroke-dashoffset:24} 100%{stroke-dashoffset:0} }
  @keyframes ob-pop    { 0%{transform:scale(.8);opacity:0} 100%{transform:scale(1);opacity:1} }
  @keyframes ob-shimmer {
    0%   { background-position: -200% center; }
    100% { background-position: 200% center; }
  }
  @keyframes ob-confetti {
    0%   { transform: translateY(-10px) rotate(0deg); opacity: 1; }
    100% { transform: translateY(90px) rotate(540deg); opacity: 0; }
  }

  .ob-spin   { animation: ob-spin .7s linear infinite; }
  .ob-float  { animation: ob-float 3.5s ease-in-out infinite; }
  .ob-pulse-dot { animation: ob-pulse 2s ease-in-out infinite; }

  @media (max-width: 1024px) {
    .ob-page-layout { flex-direction: column !important; }
    .ob-sidebar     { width: 100% !important; position: static !important; }
    .ob-steps-col   { max-width: 100% !important; }
    .ob-role-grid   { grid-template-columns: 1fr !important; }
  }
  @media (max-width: 640px) {
    .ob-role-card   { padding: 28px 24px 24px !important; }
    .ob-role-emoji  { font-size: 40px !important; width: 72px !important; height: 72px !important; }
  }
`;

// ─── Zod Schemas ─────────────────────────────────────────────────────────────
// Buyer schemas
const b1Schema = z.object({
  firstName: z.string().min(1, "First name required").max(40),
  lastName:  z.string().min(1, "Last name required").max(40),
  username:  z.string().min(3, "At least 3 characters").max(28).regex(/^[a-z0-9_]+$/, "Lowercase, numbers, underscore only"),
});
const b2Schema = z.object({ categories: z.array(z.string()).min(1, "Pick at least one") });
const b3Schema = z.object({
  fullName: z.string().min(2, "Name required"),
  address:  z.string().min(5, "Address required"),
  city:     z.string().min(2, "City required"),
  country:  z.string().min(1, "Country required"),
  phone:    z.string().optional(),
});
const b4Schema = z.object({ payMethod: z.enum(["card", "skip"]) });

// Seller schemas
const s1Schema = z.object({
  storeName:   z.string().min(2, "At least 2 characters").max(60),
  category:    z.string().min(1, "Pick a category"),
  description: z.string().max(500).optional(),
});
const s2Schema = z.object({
  phone: z.string().optional(), businessEmail: z.string().email().optional().or(z.literal("")),
  supportEmail: z.string().email().optional().or(z.literal("")), country: z.string().optional(), city: z.string().optional(),
});
const s3Schema = z.object({ accentColor: z.string().optional() });
const s4Schema = z.object({
  sellsWhat:   z.array(z.string()).min(1, "Pick at least one"),
  storeType:   z.enum(["online", "physical", "both"]),
  shipRegions: z.array(z.string()).min(1, "Select a region"),
  fulfillment: z.enum(["self", "third-party", "both"]),
});
const s5Schema = z.object({ payoutMethod: z.enum(["bank", "skip"]) });

// ─── Storage ──────────────────────────────────────────────────────────────────
const STORAGE_KEY = "woosho_onboarding_v2";
const DEFAULT_STATE = {
  role: null,        // 'buyer' | 'seller'
  currentStep: 1,
  completedSteps: [],
  data: {
    b1: {}, b2: { categories: [], budget: "mid", vibe: [] }, b3: {}, b4: { payMethod: "skip" },
    s1: {}, s2: {}, s3: { accentColor: "#F5A623" }, s4: { sellsWhat: [], shipRegions: [], storeType: "online", fulfillment: "self" }, s5: {},
  },
};

const loadState  = () => { try { const r = localStorage.getItem(STORAGE_KEY); return r ? { ...DEFAULT_STATE, ...JSON.parse(r) } : DEFAULT_STATE; } catch { return DEFAULT_STATE; } };
const persistState = (s) => { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(s)); } catch {} };

// ─── Helpers ──────────────────────────────────────────────────────────────────
const slugify = (s = "") => s.toLowerCase().replace(/[^a-z0-9\s]/g, "").trim().replace(/\s+/g, "-").slice(0, 32);
const CheckSvg = () => <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M2 5l2 2 4-4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>;
const Spinner  = ({ s = 15 }) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" className="ob-spin"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" opacity=".2" /><path fill="currentColor" d="M4 12a8 8 0 018-8v8z" opacity=".75" /></svg>;

// ─── Shared UI ────────────────────────────────────────────────────────────────
function FF({ label, error, optional, hint, children }) {
  return (
    <div>
      {label && <label className={`ob-label${optional ? " ob-label-opt" : ""}`}>{label}</label>}
      {children}
      {hint && !error && <p style={{ fontSize: 11, color: "var(--text-3)", marginTop: 4, lineHeight: 1.5 }}>{hint}</p>}
      {error && <p className="ob-error">{error}</p>}
    </div>
  );
}

function ChipGroup({ options, value = [], onChange, role }) {
  const sel = role === "buyer" ? "buyer-selected" : "seller-selected";
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
      {options.map((o) => {
        const on = value.includes(o);
        return (
          <button key={o} type="button" className={`ob-chip${on ? ` ${sel}` : ""}`}
            onClick={() => onChange(on ? value.filter((v) => v !== o) : [...value, o])}>
            {on && <CheckSvg />}{o}
          </button>
        );
      })}
    </div>
  );
}

function UploadZone({ label, hint, value, onChange, role, aspect }) {
  const ref = useRef(null);
  const [over, setOver] = useState(false);
  const [preview, setPreview] = useState(value || null);
  const handle = (f) => { if (!f?.type.startsWith("image/")) return; const url = URL.createObjectURL(f); setPreview(url); onChange?.(f, url); };
  return (
    <div className={`ob-drop${role === "buyer" ? " buyer" : ""}${over ? " over" : ""}`}
      style={{ minHeight: aspect === "banner" ? 100 : 80, display: "flex", alignItems: "center", justifyContent: "center" }}
      onDragOver={(e) => { e.preventDefault(); setOver(true); }}
      onDragLeave={() => setOver(false)}
      onDrop={(e) => { e.preventDefault(); setOver(false); handle(e.dataTransfer.files[0]); }}
      onClick={() => ref.current?.click()}>
      <input ref={ref} type="file" accept="image/*" style={{ display: "none" }} onChange={(e) => handle(e.target.files[0])} />
      {preview ? (
        <div style={{ position: "relative", width: "100%", height: aspect === "banner" ? 96 : 76 }}>
          <img src={preview} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: 10 }} />
          <button type="button" onClick={(e) => { e.stopPropagation(); setPreview(null); onChange?.(null, null); }}
            style={{ position: "absolute", top: 6, right: 6, width: 22, height: 22, borderRadius: "50%", background: "rgba(0,0,0,.65)", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 12 }}>✕</button>
        </div>
      ) : (
        <div style={{ textAlign: "center", padding: "18px 16px" }}>
          <div style={{ fontSize: 20, marginBottom: 6 }}>{aspect === "logo" ? "🖼" : aspect === "banner" ? "🏞" : aspect === "avatar" ? "👤" : "📁"}</div>
          <p style={{ fontSize: 13, fontWeight: 500, color: "var(--text-2)", marginBottom: 2 }}>{label}</p>
          <p style={{ fontSize: 11, color: "var(--text-3)" }}>{hint || "PNG or JPG · Drag or click"}</p>
        </div>
      )}
    </div>
  );
}

function StepActions({ role, isSubmitting, onSkip, label = "Save & Continue" }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, paddingTop: 8, borderTop: "1px solid var(--border)", marginTop: 4 }}>
      <button type="submit" className={`ob-btn-primary ${role}`} disabled={isSubmitting}>
        {isSubmitting ? <><Spinner s={13} /> Saving…</> : <>{label} →</>}
      </button>
      {onSkip && <button type="button" className="ob-btn-skip" onClick={onSkip}>Skip for now</button>}
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════════
// BUYER STEPS
// ════════════════════════════════════════════════════════════════════════════════

function BuyerStep1({ defaults, onSave, user }) {
  const { register, handleSubmit, watch, setValue, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(b1Schema),
    defaultValues: {
      firstName: user?.name?.split(" ")[0] || "",
      lastName:  user?.name?.split(" ").slice(1).join(" ") || "",
      username:  "",
      ...defaults,
    },
  });
  const first = watch("firstName");
  const last  = watch("lastName");

  // Auto-suggest username from name
  useEffect(() => {
    if (!watch("username") && (first || last)) {
      const suggestion = `${first}${last}`.toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 20);
      setValue("username", suggestion || "");
    }
  }, [first, last]);

  return (
    <form onSubmit={handleSubmit(onSave)} style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <FF label="Profile photo" optional>
        <UploadZone aspect="avatar" role="buyer" label="Upload a photo" hint="Square, 400×400 px ideal" />
      </FF>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
        <FF label="First name" error={errors.firstName?.message}>
          <input {...register("firstName")} className="ob-input" placeholder="Amara" autoFocus />
        </FF>
        <FF label="Last name" error={errors.lastName?.message}>
          <input {...register("lastName")} className="ob-input" placeholder="Osei" />
        </FF>
      </div>
      <FF label="Username" error={errors.username?.message} hint="Visible on wishlists and reviews — lowercase only.">
        <div style={{ position: "relative" }}>
          <span style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", fontFamily: "var(--font-m)", fontSize: 13, color: "var(--text-3)" }}>@</span>
          <input {...register("username")} className="ob-input" style={{ paddingLeft: 28 }} placeholder="amara_osei" />
        </div>
      </FF>
      <StepActions role="buyer" isSubmitting={isSubmitting} onSkip={() => onSave({}, true)} />
    </form>
  );
}

function BuyerStep2({ defaults, onSave }) {
  const CATS = ["Fashion & Style", "Electronics", "Home & Living", "Beauty & Skincare", "Sports & Fitness", "Books & Media", "Art & Prints", "Kids & Babies", "Health & Wellness", "Food & Drink", "Toys & Games", "Jewellery"];
  const BUDGET = [
    { id: "deals",   label: "Best deals", emoji: "🤑", desc: "I love a bargain" },
    { id: "mid",     label: "Mid-range",  emoji: "👌", desc: "Quality for value" },
    { id: "premium", label: "Premium",    emoji: "✨", desc: "Quality matters most" },
    { id: "luxury",  label: "Luxury",     emoji: "💎", desc: "Only the finest" },
  ];
  const [cats, setCats]     = useState(defaults?.categories || []);
  const [budget, setBudget] = useState(defaults?.budget || "mid");
  const [saving, setSaving] = useState(false);
  const [err, setErr]       = useState("");

  const submit = async () => {
    if (!cats.length) { setErr("Pick at least one category."); return; }
    setSaving(true); setErr("");
    await new Promise((r) => setTimeout(r, 400));
    onSave({ categories: cats, budget });
    setSaving(false);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <FF label="What do you love to shop?" error={err}>
        <div style={{ marginTop: 4 }}><ChipGroup options={CATS} value={cats} onChange={(v) => { setCats(v); setErr(""); }} role="buyer" /></div>
      </FF>
      <FF label="Shopping style">
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 10, marginTop: 4 }}>
          {BUDGET.map((b) => (
            <button key={b.id} type="button"
              className={`ob-toggle${budget === b.id ? " buyer-selected" : ""}`}
              onClick={() => setBudget(b.id)}>
              <div style={{ fontSize: 20, marginBottom: 6 }}>{b.emoji}</div>
              <p style={{ fontFamily: "var(--font-b)", fontWeight: 600, fontSize: 13, color: "var(--text)", marginBottom: 2 }}>{b.label}</p>
              <p style={{ fontFamily: "var(--font-b)", fontSize: 11.5, color: "var(--text-3)" }}>{b.desc}</p>
            </button>
          ))}
        </div>
      </FF>
      <div style={{ display: "flex", alignItems: "center", gap: 10, paddingTop: 8, borderTop: "1px solid var(--border)" }}>
        <button className="ob-btn-primary buyer" onClick={submit} disabled={saving}>
          {saving ? <><Spinner s={13} /> Saving…</> : <>Save & Continue →</>}
        </button>
        <button className="ob-btn-skip" onClick={() => onSave({}, true)}>Skip for now</button>
      </div>
    </div>
  );
}

function BuyerStep3({ defaults, onSave }) {
  const COUNTRIES = ["Nigeria", "Ghana", "Kenya", "South Africa", "UK", "USA", "Canada", "Germany", "UAE", "India", "Other"];
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(b3Schema),
    defaultValues: { fullName: "", address: "", city: "", country: "", phone: "", ...defaults },
  });
  return (
    <form onSubmit={handleSubmit(onSave)} style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      <FF label="Full name for delivery" error={errors.fullName?.message}>
        <input {...register("fullName")} className="ob-input" placeholder="Amara Osei" />
      </FF>
      <FF label="Street address" error={errors.address?.message}>
        <input {...register("address")} className="ob-input" placeholder="14 Victoria Island Blvd, Apt 3B" />
      </FF>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
        <FF label="City" error={errors.city?.message}>
          <input {...register("city")} className="ob-input" placeholder="Lagos" />
        </FF>
        <FF label="Country" error={errors.country?.message}>
          <select {...register("country")} className="ob-input">
            <option value="">Select…</option>
            {COUNTRIES.map((c) => <option key={c}>{c}</option>)}
          </select>
        </FF>
      </div>
      <FF label="Phone number" optional error={errors.phone?.message}>
        <input {...register("phone")} className="ob-input" placeholder="+234 801 234 5678" />
      </FF>
      <StepActions role="buyer" isSubmitting={isSubmitting} onSkip={() => onSave({}, true)} />
    </form>
  );
}

function BuyerStep4({ defaults, onSave }) {
  const [method, setMethod] = useState(defaults?.payMethod || "skip");
  const [saving, setSaving] = useState(false);
  const submit = async () => { setSaving(true); await new Promise((r) => setTimeout(r, 500)); onSave({ payMethod: method }); setSaving(false); };
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div style={{ background: "var(--teal-bg)", border: "1px solid var(--teal-border)", borderRadius: 12, padding: "14px 16px" }}>
        <p style={{ fontFamily: "var(--font-d)", fontWeight: 600, fontSize: 14, color: "var(--text)", marginBottom: 4 }}>💳 Checkout in seconds</p>
        <p style={{ fontSize: 13, color: "var(--text-2)", lineHeight: 1.55 }}>Save a payment method now and skip the card form every time you buy. You can always add one at checkout.</p>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        {[{ id: "card", label: "Add a card", icon: "💳", desc: "Fast one-tap checkout" }, { id: "skip", label: "Not now", icon: "⏳", desc: "Add at first checkout" }].map((m) => (
          <button key={m.id} type="button" className={`ob-toggle${method === m.id ? " buyer-selected" : ""}`} onClick={() => setMethod(m.id)}>
            <div style={{ fontSize: 22, marginBottom: 8 }}>{m.icon}</div>
            <p style={{ fontWeight: 600, fontSize: 13.5, color: "var(--text)", marginBottom: 3 }}>{m.label}</p>
            <p style={{ fontSize: 12, color: "var(--text-3)" }}>{m.desc}</p>
          </button>
        ))}
      </div>
      <AnimatePresence>
        {method === "card" && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} style={{ overflow: "hidden" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <FF label="Name on card"><input className="ob-input" placeholder="AMARA OSEI" /></FF>
              <FF label="Card number"><input className="ob-input" placeholder="•••• •••• •••• ••••" /></FF>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                <FF label="Expiry"><input className="ob-input" placeholder="MM / YY" /></FF>
                <FF label="CVV"><input className="ob-input" placeholder="•••" /></FF>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <div style={{ display: "flex", alignItems: "center", gap: 10, paddingTop: 8, borderTop: "1px solid var(--border)" }}>
        <button className="ob-btn-primary buyer" onClick={submit} disabled={saving} style={{ flex: 1, justifyContent: "center" }}>
          {saving ? <><Spinner s={13} /> Saving…</> : <>🛍 Start Shopping</>}
        </button>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════════
// SELLER STEPS
// ════════════════════════════════════════════════════════════════════════════════

function SellerStep1({ defaults, onSave }) {
  const [aiLoading, setAiLoading] = useState(false);
  const { register, handleSubmit, watch, setValue, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(s1Schema),
    defaultValues: { storeName: "", category: "", description: "", ...defaults },
  });
  const name = watch("storeName");
  const cat  = watch("category");
  const slug = slugify(name);

  const CATS = ["Fashion", "Electronics", "Home & Living", "Beauty", "Sports", "Food & Drink", "Art & Crafts", "Books", "Health", "Toys", "Other"];

  const suggestAI = async () => {
    if (!name) return;
    setAiLoading(true);
    await new Promise((r) => setTimeout(r, 1300));
    const desc = `${name} is a carefully curated ${cat || "premium"} store on Woosho, bringing quality products and exceptional service to buyers across Africa and the globe. Every item is handpicked with care for our discerning customers.`;
    setValue("description", desc, { shouldValidate: true });
    setAiLoading(false);
  };

  return (
    <form onSubmit={handleSubmit(onSave)} style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <FF label="Store name" error={errors.storeName?.message}>
        <input {...register("storeName")} className="ob-input" placeholder="e.g. Lúmio Bazaar" autoFocus />
        <AnimatePresence>
          {name.length > 1 && (
            <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 7, padding: "7px 12px", background: "var(--bg-3)", border: "1px solid var(--border)", borderRadius: 8 }}>
              <span style={{ fontSize: 11, color: "var(--text-3)", fontFamily: "var(--font-b)" }}>Your URL:</span>
              <span style={{ fontFamily: "var(--font-m)", fontSize: 12, color: "var(--amber)" }}>woosho.com/<strong>{slug}</strong></span>
            </motion.div>
          )}
        </AnimatePresence>
      </FF>
      <FF label="Store category" error={errors.category?.message}>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 4 }}>
          {CATS.map((c) => {
            const on = cat === c;
            return (
              <button key={c} type="button" className={`ob-chip${on ? " seller-selected" : ""}`}
                onClick={() => setValue("category", c, { shouldValidate: true })}>
                {on && <CheckSvg />}{c}
              </button>
            );
          })}
        </div>
      </FF>
      <FF label="About your store" optional hint="A great description builds trust before the first sale.">
        <div style={{ position: "relative" }}>
          <textarea {...register("description")} className="ob-textarea" placeholder="Tell your story — what makes your store special…" rows={3} />
          <button type="button" onClick={suggestAI} disabled={!name || aiLoading}
            style={{ position: "absolute", bottom: 10, right: 10, display: "flex", alignItems: "center", gap: 5, padding: "5px 10px", borderRadius: 7, background: "var(--bg-4)", border: "1px solid var(--border-2)", color: "var(--amber)", fontSize: 11.5, fontWeight: 600, cursor: "pointer", opacity: !name ? 0.4 : 1, fontFamily: "var(--font-b)" }}>
            {aiLoading ? <Spinner s={11} /> : <span style={{ fontSize: 13 }}>✦</span>}
            {aiLoading ? "Writing…" : "AI Suggest"}
          </button>
        </div>
      </FF>
      <StepActions role="seller" isSubmitting={isSubmitting} onSkip={() => onSave({}, true)} />
    </form>
  );
}

function SellerStep2({ defaults, onSave }) {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(s2Schema),
    defaultValues: { phone: "", businessEmail: "", supportEmail: "", country: "", city: "", ...defaults },
  });
  const COUNTRIES = ["Nigeria", "Kenya", "Ghana", "South Africa", "United Kingdom", "USA", "Canada", "Germany", "UAE", "India", "Other"];
  return (
    <form onSubmit={handleSubmit(onSave)} style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
        <FF label="Phone" optional error={errors.phone?.message}>
          <input {...register("phone")} className="ob-input" placeholder="+234 801 234 5678" />
        </FF>
        <FF label="Country" optional>
          <select {...register("country")} className="ob-input"><option value="">Select…</option>{COUNTRIES.map((c) => <option key={c}>{c}</option>)}</select>
        </FF>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
        <FF label="Business email" optional error={errors.businessEmail?.message}>
          <input {...register("businessEmail")} className="ob-input" placeholder="hello@store.com" type="email" />
        </FF>
        <FF label="Support email" optional error={errors.supportEmail?.message}>
          <input {...register("supportEmail")} className="ob-input" placeholder="support@store.com" type="email" />
        </FF>
      </div>
      <FF label="City" optional>
        <input {...register("city")} className="ob-input" placeholder="Lagos, Nairobi, London…" />
      </FF>
      <div style={{ background: "var(--amber-bg)", border: "1px solid var(--amber-border)", borderRadius: 10, padding: "10px 14px", display: "flex", gap: 10 }}>
        <span>💡</span>
        <p style={{ fontSize: 12.5, color: "var(--text-2)", lineHeight: 1.5 }}>All optional — fill in what you have now and update the rest from your dashboard anytime.</p>
      </div>
      <StepActions role="seller" isSubmitting={isSubmitting} onSkip={() => onSave({}, true)} />
    </form>
  );
}

function SellerStep3({ defaults, storeName, onSave }) {
  const { handleSubmit, setValue, watch, formState: { isSubmitting } } = useForm({
    resolver: zodResolver(s3Schema),
    defaultValues: { accentColor: "#F5A623", ...defaults },
  });
  const accent  = watch("accentColor");
  const [logo,   setLogo]   = useState(defaults?.logoUrl || null);
  const [banner, setBanner] = useState(defaults?.bannerUrl || null);
  const SWATCHES = ["#F5A623", "#2DD4BF", "#6366F1", "#10B981", "#F43F5E", "#0EA5E9", "#8B5CF6", "#EF4444"];
  return (
    <form onSubmit={handleSubmit((d) => onSave({ ...d, logoUrl: logo, bannerUrl: banner }))}
      style={{ display: "flex", flexDirection: "column", gap: 22 }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
        <FF label="Store logo">
          <UploadZone aspect="logo" role="seller" label="Upload logo" hint="Square, 500×500 recommended" value={logo} onChange={(_, u) => setLogo(u)} />
        </FF>
        <FF label="Store banner">
          <UploadZone aspect="banner" role="seller" label="Upload banner" hint="1200×400 recommended" value={banner} onChange={(_, u) => setBanner(u)} />
        </FF>
      </div>
      <FF label="Brand accent colour" hint="Used for buttons and highlights on your storefront.">
        <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", marginTop: 4 }}>
          {SWATCHES.map((sw) => (
            <button key={sw} type="button" className={`ob-swatch${accent === sw ? " active" : ""}`}
              onClick={() => setValue("accentColor", sw)}
              style={{ width: 30, height: 30, borderRadius: 8, background: sw, border: `2px solid ${accent === sw ? "white" : "transparent"}`, cursor: "pointer", position: "relative", transition: "transform .15s, box-shadow .15s", transform: accent === sw ? "scale(1.15)" : "scale(1)" }}>
              {accent === sw && <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ position: "absolute", inset: 0, margin: "auto" }}><path d="M3 7l3 3 5-5" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>}
            </button>
          ))}
          <input type="color" value={accent} onChange={(e) => setValue("accentColor", e.target.value)}
            style={{ width: 30, height: 30, borderRadius: 8, border: "1.5px solid var(--border-2)", cursor: "pointer", background: "none", padding: 2 }} />
          <span style={{ fontFamily: "var(--font-m)", fontSize: 10.5, color: "var(--text-3)" }}>{accent}</span>
        </div>
      </FF>
      {/* Live preview */}
      <FF label="Storefront preview">
        <div style={{ border: "1px solid var(--border-2)", borderRadius: 12, overflow: "hidden", background: "var(--bg-2)" }}>
          <div style={{ height: 72, background: banner ? `url(${banner}) center/cover` : `${accent}18`, borderBottom: `2px solid ${accent}22`, display: "flex", alignItems: "flex-end", padding: "0 14px 0" }}>
            <div style={{ width: 44, height: 44, borderRadius: 11, background: logo ? `url(${logo}) center/cover` : accent, border: "2px solid var(--bg-2)", marginBottom: -22, flexShrink: 0 }} />
          </div>
          <div style={{ padding: "26px 14px 14px" }}>
            <p style={{ fontFamily: "var(--font-d)", fontWeight: 700, fontSize: 14, color: "var(--text)", marginBottom: 3 }}>{storeName || "Your Store Name"}</p>
            <p style={{ fontFamily: "var(--font-m)", fontSize: 10.5, color: "var(--text-3)" }}>woosho.com/{slugify(storeName || "your-store")}</p>
            <div style={{ display: "inline-block", marginTop: 10, padding: "5px 12px", background: accent, borderRadius: 6, fontSize: 11, fontWeight: 600, fontFamily: "var(--font-b)", color: "#000" }}>Visit Store →</div>
          </div>
        </div>
      </FF>
      <StepActions role="seller" isSubmitting={isSubmitting} onSkip={() => onSave({}, true)} />
    </form>
  );
}

function SellerStep4({ defaults, onSave }) {
  const PROD = ["Clothing & Apparel", "Shoes & Bags", "Electronics", "Beauty & Skincare", "Home Decor", "Books & Media", "Sports", "Jewellery", "Art & Prints", "Health", "Food & Beverage", "Kids & Babies"];
  const REGIONS = ["Nigeria", "West Africa", "East Africa", "Pan-Africa", "UK", "Europe", "North America", "Middle East", "Asia", "Worldwide"];
  const STORE = [{ id: "online", icon: "🌐", label: "Online only", desc: "Ship globally" }, { id: "physical", icon: "🏪", label: "Physical", desc: "In-store pickup" }, { id: "both", icon: "⚡", label: "Both", desc: "Best of both" }];
  const FULFILL = [{ id: "self", icon: "📦", label: "Self-fulfill", desc: "You pack & ship" }, { id: "third-party", icon: "🚚", label: "3PL partner", desc: "Logistics partner" }, { id: "both", icon: "🔄", label: "Flexible", desc: "Mix as needed" }];

  const { handleSubmit, watch, setValue, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(s4Schema),
    defaultValues: { sellsWhat: [], storeType: "online", shipRegions: [], fulfillment: "self", ...defaults },
  });

  const sw = watch("sellsWhat") || [];
  const sr = watch("shipRegions") || [];

  return (
    <form onSubmit={handleSubmit(onSave)} style={{ display: "flex", flexDirection: "column", gap: 22 }}>
      <FF label="What do you sell?" error={errors.sellsWhat?.message}>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 4 }}>
          {PROD.map((p) => { const on = sw.includes(p); return <button key={p} type="button" className={`ob-chip${on ? " seller-selected" : ""}`} onClick={() => setValue("sellsWhat", on ? sw.filter((x) => x !== p) : [...sw, p], { shouldValidate: true })}>{on && <CheckSvg />}{p}</button>; })}
        </div>
      </FF>
      <FF label="Store type">
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10, marginTop: 4 }}>
          {STORE.map((t) => <button key={t.id} type="button" className={`ob-toggle${watch("storeType") === t.id ? " seller-selected" : ""}`} onClick={() => setValue("storeType", t.id)}><div style={{ fontSize: 20, marginBottom: 6 }}>{t.icon}</div><p style={{ fontWeight: 600, fontSize: 13, color: "var(--text)", marginBottom: 2 }}>{t.label}</p><p style={{ fontSize: 11.5, color: "var(--text-3)" }}>{t.desc}</p></button>)}
        </div>
      </FF>
      <FF label="Shipping regions" error={errors.shipRegions?.message}>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 4 }}>
          {REGIONS.map((r) => { const on = sr.includes(r); return <button key={r} type="button" className={`ob-chip${on ? " seller-selected" : ""}`} onClick={() => setValue("shipRegions", on ? sr.filter((x) => x !== r) : [...sr, r], { shouldValidate: true })}>{on && <CheckSvg />}{r}</button>; })}
        </div>
      </FF>
      <FF label="Fulfillment">
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10, marginTop: 4 }}>
          {FULFILL.map((f) => <button key={f.id} type="button" className={`ob-toggle${watch("fulfillment") === f.id ? " seller-selected" : ""}`} onClick={() => setValue("fulfillment", f.id)}><div style={{ fontSize: 18, marginBottom: 5 }}>{f.icon}</div><p style={{ fontWeight: 600, fontSize: 12.5, color: "var(--text)", marginBottom: 2 }}>{f.label}</p><p style={{ fontSize: 11.5, color: "var(--text-3)" }}>{f.desc}</p></button>)}
        </div>
      </FF>
      <StepActions role="seller" isSubmitting={isSubmitting} onSkip={() => onSave({}, true)} />
    </form>
  );
}

function SellerStep5({ defaults, onSave }) {
  const [method, setMethod] = useState(defaults?.payoutMethod || "bank");
  const [saving, setSaving] = useState(false);
  const submit = async () => { setSaving(true); await new Promise((r) => setTimeout(r, 600)); onSave({ payoutMethod: method }); setSaving(false); };
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div style={{ background: "linear-gradient(135deg, rgba(245,166,35,.07), transparent)", border: "1px solid var(--amber-border)", borderRadius: 12, padding: "14px 16px" }}>
        <p style={{ fontFamily: "var(--font-d)", fontWeight: 600, fontSize: 14, color: "var(--text)", marginBottom: 4 }}>💰 Get paid within 24–48 hours</p>
        <p style={{ fontSize: 13, color: "var(--text-2)", lineHeight: 1.55 }}>Set up your payout account now and receive earnings automatically after every sale. Safe, encrypted, instant.</p>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        {[{ id: "bank", icon: "🏦", label: "Bank transfer", desc: "Direct to account" }, { id: "skip", icon: "⏳", label: "Do this later", desc: "Set up from dashboard" }].map((m) => (
          <button key={m.id} type="button" className={`ob-toggle${method === m.id ? " seller-selected" : ""}`} onClick={() => setMethod(m.id)}>
            <div style={{ fontSize: 22, marginBottom: 8 }}>{m.icon}</div>
            <p style={{ fontWeight: 600, fontSize: 13.5, color: "var(--text)", marginBottom: 3 }}>{m.label}</p>
            <p style={{ fontSize: 12, color: "var(--text-3)" }}>{m.desc}</p>
          </button>
        ))}
      </div>
      <AnimatePresence>
        {method === "bank" && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} style={{ overflow: "hidden" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <FF label="Account holder name"><input className="ob-input" placeholder="Full legal name" /></FF>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                <FF label="Bank name"><input className="ob-input" placeholder="e.g. GTBank" /></FF>
                <FF label="Account number"><input className="ob-input" placeholder="0123456789" /></FF>
              </div>
              <div style={{ display: "flex", gap: 8, padding: "8px 12px", background: "var(--bg-3)", border: "1px solid var(--border)", borderRadius: 8 }}>
                <span>🔒</span>
                <p style={{ fontSize: 11.5, color: "var(--text-3)" }}>Bank details are encrypted. Never shared with buyers.</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <div style={{ paddingTop: 8, borderTop: "1px solid var(--border)" }}>
        <button className="ob-btn-primary seller" onClick={submit} disabled={saving} style={{ width: "100%", justifyContent: "center" }}>
          {saving ? <><Spinner s={13} /> Saving…</> : <>🚀 Launch my store</>}
        </button>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════════
// STEP CARD (accordion wrapper)
// ════════════════════════════════════════════════════════════════════════════════

function StepCard({ step, title, subtitle, icon, status, isActive, role, onActivate, children }) {
  const done = status === "done";
  return (
    <motion.div layout transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className={`ob-step-card${isActive ? ` active ${role}` : done ? " done" : ""}`}>
      <button type="button" onClick={onActivate} style={{ width: "100%", background: "none", border: "none", cursor: "pointer", padding: "18px 22px", display: "flex", alignItems: "center", gap: 14, textAlign: "left" }}>
        {/* Icon badge */}
        <div style={{
          width: 38, height: 38, borderRadius: 11, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 17, transition: "all .25s",
          background: done ? "var(--green-bg)" : isActive && role === "buyer" ? "var(--teal-bg)" : isActive ? "var(--amber-bg)" : "var(--bg-3)",
          border: `1.5px solid ${done ? "var(--green-border)" : isActive && role === "buyer" ? "var(--teal-border)" : isActive ? "var(--amber-border)" : "var(--border)"}`,
        }}>
          {done
            ? <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 8l3 3.5 7-6.5" stroke="var(--green)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ strokeDasharray: 20, animation: "ob-check .3s ease forwards" }} /></svg>
            : icon}
        </div>
        {/* Title area */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 7, flexWrap: "wrap" }}>
            <p style={{ fontFamily: "var(--font-d)", fontWeight: 700, fontSize: 15, color: "var(--text)", lineHeight: 1.2 }}>{title}</p>
            {done && <span style={{ fontSize: 10, fontWeight: 600, padding: "2px 7px", borderRadius: 99, background: "var(--green-bg)", color: "var(--green)", border: "1px solid var(--green-border)" }}>Done</span>}
            {isActive && <span style={{ fontSize: 10, fontWeight: 600, padding: "2px 7px", borderRadius: 99, background: role === "buyer" ? "var(--teal-bg)" : "var(--amber-bg)", color: role === "buyer" ? "var(--teal)" : "var(--amber)", border: `1px solid ${role === "buyer" ? "var(--teal-border)" : "var(--amber-border)"}` }}>Now</span>}
          </div>
          <p style={{ fontSize: 12, color: "var(--text-3)", marginTop: 2 }}>{subtitle}</p>
        </div>
        {/* Chevron */}
        <motion.div animate={{ rotate: isActive ? 180 : 0 }} transition={{ duration: 0.22 }}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M4 6l4 4 4-4" stroke="var(--text-3)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </motion.div>
      </button>

      <AnimatePresence initial={false}>
        {isActive && (
          <motion.div key="body" initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.38, ease: [0.16, 1, 0.3, 1] }} style={{ overflow: "hidden" }}>
            <div style={{ padding: "0 22px 22px", borderTop: "1px solid var(--border)", paddingTop: 20 }}>
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ════════════════════════════════════════════════════════════════════════════════
// PROGRESS SIDEBAR
// ════════════════════════════════════════════════════════════════════════════════

function ProgressSidebar({ role, steps, completedSteps, currentStep, onStepClick }) {
  const pct  = Math.round((completedSteps.length / steps.length) * 100);
  const done = completedSteps.length === steps.length;
  const R = 42, C = 2 * Math.PI * R;
  const accent = role === "buyer" ? "#2DD4BF" : "#F5A623";

  return (
    <div className="ob-sidebar" style={{ width: 272, flexShrink: 0, position: "sticky", top: 24, alignSelf: "flex-start", display: "flex", flexDirection: "column", gap: 16 }}>

      {/* Role badge */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 14px", background: "var(--bg-1)", border: "1px solid var(--border)", borderRadius: 12 }}>
        <span style={{ fontSize: 18 }}>{role === "buyer" ? "🛍" : "🏪"}</span>
        <div>
          <p style={{ fontFamily: "var(--font-m)", fontSize: 9.5, fontWeight: 600, letterSpacing: ".14em", textTransform: "uppercase", color: "var(--text-3)" }}>Setting up as</p>
          <p style={{ fontFamily: "var(--font-b)", fontWeight: 600, fontSize: 13, color: "var(--text)", lineHeight: 1.2 }}>{role === "buyer" ? "Buyer Account" : "Seller Store"}</p>
        </div>
      </div>

      {/* Progress ring */}
      <div style={{ background: "var(--bg-1)", border: "1px solid var(--border)", borderRadius: 16, padding: "26px 22px 20px", textAlign: "center" }}>
        <div style={{ position: "relative", width: 104, height: 104, margin: "0 auto 14px" }}>
          <svg width="104" height="104" viewBox="0 0 104 104" fill="none" style={{ transform: "rotate(-90deg)" }}>
            <circle cx="52" cy="52" r={R} stroke="var(--border-2)" strokeWidth="5" />
            <motion.circle cx="52" cy="52" r={R} stroke={done ? "var(--green)" : accent} strokeWidth="5"
              strokeLinecap="round" strokeDasharray={C}
              initial={{ strokeDashoffset: C }}
              animate={{ strokeDashoffset: C - (pct / 100) * C }}
              transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }} />
          </svg>
          <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
            {done
              ? <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="ob-float" style={{ fontSize: 30 }}>{role === "buyer" ? "🛍" : "🚀"}</motion.div>
              : <><span style={{ fontFamily: "var(--font-d)", fontWeight: 800, fontSize: 22, color: "var(--text)", lineHeight: 1 }}>{pct}%</span><span style={{ fontSize: 10, color: "var(--text-3)", marginTop: 1 }}>done</span></>}
          </div>
        </div>
        <p style={{ fontFamily: "var(--font-d)", fontWeight: 700, fontSize: 15, color: "var(--text)", marginBottom: 3 }}>
          {done ? (role === "buyer" ? "Ready to shop! 🎉" : "Store is live! 🎉") : pct === 0 ? "Let's go!" : "Great progress"}
        </p>
        <p style={{ fontSize: 12.5, color: "var(--text-3)", lineHeight: 1.5 }}>
          {done ? "Head to your dashboard." : `${steps.length - completedSteps.length} step${steps.length - completedSteps.length !== 1 ? "s" : ""} remaining`}
        </p>
      </div>

      {/* Checklist */}
      <div style={{ background: "var(--bg-1)", border: "1px solid var(--border)", borderRadius: 16, padding: "14px 18px" }}>
        <p style={{ fontFamily: "var(--font-m)", fontSize: 9.5, fontWeight: 600, letterSpacing: ".14em", textTransform: "uppercase", color: "var(--text-3)", marginBottom: 10 }}>Checklist</p>
        {steps.map((step, i) => {
          const isDone   = completedSteps.includes(step.id);
          const isActive = currentStep === step.id;
          return (
            <div key={step.id}>
              <button type="button" onClick={() => onStepClick(step.id)}
                style={{ width: "100%", background: "none", border: "none", cursor: "pointer", textAlign: "left", display: "flex", alignItems: "center", gap: 10, padding: "7px 0", opacity: isDone ? 0.6 : 1 }}>
                <div style={{
                  width: 20, height: 20, borderRadius: "50%", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", transition: "all .25s",
                  background: isDone ? "var(--green-bg)" : isActive ? (role === "buyer" ? "var(--teal-bg)" : "var(--amber-bg)") : "var(--bg-3)",
                  border: `1.5px solid ${isDone ? "var(--green-border)" : isActive ? (role === "buyer" ? "var(--teal-border)" : "var(--amber-border)") : "var(--border-2)"}`,
                }}>
                  {isDone
                    ? <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M2 5l2 2 4-4" stroke="var(--green)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                    : isActive
                      ? <div style={{ width: 6, height: 6, borderRadius: "50%", background: role === "buyer" ? "var(--teal)" : "var(--amber)" }} className="ob-pulse-dot" />
                      : <span style={{ fontFamily: "var(--font-m)", fontSize: 9, fontWeight: 600, color: "var(--text-3)" }}>{i + 1}</span>}
                </div>
                <span style={{ fontSize: 12.5, fontWeight: isActive ? 600 : 400, color: isActive ? "var(--text)" : isDone ? "var(--text-3)" : "var(--text-2)" }}>
                  {step.label}
                </span>
              </button>
              {i < steps.length - 1 && <div style={{ width: 1, height: 12, marginLeft: 9, background: isDone ? (role === "buyer" ? "rgba(45,212,191,.2)" : "rgba(245,166,35,.2)") : "var(--border)" }} />}
            </div>
          );
        })}
      </div>

      {/* CTA when done */}
      <AnimatePresence>
        {done && (
          <motion.button initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            className={`ob-btn-primary ${role}`}
            style={{ width: "100%", justifyContent: "center", padding: 13 }}
            onClick={() => { /* navigate('/account') */ }}>
            {role === "buyer" ? "🛍 Start Shopping" : "🏪 Open Dashboard"}
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════════
// ROLE SELECTION SCREEN
// ════════════════════════════════════════════════════════════════════════════════

function RoleSelection({ onSelect }) {
  const [hovered, setHovered] = useState(null);
  const [selected, setSelected] = useState(null);
  const [confirming, setConfirming] = useState(false);

  const choose = async (role) => {
    if (confirming) return;
    setSelected(role);
    setConfirming(true);
    await new Promise((r) => setTimeout(r, 480));
    onSelect(role);
  };

  const BUYER_PERKS = ["Browse thousands of verified sellers", "Wishlist & save your favourites", "Real-time order tracking", "Secure checkout, always"];
  const SELLER_PERKS = ["Launch your storefront in minutes", "Reach buyers across Africa & beyond", "Built-in analytics & order tools", "Get paid within 24–48 hrs"];

  const cardVariants = {
    initial:  { opacity: 0, y: 28 },
    animate:  (i) => ({ opacity: 1, y: 0, transition: { delay: i * 0.12, duration: 0.55, ease: [0.16, 1, 0.3, 1] } }),
    exit:     (role) => ({
      opacity: 0, scale: selected === role ? 1.04 : 0.94, y: selected === role ? -12 : 8,
      transition: { duration: 0.38, ease: [0.4, 0, 0.2, 1] },
    }),
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "40px 24px", position: "relative" }}>
      {/* Background texture */}
      <div style={{ position: "absolute", inset: 0, opacity: 0.025, backgroundImage: "linear-gradient(var(--text) 1px, transparent 1px), linear-gradient(90deg, var(--text) 1px, transparent 1px)", backgroundSize: "56px 56px", pointerEvents: "none" }} />
      {/* Ambient glows */}
      <div style={{ position: "absolute", top: "5%", left: "5%", width: 420, height: 420, borderRadius: "50%", background: "radial-gradient(circle, rgba(45,212,191,.055) 0%, transparent 70%)", pointerEvents: "none" }} />
      <div style={{ position: "absolute", bottom: "10%", right: "5%", width: 380, height: 380, borderRadius: "50%", background: "radial-gradient(circle, rgba(245,166,35,.055) 0%, transparent 70%)", pointerEvents: "none" }} />

      <div style={{ position: "relative", zIndex: 1, width: "100%", maxWidth: 860 }}>
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          style={{ textAlign: "center", marginBottom: 52 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, marginBottom: 20 }}>
            <div style={{ height: 1, width: 28, background: "var(--amber)", opacity: 0.5 }} />
            <span style={{ fontFamily: "var(--font-d)", fontWeight: 800, fontSize: 22, color: "var(--amber)", letterSpacing: "-0.02em" }}>Woosho</span>
            <div style={{ height: 1, width: 28, background: "var(--amber)", opacity: 0.5 }} />
          </div>
          <h1 style={{ fontFamily: "var(--font-d)", fontWeight: 800, fontSize: "clamp(30px, 5vw, 48px)", color: "var(--text)", letterSpacing: "-0.03em", lineHeight: 1.1, marginBottom: 12 }}>
            What do you want to do
            <br />on Woosho?
          </h1>
          <p style={{ fontFamily: "var(--font-b)", fontSize: 15, color: "var(--text-2)", maxWidth: 380, margin: "0 auto", lineHeight: 1.6 }}>
            Choose your path — you can always add the other role from your dashboard.
          </p>
        </motion.div>

        {/* Role cards */}
        <AnimatePresence mode="wait">
          {!confirming ? (
            <div className="ob-role-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
              {/* Buyer card */}
              <motion.div custom={0} variants={cardVariants} initial="initial" animate="animate"
                className={`ob-role-card buyer${selected === "buyer" ? " selected" : ""}`}
                onMouseEnter={() => setHovered("buyer")} onMouseLeave={() => setHovered(null)}
                onClick={() => choose("buyer")}>
                {/* Emoji badge */}
                <div className="ob-role-emoji" style={{
                  width: 80, height: 80, borderRadius: 20, marginBottom: 22, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 44,
                  background: "var(--teal-bg)", border: "1.5px solid var(--teal-border)",
                  boxShadow: hovered === "buyer" ? "0 8px 32px rgba(45,212,191,.15)" : "none",
                  transition: "box-shadow .25s",
                }}>🛍</div>
                {/* Title */}
                <h2 style={{ fontFamily: "var(--font-d)", fontWeight: 800, fontSize: 24, color: "var(--text)", letterSpacing: "-0.02em", marginBottom: 6, lineHeight: 1.1 }}>
                  Shop as a Buyer
                </h2>
                <p style={{ fontFamily: "var(--font-b)", fontSize: 13.5, color: "var(--text-3)", marginBottom: 24, lineHeight: 1.55 }}>
                  Discover unique products from verified sellers across Africa and the world.
                </p>
                {/* Perks */}
                <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 11, marginBottom: 28 }}>
                  {BUYER_PERKS.map((p) => (
                    <li key={p} style={{ display: "flex", alignItems: "flex-start", gap: 9 }}>
                      <div style={{ width: 18, height: 18, borderRadius: "50%", background: "var(--teal-bg)", border: "1px solid var(--teal-border)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1 }}>
                        <svg width="9" height="9" viewBox="0 0 9 9" fill="none"><path d="M1.5 4.5l2 2 4-4" stroke="var(--teal)" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" /></svg>
                      </div>
                      <span style={{ fontFamily: "var(--font-b)", fontSize: 13, color: "var(--text-2)", lineHeight: 1.4 }}>{p}</span>
                    </li>
                  ))}
                </ul>
                {/* CTA pill */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "11px 16px", background: "var(--teal-bg)", border: "1.5px solid var(--teal-border)", borderRadius: 11, transition: "all .2s" }}>
                  <span style={{ fontFamily: "var(--font-b)", fontWeight: 600, fontSize: 13.5, color: "var(--teal)" }}>Start shopping</span>
                  <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M4 9h10M10 5l4 4-4 4" stroke="var(--teal)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
                </div>
              </motion.div>

              {/* Seller card */}
              <motion.div custom={1} variants={cardVariants} initial="initial" animate="animate"
                className={`ob-role-card seller${selected === "seller" ? " selected" : ""}`}
                onMouseEnter={() => setHovered("seller")} onMouseLeave={() => setHovered(null)}
                onClick={() => choose("seller")}>
                <div className="ob-role-emoji" style={{
                  width: 80, height: 80, borderRadius: 20, marginBottom: 22, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 44,
                  background: "var(--amber-bg)", border: "1.5px solid var(--amber-border)",
                  boxShadow: hovered === "seller" ? "0 8px 32px rgba(245,166,35,.15)" : "none",
                  transition: "box-shadow .25s",
                }}>🏪</div>
                <h2 style={{ fontFamily: "var(--font-d)", fontWeight: 800, fontSize: 24, color: "var(--text)", letterSpacing: "-0.02em", marginBottom: 6, lineHeight: 1.1 }}>
                  Start Selling
                </h2>
                <p style={{ fontFamily: "var(--font-b)", fontSize: 13.5, color: "var(--text-3)", marginBottom: 24, lineHeight: 1.55 }}>
                  Open your store on Woosho and sell to millions of buyers — in minutes, not days.
                </p>
                <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 11, marginBottom: 28 }}>
                  {SELLER_PERKS.map((p) => (
                    <li key={p} style={{ display: "flex", alignItems: "flex-start", gap: 9 }}>
                      <div style={{ width: 18, height: 18, borderRadius: "50%", background: "var(--amber-bg)", border: "1px solid var(--amber-border)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1 }}>
                        <svg width="9" height="9" viewBox="0 0 9 9" fill="none"><path d="M1.5 4.5l2 2 4-4" stroke="var(--amber)" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" /></svg>
                      </div>
                      <span style={{ fontFamily: "var(--font-b)", fontSize: 13, color: "var(--text-2)", lineHeight: 1.4 }}>{p}</span>
                    </li>
                  ))}
                </ul>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "11px 16px", background: "var(--amber-bg)", border: "1.5px solid var(--amber-border)", borderRadius: 11, transition: "all .2s" }}>
                  <span style={{ fontFamily: "var(--font-b)", fontWeight: 600, fontSize: 13.5, color: "var(--amber)" }}>Open my store</span>
                  <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M4 9h10M10 5l4 4-4 4" stroke="var(--amber)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
                </div>
              </motion.div>
            </div>
          ) : (
            <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
              style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16, padding: "60px 0" }}>
              <div style={{ width: 64, height: 64, borderRadius: "50%", background: selected === "buyer" ? "var(--teal-bg)" : "var(--amber-bg)", border: `2px solid ${selected === "buyer" ? "var(--teal-border)" : "var(--amber-border)"}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28 }}>
                {selected === "buyer" ? "🛍" : "🏪"}
              </div>
              <p style={{ fontFamily: "var(--font-d)", fontWeight: 700, fontSize: 18, color: "var(--text)" }}>
                Setting up your {selected === "buyer" ? "buyer" : "seller"} account…
              </p>
              <Spinner s={18} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════════
// CONFETTI
// ════════════════════════════════════════════════════════════════════════════════
function Confetti({ role }) {
  const pieces = useMemo(() => Array.from({ length: 20 }, (_, i) => ({
    id: i, left: `${(i / 19) * 100}%`, delay: `${(i * 0.07).toFixed(2)}s`, size: 5 + (i % 3) * 2,
    color: role === "buyer" ? ["#2DD4BF", "#10B981", "#E8E4DA", "#7DD3FC", "#34D399"][i % 5] : ["#F5A623", "#FFC85C", "#E8E4DA", "#F59E0B", "#D97706"][i % 5],
  })), [role]);
  return (
    <div style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", pointerEvents: "none", zIndex: 999, overflow: "hidden" }}>
      {pieces.map((p) => <div key={p.id} style={{ position: "absolute", top: -12, left: p.left, width: p.size, height: p.size, borderRadius: "50%", background: p.color, animation: `ob-confetti 2s ${p.delay} ease-in both` }} />)}
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════════
// ONBOARDING FLOW (shared shell for buyer + seller)
// ════════════════════════════════════════════════════════════════════════════════

const BUYER_STEPS  = [
  { id: 1, label: "Your Profile",   icon: "👤", title: "Your profile",    subtitle: "Name, photo, and username" },
  { id: 2, label: "What You Love",  icon: "❤️", title: "What you love",   subtitle: "Personalise your shopping feed" },
  { id: 3, label: "Delivery",       icon: "📍", title: "Delivery address", subtitle: "Where should we send your orders?" },
  { id: 4, label: "Payment",        icon: "💳", title: "Payment method",  subtitle: "Save a card for faster checkout" },
];
const SELLER_STEPS = [
  { id: 1, label: "Store Identity",   icon: "🏪", title: "Name your store",      subtitle: "Your brand presence on Woosho" },
  { id: 2, label: "Contact Details",  icon: "📋", title: "Contact & business",    subtitle: "How buyers and Woosho reach you" },
  { id: 3, label: "Store Branding",   icon: "🎨", title: "Brand your storefront", subtitle: "Logo, banner, and signature colour" },
  { id: 4, label: "Selling Style",    icon: "⚙️", title: "Your selling style",    subtitle: "Products, regions, fulfillment" },
  { id: 5, label: "Get Paid",         icon: "💰", title: "Payout setup",          subtitle: "Connect your bank or set up later" },
];

function OnboardingFlow({ role, state, setState }) {
  const navigate  = useNavigate();
  const steps     = role === "buyer" ? BUYER_STEPS : SELLER_STEPS;
  const stepsData = role === "buyer" ? ["b1", "b2", "b3", "b4"] : ["s1", "s2", "s3", "s4", "s5"];
  const [confetti, setConfetti] = useState(false);
  const contentRef = useRef(null);

  useEffect(() => {
    if (state.completedSteps.length === steps.length) {
      setConfetti(true);
      const t = setTimeout(() => navigate("/account"), 3200);
      return () => clearTimeout(t);
    }
  }, [state.completedSteps.length]);

  const saveStep = useCallback(async (stepId, data) => {
    setState((prev) => {
      const completed = prev.completedSteps.includes(stepId) ? prev.completedSteps : [...prev.completedSteps, stepId];
      const next = steps.find((s) => !completed.includes(s.id))?.id ?? stepId;
      return { ...prev, completedSteps: completed, currentStep: next, data: { ...prev.data, [stepsData[stepId - 1]]: data } };
    });
    // Scroll to next step
    setTimeout(() => {
      const el = contentRef.current?.querySelector(`[data-step="${stepId + 1}"]`);
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 350);
    // supabase persist: saveOnboardingStep(user.id, stepId, data).catch(console.error)
  }, [steps, stepsData]);

  const activate = (id) => setState((prev) => ({ ...prev, currentStep: id }));

  const storeName = state.data.s1?.storeName || "";
  const user = { name: "Amara Osei", email: "amara@example.com" }; // replace with useAuth()

  return (
    <>
      {confetti && <Confetti role={role} />}
      <div className="ob-page-layout" style={{ display: "flex", gap: 24, alignItems: "flex-start" }}>
        {/* Steps column */}
        <div ref={contentRef} className="ob-steps-col" style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 10 }}>
          {steps.map((step) => {
            const status = state.completedSteps.includes(step.id) ? "done" : state.currentStep === step.id ? "active" : "idle";
            const isActive = state.currentStep === step.id;
            const stepKey = stepsData[step.id - 1];

            return (
              <div key={step.id} data-step={step.id}>
                <StepCard {...step} role={role} status={status} isActive={isActive} onActivate={() => activate(step.id)}>
                  {/* Render the correct step component */}
                  {role === "buyer" && step.id === 1 && <BuyerStep1 defaults={state.data.b1} user={user} onSave={(d) => saveStep(1, d)} />}
                  {role === "buyer" && step.id === 2 && <BuyerStep2 defaults={state.data.b2} onSave={(d) => saveStep(2, d)} />}
                  {role === "buyer" && step.id === 3 && <BuyerStep3 defaults={state.data.b3} onSave={(d) => saveStep(3, d)} />}
                  {role === "buyer" && step.id === 4 && <BuyerStep4 defaults={state.data.b4} onSave={(d) => saveStep(4, d)} />}
                  {role === "seller" && step.id === 1 && <SellerStep1 defaults={state.data.s1} onSave={(d) => saveStep(1, d)} />}
                  {role === "seller" && step.id === 2 && <SellerStep2 defaults={state.data.s2} onSave={(d) => saveStep(2, d)} />}
                  {role === "seller" && step.id === 3 && <SellerStep3 defaults={state.data.s3} storeName={storeName} onSave={(d) => saveStep(3, d)} />}
                  {role === "seller" && step.id === 4 && <SellerStep4 defaults={state.data.s4} onSave={(d) => saveStep(4, d)} />}
                  {role === "seller" && step.id === 5 && <SellerStep5 defaults={state.data.s5} onSave={(d) => saveStep(5, d)} />}
                </StepCard>
              </div>
            );
          })}
        </div>
        {/* Sidebar */}
        <ProgressSidebar role={role} steps={steps} completedSteps={state.completedSteps} currentStep={state.currentStep} onStepClick={activate} />
      </div>
    </>
  );
}

// ════════════════════════════════════════════════════════════════════════════════
// MAIN EXPORT — OnboardingPage
// ════════════════════════════════════════════════════════════════════════════════

export default function OnboardingPage() {
  const navigate = useNavigate();
  const [state, setState] = useState(loadState);

  useEffect(() => {
    const fetchUserRole = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user?.user_metadata?.role && !state.role) {
        setState((prev) => ({ ...prev, role: session.user.user_metadata.role, currentStep: 1, completedSteps: [] }));
      }
    };
    fetchUserRole();
  }, []);

  // Persist on every change
  useEffect(() => { persistState(state); }, [state]);

  // Route protection (replace with your auth hook)
  // const { user, loading } = useAuth();
  // if (loading) return <LoadingScreen />;
  // if (!user) { navigate('/login'); return null; }
  // if (isOnboardingComplete(user)) { navigate('/account'); return null; }

  const handleRoleSelect = (role) => {
    setState((prev) => ({ ...prev, role, currentStep: 1, completedSteps: [] }));
    // supabase: await supabase.from('profiles').update({ role }).eq('id', user.id)
  };

  const resetRole = () => setState((prev) => ({ ...prev, role: null, currentStep: 1, completedSteps: [] }));

  const showFlow = !!state.role;

  return (
    <div className="ob-root">
      <style>{GLOBAL_STYLES}</style>

      {/* ── Top nav ── */}
      <header style={{
        borderBottom: "1px solid var(--border)", background: "rgba(6,11,20,.92)",
        backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)",
        padding: "0 24px", height: 56, display: "flex", alignItems: "center", justifyContent: "space-between",
        position: "sticky", top: 0, zIndex: 50,
      }}
      className='pt-20'
      >
        <span style={{ fontFamily: "var(--font-d)", fontWeight: 800, fontSize: 19, color: "var(--amber)", letterSpacing: "-0.02em", cursor: "pointer" }}
          onClick={resetRole}>Woosho</span>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {showFlow && (
            <button className="ob-btn-ghost" style={{ padding: "6px 10px", fontSize: 12 }} onClick={resetRole}>
              ← Change role
            </button>
          )}
          <button className="ob-btn-ghost" style={{ padding: "6px 12px", fontSize: 12 }} onClick={() => navigate("/account")}>
            Save & exit
          </button>
        </div>
      </header>

      {/* ── Content ── */}
      <AnimatePresence mode="wait">
        {!showFlow ? (
          <motion.div key="role-select"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.3 }}>
            <RoleSelection onSelect={handleRoleSelect} />
          </motion.div>
        ) : (
          <motion.div key={`flow-${state.role}`}
            initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}>
            <div style={{ maxWidth: 1080, margin: "0 auto", padding: "36px 20px 80px" }}>
              {/* Flow heading */}
              <div style={{ marginBottom: 28 }}>
                <h1 style={{ fontFamily: "var(--font-d)", fontWeight: 800, fontSize: 27, color: "var(--text)", letterSpacing: "-0.025em", marginBottom: 6 }}>
                  {state.role === "buyer" ? "Set up your buyer account" : "Set up your store"}
                </h1>
                <p style={{ fontSize: 14, color: "var(--text-2)", maxWidth: 460, lineHeight: 1.6 }}>
                  {state.role === "buyer"
                    ? "Quick setup — personalise your experience and you're ready to discover amazing products."
                    : "A few quick steps to get you selling on Woosho. Takes under 5 minutes — and you can always come back to finish."}
                </p>
              </div>

              <OnboardingFlow role={state.role} state={state} setState={setState} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}