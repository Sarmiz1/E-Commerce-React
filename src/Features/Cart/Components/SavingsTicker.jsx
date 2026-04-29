import { formatMoneyCents } from "../../../Utils/formatMoneyCents";

export function SavingsTicker({ savings }) {
  if (savings <= 0) return null;
  const msg = `🎉 You're saving ${formatMoneyCents(savings)} on this order`;
  const doubled = Array(12).fill(msg).join("  ·  ");
  return (
    <div className="overflow-hidden bg-gradient-to-r from-amber-50 via-yellow-50 to-amber-50 border-y border-amber-200/60 py-2.5">
      <div className="flex whitespace-nowrap ct-ticker">
        <span className="text-amber-700 text-xs font-bold tracking-wide px-4">{doubled}</span>
        <span className="text-amber-700 text-xs font-bold tracking-wide px-4">{doubled}</span>
      </div>
    </div>
  );
}
