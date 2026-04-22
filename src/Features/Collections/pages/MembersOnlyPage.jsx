import CollectionPage from "../CollectionPage";

const CONFIG = {
  label: "Members Only",
  title: "Members Only",
  accentWordIndex: 0,
  icon: "👑",
  badge: "Exclusive Access",
  subtitle: "Reserved for the inner circle. Premium products, private pricing, curated for you.",
  accent: "#d97706",
  heroBg: "linear-gradient(135deg, #0a0700 0%, #1f1500 50%, #100c00 100%)",
  keywords: ["premium", "exclusive", "luxury", "vip", "members", "limited"],
  sortByRating: true,
  minRating: 4.5,
  stats: [
    { value: "VIP", label: "Access" },
    { value: "Private", label: "Pricing" },
  ],
  emptyIcon: "👑",
};

export default function MembersOnlyPage() {
  return <CollectionPage config={CONFIG} />;
}
