export function fmtNaira(val) {
  if (!val && val !== 0) return '₦0';
  const abs = Math.abs(val);
  if (abs >= 1_000_000) return `₦${(abs / 1_000_000).toFixed(2)}M`;
  if (abs >= 1_000)     return `₦${(abs / 1_000).toFixed(0)}K`;
  return `₦${abs.toLocaleString()}`;
}

export function fmtFull(val) {
  if (!val && val !== 0) return '₦0';
  return '₦' + Math.abs(val).toLocaleString();
}

export function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

export function timeAgo(dateStr) {
  const d = new Date(dateStr);
  const diff = (Date.now() - d.getTime()) / 1000;
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.round(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.round(diff / 3600)}h ago`;
  return `${Math.round(diff / 86400)}d ago`;
}
