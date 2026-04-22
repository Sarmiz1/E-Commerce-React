import CollectionPage from "../CollectionPage";

const CONFIG = {
  label: "Fashion",
  title: "Fashion Forward",
  accentWordIndex: 0,
  icon: "🧥",
  badge: "Style Essentials",
  subtitle: "Clothing, accessories and everything wearable — curated for the modern wardrobe.",
  accent: "#c084fc",
  heroBg: "linear-gradient(135deg, #12001a 0%, #25003d 50%, #12001a 100%)",
  keywords: ["fashion", "clothing", "apparel", "dress", "shirt", "pants", "jacket", "style", "wear"],
  stats: [
    { value: "All Sizes", label: "Available" },
    { value: "Season", label: "Essentials" },
  ],
  emptyIcon: "🧥",
};

export default function FashionPage() {
  return <CollectionPage config={CONFIG} />;
}
