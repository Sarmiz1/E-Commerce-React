import { useRef } from "react";
import { Link } from "react-router-dom";
import { useIntersectionObserver } from "../Hooks/useIntersectionObserver";
import { useTheme } from "../../../Store/useThemeStore";
import ShowcaseCountdownTimer from "./ShowcaseCountdownTimer";
import ShowcaseDealSection from "./ShowcaseDealSection";
import ShowcaseRail from "./ShowcaseRail";
import ShowcaseProductCard from "./ShowcaseProductCard";
import ShowcaseStoreCard from "./ShowcaseStoreCard";
import ShowcaseBrandCard from "./ShowcaseBrandCard";

export default function ShowcaseSection({ section, onQuickView, viewAllPath }) {
  const { colors } = useTheme();
  const ref = useRef(null);
  const visible = useIntersectionObserver(ref);

  const normalizedId = String(section.id || "").replace(/-/g, "");
  const isHot = normalizedId === "hotrightnow";
  const isMostLoved = normalizedId === "mostloved";
  const isContinue = normalizedId === "continueshopping";
  const isBrowsing = normalizedId === "browsing";

  return (
    <section
      id={section.id}
      ref={ref}
      style={{ paddingBottom: 64 }}
    >
      <div className="showcase-section-head" style={{
        display: "flex", alignItems: "flex-end", justifyContent: "space-between",
        marginBottom: 24,
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(16px)",
        transition: "opacity 0.5s ease, transform 0.5s ease",
      }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
            <span style={{
              fontSize: 9, fontWeight: 800,
              letterSpacing: 0, textTransform: "uppercase",
              color: section.tagColor,
              display: "inline-block",
            }}>
              {section.tag}
            </span>
            {section.isFlash && (
              <ShowcaseCountdownTimer
                endsAt={section.saleEndsAt}
                label={section.countdownLabel || "2h 29m 3s"}
              />
            )}
          </div>
          <h2 style={{
            margin: 0,
            fontSize: 22,
            fontWeight: 700,
            color: colors.text.primary,
            letterSpacing: 0,
            fontFamily: "'Playfair Display', serif",
          }}>
            {section.label}
          </h2>
        </div>
        <Link to={viewAllPath || section.path || "#"} style={{
          fontSize: 11, fontWeight: 600,
          color: colors.text.secondary, textDecoration: "none",
          letterSpacing: 0, textTransform: "uppercase",
          borderBottom: `1px solid ${colors.border.strong}`,
          paddingBottom: 1,
          transition: "color 0.2s ease, border-color 0.2s ease",
        }}>
          View All {"\u2192"}
        </Link>
      </div>

      {section.type === "brands" ? (
        <ShowcaseRail>
          {section.brands.map((brand, i) => (
            <ShowcaseBrandCard
              key={brand.id}
              brand={brand}
              accent={section.accent}
              delay={i * 60}
              visible={visible}
            />
          ))}
        </ShowcaseRail>
      ) : section.type === "stores" ? (
        <ShowcaseRail>
          {section.stores.map((store, i) => (
            <ShowcaseStoreCard
              key={store.id}
              store={store}
              accent={section.accent}
              delay={i * 60}
              visible={visible}
            />
          ))}
        </ShowcaseRail>
      ) : section.isDealOfDay ? (
        <ShowcaseDealSection section={section} visible={visible} onQuickView={onQuickView} />
      ) : (
        <ShowcaseRail>
          {section.items.map((item, i) => (
            <ShowcaseProductCard
              key={item.id}
              item={item}
              accent={section.accent}
              editorial={section.editorial}
              isMostLoved={isMostLoved}
              isContinue={isContinue}
              isBrowsing={isBrowsing}
              isHot={isHot}
              isFlash={section.isFlash}
              delay={i * 60}
              visible={visible}
              onQuickView={onQuickView}
            />
          ))}
        </ShowcaseRail>
      )}
      <style>{`
        @media (max-width: 767px) {
          .showcase-section-head {
            align-items: flex-start !important;
            gap: 12px !important;
          }
        }
      `}</style>
    </section>
  );
}
