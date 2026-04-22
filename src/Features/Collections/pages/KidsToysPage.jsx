import CollectionPage from "../CollectionPage";

const CONFIG = {
  label: "Kids & Toys",
  title: "Kids & Toys",
  accentWordIndex: 2,
  icon: "🧸",
  badge: "Play Zone",
  subtitle: "Safe, fun, and creative — the best toys, clothes and gear for little ones.",
  accent: "#f59e0b",
  heroBg: "linear-gradient(135deg, #0a0500 0%, #1f1000 50%, #0a0500 100%)",
  keywords: ["kids", "toys", "children", "baby", "play", "games", "educational"],
  stats: [
    { value: "Safety", label: "Certified" },
    { value: "Ages 0+", label: "Range" },
  ],
  emptyIcon: "🧸",
};

export default function KidsToysPage() {
  return <CollectionPage config={CONFIG} />;
}
