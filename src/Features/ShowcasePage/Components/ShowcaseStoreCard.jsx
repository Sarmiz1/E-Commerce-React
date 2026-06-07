import { Link } from "react-router-dom";

const getStorePath = (store) =>
  store?.slug ? `/seller?store=${encodeURIComponent(store.slug)}` : "/seller";

export default function ShowcaseStoreCard({
  store,
  accent = "#0F7B6C",
  delay = 0,
  visible,
}) {
  const badge = store.isVerified
    ? "Verified"
    : store.badges?.[0] || (store.trustScore >= 80 ? "Trusted" : "New Store");

  return (
    <Link
      to={getStorePath(store)}
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
        minHeight: 260,
        border: "1px solid #ece8df",
        borderRadius: 12,
        background: "#fff",
        overflow: "hidden",
        boxShadow: "0 18px 45px rgba(20, 18, 14, 0.08)",
      }}>
        <div style={{
          height: 106,
          background: `linear-gradient(135deg, ${accent}, #181818)`,
          position: "relative",
        }}>
          <div style={{
            position: "absolute",
            left: 16,
            bottom: -34,
            width: 76,
            height: 76,
            borderRadius: "50%",
            border: "4px solid #fff",
            background: "#f4f3f0",
            overflow: "hidden",
            display: "grid",
            placeItems: "center",
            color: "#111",
            fontSize: 26,
            fontWeight: 800,
          }}>
            {store.image ? (
              <img
                src={store.image}
                alt={store.name}
                loading="lazy"
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            ) : (
              store.name?.charAt(0) || "S"
            )}
          </div>
        </div>

        <div style={{ padding: "46px 16px 16px" }}>
          <span style={{
            display: "inline-flex",
            marginBottom: 8,
            padding: "3px 8px",
            borderRadius: 4,
            background: "rgba(0,0,0,0.84)",
            color: "#fff",
            fontSize: 9,
            fontWeight: 800,
            textTransform: "uppercase",
            letterSpacing: 0,
          }}>
            {badge}
          </span>
          <h3 style={{
            margin: 0,
            color: "#111",
            fontSize: 15,
            fontWeight: 800,
            lineHeight: 1.25,
          }}>
            {store.name}
          </h3>
          <p style={{
            margin: "8px 0 0",
            color: "#777",
            fontSize: 11,
            lineHeight: 1.5,
          }}>
            {store.rating > 0 ? `${store.rating.toFixed(1)} rating` : "Newly added to WooSho"}
            {store.trustScore > 0 ? ` · ${store.trustScore}% trust score` : ""}
          </p>
          <div style={{
            marginTop: 18,
            color: accent,
            fontSize: 11,
            fontWeight: 800,
            textTransform: "uppercase",
            letterSpacing: 0,
          }}>
            Visit Store {"\u2192"}
          </div>
        </div>
      </article>
    </Link>
  );
}
