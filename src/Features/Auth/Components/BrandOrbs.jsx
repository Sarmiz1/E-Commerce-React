/**
 * BrandOrbs.jsx
 * This component generates a series of animated, glowing orbs that float in the background
 * of the Authentication page's brand panel. It provides a premium, modern aesthetic.
 * 
 * It dynamically adjusts its colors based on the current theme (light or dark mode)
 * using the colors object provided via props.
 * 
 * Additionally, it renders an SVG grain overlay to provide texture to the background,
 * reducing color banding and adding a cinematic feel.
 */
import React from 'react';

export function BrandOrbs({ colors, isDark }) {
  // Array defining the properties of each individual orb: size, position, animation delay, duration, and opacity
  const orbs = [
    { size: 320, x: "15%", y: "10%",  delay: 0,    dur: 8,  opacity: 0.18 },
    { size: 200, x: "65%", y: "5%",   delay: 1.2,  dur: 11, opacity: 0.12 },
    { size: 260, x: "-5%", y: "55%",  delay: 0.6,  dur: 9,  opacity: 0.15 },
    { size: 180, x: "70%", y: "65%",  delay: 2,    dur: 13, opacity: 0.1  },
    { size: 140, x: "40%", y: "80%",  delay: 0.3,  dur: 7,  opacity: 0.13 },
    { size: 100, x: "55%", y: "30%",  delay: 1.8,  dur: 10, opacity: 0.09 },
  ];

  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none" }}>
      {/* Map through the orbs array to render each orb div with inline dynamic styling */}
      {orbs.map((orb, i) => (
        <div key={i} style={{
          position: "absolute",
          left: orb.x, top: orb.y,
          width: orb.size, height: orb.size,
          borderRadius: "50%",
          // Radial gradient adjusts to theme for optimal visual blending
          background: isDark
            ? `radial-gradient(circle, ${colors.brand.electricBlue}55 0%, transparent 70%)`
            : `radial-gradient(circle, ${colors.cta.primary}33 0%, transparent 70%)`,
          opacity: orb.opacity,
          // Custom CSS keyframes (orbFloat{i}) defined in the parent component handle the actual floating motion
          animation: `orbFloat${i} ${orb.dur}s ease-in-out infinite`,
          animationDelay: `${orb.delay}s`,
          filter: "blur(1px)",
        }} />
      ))}
      {/* Noise/Grain overlay to add texture and break up gradient banding */}
      <div style={{
        position: "absolute", inset: 0, opacity: isDark ? 0.04 : 0.025,
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E")`,
      }} />
    </div>
  );
}
