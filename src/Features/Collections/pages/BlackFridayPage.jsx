import CollectionPage from "../CollectionPage";

const CONFIG = {
  label: "Black Friday",
  title: "Black Friday",
  accentWordIndex: 0,
  icon: "🖤",
  badge: "Biggest Event of the Year",
  subtitle: "The most anticipated shopping event. Epic discounts across every category.",
  accent: "#ffffff",
  heroBg: "linear-gradient(135deg, #000000 0%, #111111 50%, #000000 100%)",
  keywords: ["sale", "deal", "discount", "offer", "black friday", "clearance"],
  onSale: true,
  stats: [
    { value: "Massive", label: "Deals" },
    { value: "1 Day", label: "Event" },
  ],
  emptyIcon: "🖤",
};

export default function BlackFridayPage() {
  return <CollectionPage config={CONFIG} />;
}
