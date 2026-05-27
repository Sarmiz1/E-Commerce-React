/* ─── DEMO PAGE ──────────────────────────────────────────────────────────────── */
import { useState } from "react";

const ALL = ["verified", "topRated", "proSeller"];

const USERS = [
  {
    name: "Adaeze Okonkwo",
    role: "UI/UX Designer",
    avatar: "AO",
    avatarBg: "#ddd6fe",
    avatarColor: "#4338ca",
    badges: ["proSeller", "verified"],
    rating: "4.97",
    jobs: "312",
  },
  {
    name: "James Whitfield",
    role: "Full-Stack Developer",
    avatar: "JW",
    avatarBg: "#d1fae5",
    avatarColor: "#059669",
    badges: ["topRated", "verified"],
    rating: "5.0",
    jobs: "241",
  },
  {
    name: "Priya Nair",
    role: "Brand Strategist",
    avatar: "PN",
    avatarBg: "#fef9c3",
    avatarColor: "#b45309",
    badges: ["topRated"],
    rating: "4.92",
    jobs: "189",
  },
];







export default function UserCard({BADGE_CSS}) {
  const [activeSize, setActiveSize] = useState("md");

  return (
    <>
      <style>{BADGE_CSS}</style>
      <div style={{
        minHeight: "100vh",
        background: "linear-gradient(160deg, #f8fafc 0%, #f1f5f9 100%)",
        fontFamily: "'DM Sans', system-ui, sans-serif",
        padding: "48px 32px",
        boxSizing: "border-box",
      }}>

        {/* ── Header ── */}
        <div style={{ marginBottom: 40 }}>
          <p style={{
            fontSize: 11, fontWeight: 600, letterSpacing: "0.1em",
            color: "#94a3b8", textTransform: "uppercase", marginBottom: 6,
          }}>
            Component Preview
          </p>
          <h1 style={{
            fontSize: 28, fontWeight: 600, color: "#0f172a",
            margin: 0, letterSpacing: "-0.02em",
          }}>
            UserBadges
          </h1>
        </div>

        {/* ── All three badges ── */}
        <section style={{ marginBottom: 40 }}>
          <p style={{ fontSize: 11, fontWeight: 600, color: "#94a3b8", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 14 }}>
            All variants — hover each
          </p>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
            {ALL.map((t, i) => <Badge key={t} type={t} size={activeSize} delay={i * 70} />)}
          </div>
          <div style={{ display: "flex", gap: 8, marginTop: 16, alignItems: "center" }}>
            <p style={{ fontSize: 12, color: "#94a3b8", margin: 0, fontWeight: 500 }}>Size:</p>
            {["sm", "md", "lg"].map(s => (
              <button
                key={s}
                onClick={() => setActiveSize(s)}
                style={{
                  padding: "4px 12px", borderRadius: 6, border: "1px solid",
                  borderColor: activeSize === s ? "#6366f1" : "#e2e8f0",
                  background: activeSize === s ? "#ede9fe" : "#fff",
                  color: activeSize === s ? "#4338ca" : "#64748b",
                  fontSize: 12, fontWeight: 600, cursor: "pointer",
                  fontFamily: "'DM Sans', sans-serif", letterSpacing: "0.02em",
                  transition: "all 0.15s ease",
                }}
              >
                {s}
              </button>
            ))}
          </div>
        </section>

        {/* ── Compact mode ── */}
        <section style={{ marginBottom: 40 }}>
          <p style={{ fontSize: 11, fontWeight: 600, color: "#94a3b8", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 14 }}>
            Compact mode (max 2 + overflow)
          </p>
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <UserBadges badges={ALL} compact size="sm" />
          </div>
        </section>

        {/* ── User cards ── */}
        <section>
          <p style={{ fontSize: 11, fontWeight: 600, color: "#94a3b8", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 14 }}>
            In context — seller cards
          </p>
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: 16,
          }}>
            {USERS.map((u, idx) => (
              <div
                key={u.name}
                style={{
                  background: "#fff",
                  border: "1px solid rgba(0,0,0,0.07)",
                  borderRadius: 16,
                  padding: "20px 20px 18px",
                  boxShadow: "0 1px 4px rgba(0,0,0,0.05), 0 4px 16px rgba(0,0,0,0.04)",
                  transition: "box-shadow 0.22s ease, transform 0.22s ease",
                  cursor: "pointer",
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.08), 0 12px 32px rgba(0,0,0,0.07)";
                  e.currentTarget.style.transform = "translateY(-3px)";
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.boxShadow = "0 1px 4px rgba(0,0,0,0.05), 0 4px 16px rgba(0,0,0,0.04)";
                  e.currentTarget.style.transform = "translateY(0)";
                }}
              >
                {/* Avatar + info */}
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
                  <div style={{
                    width: 42, height: 42, borderRadius: "50%",
                    background: u.avatarBg, color: u.avatarColor,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 13, fontWeight: 700, letterSpacing: "-0.01em",
                    flexShrink: 0,
                    boxShadow: `0 0 0 2px ${u.avatarBg}, 0 0 0 3px ${u.avatarColor}22`,
                  }}>
                    {u.avatar}
                  </div>
                  <div>
                    <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: "#0f172a", letterSpacing: "-0.01em" }}>
                      {u.name}
                    </p>
                    <p style={{ margin: 0, fontSize: 12, color: "#94a3b8", fontWeight: 500, marginTop: 1 }}>
                      {u.role}
                    </p>
                  </div>
                </div>

                {/* Badges */}
                <div style={{ marginBottom: 16 }}>
                  <UserBadges badges={u.badges} size="sm" />
                </div>

                {/* Stats */}
                <div style={{
                  display: "flex", gap: 12,
                  borderTop: "1px solid #f1f5f9",
                  paddingTop: 14,
                }}>
                  <div>
                    <p style={{ margin: 0, fontSize: 11, color: "#94a3b8", fontWeight: 500 }}>Rating</p>
                    <p style={{ margin: 0, fontSize: 15, fontWeight: 700, color: "#0f172a", letterSpacing: "-0.01em" }}>
                      ★ {u.rating}
                    </p>
                  </div>
                  <div style={{ width: 1, background: "#f1f5f9" }} />
                  <div>
                    <p style={{ margin: 0, fontSize: 11, color: "#94a3b8", fontWeight: 500 }}>Jobs done</p>
                    <p style={{ margin: 0, fontSize: 15, fontWeight: 700, color: "#0f172a", letterSpacing: "-0.01em" }}>
                      {u.jobs}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

      </div>
    </>
  );
}