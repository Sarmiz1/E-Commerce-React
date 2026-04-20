export const PAGE_SIZE = 24;
export const AD_INTERVAL = 12;
export const TICKER_MS = 4000;

export const ACTIVITY_TEMPLATES = [
  { emoji: "🛍️", tpl: "[name] just purchased in Lagos" },
  { emoji: "❤️", tpl: "[name] wishlisted from Abuja" },
  { emoji: "🛒", tpl: "[name] added to cart · London" },
  { emoji: "⚡", tpl: "Flash deal: [name] · NYC" },
  { emoji: "🔥", tpl: "[name] is trending now" },
  { emoji: "🌍", tpl: "[name] shipped to Nairobi" },
];

export const SORT_OPTIONS = [
  { value: "default", label: "Best Match" },
  { value: "price-asc", label: "Price: Low" },
  { value: "price-desc", label: "Price: High" },
  { value: "rating", label: "Top Rated" },
  { value: "newest", label: "Newest" },
];

export const CATEGORIES = ["All", "Electronics", "Fashion", "Sports", "Home", "Beauty", "Toys", "Books"];

export const COLOR_KEYWORDS = {
  black: "#111827", white: "#f8fafc", red: "#ef4444", blue: "#3b82f6",
  green: "#22c55e", yellow: "#eab308", pink: "#ec4899", purple: "#a855f7",
  orange: "#f97316", gray: "#6b7280", grey: "#6b7280", brown: "#92400e",
  navy: "#1e3a5f", beige: "#d4b896", cream: "#fef9e7", gold: "#d97706",
  silver: "#9ca3af", rose: "#f43f5e", teal: "#14b8a6", coral: "#fb7185",
  lavender: "#c4b5fd", burgundy: "#7f1d1d", olive: "#4d7c0f", tan: "#d4a76a",
  khaki: "#c3b091", mint: "#a7f3d0", sky: "#38bdf8", lime: "#a3e635",
};

export const SIZE_TABLES = {
  apparel: {
    Standard: ["XS", "S", "M", "L", "XL", "2XL", "3XL"],
    UK: ["6", "8", "10", "12", "14", "16", "18"],
    US: ["2", "4", "6", "8", "10", "12", "14"],
    EU: ["34", "36", "38", "40", "42", "44", "46"],
  },
  footwear: {
    Standard: ["36", "37", "38", "39", "40", "41", "42", "43", "44", "45"],
    UK: ["3", "4", "5", "6", "7", "8", "9", "10", "11", "12"],
    US: ["5", "6", "7", "8", "9", "10", "11", "12", "13", "14"],
    EU: ["36", "37", "38", "39", "40", "41", "42", "43", "44", "45"],
  },
};
