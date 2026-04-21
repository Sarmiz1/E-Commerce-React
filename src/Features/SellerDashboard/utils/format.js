// ─── Shared utility: format Nigerian Naira ────────────────────────────────────
export function fmt(cents) {
  if (cents === undefined || cents === null) return '₦0';
  const abs = Math.abs(cents);
  const sign = cents < 0 ? '-' : '';
  if (abs >= 1_000_000) return `${sign}₦${(abs / 1_000_000).toFixed(2)}M`;
  if (abs >= 1_000)     return `${sign}₦${(abs / 1_000).toFixed(0)}K`;
  return `${sign}₦${abs.toLocaleString()}`;
}

export function fmtFull(cents) {
  if (!cents && cents !== 0) return '₦0';
  return '₦' + Math.abs(cents).toLocaleString();
}

export function changeColor(change, colors) {
  if (change > 0) return colors.state.success;
  if (change < 0) return colors.state.error;
  return colors.text.tertiary;
}

export function changeLabel(change, suffix = '') {
  if (change === 0) return 'No change';
  const sign = change > 0 ? '+' : '';
  return `${sign}${change}${suffix} from last week`;
}

export function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}
