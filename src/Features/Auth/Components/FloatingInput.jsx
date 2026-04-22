/**
 * FloatingInput.jsx
 * A highly interactive input component featuring a "floating label" design.
 * 
 * When the user focuses on the input or types something into it, the label smoothly 
 * animates upwards, decreasing in size. This pattern saves screen real estate while 
 * keeping context clear. 
 * 
 * Features:
 * - Dynamic Left Icons (e.g., Mail, Lock)
 * - Dynamic Right Suffixes (e.g., Eye icon to toggle password visibility)
 * - Responsive color styling based on light/dark theme via the `colors` prop.
 */
import React, { useState } from 'react';

export function FloatingInput({ label, type = "text", value, onChange, icon: Icon,
  colors, isDark, autoComplete, suffix }) {
  // Local state tracks if the input is currently focused by the user
  const [focused, setFocused] = useState(false);
  // 'active' determines whether the label should float up. True if focused OR if there's text typed.
  const active = focused || value.length > 0;

  return (
    <div style={{ position: "relative", marginBottom: 16 }}>
      {/* 
        The Label 
        Uses absolute positioning to sit over the input.
        Transform translates it upward when 'active' is true.
      */}
      <label style={{
        position: "absolute",
        left: Icon ? 46 : 16, zIndex: 2,
        top: active ? 7 : "50%",
        transform: active ? "translateY(0)" : "translateY(-50%)",
        fontSize: active ? 10 : 14,
        fontWeight: active ? 700 : 500,
        color: focused
          ? colors.cta.primary // Highlight label in primary color when focused
          : active ? colors.text.tertiary : colors.text.tertiary,
        letterSpacing: active ? "0.07em" : "-0.01em",
        textTransform: active ? "uppercase" : "none",
        transition: "all 0.22s cubic-bezier(0.4,0,0.2,1)",
        pointerEvents: "none", // Ensures clicks pass through to the input beneath
        userSelect: "none",
      }}>
        {label}
      </label>

      {/* 
        Optional Left Icon (e.g., an envelope for an email field)
        Also animates its color based on focus state.
      */}
      {Icon && (
        <div style={{
          position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)",
          zIndex: 2, transition: "color 0.2s",
          color: focused ? colors.cta.primary : colors.text.tertiary,
        }}>
          <Icon size={16} />
        </div>
      )}

      {/* 
        The Actual Input Field 
        Padding is dynamically adjusted so typed text doesn't overlap the floating label.
      */}
      <input
        type={type} value={value} onChange={onChange}
        autoComplete={autoComplete}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{
          width: "100%", height: 58, borderRadius: 14,
          border: `1.5px solid ${focused ? colors.cta.primary : colors.border.default}`,
          background: isDark ? "rgba(255,255,255,0.04)" : colors.surface.secondary,
          color: colors.text.primary,
          fontSize: 14, fontWeight: 500,
          paddingTop: active ? 18 : 0, // Push text down when label floats up
          paddingBottom: active ? 4 : 0,
          paddingLeft: Icon ? 46 : 16, // Indent text if there's a left icon
          paddingRight: suffix ? 44 : 16, // Indent text if there's a right suffix (like a reveal password eye)
          outline: "none", transition: "all 0.22s ease",
          fontFamily: "inherit",
          // Outer glow ring when focused
          boxShadow: focused
            ? `0 0 0 3px ${colors.cta.primary}22`
            : "none",
          boxSizing: "border-box",
        }}
      />

      {/* 
        Optional Right Suffix Component
        Typically used for interactive elements like "Show Password" toggles.
      */}
      {suffix && (
        <div style={{
          position: "absolute", right: 14, top: "50%",
          transform: "translateY(-50%)", zIndex: 2,
        }}>
          {suffix}
        </div>
      )}
    </div>
  );
}
