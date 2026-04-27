import React from "react";
import { useTheme } from "../../../Context/theme/ThemeContext";
import { IconSpinner } from "../../../Components/Icons/IconSpinner";

export default function ViewMoreBtn({ onClick, loading, allLoaded, count }) {
  const { colors } = useTheme();
  if (allLoaded && count === 0) return null;
  if (allLoaded)
    return (
      <div
        className="col-span-full text-center py-10 text-xs font-medium"
        style={{ color: colors.text.tertiary }}
      >
        Showing all {count} products
      </div>
    );
  return (
    <div className="col-span-full flex justify-center py-10">
      <button
        onClick={onClick}
        disabled={loading}
        className="flex items-center gap-3 font-bold text-sm px-10 py-3.5 rounded-full border transition-all active:scale-95 disabled:opacity-50"
        style={{
          borderColor: colors.border.default,
          color: colors.text.primary,
        }}
      >
        {loading ? <IconSpinner /> : "Explore More Products"}
      </button>
    </div>
  );
}
