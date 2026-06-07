import { Link } from "react-router-dom";
import { useTheme } from "../../../Store/useThemeStore";

const getBrandPath = (brand) =>
  brand?.slug ? `/brands/${encodeURIComponent(brand.slug)}` : "/brands";

export default function ShowcaseBrandCard({
  brand,
  accent = "#1A73C9",
  delay = 0,
  visible,
}) {
  const { colors, isDark } = useTheme();

  return (
    <Link
      to={getBrandPath(brand)}
      style={{
        flex: "0 0 clamp(180px, 52vw, 220px)",
        width: "clamp(180px, 52vw, 220px)",
        textDecoration: "none",
        color: "inherit",
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(28px)",
        transition: `opacity 0.5s ease ${delay}ms, transform 0.5s ease ${delay}ms`,
        scrollSnapAlign: "start",
      }}
    >
      <article style={{
        minHeight: 250,
        borderRadius: 12,
        overflow: "hidden",
        border: `1px solid ${colors.border.subtle}`,
        background: colors.surface.elevated,
        boxShadow: isDark ? "0 18px 45px rgba(0,0,0,0.22)" : "0 18px 45px rgba(20,18,14,0.08)",
      }}>
        <div style={{
          height: 132,
          background: colors.surface.secondary,
          position: "relative",
          overflow: "hidden",
        }}>
          {brand.image ? (
            <img
              src={brand.image}
              alt={brand.name}
              loading="lazy"
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          ) : (
            <div style={{
              width: "100%",
              height: "100%",
              display: "grid",
              placeItems: "center",
              background: `linear-gradient(135deg, ${accent}, ${colors.surface.tertiary})`,
              color: colors.text.primary,
              fontSize: 34,
              fontWeight: 900,
            }}>
              {brand.name?.charAt(0) || "B"}
            </div>
          )}
          <span style={{
            position: "absolute",
            left: 12,
            bottom: 12,
            background: isDark ? "rgba(14,14,16,0.86)" : "rgba(255,255,255,0.9)",
            color: colors.text.primary,
            border: `1px solid ${colors.border.subtle}`,
            borderRadius: 4,
            padding: "4px 8px",
            fontSize: 9,
            fontWeight: 800,
            textTransform: "uppercase",
            letterSpacing: 0,
          }}>
            Brand
          </span>
        </div>
        <div style={{ padding: 16 }}>
          <h3 style={{
            margin: 0,
            color: colors.text.primary,
            fontSize: 15,
            fontWeight: 800,
            lineHeight: 1.25,
          }}>
            {brand.name}
          </h3>
          <p style={{
            margin: "8px 0 0",
            color: colors.text.secondary,
            fontSize: 11,
            lineHeight: 1.5,
          }}>
            {brand.productCount > 0
              ? `${brand.productCount.toLocaleString()} active listings`
              : "Browse active listings"}
          </p>
          <div style={{
            marginTop: 18,
            color: accent,
            fontSize: 11,
            fontWeight: 800,
            textTransform: "uppercase",
            letterSpacing: 0,
          }}>
            Shop Brand {"\u2192"}
          </div>
        </div>
      </article>
    </Link>
  );
}
