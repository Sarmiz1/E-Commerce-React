import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrollToPlugin } from "gsap/ScrollToPlugin";
import { CATEGORIES } from "../../Data/categories";
import { BRANDS } from "../../Data/brands";
import { PERKS } from "../../Data/perks";
import { TESTIMONIALS } from "../../Data/testimonials";
import { HOW_IT_WORKS } from "../../Data/how-it-works";
import SectionLabel from "../SectionLabel";
import Stars from "../../../../components/Stars";
import ParticleField from "../ParticleField";
import FloatingOrbs from "../FloatingOrbs";
import ProductCard from "../../../../components/Ui/ProductCard";
import { BentoCard } from "../BentoProductGridComponents/BentoCard";
import AddToCart from "../../../../components/Ui/AddToCart";

gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);

export default function Skeleton({ variant = "default", count = 1 }) {
  const items = Array(count).fill(0);
  if (variant === "tall") return items.map((_, i) => (
    <div key={i} className="rounded-3xl overflow-hidden bg-white shadow-lg animate-pulse">
      <div className="h-72 bg-gray-200" />
      <div className="p-5 space-y-2"><div className="h-4 bg-gray-200 rounded w-3/4" /><div className="h-3 bg-gray-100 rounded w-1/2" /><div className="h-6 bg-gray-200 rounded w-1/3 mt-2" /></div>
    </div>
  ));
  if (variant === "wide") return items.map((_, i) => (
    <div key={i} className="flex gap-4 bg-white rounded-2xl p-4 shadow-md animate-pulse">
      <div className="w-24 h-24 rounded-xl bg-gray-200 flex-shrink-0" />
      <div className="flex-1 space-y-2 py-1"><div className="h-4 bg-gray-200 rounded w-3/4" /><div className="h-3 bg-gray-100 rounded w-1/2" /><div className="h-5 bg-gray-200 rounded w-1/3 mt-3" /></div>
    </div>
  ));
  return items.map((_, i) => (
    <div key={i} className="rounded-3xl overflow-hidden bg-white shadow-md animate-pulse">
      <div className="h-56 bg-gray-200" />
      <div className="p-5 space-y-2"><div className="h-4 bg-gray-200 rounded w-3/4" /><div className="h-3 bg-gray-100 rounded w-1/2" /><div className="h-6 bg-gray-200 rounded w-1/3 mt-3" /></div>
    </div>
  ));
}
