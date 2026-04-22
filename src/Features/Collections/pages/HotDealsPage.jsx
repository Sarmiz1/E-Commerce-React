import CollectionPage from "../CollectionPage";

const CONFIG = {
  label: "Hot Deals",
  title: "Hot Deals",
  accentWordIndex: 0,
  icon: "🔥",
  badge: "Biggest Savings",
  subtitle: "Steal-worthy prices on premium items. These deals don't last — grab yours now.",
  accent: "#f97316",
  heroBg: "linear-gradient(135deg, #1a0500 0%, #3d0f00 50%, #1a0500 100%)",
  keywords: ["sale", "deal", "discount", "offer", "budget"],
  onSale: true,
  stats: [
    { value: "Up to 70%", label: "Off" },
    { value: "Limited", label: "Stock" },
  ],
  emptyIcon: "🔥",
};

export default function HotDealsPage() {
  return <CollectionPage config={CONFIG} />;
}
