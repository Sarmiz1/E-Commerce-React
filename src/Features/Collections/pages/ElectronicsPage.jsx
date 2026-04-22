import CollectionPage from "../CollectionPage";

const CONFIG = {
  label: "Electronics",
  title: "Tech & Electronics",
  accentWordIndex: 0,
  icon: "⚡",
  badge: "Powered Up",
  subtitle: "Cutting-edge tech, next-gen gadgets, and everyday essentials — all in one place.",
  accent: "#3b82f6",
  heroBg: "linear-gradient(135deg, #00071a 0%, #001540 50%, #000e2a 100%)",
  keywords: ["electronics", "tech", "gadget", "phone", "laptop", "computer", "device", "audio"],
  stats: [
    { value: "Latest", label: "Tech" },
    { value: "Warranty", label: "Included" },
  ],
  emptyIcon: "⚡",
};

export default function ElectronicsPage() {
  return <CollectionPage config={CONFIG} />;
}
