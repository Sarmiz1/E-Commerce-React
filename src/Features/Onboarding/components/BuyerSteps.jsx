import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion, AnimatePresence } from "framer-motion";
import { FF, ChipGroup, UploadZone, StepActions, Spinner } from "./SharedUI";

// ─── Zod Schemas ─────────────────────────────────────────────────────────────
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

// ════════════════════════════════════════════════════════════════════════════════

export function BuyerStep1({ defaults, onSave, user }) {
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

  useEffect(() => {
    if (!watch("username") && (first || last)) {
      const suggestion = `${first}${last}`.toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 20);
      setValue("username", suggestion || "");
    }
  }, [first, last, setValue, watch]);

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

export function BuyerStep2({ defaults, onSave }) {
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

export function BuyerStep3({ defaults, onSave }) {
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
            {COUNTRIES.map((c) => <option key={c} value={c}>{c}</option>)}
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

export function BuyerStep4({ defaults, onSave }) {
  const [method, setMethod] = useState(defaults?.payMethod || "skip");
  const [saving, setSaving] = useState(false);
  
  const submit = async () => { 
    setSaving(true); 
    await new Promise((r) => setTimeout(r, 500)); 
    onSave({ payMethod: method }); 
    setSaving(false); 
  };
  
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
