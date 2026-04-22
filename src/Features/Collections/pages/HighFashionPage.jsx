import CollectionPage from "../CollectionPage";

const CONFIG = {
  label: "High Fashion",
  title: "High Fashion",
  accentWordIndex: 1,
  icon: "👗",
  badge: "Luxury Editorial",
  subtitle: "Elevated. Curated. Exclusive. Pieces built for those who define the look, not follow it.",
  accent: "#a855f7",
  heroBg: "linear-gradient(135deg, #0d001a 0%, #1e003d 50%, #0d001a 100%)",
  keywords: ["fashion", "luxury", "designer", "premium", "couture", "style", "vogue"],
  sortByRating: true,
  stats: [
    { value: "Luxury", label: "Grade" },
    { value: "Editorial", label: "Curated" },
  ],
  emptyIcon: "👗",
};

export default function HighFashionPage() {
  return <CollectionPage config={CONFIG} />;
}
