import { ShoppingBag, TrendingUp } from "lucide-react";

export const PAIN_POINTS = [
  {
    title: "For Buyers",
    icon: ShoppingBag,
    pains: [
      "Endless scrolling through irrelevant items",
      "Fake reviews and untrusted sellers",
      "Non-existent personalized recommendations",
    ],
    solutions: [
      "Deep neural matching for your exact taste",
      "Verified seller checks before discovery",
      "Instant AI-driven style discovery",
    ],
    color: "blue",
  },
  {
    title: "For Sellers",
    icon: TrendingUp,
    pains: [
      "High advertising costs with low conversion",
      "Difficulty reaching the right audience",
      "Inventory waste due to poor demand prediction",
    ],
    solutions: [
      "Predictive demand signals for smarter inventory",
      "Direct connection to high-intent buyers",
      "Lower-waste marketing with optimization loops",
    ],
    color: "purple",
  },
];
