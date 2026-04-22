import CollectionPage from "../CollectionPage";

const CONFIG = {
  label: "Sneakers",
  title: "Sneaker Culture",
  accentWordIndex: 0,
  icon: "👟",
  badge: "Heat Drops",
  subtitle: "From court classics to limited heat — every pair that matters lives right here.",
  accent: "#22d3ee",
  heroBg: "linear-gradient(135deg, #00101a 0%, #002030 50%, #001520 100%)",
  keywords: ["sneakers", "shoes", "footwear", "kicks", "trainers", "boots"],
  stats: [
    { value: "Verified", label: "Auth" },
    { value: "Grail", label: "Access" },
  ],
  emptyIcon: "👟",
};

export default function SneakersPage() {
  return <CollectionPage config={CONFIG} />;
}
