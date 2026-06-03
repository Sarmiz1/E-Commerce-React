export function ShowcaseLoadingState({ colors, isDark }) {
  const skeletonClass = `pg-skeleton ${
    isDark ? "pg-skeleton-dark" : "pg-skeleton-light"
  }`;

  return (
    <div className="mx-auto max-w-screen-xl px-6 py-10">
      <div className={`${skeletonClass} h-5 w-32 rounded-full`} />
      <div className={`${skeletonClass} mt-5 h-14 max-w-xl rounded-2xl`} />
      <div className={`${skeletonClass} mt-4 h-5 max-w-2xl rounded-full`} />
      <div className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 8 }).map((_, index) => (
          <div
            className="overflow-hidden rounded-2xl border"
            key={index}
            style={{
              background: colors.surface.secondary,
              borderColor: colors.border.subtle,
            }}
          >
            <div className={skeletonClass} style={{ paddingTop: "133%" }} />
            <div className="space-y-2.5 p-3.5">
              <div className={`${skeletonClass} h-3.5 w-3/4 rounded-full`} />
              <div className={`${skeletonClass} h-3 w-1/2 rounded-full`} />
              <div className={`${skeletonClass} mt-2 h-4 w-1/3 rounded-full`} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function ShowcaseErrorState({
  colors,
  eyebrow = "Unable to load showcase",
  heading = "This page needs a refresh.",
  body = "We could not load these products right now. Please try again.",
  onRetry,
}) {
  return (
    <div className="mx-auto max-w-lg px-6 py-24 text-center">
      <p
        className="text-[11px] font-black uppercase tracking-[0.22em]"
        style={{ color: colors.state.error }}
      >
        {eyebrow}
      </p>
      <h1 className="mt-3 font-serif text-3xl font-bold" style={{ color: colors.text.primary }}>
        {heading}
      </h1>
      <p className="mt-3 text-sm leading-6" style={{ color: colors.text.secondary }}>
        {body}
      </p>
      {onRetry && (
        <button
          className="mt-6 rounded-full px-5 py-2.5 text-xs font-black uppercase tracking-wider"
          onClick={onRetry}
          style={{ background: colors.cta.primary, color: colors.cta.primaryText }}
          type="button"
        >
          Try again
        </button>
      )}
    </div>
  );
}

export function ShowcaseEmptyState({
  colors,
  filtered,
  onReset,
  title,
  emptyLabel = "Showcase coming soon",
  filteredLabel = "No matches",
  emptyHeading,
  filteredHeading = "Try a wider filter",
  emptyBody = "There are no active products here yet. Explore the full marketplace in the meantime.",
  filteredBody = "Adjust the selected filters to see more products from this showcase.",
}) {
  return (
    <div className="rounded-3xl border px-6 py-20 text-center" style={{ borderColor: colors.border.subtle }}>
      <p
        className="text-[11px] font-black uppercase tracking-[0.22em]"
        style={{ color: colors.text.accent }}
      >
        {filtered ? filteredLabel : emptyLabel}
      </p>
      <h2 className="mt-3 font-serif text-3xl font-bold" style={{ color: colors.text.primary }}>
        {filtered ? filteredHeading : emptyHeading || `${title} is being prepared.`}
      </h2>
      <p className="mx-auto mt-3 max-w-md text-sm leading-6" style={{ color: colors.text.secondary }}>
        {filtered ? filteredBody : emptyBody}
      </p>
      {filtered && onReset && (
        <button
          className="mt-6 text-sm font-bold underline"
          onClick={onReset}
          style={{ color: colors.text.accent }}
          type="button"
        >
          Clear all filters
        </button>
      )}
    </div>
  );
}
