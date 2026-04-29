import { STATUS_CONFIG } from "../Utils/ordersConstants";

export default function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.processing;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-black border ${cfg.bg} ${cfg.text} ${cfg.ring} ${cfg.glow}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot} flex-shrink-0`} />
      {cfg.label}
    </span>
  );
}
