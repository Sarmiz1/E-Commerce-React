import CollectionPage from "../CollectionPage";

const CONFIG = {
  label: "New Arrivals",
  title: "Just Dropped",
  accentWordIndex: 1,
  icon: "✨",
  badge: "Fresh Drops",
  subtitle: "The freshest pieces — landed today. Be the first to own what's new before it sells out.",
  accent: "#6366f1",
  heroBg: "linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)",
  keywords: ["new", "arrivals", "latest", "fresh", "2024", "2025"],
  sortByNew: true,
  stats: [
    { value: "Daily", label: "New Drops" },
    { value: "48h", label: "Ships Fast" },
  ],
  emptyIcon: "✨",
};

export default function NewArrivalsPage() {
  return <CollectionPage config={CONFIG} />;
}
