import { formatStoreName } from "../../utils/formatStoreName";
import { useNavigate, Link } from "react-router-dom";
import { UserBadges } from "./UserBadges";

export function StoreHeader({ storeInfo, colors }) {
  const navigate = useNavigate();

  const { name, shouldWrap, shouldTruncate } = formatStoreName(
    storeInfo?.store_name || "Anonymous Store",
  );

  const hasBadges = storeInfo?.badges?.length > 0;

  return (
    <div className="flex items-start text-xs">
      {/* LEFT SIDE */}
      <div className="flex items-start gap-2 min-w-0 items-center">
        {/* Logo */}
        {storeInfo?.store_logo && (
          <img
            src={storeInfo.store_logo}
            alt={name}
            className="w-6 h-6 rounded-full object-cover cursor-pointer shrink-0"
            onClick={() => navigate(`/user/${storeInfo?.store_slug}`)}
          />
        )}

        {/* Label + Name */}
        <div className="flex items-center gap-2 min-w-0">
          <span
            className="font-medium shrink-0"
            style={{ color: colors.text.tertiary }}
          >
            Sold by
          </span>

          <Link
            to={`/user/${storeInfo?.store_slug}`}
            title={name}
            className={`
              font-bold hover:underline
              ${shouldWrap ? "break-words max-w-[20ch]" : "whitespace-nowrap"}
              ${shouldTruncate ? "truncate max-w-[18ch] block" : ""}
            `}
            style={{ color: colors.text.accent }}
          >
            {name}
          </Link>
        </div>
      </div>

      {/* RIGHT SIDE (BADGES ONLY IF EXIST) */}
      {hasBadges && (
        <div className="ml-auto flex items-center shrink-0">
          <UserBadges badges={storeInfo.badges} compact size="sm"/>
        </div>
      )}
    </div>
  );
}
