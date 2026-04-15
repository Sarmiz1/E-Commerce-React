// ─── Floating orbs background ─────────────────────────────────────────────────
function FloatingOrbs({ dark = false }) {
  const orbs = [
    { w: 600, h: 600, top: "-10%", left: "-10%", delay: 0, dur: 18 },
    { w: 400, h: 400, top: "40%", right: "-8%", delay: 3, dur: 22 },
    { w: 300, h: 300, bottom: "-5%", left: "30%", delay: 6, dur: 16 },
    { w: 200, h: 200, top: "20%", left: "50%", delay: 2, dur: 20 },
  ];
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {orbs.map((o, i) => (
        <div key={i} style={{ width: o.w, height: o.h, top: o.top, left: o.left, right: o.right, bottom: o.bottom, animationDelay: `${o.delay}s`, animationDuration: `${o.dur}s` }}
          className={`absolute rounded-full blur-3xl se-float-orb ${dark ? "bg-indigo-900/40" : "bg-gradient-to-br from-blue-400/20 to-indigo-500/20"}`} />
      ))}
    </div>
  );
}

export default FloatingOrbs
