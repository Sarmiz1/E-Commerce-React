export default function Stars({ rating = 0 }) {
  const full = Math.floor(rating), half = rating % 1 >= 0.5, empty = 5 - full - (half ? 1 : 0);
  return (
    <div className="flex items-center gap-0.5">
      {Array(full).fill(0).map((_, i) => <span key={`f${i}`} className="text-yellow-400 text-sm">★</span>)}
      {half && <span className="text-yellow-400 text-sm">⯪</span>}
      {Array(empty).fill(0).map((_, i) => <span key={`e${i}`} className="text-gray-200 text-sm">★</span>)}
      <span className="ml-1 text-xs text-gray-400">{rating}</span>
    </div>
  );
}