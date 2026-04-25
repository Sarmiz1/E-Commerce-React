import PartnerLogo from "./PartnerLogo";

export default function MarqueeRow({ partners, reverse = false, paused = false }) {
  const doubled = [...partners, ...partners, ...partners];
  return (
    <div className="relative overflow-hidden w-full">
      {/* Left fade */}
      <div
        className="pointer-events-none absolute left-0 top-0 bottom-0 w-24 z-10"
        style={{
          background:
            "linear-gradient(to right, var(--marquee-fade), transparent)",
        }}
      />
      {/* Right fade */}
      <div
        className="pointer-events-none absolute right-0 top-0 bottom-0 w-24 z-10"
        style={{
          background:
            "linear-gradient(to left, var(--marquee-fade), transparent)",
        }}
      />

      <div
        className="flex items-center gap-1 w-max"
        style={{
          animation: `marquee${reverse ? "Rev" : "Fwd"} 38s linear infinite`,
          animationPlayState: paused ? "paused" : "running",
        }}
      >
        {doubled.map((p, i) => (
          <PartnerLogo key={`${p.name}-${i}`} name={p.name} accent={p.accent} />
        ))}
      </div>
    </div>
  );
}
