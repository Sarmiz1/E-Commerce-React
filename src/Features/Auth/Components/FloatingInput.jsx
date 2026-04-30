import React, { useState } from 'react';

export default function FloatingInput({
  label,
  type = "text",
  value,
  onChange,
  icon: Icon,
  colors,
  isDark,
  autoComplete,
  suffix,
}) {
  const [focused, setFocused] = useState(false);
  const active = focused || (value && value.length > 0);

  return (
    <div style={{ position: "relative", marginBottom: 13 }}>
      {/* Floating label */}
      <label
        style={{
          position: "absolute",
          left: Icon ? 46 : 16,
          zIndex: 2,
          top: active ? 8 : "50%",
          transform: active ? "translateY(0)" : "translateY(-50%)",
          fontSize: active ? 9.5 : 13.5,
          fontWeight: active ? 700 : 400,
          color: focused ? colors.cta.primary : colors.text.tertiary,
          letterSpacing: active ? "0.08em" : "-0.01em",
          textTransform: active ? "uppercase" : "none",
          transition: "all 0.2s cubic-bezier(0.4,0,0.2,1)",
          pointerEvents: "none",
          userSelect: "none",
        }}
      >
        {label}
      </label>

      {/* Left icon */}
      {Icon && (
        <div
          style={{
            position: "absolute",
            left: 14,
            top: "50%",
            transform: "translateY(-50%)",
            zIndex: 2,
            color: focused ? colors.cta.primary : colors.text.tertiary,
            transition: "color 0.2s",
          }}
        >
          <Icon size={16} />
        </div>
      )}

      <input
        type={type}
        value={value}
        onChange={onChange}
        autoComplete={autoComplete}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{
          width: "100%",
          height: 56,
          borderRadius: 14,
          boxSizing: "border-box",
          border: `1.5px solid ${focused ? colors.cta.primary : colors.border.default}`,
          background: isDark
            ? "rgba(255,255,255,0.04)"
            : colors.surface.secondary,
          color: colors.text.primary,
          fontSize: 14,
          fontWeight: 500,
          fontFamily: "inherit",
          paddingTop: active ? 18 : 0,
          paddingBottom: active ? 4 : 0,
          paddingLeft: Icon ? 46 : 16,
          paddingRight: suffix ? 46 : 16,
          outline: "none",
          transition: "border-color 0.2s, box-shadow 0.2s",
          boxShadow: focused ? `0 0 0 3px ${colors.cta.primary}20` : "none",
        }}
      />

      {suffix && (
        <div
          style={{
            position: "absolute",
            right: 12,
            top: "50%",
            transform: "translateY(-50%)",
            zIndex: 2,
          }}
        >
          {suffix}
        </div>
      )}
    </div>
  );
}
