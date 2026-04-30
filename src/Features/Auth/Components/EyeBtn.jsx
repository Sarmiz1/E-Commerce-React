import React from 'react';
import { Eye, EyeOff } from "lucide-react";

export default function EyeBtn({ show, toggle, colors }) {
  return (
    <button
      className="eye-btn"
      onClick={toggle}
      style={{
        background: "none",
        border: "none",
        cursor: "pointer",
        padding: 4,
        display: "flex",
        alignItems: "center",
        color: colors.text.tertiary,
      }}
    >
      {show ? <EyeOff size={16} /> : <Eye size={16} />}
    </button>
  );
}
