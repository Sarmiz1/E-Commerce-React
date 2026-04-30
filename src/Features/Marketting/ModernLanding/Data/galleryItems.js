import shoeImg from "../../../../assets/marketing/shoe-stealth.png";
import sneakersImg from "../../../../assets/marketing/cat-sneakers.png";
import neuralImg from "../../../../assets/marketing/neural-preview.png";
import heroImg from "../../../../assets/marketing/hero-blur.png";
import fashionImg from "../../../../assets/marketing/cat-fashion.png";

export const GALLERY_ITEMS = [
  {
    id: 1,
    title: "Stealth Runner",
    subtitle: "Built for the streets, engineered for the track.",
    label: "NEW DROP",
    tag: "FOOTWEAR",
    img: shoeImg,
    href: "/products?category=Footwear",
  },
  {
    id: 2,
    title: "Classic Kicks",
    subtitle: "Timeless silhouette. Contemporary comfort.",
    label: "BESTSELLER",
    tag: "SNEAKERS",
    img: sneakersImg,
    href: "/products?category=Sneakers",
  },
  {
    id: 3,
    title: "Neural Vision",
    subtitle: "AI-curated fashion that adapts to your style DNA.",
    label: "AI POWERED",
    tag: "TECHNOLOGY",
    img: neuralImg,
    href: "/products?category=Technology",
  },
  {
    id: 4,
    title: "Blur Edit",
    subtitle: "Limited edition pieces that define culture.",
    label: "LIMITED",
    tag: "EDITORIAL",
    img: heroImg,
    href: "/products?category=Editorial",
  },
  {
    id: 5,
    title: "Mode Sauvage",
    subtitle: "Unapologetic. Raw. Built with precision.",
    label: "EXCLUSIVE",
    tag: "FASHION",
    img: fashionImg,
    href: "/products?category=Fashion",
  },
];
