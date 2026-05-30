import { useTheme } from "../../../Store/useThemeStore";

export const useAboutStyles = () => {
  const { colors, isDark } = useTheme();

  return {
    background: colors.surface.primary,
    color: colors.text.primary,
    "--about-bg": colors.surface.primary,
    "--about-card-bg": isDark ? "rgba(39,39,42,0.5)" : "rgba(248,250,252,0.92)",
    "--about-card-hover": isDark ? "#18181b" : "#ffffff",
    "--about-section-bg": isDark ? "rgba(39,39,42,0.2)" : "rgba(248,250,252,0.85)",
    "--about-border": colors.border.subtle,
    "--about-border-strong": colors.border.strong,
    "--about-text": colors.text.primary,
    "--about-muted": colors.text.secondary,
    "--about-subtle": colors.text.tertiary,
    "--about-accent": colors.text.accent,
    "--about-icon-bg": isDark ? "rgba(255,255,255,0.05)" : "rgba(0,80,212,0.08)",
    "--about-hero-glow": isDark ? "rgba(30,58,138,0.18)" : "rgba(59,130,246,0.16)",
    "--about-cta-bg": isDark ? "#ffffff" : colors.text.primary,
    "--about-cta-text": isDark ? "#000000" : colors.text.inverse,
  };
};
