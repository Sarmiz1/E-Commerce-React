import React, { useState, forwardRef } from 'react';

const FloatingInput = forwardRef(({
  label,
  type = "text",
  value,
  onChange,
  onBlur,
  name,
  icon: Icon,
  colors,
  isDark,
  autoComplete,
  suffix,
  error,
}, ref) => {
  const [focused, setFocused] = useState(false);
  // We determine 'active' either by value or if it's focused. 
  // If used with react-hook-form register, value might be undefined unless watched,
  // but if used with Controller, value will be defined.
  const active = focused || (value !== undefined && value !== null && String(value).length > 0);

  return (
    <div style={{ position: "relative", marginBottom: error ? 24 : 13 }}>
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
          color: error ? "#ef4444" : (focused ? colors.cta.primary : colors.text.tertiary),
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
            color: error ? "#ef4444" : (focused ? colors.cta.primary : colors.text.tertiary),
            transition: "color 0.2s",
          }}
        >
          <Icon size={16} />
        </div>
      )}

      <input
        ref={ref}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        autoComplete={autoComplete}
        onFocus={() => setFocused(true)}
        onBlur={(e) => {
          setFocused(false);
          if (onBlur) onBlur(e);
        }}
        style={{
          width: "100%",
          height: 56,
          borderRadius: 14,
          boxSizing: "border-box",
          border: `1.5px solid ${error ? "#ef4444" : (focused ? colors.cta.primary : colors.border.default)}`,
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
          boxShadow: error ? "0 0 0 3px rgba(239,68,68,0.15)" : (focused ? `0 0 0 3px ${colors.cta.primary}20` : "none"),
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

      {error && (
        <div style={{ position: "absolute", bottom: -18, left: 4, fontSize: 11, color: "#ef4444", fontWeight: 600 }}>
          {error}
        </div>
      )}
    </div>
  );
});

FloatingInput.displayName = 'FloatingInput';
export default FloatingInput;
