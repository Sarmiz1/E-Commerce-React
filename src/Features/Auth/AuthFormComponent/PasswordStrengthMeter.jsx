import React from "react";
import { motion } from "framer-motion";

function getPasswordStrength(pass) {
  if (!pass) return 0;
  let score = 0;
  if (pass.length > 7) score++;
  if (pass.length > 10) score++;
  if (/[A-Z]/.test(pass)) score++;
  if (/[0-9]/.test(pass)) score++;
  if (/[^A-Za-z0-9]/.test(pass)) score++;
  return Math.min(4, score);
}

const PasswordStrengthMeter = ({ password }) => {
  const score = getPasswordStrength(password);
  const colors = ["#e5e7eb", "#ef4444", "#f97316", "#eab308", "#22c55e"];
  const width = password ? (score === 0 ? 20 : (score / 4) * 100) : 0;
  const color = password ? colors[Math.max(1, score)] : colors[0];

  return (
    <div style={{ marginTop: -5, marginBottom: 15 }}>
      <div
        style={{
          display: "flex",
          gap: 4,
          height: 4,
          borderRadius: 2,
          overflow: "hidden",
          background: "rgba(150,150,150,0.2)",
        }}
      >
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${width}%`, backgroundColor: color }}
          transition={{ duration: 0.3 }}
          style={{ height: "100%" }}
        />
      </div>
      <div
        style={{
          fontSize: 10,
          color: "rgba(150,150,150,0.8)",
          marginTop: 4,
          textAlign: "right",
          fontWeight: 600,
        }}
      >
        {password && score < 2 && "Weak"}
        {password && score === 2 && "Fair"}
        {password && score === 3 && "Good"}
        {password && score === 4 && "Strong"}
      </div>
    </div>
  );
};

export default PasswordStrengthMeter;
