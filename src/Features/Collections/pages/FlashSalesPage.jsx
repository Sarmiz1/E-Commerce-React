import CollectionPage from "../CollectionPage";

const CONFIG = {
  label: "Flash Sales",
  title: "Flash Sales",
  accentWordIndex: 0,
  icon: "⚡",
  badge: "Live Now",
  subtitle: "Lightning-fast deals that vanish in hours. No second chances — act now.",
  accent: "#eab308",
  heroBg: "linear-gradient(135deg, #1a1000 0%, #3d2800 50%, #1a1500 100%)",
  keywords: ["flash", "sale", "deal", "limited", "clearance", "offer"],
  onSale: true,
  sortByNew: true,
  stats: [
    { value: "Today", label: "Only" },
    { value: "⚡ Fast", label: "Selling" },
  ],
  emptyIcon: "⚡",
};

export default function FlashSalesPage() {
  return <CollectionPage config={CONFIG} />;
}
