import { Ic } from "./CartConstants";
import { cartTrustBadges } from "../utils/cartItemUtils";

const badgeIcons = {
  lock: Ic.Lock,
  returns: Ic.Undo,
  delivery: Ic.Truck,
};

export function TrustBadges() {
  return (
    <div className="grid grid-cols-1 gap-2 sm-min:grid-cols-3 sm:gap-3">
      {cartTrustBadges.map((badge) => {
        const BadgeIcon = badgeIcons[badge.icon] || Ic.Check;

        return (
          <div
            key={badge.title}
            className="flex items-center gap-3 rounded-2xl border border-gray-100 bg-white p-2.5 text-left shadow-sm transition-colors duration-300 dark:border-neutral-800 dark:bg-neutral-900 sm-min:block sm-min:text-center sm:p-4"
          >
            <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-gray-50 text-indigo-500 dark:bg-neutral-800 dark:text-indigo-400 sm-min:mx-auto sm-min:mb-2">
              <BadgeIcon c="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-900 dark:text-white">{badge.title}</p>
              <p className="mt-0.5 text-[10px] text-gray-400 dark:text-neutral-500">{badge.sub}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
