const ORBS = [
  { w: 500, h: 500, top: "-12%", left: "-8%", delay: 0, dur: 20 },
  { w: 380, h: 380, top: "45%", right: "-8%", delay: 5, dur: 24 },
  { w: 260, h: 260, bottom: "0", left: "38%", delay: 10, dur: 18 },
];

export default function FloatingOrbs({ dark = false }) {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {ORBS.map((orb, index) => (
        <div
          key={index}
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
          className={`absolute rounded-full blur-3xl or-orb ${
            dark
              ? "bg-indigo-900/35"
              : "bg-gradient-to-br from-blue-400/15 to-indigo-500/15"
          }`}
        />
      ))}
    </div>
  );
}
