
export function WooshoLogo({ size = 40, dark = false, markOnly = false }) {
  const r = size / 40;
  const c = dark ? "white" : "#1A1433";
  const bg = dark ? "#7B6AF5" : "#5B4FE8";
  return (
    <svg width={markOnly ? size : size * 5.5} height={size}
      viewBox={`0 0 ${markOnly ? 40 : 220} 40`}>
      <rect width="40" height="40" rx={size * 0.275} fill={bg}/>
      <polyline points="8,38 16,16 24,32 32,16 40,38"
        fill="none" stroke="white"
        strokeWidth={size * 0.088}
        strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M5,14 Q24,3 44,14" fill="none" stroke="white"
        strokeWidth={size * 0.038} strokeLinecap="round"
        strokeDasharray="3 4" opacity="0.5"/>
      {!markOnly && <>
        <text x="52" y="29" fontSize="26" fontWeight="700"
          fill={c} letterSpacing="-1">W</text>
        <text x="71" y="29" fontSize="26" fontWeight="400"
          fill={c} letterSpacing="-0.5">oosho</text>
      </>}
    </svg>
  );
}
