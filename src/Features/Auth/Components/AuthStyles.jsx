import React from 'react';

export default function AuthStyles({ cta, isDark }) {
  const css = `
    @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600;9..40,700;9..40,800;9..40,900&display=swap');

    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    html, body { height: 100%; }

    .woo-auth { 
      font-family: 'DM Sans', system-ui, sans-serif; 
      color-scheme: ${isDark ? "dark" : "light"};
    }
    .woo-auth input::placeholder,
    .woo-auth select::placeholder { color: transparent; }
    .woo-auth input:focus,
    .woo-auth select:focus { outline: none; }

    /* Scrollbar hidden on form panel */
    .woo-form-scroll::-webkit-scrollbar { width: 0; }

    /* Tabs */
    .auth-tab { transition: all 0.22s ease; cursor: pointer; }

    /* Role cards */
    .role-card { transition: transform 0.18s ease, border-color 0.18s ease; cursor: pointer; }
    .role-card:hover { transform: translateY(-2px); }

    /* CTA */
    .auth-cta { transition: transform 0.18s ease, filter 0.18s ease; }
    .auth-cta:hover:not(:disabled) { transform: translateY(-2px); filter: brightness(1.07); }
    .auth-cta:active:not(:disabled) { transform: translateY(0); }

    /* Google */
    .google-btn { transition: transform 0.18s ease, box-shadow 0.18s ease !important; }
    .google-btn:hover { transform: translateY(-1px) !important; }

    /* Eye, forgot, mode-link */
    .eye-btn:hover { color: ${cta} !important; }
    .forgot-link { transition: opacity 0.15s ease; }
    .forgot-link:hover { opacity: 0.7; }
    .mode-link { transition: opacity 0.15s ease; }
    .mode-link:hover { opacity: 0.72; }

    /* Theme button */
    .theme-btn { transition: transform 0.22s ease; }
    .theme-btn:hover { transform: rotate(22deg) scale(1.1); }

    /* Stat badge hover */
    .stat-badge { transition: transform 0.18s ease; }
    .stat-badge:hover { transform: translateX(4px); }

    @keyframes auth-spin {
      to { transform: rotate(360deg); }
    }
  `;

  return <style>{css}</style>;
}
