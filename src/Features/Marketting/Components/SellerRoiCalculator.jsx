import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Calculator, TrendingUp } from "lucide-react";
import { formatMoneyCurrency } from "../../../utils/FormatMoneyCents";
import { trackEvent } from "../../../api/track_events";

export default function SellerRoiCalculator() {
  const [orders, setOrders] = useState(180);
  const [aov, setAov] = useState(42);
  const [margin, setMargin] = useState(38);
  const [hours, setHours] = useState(18);

  const result = useMemo(() => {
    const monthlyRevenue = orders * aov;
    const conversionLift = 0.14;
    const opsHoursSaved = Math.round(hours * 0.35);
    const addedRevenue = monthlyRevenue * conversionLift;
    const addedProfit = addedRevenue * (margin / 100);
    const opsValue = opsHoursSaved * 18;

    return {
      monthlyRevenue,
      addedRevenue,
      addedProfit,
      opsHoursSaved,
      opsValue,
      totalLift: addedProfit + opsValue,
    };
  }, [aov, hours, margin, orders]);

  const fields = [
    { label: "Monthly orders", value: orders, setValue: setOrders, min: 10, max: 2000, step: 10 },
    { label: "Average order value", value: aov, setValue: setAov, min: 10, max: 300, step: 5 },
    { label: "Gross margin", value: margin, setValue: setMargin, min: 10, max: 80, step: 1, suffix: "%" },
    { label: "Weekly ops hours", value: hours, setValue: setHours, min: 1, max: 80, step: 1 },
  ];

  return (
    <section className="relative overflow-hidden bg-[#08080A] px-6 py-24 text-white">
      <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
        <motion.div
          initial={{ opacity: 0, x: -24 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
        >
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-xs font-black uppercase tracking-[0.24em] text-violet-200">
            <Calculator className="h-4 w-4" />
            Seller math
          </div>
          <h2 className="text-4xl font-black tracking-tight md:text-6xl">
            See the lift before you switch.
          </h2>
          <p className="mt-5 max-w-xl text-base leading-7 text-white/62">
            Estimate how AI listings, smarter merchandising, and lighter operations can change monthly profit.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="rounded-[2rem] border border-white/10 bg-white/[0.05] p-5 shadow-2xl backdrop-blur-xl md:p-7"
        >
          <div className="grid gap-5">
            {fields.map((field) => (
              <label key={field.label} className="block">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-xs font-black uppercase tracking-[0.2em] text-white/50">
                    {field.label}
                  </span>
                  <span className="text-sm font-black text-white">
                    {field.suffix
                      ? `${field.value.toLocaleString()}${field.suffix}`
                      : field.label.includes("value")
                        ? formatMoneyCurrency(field.value * 100).replace(".00", "")
                        : field.value.toLocaleString()}
                  </span>
                </div>
                <input
                  className="w-full accent-violet-400"
                  max={field.max}
                  min={field.min}
                  onChange={(event) => field.setValue(Number(event.target.value))}
                  step={field.step}
                  type="range"
                  value={field.value}
                />
              </label>
            ))}
          </div>

          <div className="mt-7 grid gap-3 sm:grid-cols-3">
            <Metric label="Added revenue" value={formatMoneyCurrency(result.addedRevenue * 100).replace(".00", "")} />
            <Metric label="Ops hours saved" value={`${result.opsHoursSaved}/wk`} />
            <Metric label="Monthly lift" value={formatMoneyCurrency(result.totalLift * 100).replace(".00", "")} highlight />
          </div>

          <Link
            to="/signup?role=seller&source=roi"
            onClick={() =>
              trackEvent({
                eventType: "seller_roi_cta_clicked",
                metadata: result,
              })
            }
            className="mt-6 flex h-14 items-center justify-center gap-2 rounded-2xl bg-white px-5 py-4 text-sm font-black text-black transition hover:bg-violet-100"
          >
            Start with this estimate
            <ArrowRight className="h-4 w-4" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}

function Metric({ label, value, highlight = false }) {
  return (
    <div
      className={`rounded-2xl border p-4 ${
        highlight
          ? "border-emerald-400/25 bg-emerald-400/10"
          : "border-white/10 bg-black/20"
      }`}
    >
      <div className="mb-2 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.18em] text-white/45">
        <TrendingUp className="h-3.5 w-3.5" />
        {label}
      </div>
      <p className="text-2xl font-black">{value}</p>
    </div>
  );
}
