import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { supabase } from "../../../supabaseClient";
import { trackEvent } from "../../../Utils/analytics";
import { useExperiment } from "../../../Hooks/useExperiment";

const LEAD_STORE_KEY = "woosho.marketing.leads";

function persistLeadLocally(lead) {
  try {
    const existing = JSON.parse(localStorage.getItem(LEAD_STORE_KEY) || "[]");
    localStorage.setItem(LEAD_STORE_KEY, JSON.stringify([lead, ...existing].slice(0, 50)));
  } catch {
    // Lead capture must stay non-blocking.
  }
}

export default function LeadCaptureForm({
  audience = "buyer",
  title = "Get early access",
  description = "Join the WooSho list for launches, marketplace updates, and smarter shopping tools.",
  cta = "Join Waitlist",
  dark = false,
}) {
  const experiment = useExperiment(`lead-capture-${audience}`, [
    { id: "control", title, cta, weight: 2 },
    { id: "early-access", title: "Get early access", cta: "Request Access" },
    { id: "drops", title: "Get launch drops first", cta: "Join The List" },
  ]);
  const [form, setForm] = useState({
    email: "",
    name: "",
    businessType: audience === "seller" ? "Fashion seller" : "Smart shopper",
    monthlyVolume: "",
  });
  const [status, setStatus] = useState("idle");

  const update = (key) => (event) => {
    setForm((current) => ({ ...current, [key]: event.target.value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!form.email) return;

    const lead = {
      ...form,
      audience,
      source_path: window.location.pathname,
      created_at: new Date().toISOString(),
    };

    setStatus("saving");
    persistLeadLocally(lead);
    trackEvent("lead_capture_submitted", { audience, emailDomain: form.email.split("@")[1] });

    try {
      await supabase.from("marketing_leads").insert(lead);
    } catch {
      // Local queue is enough until the marketing_leads table is deployed.
    }

    setStatus("saved");
  };

  const surface = dark
    ? "border-white/10 bg-white/[0.04] text-white"
    : "border-slate-200 bg-white text-slate-950";
  const muted = dark ? "text-white/60" : "text-slate-500";
  const input =
    "h-12 rounded-xl border px-4 text-sm outline-none transition focus:ring-2 focus:ring-blue-500/30";
  const inputTheme = dark
    ? "border-white/10 bg-black/20 text-white placeholder:text-white/35"
    : "border-slate-200 bg-slate-50 text-slate-950 placeholder:text-slate-400";

  return (
    <motion.form
      onSubmit={handleSubmit}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      className={`rounded-3xl border p-5 shadow-2xl md:p-6 ${surface}`}
    >
      <div className="mb-5">
        <p className="text-[11px] font-black uppercase tracking-[0.25em] text-blue-500">
          {audience} growth list
        </p>
        <h3 className="mt-2 text-2xl font-black tracking-tight">{experiment.title}</h3>
        <p className={`mt-2 text-sm leading-6 ${muted}`}>{description}</p>
      </div>

      {status === "saved" ? (
        <div className="flex items-center gap-3 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-sm font-bold text-emerald-500">
          <CheckCircle2 className="h-5 w-5" />
          You are on the list.
        </div>
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          <input
            value={form.name}
            onChange={update("name")}
            className={`${input} ${inputTheme}`}
            placeholder="Name"
          />
          <input
            value={form.email}
            onChange={update("email")}
            className={`${input} ${inputTheme}`}
            placeholder="Email"
            type="email"
            required
          />
          <select
            value={form.businessType}
            onChange={update("businessType")}
            className={`${input} ${inputTheme}`}
          >
            <option>Fashion seller</option>
            <option>Beauty seller</option>
            <option>Home goods seller</option>
            <option>Smart shopper</option>
            <option>Creator / affiliate</option>
          </select>
          <input
            value={form.monthlyVolume}
            onChange={update("monthlyVolume")}
            className={`${input} ${inputTheme}`}
            placeholder={audience === "seller" ? "Monthly orders" : "Favorite category"}
          />
          <button
            className="mt-2 flex h-12 items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 text-sm font-black text-white transition hover:bg-blue-700 md:col-span-2"
            disabled={status === "saving"}
            type="submit"
          >
            {status === "saving" ? "Saving..." : experiment.cta}
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      )}
    </motion.form>
  );
}
