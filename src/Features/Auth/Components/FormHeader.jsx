import React from "react";

const FormHeader = ({ mode, colors, isMobile }) => {
  return (
    <div style={{ marginBottom: 26, textAlign: "center" }}>
      <h2
        style={{
          fontFamily: "'DM Serif Display', Georgia, serif",
          fontSize: isMobile ? 25 : 29,
          fontWeight: 400,
          lineHeight: 1.15,
          color: colors.text.primary,
          letterSpacing: "-0.035em",
          marginBottom: 7,
        }}
      >
        {mode === "login" ? "Welcome back." : mode === "register" ? "Create your account." : "Reset password."}
      </h2>
      <p
        style={{
          fontSize: 14,
          color: colors.text.tertiary,
          fontWeight: 400,
          lineHeight: 1.55,
        }}
      >
        {mode === "login"
          ? "Sign in to continue to Woosho."
          : mode === "register"
            ? "Join millions of buyers and sellers."
            : "Enter your email to receive a reset link."}
      </p>
    </div>
  );
};

export default FormHeader;
