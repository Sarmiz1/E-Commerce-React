export default function ShowcaseTopbar({
  sections,
  labels,
  activeId,
  topbarRef,
  onScrollSection,
  onScrollTopbar,
  top = 0,
}) {

  // if there are no sections dont hide top bar
  if (!sections || sections.length === 0) return null;

  return (
    <div style={{
      position: "sticky", top, zIndex: 50,
      background: "rgba(255,255,255,0.96)",
      borderBottom: "1px solid #f0f0f0",
      backdropFilter: "blur(12px)",
    }}>
      <div style={{
        maxWidth: 1200, margin: "0 auto",
        padding: "0 32px",
        display: "flex", alignItems: "center", gap: 0,
      }}>
        <button onClick={() => onScrollTopbar(-1)} style={{
          padding: "14px 8px", background: "none", border: "none",
          cursor: "pointer", color: "#aaa", fontSize: 16, flexShrink: 0,
        }}>{"\u2039"}</button>
        <div ref={topbarRef} style={{
          display: "flex", gap: 0,
          overflowX: "auto", scrollbarWidth: "none",
          flex: 1,
        }}>
          {sections.map((section) => (
            <button
              key={section.id}
              onClick={() => onScrollSection(section.id)}
              style={{
                flexShrink: 0,
                background: "none",
                border: "none",
                borderBottom: activeId === section.id ? `2px solid ${section.accent}` : "2px solid transparent",
                padding: "16px 14px",
                fontSize: 11,
                fontWeight: activeId === section.id ? 700 : 500,
                color: activeId === section.id ? section.accent : "#888",
                cursor: "pointer",
                letterSpacing: 0.3,
                whiteSpace: "nowrap",
                transition: "color 0.2s ease, border-color 0.2s ease",
                fontFamily: "'DM Sans', sans-serif",
              }}
            >
              {labels[section.id]}
            </button>
          ))}
        </div>
        <button onClick={() => onScrollTopbar(1)} style={{
          padding: "14px 8px", background: "none", border: "none",
          cursor: "pointer", color: "#aaa", fontSize: 16, flexShrink: 0,
        }}>{"\u203a"}</button>
      </div>
    </div>
  );
}
