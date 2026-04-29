const ORBS = [
  { w: 450, h: 450, top: "-12%", left: "-8%", delay: 0, dur: 20 },
  { w: 350, h: 350, top: "50%", right: "-8%", delay: 5, dur: 24 },
  { w: 250, h: 250, bottom: "5%", left: "40%", delay: 10, dur: 18 },
];

export function FloatingOrbs({ dark = false }) {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {ORBS.map((orb, index) => (
        <div
          key={index}
          className={`co-orb absolute rounded-full blur-3xl ${dark ? "bg-indigo-900/40" : "bg-gradient-to-br from-blue-400/20 to-indigo-500/20"}`}
          style={{
            width: orb.w,
            height: orb.h,
            top: orb.top,
            left: orb.left,
            right: orb.right,
            bottom: orb.bottom,
            animationDelay: `${orb.delay}s`,
            animationDuration: `${orb.dur}s`,
          }}
        />
      ))}
    </div>
  );
}
