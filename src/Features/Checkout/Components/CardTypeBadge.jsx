const CARD_LABELS = {
  visa: "VISA",
  mastercard: "MC",
  amex: "AMEX",
  discover: "DISC",
};

const CARD_COLORS = {
  visa: "bg-blue-600",
  mastercard: "bg-red-500",
  amex: "bg-green-600",
  discover: "bg-orange-500",
};

export function CardTypeBadge({ type }) {
  if (!type) return null;

  return (
    <span className={`ml-2 rounded px-2 py-0.5 text-[9px] font-black text-white ${CARD_COLORS[type] || "bg-gray-400"}`}>
      {CARD_LABELS[type]}
    </span>
  );
}
