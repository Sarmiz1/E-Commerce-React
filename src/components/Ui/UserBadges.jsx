import { BADGE_CONFIG } from "../../Utils/badgeConfig";

export const UserBadges = ({ badges = [], compact = false }) => {
  if (!badges.length) return null;

  const visibleBadges = compact ? badges.slice(0, 2) : badges;

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {visibleBadges.map((type) => {
        const badge = BADGE_CONFIG[type];
        if (!badge) return null;

        return (
          <div
            key={type}
            className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium transition hover:shadow-sm ${badge.style}`}
          >
            <span className="text-[10px]">{badge.icon}</span>
            <span>{badge.label}</span>
          </div>
        );
      })}
    </div>
  );
};
