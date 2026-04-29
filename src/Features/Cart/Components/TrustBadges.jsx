import { Ic } from "./CartConstants";
import { cartTrustBadges } from "../Utils/cartItemUtils";

const badgeIcons = {
  lock: Ic.Lock,
  returns: Ic.Undo,
  delivery: Ic.Truck,
};

export function TrustBadges() {
  return (
    <div className="grid grid-cols-3 gap-3">
      {cartTrustBadges.map((badge) => {
        const BadgeIcon = badgeIcons[badge.icon] || Ic.Check;

        return (
          <div
            key={badge.title}
            className="bg-white dark:bg-neutral-900 border border-gray-100 dark:border-neutral-800 rounded-2xl p-4 text-center shadow-sm transition-colors duration-300"
          >
            <div className="w-9 h-9 mx-auto mb-2 rounded-xl bg-gray-50 dark:bg-neutral-800 text-indigo-500 dark:text-indigo-400 flex items-center justify-center">
              <BadgeIcon c="w-4 h-4" />
            </div>
            <p className="font-bold text-gray-900 dark:text-white text-xs">{badge.title}</p>
            <p className="text-gray-400 dark:text-neutral-500 text-[10px] mt-0.5">{badge.sub}</p>
          </div>
        );
      })}
    </div>
  );
}
