/**
 * StatBadge.jsx
 * A small, glassmorphic UI component designed to display a statistic on the brand panel.
 * It combines an icon, a large numeric value, and a small descriptive label.
 * 
 * Uses backdrop-filter to achieve the "glass" look and adjusts borders and shadows 
 * dynamically based on whether the app is in dark mode or light mode.
 */
import React from 'react';

export function StatBadge({ icon: Icon, value, label, colors, isDark, className }) {
  return (
    <div className={className} style={{
      display: "flex", alignItems: "center", gap: 10,
      padding: "12px 18px",
      // Glass effect styling: semi-transparent background with a strong blur behind it
      background: isDark ? "rgba(255,255,255,0.07)" : "rgba(255,255,255,0.55)",
      backdropFilter: "blur(16px)",
      WebkitBackdropFilter: "blur(16px)",
      borderRadius: 16,
      // The border acts as a specular highlight on the edge of the glass
      border: isDark ? "1px solid rgba(255,255,255,0.1)" : "1px solid rgba(255,255,255,0.8)",
      // Subtle shadow grounds the component against the background
      boxShadow: isDark ? "0 8px 32px rgba(0,0,0,0.3)" : "0 8px 24px rgba(0,0,0,0.08)",
    }}>
      {/* Icon Container: Renders the Lucide-react icon passed down via props */}
      <div style={{
        width: 34, height: 34, borderRadius: 10,
        background: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,80,212,0.1)",
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        <Icon size={17} color={isDark ? "#90abff" : "#0050d4"} />
      </div>
      
      {/* Text Container */}
      <div>
        {/* Main Value String (e.g., "50k+") */}
        <div style={{
          fontSize: 15, fontWeight: 800,
          color: isDark ? "#F5F6F7" : "#0E0E10",
          letterSpacing: "-0.03em", lineHeight: 1.1,
          fontFamily: "'DM Serif Display', 'Georgia', serif",
        }}>{value}</div>
        
        {/* Sub-label (e.g., "ACTIVE SELLERS") */}
        <div style={{
          fontSize: 10, fontWeight: 600,
          color: isDark ? "rgba(245,246,247,0.55)" : "rgba(14,14,16,0.55)",
          letterSpacing: "0.04em", textTransform: "uppercase",
        }}>{label}</div>
      </div>
    </div>
  );
}
