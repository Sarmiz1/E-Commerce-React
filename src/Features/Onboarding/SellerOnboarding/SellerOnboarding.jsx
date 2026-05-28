// src/pages/SellerOnboarding/SellerOnboardingPage.jsx
//
// ── WooSho Seller Onboarding ────────────────────────────────────────────────
//
//  ARCHITECTURE (production: split into these modules)
//  ├── pages/SellerOnboarding/
//  │   ├── index.jsx                 ← Route entry + auth guard
//  │   └── SellerOnboardingPage.jsx  ← This file (main layout)
//  ├── features/onboarding/
//  │   ├── Components/
//  │   │   ├── ProgressSidebar.jsx
//  │   │   ├── StepCard.jsx
//  │   │   ├── steps/
//  │   │   │   ├── Step1Identity.jsx
//  │   │   │   ├── Step2Contact.jsx
//  │   │   │   ├── Step3Branding.jsx
//  │   │   │   ├── Step4Preferences.jsx
//  │   │   │   └── Step5Payout.jsx
//  │   │   └── shared/
//  │   │       ├── UploadZone.jsx
//  │   │       ├── ChipSelect.jsx
//  │   │       └── FormField.jsx
//  │   ├── hooks/useOnboarding.js
//  │   ├── lib/schemas.js
//  │   └── lib/onboardingApi.js
//
// ── Route logic ──────────────────────────────────────────────────────────────
//  • Requires auth (redirect to /login if not)
//  • Sellers already onboarded → redirect to /account
//  • Supports Google OAuth redirect from /auth/callback
//  • Progress auto-saved to Supabase + localStorage (resilient)
//
// ── Supabase tables used ──────────────────────────────────────────────────────
//  profiles         — user identity (already exists post-auth)
//  seller_profiles  — created only on onboarding completion
//  addresses        — seller business address
// ─────────────────────────────────────────────────────────────────────────────

import {
  useState, useEffect, useCallback, useRef, useMemo,
} from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate } from "react-router-dom";
// import { supabase } from "@/lib/supabase";
// import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

// ─── WooSho Brand Tokens ──────────────────────────────────────────────────────
const BRAND = `
  @import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,300;12..96,400;12..96,500;12..96,600;12..96,700;12..96,800&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,300&family=JetBrains+Mono:wght@400;500;600&display=swap');

  *, *::before, *::after { box-sizing: border-box; }

  .ob-root {
    --bg:       #060B14;
    --bg-1:     #0C1322;
    --bg-2:     #111B2E;
    --bg-3:     #18243A;
    --bg-4:     #1E2D47;
    --border:   rgba(255,255,255,0.055);
    --border-2: rgba(255,255,255,0.09);
    --border-3: rgba(255,255,255,0.14);
    --amber:    #F5A623;
    --amber-l:  #FFC85C;
    --amber-d:  #C47E0A;
    --amber-bg: rgba(245,166,35,0.08);
    --green:    #10B981;
    --green-bg: rgba(16,185,129,0.09);
    --text:     #E8E4DA;
    --text-2:   #9199A8;
    --text-3:   #49566A;
    --font-d:   'Bricolage Grotesque', sans-serif;
    --font-b:   'DM Sans', sans-serif;
    --font-m:   'JetBrains Mono', monospace;

    font-family: var(--font-b);
    background: var(--bg);
    color: var(--text);
    min-height: 100vh;
  }

  /* Form primitives */
  .ob-input {
    width: 100%;
    background: var(--bg-3);
    border: 1.5px solid var(--border-2);
    border-radius: 10px;
    padding: 11px 14px;
    font-family: var(--font-b);
    font-size: 14px;
    font-weight: 400;
    color: var(--text);
    outline: none;
    transition: border-color .18s, box-shadow .18s, background .18s;
    -webkit-appearance: none;
  }
  .ob-input::placeholder { color: var(--text-3); }
  .ob-input:focus {
    border-color: rgba(245,166,35,.5);
    background: var(--bg-4);
    box-shadow: 0 0 0 3px rgba(245,166,35,.1);
  }
  .ob-input:disabled { opacity: .4; cursor: not-allowed; }

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
    min-height: 90px;
    line-height: 1.65;
    transition: border-color .18s, box-shadow .18s;
  }
  .ob-textarea::placeholder { color: var(--text-3); }
  .ob-textarea:focus {
    border-color: rgba(245,166,35,.5);
    box-shadow: 0 0 0 3px rgba(245,166,35,.1);
  }

  .ob-label {
    display: block;
    font-family: var(--font-b);
    font-size: 12.5px;
    font-weight: 500;
    color: var(--text-2);
    margin-bottom: 6px;
  }
  .ob-label-opt::after {
    content: ' — optional';
    font-weight: 400;
    color: var(--text-3);
    font-size: 11px;
  }

  .ob-error {
    font-size: 11.5px;
    color: #F87171;
    margin-top: 4px;
    font-weight: 500;
  }

  /* Scroll */
  .ob-scroll::-webkit-scrollbar { width: 4px; }
  .ob-scroll::-webkit-scrollbar-thumb { background: var(--border-2); border-radius: 99px; }

  @keyframes ob-spin { to { transform: rotate(360deg); } }
  @keyframes ob-pop  { 0% { transform: scale(.85); opacity: 0; } 100% { transform: scale(1); opacity: 1; } }
  @keyframes ob-check { 0% { stroke-dashoffset: 24; } 100% { stroke-dashoffset: 0; } }
  @keyframes ob-pulse { 0%,100%{opacity:1} 50%{opacity:.4} }
  @keyframes ob-float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-5px)} }
  @keyframes ob-confetti-fall {
    0%   { transform: translateY(-10px) rotate(0deg);  opacity: 1; }
    100% { transform: translateY(80px)  rotate(720deg); opacity: 0; }
  }

  .ob-spin { animation: ob-spin 0.7s linear infinite; }
  .ob-float{ animation: ob-float 3.5s ease-in-out infinite; }

  /* Upload zone */
  .ob-upload-zone {
    border: 1.5px dashed var(--border-2);
    border-radius: 12px;
    cursor: pointer;
    transition: border-color .2s, background .2s;
    position: relative;
    overflow: hidden;
  }
  .ob-upload-zone:hover,
  .ob-upload-zone.drag-over {
    border-color: rgba(245,166,35,.45);
    background: rgba(245,166,35,.04);
  }

  /* Chip */
  .ob-chip {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    padding: 6px 13px;
    border-radius: 99px;
    font-size: 12.5px;
    font-weight: 500;
    cursor: pointer;
    border: 1.5px solid var(--border-2);
    background: var(--bg-2);
    color: var(--text-2);
    transition: all .15s;
    user-select: none;
  }
  .ob-chip:hover {
    border-color: var(--border-3);
    color: var(--text);
  }
  .ob-chip.selected {
    background: var(--amber-bg);
    border-color: rgba(245,166,35,.35);
    color: var(--amber);
  }

  /* Toggle card */
  .ob-toggle-card {
    border: 1.5px solid var(--border-2);
    border-radius: 12px;
    padding: 14px 16px;
    cursor: pointer;
    transition: all .18s;
    background: var(--bg-2);
  }
  .ob-toggle-card:hover { border-color: var(--border-3); }
  .ob-toggle-card.selected {
    border-color: rgba(245,166,35,.4);
    background: rgba(245,166,35,.06);
  }

  /* Color swatch */
  .ob-swatch {
    width: 32px;
    height: 32px;
    border-radius: 8px;
    cursor: pointer;
    transition: transform .15s, box-shadow .15s;
    position: relative;
    border: 2px solid transparent;
  }
  .ob-swatch:hover   { transform: scale(1.12); }
  .ob-swatch.active  { border-color: var(--text); box-shadow: 0 0 0 3px rgba(232,228,218,.2); }

  /* Step card */
  .ob-step-card {
    border: 1px solid var(--border);
    border-radius: 16px;
    overflow: hidden;
    background: var(--bg-1);
    transition: border-color .25s;
  }
  .ob-step-card.active  { border-color: var(--border-2); }
  .ob-step-card.done    { border-color: rgba(16,185,129,.2); }
  .ob-step-card.locked  { opacity: .55; }

  /* Buttons */
  .ob-btn-primary {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 11px 22px;
    background: var(--amber);
    color: #0D0800;
    border: none;
    border-radius: 10px;
    font-family: var(--font-b);
    font-size: 13.5px;
    font-weight: 600;
    cursor: pointer;
    transition: background .15s, transform .1s, opacity .15s;
    white-space: nowrap;
  }
  .ob-btn-primary:hover   { background: var(--amber-l); }
  .ob-btn-primary:active  { transform: scale(.97); }
  .ob-btn-primary:disabled { opacity: .45; cursor: not-allowed; transform: none; }

  .ob-btn-ghost {
    display: inline-flex;
    align-items: center;
    gap: 7px;
    padding: 10px 18px;
    background: transparent;
    color: var(--text-2);
    border: 1.5px solid var(--border-2);
    border-radius: 10px;
    font-family: var(--font-b);
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;
    transition: all .15s;
  }
  .ob-btn-ghost:hover {
    background: var(--bg-3);
    color: var(--text);
    border-color: var(--border-3);
  }

  .ob-btn-skip {
    background: none;
    border: none;
    color: var(--text-3);
    font-family: var(--font-b);
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;
    transition: color .15s;
    padding: 10px 4px;
    text-decoration: underline;
    text-underline-offset: 3px;
  }
  .ob-btn-skip:hover { color: var(--text-2); }

  @media (max-width: 1024px) {
    .ob-layout{ flex-direction: column !important; }
    .ob-sidebar{ width: 100% !important; position: static !important; }
    .ob-content{ max-width: 100% !important; }
  }
`;

// ─── Zod Schemas (production: move to features/onboarding/lib/schemas.js) ─────
const step1Schema = z.object({
  storeName: z.string().min(2, "Store name must be at least 2 characters").max(60),
  category: z.string().min(1, "Please select a category"),
  description: z.string().min(20, "Add a bit more — 20+ characters").max(500).optional().or(z.literal("")),
});

const step2Schema = z.object({
  phone: z.string().min(7, "Enter a valid phone number").optional().or(z.literal("")),
  businessEmail: z.string().email("Enter a valid email").optional().or(z.literal("")),
  supportEmail: z.string().email("Enter a valid email").optional().or(z.literal("")),
  country: z.string().optional(),
  city: z.string().optional(),
  regNumber: z.string().optional(),
});

const step3Schema = z.object({
  accentColor: z.string().optional(),
});

const step4Schema = z.object({
  sellsWhat: z.array(z.string()).min(1, "Pick at least one category"),
  storeType: z.enum(["online", "physical", "both"]),
  shipRegions: z.array(z.string()).min(1, "Select at least one region"),
  fulfillment: z.enum(["self", "third-party", "both"]),
});

const step5Schema = z.object({
  payoutMethod: z.enum(["bank", "skip"]),
  accountName: z.string().optional(),
  bankName: z.string().optional(),
  accountNumber: z.string().optional(),
});

// ─── Onboarding state (production: useOnboarding.js hook) ────────────────────
const STORAGE_KEY = "woosho_onboarding_v1";

const defaultState = {
  currentStep: 1,
  completedSteps: [],
  data: { step1: {}, step2: {}, step3: { accentColor: "#F5A623" }, step4: {}, step5: {} },
};

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? { ...defaultState, ...JSON.parse(raw) } : defaultState;
  } catch { return defaultState; }
}

function saveState(state) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch { }
}

// ─── Supabase API (production: features/onboarding/lib/onboardingApi.js) ──────
/*
export async function saveOnboardingStep(userId, step, data) {
  const { error } = await supabase
    .from("seller_profiles")
    .upsert({
      user_id: userId,
      onboarding_step: step,
      onboarding_data: data,
      updated_at: new Date().toISOString(),
    }, { onConflict: "user_id" });
  if (error) throw error;
}

export async function completeOnboarding(userId, allData) {
  const { error: profileErr } = await supabase
    .from("seller_profiles")
    .upsert({
      user_id: userId,
      store_name: allData.step1.storeName,
      store_slug: generateSlug(allData.step1.storeName),
      category: allData.step1.category,
      description: allData.step1.description,
      accent_color: allData.step3.accentColor,
      onboarding_complete: true,
      updated_at: new Date().toISOString(),
    }, { onConflict: "user_id" });

  if (profileErr) throw profileErr;

  if (allData.step2.country) {
    await supabase.from("addresses").insert({
      user_id: userId,
      country: allData.step2.country,
      city: allData.step2.city,
      type: "business",
    });
  }

  // Update profiles role to seller
  await supabase
    .from("profiles")
    .update({ role: "seller", phone: allData.step2.phone })
    .eq("id", userId);
}

export async function checkOnboardingStatus(userId) {
  const { data, error } = await supabase
    .from("seller_profiles")
    .select("onboarding_complete, onboarding_step, onboarding_data")
    .eq("user_id", userId)
    .single();
  if (error) return null;
  return data;
}
*/

// ─── Utilities ────────────────────────────────────────────────────────────────
function generateSlug(name = "") {
  return name.toLowerCase().replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-").slice(0, 32);
}

// ─── Shared UI Primitives ────────────────────────────────────────────────────
function FormField({ label, error, optional, children, hint }) {
  return (
    <div>
      {label && (
        <label className={`ob-label${optional ? " ob-label-opt" : ""}`}>{label}</label>
      )}
      {children}
      {hint && !error && <p style={{ fontSize: 11.5, color: "var(--text-3)", marginTop: 4 }}>{hint}</p>}
      {error && <p className="ob-error">{error}</p>}
    </div>
  );
}

function Spinner({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className="ob-spin">
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" opacity=".2" />
      <path fill="currentColor" d="M4 12a8 8 0 018-8v8z" opacity=".75" />
    </svg>
  );
}

// Chip multiselect
function ChipSelect({ options, value = [], onChange, max }) {
  const toggle = (opt) => {
    if (value.includes(opt)) {
      onChange(value.filter((v) => v !== opt));
    } else if (!max || value.length < max) {
      onChange([...value, opt]);
    }
  };
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
      {options.map((opt) => (
        <button key={opt} type="button" className={`ob-chip${value.includes(opt) ? " selected" : ""}`}
          onClick={() => toggle(opt)}>
          {value.includes(opt) && (
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
              <path d="M2 5l2 2 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
          {opt}
        </button>
      ))}
    </div>
  );
}

// UploadZone
function UploadZone({ label, hint, accept = "image/*", value, onChange, aspect }) {
  const inputRef = useRef(null);
  const [dragging, setDragging] = useState(false);
  const [preview, setPreview] = useState(value || null);

  const handleFile = (file) => {
    if (!file || !file.type.startsWith("image/")) return;
    const url = URL.createObjectURL(file);
    setPreview(url);
    onChange?.(file, url);
  };

  const onDrop = (e) => {
    e.preventDefault(); setDragging(false);
    handleFile(e.dataTransfer.files[0]);
  };

  return (
    <div className={`ob-upload-zone${dragging ? " drag-over" : ""}`}
      style={{ minHeight: aspect === "banner" ? 100 : 80, display: "flex", alignItems: "center", justifyContent: "center" }}
      onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={onDrop}
      onClick={() => inputRef.current?.click()}>

      <input ref={inputRef} type="file" accept={accept} style={{ display: "none" }}
        onChange={(e) => handleFile(e.target.files[0])} />

      {preview ? (
        <div style={{ position: "relative", width: "100%", height: aspect === "banner" ? 96 : 76 }}>
          <img src={preview} alt="preview" style={{
            width: "100%", height: "100%", objectFit: "cover", borderRadius: 10,
          }} />
          <button type="button"
            onClick={(e) => { e.stopPropagation(); setPreview(null); onChange?.(null, null); }}
            style={{
              position: "absolute", top: 6, right: 6,
              width: 22, height: 22, borderRadius: "50%",
              background: "rgba(0,0,0,.65)", border: "none", cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
              color: "#fff", fontSize: 12, lineHeight: 1,
            }}>✕</button>
        </div>
      ) : (
        <div style={{ textAlign: "center", padding: "20px 16px" }}>
          <div style={{ fontSize: 22, marginBottom: 6 }}>
            {aspect === "logo" ? "🖼" : aspect === "banner" ? "🏞" : "📁"}
          </div>
          <p style={{ fontFamily: "var(--font-b)", fontSize: 13, fontWeight: 500, color: "var(--text-2)", marginBottom: 3 }}>
            {label}
          </p>
          <p style={{ fontFamily: "var(--font-b)", fontSize: 11.5, color: "var(--text-3)" }}>
            {hint || "PNG, JPG up to 5MB · Drag or click"}
          </p>
        </div>
      )}
    </div>
  );
}

// ─── Step 1 — Store Identity ──────────────────────────────────────────────────
function Step1Identity({ defaultValues, onSave }) {
  const { register, handleSubmit, watch, formState: { errors, isSubmitting }, setValue } = useForm({
    resolver: zodResolver(step1Schema),
    defaultValues: { storeName: "", category: "", description: "", ...defaultValues },
  });

  const storeName = watch("storeName");
  const slug = generateSlug(storeName);
  const [aiLoading, setAiLoading] = useState(false);

  const suggestDescription = async () => {
    if (!storeName) return;
    setAiLoading(true);
    await new Promise((r) => setTimeout(r, 1400));
    const suggestions = {
      "Fashion": `${storeName} brings you curated fashion pieces that blend contemporary style with everyday wearability. From statement outfits to timeless basics — built for the modern wardrobe.`,
      "Electronics": `${storeName} delivers premium electronics and tech essentials. We source only the best gadgets, accessories, and devices to keep you ahead of the curve.`,
      "default": `${storeName} is a carefully curated marketplace bringing quality products and exceptional service to customers across the globe. We believe great products deserve great presentation.`,
    };
    const cat = watch("category");
    setValue("description", suggestions[cat] || suggestions["default"], { shouldValidate: true });
    setAiLoading(false);
  };

  const CATEGORIES = ["Fashion", "Electronics", "Home & Living", "Beauty", "Sports", "Food & Drink", "Art & Crafts", "Books", "Health", "Toys", "Other"];

  return (
    <form onSubmit={handleSubmit(onSave)} style={{ display: "flex", flexDirection: "column", gap: 22 }}>
      {/* Store name + slug preview */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 8 }}>
        <FormField label="Store name" error={errors.storeName?.message}>
          <input {...register("storeName")} className="ob-input" placeholder="e.g. Lúmio Bazaar" autoFocus />
        </FormField>
        {storeName.length > 1 && (
          <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
            style={{
              background: "var(--bg-3)", border: "1px solid var(--border)", borderRadius: 8,
              padding: "8px 12px", display: "flex", alignItems: "center", gap: 10,
            }}>
            <span style={{ fontFamily: "var(--font-b)", fontSize: 11, color: "var(--text-3)" }}>Your storefront URL:</span>
            <span style={{ fontFamily: "var(--font-m)", fontSize: 12, color: "var(--amber)", letterSpacing: ".02em" }}>
              woosho.com/<strong>{slug || "—"}</strong>
            </span>
          </motion.div>
        )}
      </div>

      {/* Category chips */}
      <FormField label="What best describes your store?" error={errors.category?.message}>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 4 }}>
          {CATEGORIES.map((cat) => {
            const isSelected = watch("category") === cat;
            return (
              <button key={cat} type="button"
                className={`ob-chip${isSelected ? " selected" : ""}`}
                onClick={() => setValue("category", cat, { shouldValidate: true })}>
                {isSelected && (
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                    <path d="M2 5l2 2 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
                {cat}
              </button>
            );
          })}
        </div>
      </FormField>

      {/* Description with AI suggestion */}
      <FormField label="About your store" optional error={errors.description?.message}
        hint="A good intro helps customers trust you immediately.">
        <div style={{ position: "relative" }}>
          <textarea {...register("description")} className="ob-textarea"
            placeholder="Tell your story — what makes your store special..." rows={3} />
          <button type="button" onClick={suggestDescription} disabled={!storeName || aiLoading}
            style={{
              position: "absolute", bottom: 10, right: 10,
              display: "flex", alignItems: "center", gap: 6,
              padding: "5px 10px", borderRadius: 7,
              background: "var(--bg-4)", border: "1px solid var(--border-2)",
              color: "var(--amber)", fontFamily: "var(--font-b)", fontSize: 11.5, fontWeight: 600,
              cursor: "pointer", transition: "opacity .15s",
              opacity: !storeName ? 0.4 : 1,
            }}>
            {aiLoading ? <Spinner size={11} /> : <span style={{ fontSize: 12 }}>✦</span>}
            {aiLoading ? "Writing…" : "AI Suggest"}
          </button>
        </div>
      </FormField>

      <StepActions isSubmitting={isSubmitting} onSkip={() => onSave({}, true)} />
    </form>
  );
}

// ─── Step 2 — Contact & Business ──────────────────────────────────────────────
function Step2Contact({ defaultValues, onSave }) {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(step2Schema),
    defaultValues: { phone: "", businessEmail: "", supportEmail: "", country: "", city: "", regNumber: "", ...defaultValues },
  });

  const COUNTRIES = ["Nigeria", "Kenya", "Ghana", "South Africa", "United Kingdom", "United States", "Canada", "Germany", "France", "UAE", "India", "Other"];

  return (
    <form onSubmit={handleSubmit(onSave)} style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
        <FormField label="Phone number" optional error={errors.phone?.message}>
          <input {...register("phone")} className="ob-input" placeholder="+234 801 234 5678" />
        </FormField>
        <FormField label="Country" optional>
          <select {...register("country")} className="ob-input"
            style={{ backgroundImage: "none" }}>
            <option value="">Select country…</option>
            {COUNTRIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </FormField>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
        <FormField label="Business email" optional error={errors.businessEmail?.message}>
          <input {...register("businessEmail")} className="ob-input" placeholder="store@yourdomain.com" type="email" />
        </FormField>
        <FormField label="Support email" optional error={errors.supportEmail?.message}>
          <input {...register("supportEmail")} className="ob-input" placeholder="support@yourdomain.com" type="email" />
        </FormField>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 14 }}>
        <FormField label="City" optional>
          <input {...register("city")} className="ob-input" placeholder="Lagos, Nairobi, London…" />
        </FormField>
        <FormField label="Business reg. no." optional>
          <input {...register("regNumber")} className="ob-input" placeholder="Optional" />
        </FormField>
      </div>

      <div style={{
        background: "rgba(245,166,35,.05)", border: "1px solid rgba(245,166,35,.15)",
        borderRadius: 10, padding: "10px 14px", display: "flex", gap: 10,
      }}>
        <span style={{ fontSize: 15 }}>💡</span>
        <p style={{ fontFamily: "var(--font-b)", fontSize: 12.5, color: "var(--text-2)", lineHeight: 1.5 }}>
          Most fields here are optional. You can always update your business details from your seller dashboard.
        </p>
      </div>

      <StepActions isSubmitting={isSubmitting} onSkip={() => onSave({}, true)} />
    </form>
  );
}

// ─── Step 3 — Store Branding ──────────────────────────────────────────────────
function Step3Branding({ defaultValues, storeName, onSave }) {
  const { handleSubmit, setValue, watch, formState: { isSubmitting } } = useForm({
    resolver: zodResolver(step3Schema),
    defaultValues: { accentColor: "#F5A623", ...defaultValues },
  });

  const accentColor = watch("accentColor");
  const [logo, setLogo] = useState(defaultValues?.logoUrl || null);
  const [banner, setBanner] = useState(defaultValues?.bannerUrl || null);

  const SWATCHES = ["#F5A623", "#6366F1", "#10B981", "#F43F5E", "#0EA5E9", "#8B5CF6", "#EF4444", "#14B8A6"];

  return (
    <form onSubmit={handleSubmit((d) => onSave({ ...d, logoUrl: logo, bannerUrl: banner }))}
      style={{ display: "flex", flexDirection: "column", gap: 24 }}>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <FormField label="Store logo">
          <UploadZone aspect="logo" label="Upload logo" hint="Square, 500×500 recommended"
            value={logo} onChange={(_, url) => setLogo(url)} />
        </FormField>
        <FormField label="Store banner">
          <UploadZone aspect="banner" label="Upload banner" hint="1200×400 recommended"
            value={banner} onChange={(_, url) => setBanner(url)} />
        </FormField>
      </div>

      {/* Accent color */}
      <FormField label="Brand accent colour" hint="Used for buttons and highlights in your storefront.">
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 4, flexWrap: "wrap" }}>
          {SWATCHES.map((sw) => (
            <button key={sw} type="button"
              className={`ob-swatch${accentColor === sw ? " active" : ""}`}
              style={{ background: sw }}
              onClick={() => setValue("accentColor", sw)}>
              {accentColor === sw && (
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ position: "absolute", inset: 0, margin: "auto" }}>
                  <path d="M3 7l3 3 5-5" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </button>
          ))}
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <input type="color" value={accentColor} onChange={(e) => setValue("accentColor", e.target.value)}
              style={{ width: 32, height: 32, borderRadius: 8, border: "2px solid var(--border-2)", cursor: "pointer", background: "none", padding: 2 }} />
            <span style={{ fontFamily: "var(--font-m)", fontSize: 11, color: "var(--text-3)" }}>{accentColor}</span>
          </div>
        </div>
      </FormField>

      {/* Live storefront preview */}
      <div>
        <label className="ob-label">Storefront preview</label>
        <div style={{
          border: "1px solid var(--border-2)", borderRadius: 12, overflow: "hidden",
          background: "var(--bg-2)",
        }}>
          {/* Banner */}
          <div style={{
            height: 80, background: banner ? `url(${banner}) center/cover` : accentColor + "20",
            borderBottom: `2px solid ${accentColor}30`,
            display: "flex", alignItems: "flex-end", padding: "0 16px 12px",
          }}>
            {/* Logo bubble */}
            <div style={{
              width: 48, height: 48, borderRadius: 12,
              background: logo ? `url(${logo}) center/cover` : accentColor,
              border: "2px solid var(--bg-2)", marginBottom: -24,
              flexShrink: 0,
            }} />
          </div>
          <div style={{ padding: "28px 16px 16px" }}>
            <p style={{ fontFamily: "var(--font-d)", fontWeight: 700, fontSize: 15, color: "var(--text)", marginBottom: 4 }}>
              {storeName || "Your Store Name"}
            </p>
            <p style={{ fontFamily: "var(--font-b)", fontSize: 12, color: "var(--text-3)" }}>
              woosho.com/{generateSlug(storeName || "your-store")}
            </p>
            <div style={{
              display: "inline-block", marginTop: 10, padding: "6px 14px",
              background: accentColor, borderRadius: 7, fontSize: 11, fontWeight: 600,
              fontFamily: "var(--font-b)", color: "#000",
            }}>
              Visit Store →
            </div>
          </div>
        </div>
      </div>

      <StepActions isSubmitting={isSubmitting} onSkip={() => onSave({}, true)} />
    </form>
  );
}

// ─── Step 4 — Seller Preferences ─────────────────────────────────────────────
function Step4Preferences({ defaultValues, onSave }) {
  const { handleSubmit, setValue, watch, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(step4Schema),
    defaultValues: {
      sellsWhat: [], storeType: "online", shipRegions: [], fulfillment: "self", ...defaultValues,
    },
  });

  const PRODUCT_CATS = ["Clothing & Apparel", "Shoes & Bags", "Electronics", "Beauty & Skincare", "Home Decor", "Books & Media", "Sports & Fitness", "Jewellery", "Art & Prints", "Health & Wellness", "Food & Beverage", "Kids & Babies"];
  const REGIONS = ["Nigeria", "West Africa", "East Africa", "Pan-Africa", "UK", "Europe", "North America", "Middle East", "Asia", "Worldwide"];
  const STORE_TYPES = [
    { id: "online", label: "Online only", icon: "🌐", desc: "Ship to customers globally" },
    { id: "physical", label: "Physical store", icon: "🏪", desc: "In-store pickup available" },
    { id: "both", label: "Both", icon: "⚡", desc: "Best of both worlds" },
  ];
  const FULFILLMENT = [
    { id: "self", label: "I handle it", icon: "📦", desc: "Pack & ship yourself" },
    { id: "third-party", label: "3PL partner", icon: "🚚", desc: "Use a logistics partner" },
    { id: "both", label: "Flexible", icon: "🔄", desc: "Mix based on order" },
  ];

  return (
    <form onSubmit={handleSubmit(onSave)} style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {/* What you sell */}
      <FormField label="What do you sell?" error={errors.sellsWhat?.message}>
        <Controller name="sellsWhat" control={{ _formValues: watch() }}
          render={() => (
            <ChipSelect options={PRODUCT_CATS} value={watch("sellsWhat")}
              onChange={(v) => setValue("sellsWhat", v, { shouldValidate: true })} />
          )} />
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 8 }}>
          {PRODUCT_CATS.map((cat) => {
            const selected = watch("sellsWhat").includes(cat);
            return (
              <button key={cat} type="button"
                className={`ob-chip${selected ? " selected" : ""}`}
                onClick={() => {
                  const cur = watch("sellsWhat");
                  setValue("sellsWhat", selected ? cur.filter((c) => c !== cat) : [...cur, cat], { shouldValidate: true });
                }}>
                {selected && <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M2 5l2 2 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>}
                {cat}
              </button>
            );
          })}
        </div>
      </FormField>

      {/* Store type toggle cards */}
      <FormField label="Store type">
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
          {STORE_TYPES.map((t) => (
            <button key={t.id} type="button"
              className={`ob-toggle-card${watch("storeType") === t.id ? " selected" : ""}`}
              onClick={() => setValue("storeType", t.id)}>
              <div style={{ fontSize: 20, marginBottom: 6 }}>{t.icon}</div>
              <p style={{ fontFamily: "var(--font-b)", fontWeight: 600, fontSize: 13, color: "var(--text)", marginBottom: 3 }}>{t.label}</p>
              <p style={{ fontFamily: "var(--font-b)", fontSize: 11.5, color: "var(--text-3)" }}>{t.desc}</p>
            </button>
          ))}
        </div>
      </FormField>

      {/* Shipping regions */}
      <FormField label="Shipping regions" error={errors.shipRegions?.message}>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 4 }}>
          {REGIONS.map((r) => {
            const selected = watch("shipRegions").includes(r);
            return (
              <button key={r} type="button"
                className={`ob-chip${selected ? " selected" : ""}`}
                onClick={() => {
                  const cur = watch("shipRegions");
                  setValue("shipRegions", selected ? cur.filter((c) => c !== r) : [...cur, r], { shouldValidate: true });
                }}>
                {selected && <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M2 5l2 2 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>}
                {r}
              </button>
            );
          })}
        </div>
      </FormField>

      {/* Fulfillment */}
      <FormField label="How will you fulfill orders?">
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10, marginTop: 4 }}>
          {FULFILLMENT.map((f) => (
            <button key={f.id} type="button"
              className={`ob-toggle-card${watch("fulfillment") === f.id ? " selected" : ""}`}
              onClick={() => setValue("fulfillment", f.id)}>
              <div style={{ fontSize: 18, marginBottom: 5 }}>{f.icon}</div>
              <p style={{ fontFamily: "var(--font-b)", fontWeight: 600, fontSize: 12.5, color: "var(--text)", marginBottom: 2 }}>{f.label}</p>
              <p style={{ fontFamily: "var(--font-b)", fontSize: 11.5, color: "var(--text-3)" }}>{f.desc}</p>
            </button>
          ))}
        </div>
      </FormField>

      <StepActions isSubmitting={isSubmitting} onSkip={() => onSave({}, true)} />
    </form>
  );
}

// ─── Step 5 — Payout Setup ────────────────────────────────────────────────────
function Step5Payout({ defaultValues, onSave, onComplete }) {
  const { register, handleSubmit, setValue, watch, formState: { isSubmitting } } = useForm({
    resolver: zodResolver(step5Schema),
    defaultValues: { payoutMethod: "bank", accountName: "", bankName: "", accountNumber: "", ...defaultValues },
  });

  const method = watch("payoutMethod");

  return (
    <form onSubmit={handleSubmit(onSave)} style={{ display: "flex", flexDirection: "column", gap: 22 }}>
      {/* Why it matters callout */}
      <div style={{
        background: "linear-gradient(135deg, rgba(245,166,35,.08), rgba(245,166,35,.03))",
        border: "1px solid rgba(245,166,35,.2)", borderRadius: 12, padding: "14px 16px",
      }}>
        <p style={{ fontFamily: "var(--font-d)", fontWeight: 600, fontSize: 14, color: "var(--text)", marginBottom: 4 }}>
          💰 Get paid faster
        </p>
        <p style={{ fontFamily: "var(--font-b)", fontSize: 13, color: "var(--text-2)", lineHeight: 1.6 }}>
          Set up your payout account so your earnings reach you within 24–48 hours of each sale. You can always update this later.
        </p>
      </div>

      {/* Method select */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        {[
          { id: "bank", label: "Bank transfer", icon: "🏦", desc: "Direct to your account" },
          { id: "skip", label: "Do this later", icon: "⏳", desc: "Set up from dashboard" },
        ].map((m) => (
          <button key={m.id} type="button"
            className={`ob-toggle-card${method === m.id ? " selected" : ""}`}
            onClick={() => setValue("payoutMethod", m.id)}>
            <div style={{ fontSize: 22, marginBottom: 8 }}>{m.icon}</div>
            <p style={{ fontFamily: "var(--font-b)", fontWeight: 600, fontSize: 13.5, color: "var(--text)", marginBottom: 3 }}>{m.label}</p>
            <p style={{ fontFamily: "var(--font-b)", fontSize: 12, color: "var(--text-3)" }}>{m.desc}</p>
          </button>
        ))}
      </div>

      {/* Bank details (shown only if bank selected) */}
      <AnimatePresence>
        {method === "bank" && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }} style={{ overflow: "hidden" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <FormField label="Account holder name">
                <input {...register("accountName")} className="ob-input" placeholder="Full legal name" />
              </FormField>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                <FormField label="Bank name">
                  <input {...register("bankName")} className="ob-input" placeholder="e.g. GTBank" />
                </FormField>
                <FormField label="Account number">
                  <input {...register("accountNumber")} className="ob-input" placeholder="0123456789" />
                </FormField>
              </div>
              <div style={{
                display: "flex", alignItems: "center", gap: 8,
                background: "var(--bg-3)", border: "1px solid var(--border)", borderRadius: 8,
                padding: "8px 12px",
              }}>
                <span style={{ fontSize: 14 }}>🔒</span>
                <p style={{ fontFamily: "var(--font-b)", fontSize: 11.5, color: "var(--text-3)" }}>
                  Your banking details are encrypted and never shared with buyers.
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Final CTA */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, paddingTop: 4 }}>
        <button type="submit" className="ob-btn-primary" disabled={isSubmitting}
          style={{ flex: 1, justifyContent: "center" }}>
          {isSubmitting ? <><Spinner size={14} />Saving…</> : <>🚀 Launch my store</>}
        </button>
      </div>
    </form>
  );
}

// ─── Step Action Bar (shared footer) ─────────────────────────────────────────
function StepActions({ isSubmitting, onSkip, primaryLabel = "Save & Continue" }) {
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 10,
      paddingTop: 8, borderTop: "1px solid var(--border)", marginTop: 4,
    }}>
      <button type="submit" className="ob-btn-primary" disabled={isSubmitting}>
        {isSubmitting ? <><Spinner size={14} />Saving…</> : <>{primaryLabel} →</>}
      </button>
      <button type="button" className="ob-btn-skip" onClick={onSkip}>
        Skip for now
      </button>
    </div>
  );
}

// ─── Step Card (accordion wrapper) ───────────────────────────────────────────
function StepCard({ step, title, subtitle, icon, status, isActive, onActivate, children }) {
  const isDone = status === "done";
  const isLocked = status === "locked";

  return (
    <motion.div
      className={`ob-step-card${isActive ? " active" : isDone ? " done" : isLocked ? " locked" : ""}`}
      layout
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}>

      {/* Header — always visible */}
      <button type="button"
        onClick={() => !isLocked && onActivate?.()}
        style={{
          width: "100%", background: "none", border: "none", cursor: isLocked ? "default" : "pointer",
          padding: "20px 24px", display: "flex", alignItems: "center", gap: 16, textAlign: "left",
        }}>

        {/* Step indicator */}
        <div style={{
          width: 40, height: 40, borderRadius: 12, flexShrink: 0,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 18,
          background: isDone ? "var(--green-bg)" : isActive ? "var(--amber-bg)" : "var(--bg-3)",
          border: `1.5px solid ${isDone ? "rgba(16,185,129,.3)" : isActive ? "rgba(245,166,35,.3)" : "var(--border)"}`,
          transition: "all .25s",
        }}>
          {isDone ? (
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M3.75 9l4 4 6.5-7" stroke="#10B981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                strokeDasharray="24" strokeDashoffset="0"
                style={{ animation: "ob-check .35s ease forwards" }} />
            </svg>
          ) : icon}
        </div>

        {/* Text */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
            <p style={{
              fontFamily: "var(--font-d)", fontWeight: 700, fontSize: 15.5,
              color: isLocked ? "var(--text-3)" : "var(--text)",
              lineHeight: 1.2,
            }}>{title}</p>
            {isDone && (
              <span style={{
                fontFamily: "var(--font-b)", fontSize: 10.5, fontWeight: 600,
                padding: "2px 8px", borderRadius: 99, background: "var(--green-bg)",
                color: "var(--green)", border: "1px solid rgba(16,185,129,.2)",
              }}>Done</span>
            )}
            {isActive && (
              <span style={{
                fontFamily: "var(--font-b)", fontSize: 10.5, fontWeight: 600,
                padding: "2px 8px", borderRadius: 99, background: "var(--amber-bg)",
                color: "var(--amber)", border: "1px solid rgba(245,166,35,.2)",
              }}>In progress</span>
            )}
          </div>
          <p style={{ fontFamily: "var(--font-b)", fontSize: 12.5, color: "var(--text-3)", marginTop: 2 }}>
            {subtitle}
          </p>
        </div>

        {/* Chevron */}
        {!isLocked && (
          <motion.div animate={{ rotate: isActive ? 180 : 0 }} transition={{ duration: 0.25 }}>
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M4.5 6.75l4.5 4.5 4.5-4.5" stroke="var(--text-3)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </motion.div>
        )}
      </button>

      {/* Body — expands when active */}
      <AnimatePresence initial={false}>
        {isActive && (
          <motion.div
            key="body"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.38, ease: [0.16, 1, 0.3, 1] }}
            style={{ overflow: "hidden" }}>
            <div style={{
              padding: "0 24px 24px",
              borderTop: "1px solid var(--border)",
              paddingTop: 20,
            }}>
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ─── Progress Sidebar ─────────────────────────────────────────────────────────
function ProgressSidebar({ steps, completedSteps, currentStep, onStepClick }) {
  const pct = Math.round((completedSteps.length / steps.length) * 100);
  const radius = 42;
  const circ = 2 * Math.PI * radius;
  const strokeDash = circ - (pct / 100) * circ;

  const isAllDone = completedSteps.length === steps.length;

  return (
    <div className="ob-sidebar" style={{
      width: 280, flexShrink: 0, position: "sticky", top: 24, alignSelf: "flex-start",
      display: "flex", flexDirection: "column", gap: 20,
    }}>
      {/* Progress ring card */}
      <div style={{
        background: "var(--bg-1)", border: "1px solid var(--border)", borderRadius: 16,
        padding: "28px 24px 22px", textAlign: "center",
      }}>
        {/* Circular progress */}
        <div style={{ position: "relative", width: 110, height: 110, margin: "0 auto 16px" }}>
          <svg width="110" height="110" viewBox="0 0 110 110" fill="none" style={{ transform: "rotate(-90deg)" }}>
            <circle cx="55" cy="55" r={radius} stroke="var(--border-2)" strokeWidth="5" />
            <motion.circle
              cx="55" cy="55" r={radius}
              stroke={isAllDone ? "#10B981" : "var(--amber)"}
              strokeWidth="5"
              strokeLinecap="round"
              strokeDasharray={circ}
              initial={{ strokeDashoffset: circ }}
              animate={{ strokeDashoffset: strokeDash }}
              transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
            />
          </svg>
          {/* Centre content */}
          <div style={{
            position: "absolute", inset: 0,
            display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
          }}>
            {isAllDone ? (
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="ob-float"
                style={{ fontSize: 32 }}>🚀</motion.div>
            ) : (
              <>
                <span style={{ fontFamily: "var(--font-d)", fontWeight: 800, fontSize: 24, color: "var(--text)", lineHeight: 1 }}>
                  {pct}%
                </span>
                <span style={{ fontFamily: "var(--font-b)", fontSize: 10.5, color: "var(--text-3)", marginTop: 1 }}>complete</span>
              </>
            )}
          </div>
        </div>

        <p style={{ fontFamily: "var(--font-d)", fontWeight: 700, fontSize: 16, color: "var(--text)", marginBottom: 4 }}>
          {isAllDone ? "Store is ready! 🎉" : pct === 0 ? "Let's build your store" : "You're on a roll"}
        </p>
        <p style={{ fontFamily: "var(--font-b)", fontSize: 12.5, color: "var(--text-3)", lineHeight: 1.5 }}>
          {isAllDone ? "Head to your dashboard to go live." : `${steps.length - completedSteps.length} step${steps.length - completedSteps.length !== 1 ? "s" : ""} left to complete`}
        </p>
      </div>

      {/* Checklist card */}
      <div style={{
        background: "var(--bg-1)", border: "1px solid var(--border)", borderRadius: 16,
        padding: "16px 20px",
      }}>
        <p style={{ fontFamily: "var(--font-m)", fontSize: 10, fontWeight: 600, letterSpacing: ".12em", textTransform: "uppercase", color: "var(--text-3)", marginBottom: 12 }}>
          Setup checklist
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
          {steps.map((step, i) => {
            const done = completedSteps.includes(step.id);
            const active = currentStep === step.id;
            return (
              <div key={step.id}>
                <button type="button" onClick={() => onStepClick(step.id)}
                  style={{
                    width: "100%", background: "none", border: "none",
                    cursor: "pointer", textAlign: "left",
                    display: "flex", alignItems: "center", gap: 12,
                    padding: "8px 0", transition: "opacity .15s",
                    opacity: done ? 0.65 : 1,
                  }}>
                  {/* Node */}
                  <div style={{
                    width: 22, height: 22, borderRadius: "50%", flexShrink: 0,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    background: done ? "var(--green-bg)" : active ? "var(--amber-bg)" : "var(--bg-3)",
                    border: `1.5px solid ${done ? "rgba(16,185,129,.4)" : active ? "rgba(245,166,35,.4)" : "var(--border-2)"}`,
                    transition: "all .25s",
                  }}>
                    {done ? (
                      <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
                        <path d="M2 5.5l2.5 2.5 5-5" stroke="#10B981" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    ) : active ? (
                      <div style={{ width: 7, height: 7, borderRadius: "50%", background: "var(--amber)", animation: "ob-pulse 2s ease-in-out infinite" }} />
                    ) : (
                      <span style={{ fontFamily: "var(--font-m)", fontSize: 9.5, fontWeight: 600, color: "var(--text-3)" }}>{i + 1}</span>
                    )}
                  </div>
                  <span style={{
                    fontFamily: "var(--font-b)", fontSize: 13, fontWeight: active ? 600 : 400,
                    color: active ? "var(--text)" : done ? "var(--text-3)" : "var(--text-2)",
                    transition: "color .2s",
                  }}>{step.label}</span>
                </button>
                {/* Connector line */}
                {i < steps.length - 1 && (
                  <div style={{
                    width: 1, height: 14, marginLeft: 10.5,
                    background: done ? "rgba(16,185,129,.25)" : "var(--border)",
                  }} />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Go to dashboard CTA */}
      <AnimatePresence>
        {isAllDone && (
          <motion.button initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className="ob-btn-primary"
            style={{ width: "100%", justifyContent: "center", padding: "14px" }}
            onClick={() => { /* navigate('/account') */ }}>
            🏪 Open my dashboard
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Completion Confetti ──────────────────────────────────────────────────────
function Confetti() {
  const pieces = useMemo(() => Array.from({ length: 18 }, (_, i) => ({
    id: i,
    color: ["#F5A623", "#10B981", "#6366F1", "#F43F5E", "#0EA5E9"][i % 5],
    left: `${(i / 17) * 100}%`,
    delay: `${(i * 0.06).toFixed(2)}s`,
    size: Math.random() > 0.5 ? 8 : 6,
  })), []);

  return (
    <div style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", pointerEvents: "none", zIndex: 999, overflow: "hidden" }}>
      {pieces.map((p) => (
        <div key={p.id} style={{
          position: "absolute", top: -12, left: p.left,
          width: p.size, height: p.size, borderRadius: "50%", background: p.color,
          animation: `ob-confetti-fall 1.8s ${p.delay} ease-in both`,
        }} />
      ))}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN PAGE COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════
export default function SellerOnboardingPage() {
  const navigate = useNavigate();
  // const { user } = useAuth(); // from your auth context / Supabase session
  const user = { id: "mock-user-id", email: "seller@example.com", name: "Amara Osei" }; // mock

  // ── State ───────────────────────────────────────────────────────────────────
  const [state, setState] = useState(() => loadState());
  const [showConfetti, setShowConfetti] = useState(false);
  const contentRef = useRef(null);

  const { currentStep, completedSteps, data } = state;

  const STEPS = [
    { id: 1, label: "Store Identity", icon: "🏪", title: "Name your store", subtitle: "Create your brand presence on Woosho" },
    { id: 2, label: "Contact & Business", icon: "📋", title: "Contact details", subtitle: "How customers and Woosho can reach you" },
    { id: 3, label: "Store Branding", icon: "🎨", title: "Brand your storefront", subtitle: "Logo, banner, and your signature colour" },
    { id: 4, label: "Seller Preferences", icon: "⚙️", title: "Your selling style", subtitle: "What you sell and how you ship it" },
    { id: 5, label: "Payout Setup", icon: "💳", title: "Get paid", subtitle: "Connect your bank or set up later" },
  ];

  // ── Persist state ───────────────────────────────────────────────────────────
  useEffect(() => { saveState(state); }, [state]);

  // ── Check completion + redirect ─────────────────────────────────────────────
  useEffect(() => {
    if (completedSteps.length === STEPS.length) {
      setShowConfetti(true);
      const t = setTimeout(() => {
        navigate("/account"); // redirect to seller dashboard
      }, 3500);
      return () => clearTimeout(t);
    }
  }, [completedSteps.length]);

  // ── Step save handler ────────────────────────────────────────────────────────
  const handleStepSave = useCallback(async (stepId, formData, isSkipped = false) => {
    // Optimistic update
    setState((prev) => {
      const newCompleted = prev.completedSteps.includes(stepId)
        ? prev.completedSteps
        : [...prev.completedSteps, stepId];
      const nextStep = STEPS.find((s) => !newCompleted.includes(s.id))?.id ?? stepId;
      return {
        ...prev,
        completedSteps: newCompleted,
        currentStep: nextStep,
        data: { ...prev.data, [`step${stepId}`]: formData },
      };
    });

    // Scroll to next step
    setTimeout(() => {
      const next = contentRef.current?.querySelector(`[data-step="${stepId + 1}"]`);
      if (next) next.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 400);

    // Supabase persist (non-blocking)
    // saveOnboardingStep(user.id, stepId, formData).catch(console.error);
  }, []);

  const getStepStatus = (stepId) => {
    if (completedSteps.includes(stepId)) return "done";
    if (currentStep === stepId) return "active";
    // All steps are accessible (can click to jump, not locked)
    return "available";
  };

  const activateStep = (stepId) => {
    setState((prev) => ({ ...prev, currentStep: stepId }));
  };

  return (
    <div className="ob-root">
      <style>{BRAND}</style>
      {showConfetti && <Confetti />}

      {/* ── Top Nav ── */}
      <header style={{
        borderBottom: "1px solid var(--border)", background: "var(--bg-1)",
        padding: "0 24px", height: 60,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        position: "sticky", top: 0, zIndex: 50,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {/* Woosho wordmark */}
          <span style={{ fontFamily: "var(--font-d)", fontWeight: 800, fontSize: 20, color: "var(--amber)", letterSpacing: "-0.02em" }}>
            Woosho
          </span>
          <span style={{ fontFamily: "var(--font-b)", fontSize: 11.5, color: "var(--text-3)", letterSpacing: ".04em" }}>
            / Seller Setup
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontFamily: "var(--font-b)", fontSize: 13, color: "var(--text-3)" }}>
            {user.email}
          </span>
          <button className="ob-btn-ghost" style={{ padding: "6px 12px" }}
            onClick={() => navigate("/account")}>
            Save & exit
          </button>
        </div>
      </header>

      {/* ── Page content ── */}
      <div style={{ maxWidth: 1120, margin: "0 auto", padding: "36px 24px 80px" }}>
        {/* Page heading */}
        <div style={{ marginBottom: 32 }}>
          <h1 style={{
            fontFamily: "var(--font-d)", fontWeight: 800, fontSize: 30,
            color: "var(--text)", letterSpacing: "-0.025em", marginBottom: 8,
          }}>
            Set up your store
          </h1>
          <p style={{ fontFamily: "var(--font-b)", fontSize: 14.5, color: "var(--text-2)", maxWidth: 480, lineHeight: 1.6 }}>
            A few quick steps to get you selling on Woosho. Most takes under 2 minutes — and you can always come back to finish.
          </p>
        </div>

        {/* ── Layout: steps left, sidebar right ── */}
        <div className="ob-layout" style={{ display: "flex", gap: 28, alignItems: "flex-start" }}>

          {/* ── Left: step accordion ── */}
          <div ref={contentRef} className="ob-content" style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 12 }}>

            {/* Step 1 */}
            <div data-step="1">
              <StepCard {...STEPS[0]} status={getStepStatus(1)}
                isActive={currentStep === 1} onActivate={() => activateStep(1)}>
                <Step1Identity
                  defaultValues={data.step1}
                  onSave={(d, skipped) => handleStepSave(1, d, skipped)} />
              </StepCard>
            </div>

            {/* Step 2 */}
            <div data-step="2">
              <StepCard {...STEPS[1]} status={getStepStatus(2)}
                isActive={currentStep === 2} onActivate={() => activateStep(2)}>
                <Step2Contact
                  defaultValues={data.step2}
                  onSave={(d, skipped) => handleStepSave(2, d, skipped)} />
              </StepCard>
            </div>

            {/* Step 3 */}
            <div data-step="3">
              <StepCard {...STEPS[2]} status={getStepStatus(3)}
                isActive={currentStep === 3} onActivate={() => activateStep(3)}>
                <Step3Branding
                  defaultValues={data.step3}
                  storeName={data.step1?.storeName || ""}
                  onSave={(d, skipped) => handleStepSave(3, d, skipped)} />
              </StepCard>
            </div>

            {/* Step 4 */}
            <div data-step="4">
              <StepCard {...STEPS[3]} status={getStepStatus(4)}
                isActive={currentStep === 4} onActivate={() => activateStep(4)}>
                <Step4Preferences
                  defaultValues={data.step4}
                  onSave={(d, skipped) => handleStepSave(4, d, skipped)} />
              </StepCard>
            </div>

            {/* Step 5 */}
            <div data-step="5">
              <StepCard {...STEPS[4]} status={getStepStatus(5)}
                isActive={currentStep === 5} onActivate={() => activateStep(5)}>
                <Step5Payout
                  defaultValues={data.step5}
                  onSave={(d) => handleStepSave(5, d)} />
              </StepCard>
            </div>
          </div>

          {/* ── Right: sticky sidebar ── */}
          <ProgressSidebar
            steps={STEPS}
            completedSteps={completedSteps}
            currentStep={currentStep}
            onStepClick={activateStep}
          />
        </div>
      </div>
    </div>
  );
}