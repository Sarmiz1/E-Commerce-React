import React from "react";
import { useTheme } from "../../../Store/useThemeStore";
import HeroLinksThumbnails from "./UI/HeroLinksThumbnails";
import { CATEGORIES } from "../Utils/categories";
import { FILTERED_LINKS } from "../Utils/filteredLInk";

export default function CategoryHeroLinks() {
  const { colors, isDark } = useTheme();

  return (
    <div className="w-full border-b" style={{ borderColor: colors.border.subtle }}>
      {/* Categories */}
      <HeroLinksThumbnails items={CATEGORIES} isDark={isDark} colors={colors} />

      {/* Hero Trends */}
      <HeroLinksThumbnails items={FILTERED_LINKS} isDark={isDark} colors={colors} />
    </div>
  );
}
