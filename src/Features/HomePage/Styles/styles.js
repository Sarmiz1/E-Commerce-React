// ─── Styles constant ──────────────────────────────────────────────────────────
export const STYLES = `
  @keyframes hp-float-orb{0%,100%{transform:translate(0,0) scale(1)}33%{transform:translate(30px,-40px) scale(1.05)}66%{transform:translate(-20px,30px) scale(0.97)}}
  .hp-float-orb{animation:hp-float-orb linear infinite}
  @keyframes hp-marquee{0%{transform:translateX(0)}100%{transform:translateX(-50%)}}
  .hp-marquee{animation:hp-marquee 40s linear infinite}
  @keyframes hp-marquee-rev{0%{transform:translateX(-50%)}100%{transform:translateX(0)}}
  .hp-marquee-rev{animation:hp-marquee-rev 40s linear infinite}
  @keyframes hp-hero-glow{0%,100%{opacity:.6;transform:scale(1)}50%{opacity:1;transform:scale(1.1)}}
  .hp-hero-glow{animation:hp-hero-glow 6s ease-in-out infinite}
  @keyframes hp-shimmer{0%{background-position:-200% center}100%{background-position:200% center}}
  .hp-shimmer{
    background:linear-gradient(90deg,#fff 0%,#a5b4fc 30%,#fff 60%,#818cf8 90%);
    background-size:200% auto;-webkit-background-clip:text;background-clip:text;
    -webkit-text-fill-color:transparent;animation:hp-shimmer 4s linear infinite;
  }
  @keyframes hp-float-y{0%,100%{transform:translateY(0)}50%{transform:translateY(-14px)}}
  .hp-float-y{animation:hp-float-y 4s ease-in-out infinite}

  @keyframes hp-count-up{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
  .hp-count-up{animation:hp-count-up 0.5s ease-out forwards}

  @keyframes hp-pulse-ring{0%{transform:scale(1);opacity:.6}70%{transform:scale(1.4);opacity:0}100%{transform:scale(1.4);opacity:0}}
  .hp-pulse-ring{animation:hp-pulse-ring 2s ease-out infinite}

  @keyframes hp-scroll-x{0%{transform:translateX(0)}100%{transform:translateX(-50%)}}
  .hp-scroll-x{animation:hp-scroll-x 30s linear infinite}
  .hp-scroll-x:hover{animation-play-state:paused}

  .hp-progress-bar{transition:width 1.2s cubic-bezier(0.4,0,0.2,1)}

  @keyframes hp-back-top-float{0%,100%{transform:translateY(0)}50%{transform:translateY(-6px)}}

  .hp-back-top{
    position:fixed;bottom:6rem;right:1.5rem;z-index:1200;
    width:3.5rem;height:3.5rem;border-radius:9999px;
    background:linear-gradient(135deg,#2563eb,#6366f1);
    color:white;display:flex;align-items:center;justify-content:center;
    box-shadow:0 10px 30px rgba(99,102,241,0.4);
    cursor:pointer;border:none;outline:none;
    will-change:transform,opacity;
    touch-action:manipulation;
    pointer-events:auto;
  }
  .hp-back-top:hover{box-shadow:0 16px 40px rgba(99,102,241,0.55);}
  .hp-back-top-inner{
    position:relative;width:100%;height:100%;
    display:flex;align-items:center;justify-content:center;
    animation:hp-back-top-float 2.6s ease-in-out infinite;
  }
  .hp-back-top.is-scrolling .hp-back-top-inner{animation:none;}
  .hp-back-top-ring{pointer-events:none;}
  .hp-back-top-icon{pointer-events:none;transition:transform 0.18s ease;}
  .hp-back-top:hover .hp-back-top-icon{transform:translateY(-2px);}
`;
