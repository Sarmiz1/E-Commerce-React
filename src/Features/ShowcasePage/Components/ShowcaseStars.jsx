export default function ShowcaseStars({ rating }) {
  return (
    <span style={{ display: "flex", alignItems: "center", gap: 2 }}>
      {[1, 2, 3, 4, 5].map((i) => (
        <svg key={i} width="9" height="9" viewBox="0 0 10 10" fill={i <= Math.round(rating) ? "#C9A84C" : "#ddd"}>
          <path d="M5 0.5l1.1 3.1H9.3L6.7 5.6l1 3.1L5 7l-2.7 1.7 1-3.1L.7 3.6h3.2z" />
        </svg>
      ))}
    </span>
  );
}
