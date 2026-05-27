// Stars.jsx

function getStars(rating = 0, max = 5) {
  const full = Math.floor(rating);
  const half = rating % 1 >= 0.5;
  const empty = max - full - (half ? 1 : 0);
  return { full, half, empty };
}

export default function Stars({
  rating = 0,
  count = 0,
  variant = "default", // default | compact | minimal
  max = 5,
}) {
  const { full, half, empty } = getStars(rating, max);

  const styles = {
    default: {
      starSize: "text-sm",
      gap: "gap-0.5",
      showRating: true,
      showCount: false,
    },
    compact: {
      starSize: "text-xs",
      gap: "gap-1.5",
      showRating: false,
      showCount: true,
    },
    minimal: {
      starSize: "text-sm",
      gap: "gap-0.5",
      showRating: false,
      showCount: false,
    },
  };

  const current = styles[variant] || styles.default;

  return (
    <div className={`flex items-center ${current.gap}`}>
      <div className="flex items-center gap-0.5">
        {Array(full).fill(0).map((_, i) => (
          <span key={`f${i}`} className={`text-yellow-400 ${current.starSize}`}>
            ★
          </span>
        ))}

        {half && (
          <span className={`text-yellow-400 ${current.starSize}`}>
            ⯪
          </span>
        )}

        {Array(empty).fill(0).map((_, i) => (
          <span key={`e${i}`} className={`text-gray-200 ${current.starSize}`}>
            ★
          </span>
        ))}
      </div>

      {current.showRating && (
        <span className="ml-1 text-xs text-gray-400">
          {rating}
        </span>
      )}

      {current.showCount && count > 0 && (
        <span className="text-gray-400 text-[11px] font-medium">
          ({count.toLocaleString()})
        </span>
      )}
    </div>
  );
}