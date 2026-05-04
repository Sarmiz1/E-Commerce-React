
export const STATUS_CFG = {
  processing: { color: "#F59E0B", bg: "rgba(245,158,11,0.08)", label: "Processing",  icon: "◎", pct: 28 },
  shipped:    { color: "#00C2FF", bg: "rgba(0,194,255,0.08)",  label: "In Transit",  icon: "◉", pct: 62 },
  delivered:  { color: "#10B981", bg: "rgba(16,185,129,0.08)", label: "Delivered",   icon: "●", pct: 100 },
  cancelled:  { color: "#EF4444", bg: "rgba(239,68,68,0.08)",  label: "Cancelled",   icon: "✕", pct: 12 },
};

const MILESTONES = [
  { id: "placed",   label: "Placed" },
  { id: "cleared",  label: "Cleared" },
  { id: "packed",   label: "Packed" },
  { id: "shipped",  label: "Shipped" },
  { id: "transit",  label: "Transit" },
  { id: "local",    label: "Local" },
  { id: "delivered",label: "Delivered" },
];

const MILESTONE_IDX = { processing: 2, shipped: 4, delivered: 6, cancelled: 1 };

export function statusColor(s) { return STATUS_CFG[s]?.color ?? "#6366F1"; }
export function statusPct(s)   { return STATUS_CFG[s]?.pct   ?? 28; }

export function computeETA(status, created_at) {
  if (status === "delivered") return "Delivered";
  if (status === "cancelled") return "Cancelled";
  const base = created_at ? new Date(created_at) : new Date();
  const fmt = (d) => new Date(base.getTime() + d * 86400000)
    .toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" });
  if (status === "shipped") return `Today – ${fmt(1)}`;
  return `${fmt(2)} – ${fmt(5)}`;
}

export function timeAgo(isoStr) {
  if (!isoStr) return "just now";
  const diff = Date.now() - new Date(isoStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}
export useAutoPoll(status, cb, ms = 30000) {
  useEffect(() => {
    if (["delivered", "cancelled", null, undefined].includes(status)) return;
    const id = setInterval(cb, ms);
    return () => clearInterval(id);
  }, [status, cb, ms]);
}


