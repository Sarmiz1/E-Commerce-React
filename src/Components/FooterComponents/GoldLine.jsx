import React from 'react'

// Animated shimmer line
function GoldLine() {
  return (
    <div className="relative h-px w-full overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#c9a84c] to-transparent opacity-40" />
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-10 footer-shimmer-line" />
    </div>
  );
}

export default GoldLine
