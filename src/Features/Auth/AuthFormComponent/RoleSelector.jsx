import React from "react";
import { ShoppingBag, Store, Check } from "lucide-react";

const RoleSelector = ({ role, setValue, colors, isDark, cta }) => {
  return (
    <div style={{ marginBottom: 18 }}>
      <div
        style={{
          fontSize: 10,
          fontWeight: 700,
          color: colors.text.tertiary,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          marginBottom: 10,
        }}
      >
        I want to
      </div>
      <div style={{ display: "flex", gap: 10 }}>
        {[
          { val: "buyer", label: "Shop & Buy", Icon: ShoppingBag },
          { val: "seller", label: "Sell Products", Icon: Store },
        ].map(({ val, label, Icon }) => (
          <div
            key={val}
            className="role-card"
            onClick={() => setValue("role", val)}
            style={{
              flex: 1,
              padding: "13px 12px",
              borderRadius: 14,
              border: `1.5px solid ${role === val ? cta : colors.border.default}`,
              background:
                role === val
                  ? isDark
                    ? `${cta}1a`
                    : `${cta}0e`
                  : isDark
                    ? "rgba(255,255,255,0.03)"
                    : colors.surface.secondary,
              display: "flex",
              alignItems: "center",
              gap: 9,
              boxShadow: role === val ? `0 0 0 3px ${cta}1e` : "none",
              cursor: "pointer",
            }}
          >
            <Icon size={17} color={role === val ? cta : colors.text.tertiary} />
            <span
              style={{
                fontSize: 13,
                fontWeight: 700,
                color: role === val ? cta : colors.text.secondary,
              }}
            >
              {label}
            </span>
            {role === val && (
              <Check size={12} color={cta} style={{ marginLeft: "auto" }} />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default RoleSelector;
