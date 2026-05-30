import React from "react";
import { useTheme } from "../../../Store/useThemeStore";
import HeroLinksThumbnails from "./UI/HeroLinksThumbnails";

export default function CategoryHeroLinks({ categoryOptions }) {
  const { colors, isDark } = useTheme();
  const categories = categoryOptions
    .filter((category) => category.value !== "All")
    .map((category) => ({
      id: category.id,
      label: category.label,
      image: category.image,
      link: `/products?category=${encodeURIComponent(category.value)}`,
    }));

  return (
    <div className="w-full border-b" style={{ borderColor: colors.border.subtle }}>
      <HeroLinksThumbnails items={categories} isDark={isDark} colors={colors} />
    </div>
  );
}
