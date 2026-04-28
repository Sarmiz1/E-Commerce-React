import React from "react";

export default function ProductEmptyState({ colors, onReset, maxBudget }) {
  return (
    <div className="flex flex-col items-center py-20 text-center">
      <div className="text-6xl mb-5">🔍</div>
      <h2
        className="text-xl font-bold mb-2"
        style={{ color: colors.text.primary }}
      >
        No products found
      </h2>
      <p
        className="text-sm mb-6 max-w-xs"
        style={{ color: colors.text.tertiary }}
      >
        Try adjusting your filters or search term to find what you're
        looking for.
      </p>
      <button
        onClick={onReset}
        className="text-sm font-bold underline"
        style={{ color: colors.text.accent }}
      >
        Clear all filters
      </button>
    </div>
  );
}
