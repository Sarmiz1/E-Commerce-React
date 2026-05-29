import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion, AnimatePresence } from "framer-motion";
import { FF, ChipGroup, UploadZone, StepActions, Spinner, CheckSvg } from "./SharedUI";

// ─── Helpers ──────────────────────────────────────────────────────────────────
const slugify = (s = "") => s.toLowerCase().replace(/[^a-z0-9\s]/g, "").trim().replace(/\s+/g, "-").slice(0, 32);

// ─── Zod Schemas ─────────────────────────────────────────────────────────────
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

// ════════════════════════════════════════════════════════════════════════════════

export function SellerStep1({ defaults, onSave }) {
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

export function SellerStep2({ defaults, onSave }) {
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
          <select {...register("country")} className="ob-input"><option value="">Select…</option>{COUNTRIES.map((c) => <option key={c} value={c}>{c}</option>)}</select>
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

export function SellerStep3({ defaults, storeName, onSave }) {
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

export function SellerStep4({ defaults, onSave }) {
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
          {PROD.map((p) => { 
            const on = sw.includes(p); 
            return <button key={p} type="button" className={`ob-chip${on ? " seller-selected" : ""}`} onClick={() => setValue("sellsWhat", on ? sw.filter((x) => x !== p) : [...sw, p], { shouldValidate: true })}>{on && <CheckSvg />}{p}</button>; 
          })}
        </div>
      </FF>
      <FF label="Store type">
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10, marginTop: 4 }}>
          {STORE.map((t) => <button key={t.id} type="button" className={`ob-toggle${watch("storeType") === t.id ? " seller-selected" : ""}`} onClick={() => setValue("storeType", t.id)}><div style={{ fontSize: 20, marginBottom: 6 }}>{t.icon}</div><p style={{ fontWeight: 600, fontSize: 13, color: "var(--text)", marginBottom: 2 }}>{t.label}</p><p style={{ fontSize: 11.5, color: "var(--text-3)" }}>{t.desc}</p></button>)}
        </div>
      </FF>
      <FF label="Shipping regions" error={errors.shipRegions?.message}>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 4 }}>
          {REGIONS.map((r) => { 
            const on = sr.includes(r); 
            return <button key={r} type="button" className={`ob-chip${on ? " seller-selected" : ""}`} onClick={() => setValue("shipRegions", on ? sr.filter((x) => x !== r) : [...sr, r], { shouldValidate: true })}>{on && <CheckSvg />}{r}</button>; 
          })}
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

export function SellerStep5({ defaults, onSave }) {
  const [method, setMethod] = useState(defaults?.payoutMethod || "bank");
  const [saving, setSaving] = useState(false);
  
  const submit = async () => { 
    setSaving(true); 
    await new Promise((r) => setTimeout(r, 600)); 
    onSave({ payoutMethod: method }); 
    setSaving(false); 
  };
  
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
