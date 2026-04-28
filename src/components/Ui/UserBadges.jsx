// sizes: "sm" | "md" | "lg"
// sm: 10px font, 3px vertical padding, 8px horizontal padding : smaller icon (9px), smaller gap (4px), smaller "+N" font (11px, 0.02em letter spacing)
//++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
// md: 11.5px font, 5px vertical padding, 10px horizontal padding
// md: 11.5px font, 5px vertical padding, 10px horizontal padding : default icon (11px), default gap (5px), default "+N" font (11px, 0.02em letter spacing)
//+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
// lg: 13px font, 7px vertical padding, 13px horizontal padding
// lg: 13px font, 7px vertical padding, 13px horizontal padding : larger icon (13px), larger gap (6px), larger "+N" font (13px, 0.02em letter spacing)
//******************************************************************************************************************** */
//************************************************************************************************************************* */
// badge types: "verified" (emerald), "topRated" (amber), "proSeller" (indigo)
// types: "verified" | "topRated" | "proSeller"
// "verified" = emerald gradient, checkmark icon
//verified is the default badge type, so it can be used without specifying a user has gone through system verification checks. It can be used to indicate trustworthiness, authenticity, or official status of a user, product, or content. The checkmark icon reinforces the idea of approval and legitimacy..
//+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
// "topRated" = amber gradient, star icon
//topRated can be used to highlight users who have received high ratings or positive reviews from other users. It can indicate that a user is popular, well-regarded, or has a strong reputation within the community. The star icon symbolizes excellence and recognition, making it a fitting choice for this badge type.
//++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
// "proSeller" = indigo gradient, diamond icon
//proSeller can be used to identify users who are professional sellers or have achieved a certain level of sales success on the platform. It can indicate that a user is experienced, reliable, and has a track record of successful transactions. The diamond icon represents value and prestige, making it an appropriate symbol for this badge type.


import { BADGE_CONFIG } from "../../Utils/badgeConfig";
/* ─── INJECTED STYLES ───────────────────────────────────────────────────────── */

const BADGE_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@500;600&display=swap');

  @keyframes pb-shimmer {
    from { transform: translateX(-160%) skewX(-18deg); }
    to   { transform: translateX(260%)  skewX(-18deg); }
  }
  @keyframes pb-in {
    from { opacity: 0; transform: scale(0.7) translateY(8px); }
    to   { opacity: 1; transform: scale(1) translateY(0);     }
  }

  .pb {
    font-family: 'DM Sans', system-ui, -apple-system, sans-serif;
    position: relative; display: inline-flex; align-items: center;
    gap: 5px; border-radius: 999px; overflow: hidden;
    cursor: default; user-select: none; white-space: nowrap;
    font-weight: 600; letter-spacing: 0.03em;
    transition:
      transform   0.3s  cubic-bezier(0.34, 1.56, 0.64, 1),
      box-shadow  0.25s ease,
      border-color 0.25s ease;
    animation: pb-in 0.45s cubic-bezier(0.34, 1.56, 0.64, 1) both;
  }
  .pb:hover { transform: translateY(-2px) scale(1.05); }
  .pb-sm  { padding: 3px  8px  3px  7px;  font-size: 10px;   }
  .pb-md  { padding: 5px  12px 5px  10px; font-size: 11.5px; }
  .pb-lg  { padding: 7px  16px 7px  13px; font-size: 13px;   }

  /* shimmer sweep */
  .pb-shine {
    position: absolute; inset: 0; pointer-events: none;
    background: linear-gradient(
      100deg, transparent 25%,
      rgba(255,255,255,0.58) 50%,
      transparent 75%
    );
    transform: translateX(-160%) skewX(-18deg);
  }
  .pb:hover .pb-shine { animation: pb-shimmer 0.65s ease forwards; }

  /* icon sub-color (each variant overrides) */
  .pb-ico { display: flex; align-items: center; flex-shrink: 0; }

  /* ── Verified – Emerald ── */
  .pb-verified {
    background: linear-gradient(135deg, #d1fae5 0%, #6ee7b7 100%);
    border: 1px solid rgba(5, 150, 105, 0.28);
    color: #064e3b;
    box-shadow: inset 0 1px 0 rgba(255,255,255,0.65),
                0 1px 3px rgba(5,150,105,0.1);
  }
  .pb-verified .pb-ico { color: #059669; }
  .pb-verified:hover {
    box-shadow: inset 0 1px 0 rgba(255,255,255,0.65),
                0 8px 24px rgba(16,185,129,0.3),
                0 2px 6px rgba(0,0,0,0.07);
    border-color: rgba(5,150,105,0.5);
  }

  /* ── Top Rated – Amber ── */
  .pb-topRated {
    background: linear-gradient(135deg, #fef3c7 0%, #fcd34d 100%);
    border: 1px solid rgba(180, 100, 0, 0.24);
    color: #78350f;
    box-shadow: inset 0 1px 0 rgba(255,255,255,0.7),
                0 1px 3px rgba(180,100,0,0.1);
  }
  .pb-topRated .pb-ico { color: #b45309; }
  .pb-topRated:hover {
    box-shadow: inset 0 1px 0 rgba(255,255,255,0.7),
                0 8px 24px rgba(245,158,11,0.32),
                0 2px 6px rgba(0,0,0,0.07);
    border-color: rgba(180,100,0,0.45);
  }

  /* ── Pro Seller – Indigo ── */
  .pb-proSeller {
    background: linear-gradient(135deg, #ede9fe 0%, #a5b4fc 100%);
    border: 1px solid rgba(79, 70, 229, 0.24);
    color: #312e81;
    box-shadow: inset 0 1px 0 rgba(255,255,255,0.62),
                0 1px 3px rgba(79,70,229,0.1);
  }
  .pb-proSeller .pb-ico { color: #4338ca; }
  .pb-proSeller:hover {
    box-shadow: inset 0 1px 0 rgba(255,255,255,0.62),
                0 8px 24px rgba(99,102,241,0.32),
                0 2px 6px rgba(0,0,0,0.07);
    border-color: rgba(79,70,229,0.45);
  }
`;

/* ─── BADGE CONFIG (drop-in replacement) ─────────────────────────────────── */



/* ─── SVG ICONS ─────────────────────────────────────────────────────────────── */

function VerifiedIcon({ s }) {
  return (
    <svg className="pb-ico" width={s} height={s} viewBox="0 0 12 12" fill="none">
      <path
        d="M6 1L9.8 2.7V6C9.8 8.3 8.2 10.3 6 11C3.8 10.3 2.2 8.3 2.2 6V2.7L6 1Z"
        fill="currentColor" fillOpacity="0.18"
      />
      <path
        d="M4 6L5.5 7.6L8.2 4.4"
        stroke="currentColor" strokeWidth="1.45"
        strokeLinecap="round" strokeLinejoin="round"
      />
    </svg>
  );
}

function StarIcon({ s }) {
  return (
    <svg className="pb-ico" width={s} height={s} viewBox="0 0 12 12" fill="currentColor">
      <path d="M6 1.3L7.3 4.5H10.8L8.05 6.55L9.1 9.9L6 7.95L2.9 9.9L3.95 6.55L1.2 4.5H4.7L6 1.3Z" />
    </svg>
  );
}

function DiamondIcon({ s }) {
  return (
    <svg className="pb-ico" width={s} height={s} viewBox="0 0 12 12" fill="currentColor">
      <path d="M3.2 1.5H8.8L11 5L6 10.8L1 5L3.2 1.5Z" fillOpacity="0.22" />
      <path d="M3.7 2H8.3L10.2 5L6 10L1.8 5L3.7 2Z" />
    </svg>
  );
}

function BadgeIcon({ type, size }) {
  const s = size === "sm" ? 9 : size === "lg" ? 13 : 11;
  if (type === "verified")  return <VerifiedIcon s={s} />;
  if (type === "topRated")  return <StarIcon s={s} />;
  if (type === "proSeller") return <DiamondIcon s={s} />;
  return null;
}

/* ─── SINGLE BADGE ───────────────────────────────────────────────────────────── */

function Badge({ type, size = "md", delay = 0 }) {
  const cfg = BADGE_CONFIG[type];
  if (!cfg) return null;
  return (
    <div
      className={`pb pb-${size} ${cfg.cls}`}
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="pb-shine" />
      <BadgeIcon type={type} size={size} />
      <span>{cfg.label}</span>
    </div>
  );
}

/* ─── USER BADGES (main export) ─────────────────────────────────────────────── */

export function UserBadges({ badges = [], compact = false, size = "md" }) {
  if (!badges.length) return null;
  const visible = compact ? badges.slice(0, 2) : badges;

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
      <style>{BADGE_CSS}</style>
      {visible.map((type, i) => (
        <Badge key={type} type={type} size={size} delay={i * 60} />
      ))}
      {compact && badges.length > 2 && (
        <span
          style={{
            fontFamily: "'DM Sans', system-ui, sans-serif",
            fontSize: 11, fontWeight: 600,
            color: "#888", letterSpacing: "0.02em",
          }}
        >
          +{badges.length - 2}
        </span>
      )}
    </div>
  );
}


