// ─── Shared utility: format Nigerian Naira ────────────────────────────────────
// All values from the DB are in minor units (Kobo). 1 Naira = 100 Kobo.
import { minorToNaira } from '../../../Utils/currency';

export function fmt(minor) {
  if (minor === undefined || minor === null) return '₦0';
  const val = Math.abs(minorToNaira(minor));
  const sign = minor < 0 ? '-' : '';
  if (val >= 1_000_000) return `${sign}₦${(val / 1_000_000).toFixed(2)}M`;
  if (val >= 1_000)     return `${sign}₦${(val / 1_000).toFixed(1)}K`;
  return `${sign}₦${val.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
}

export function fmtFull(minor) {
  if (!minor && minor !== 0) return '₦0';
  const val = Math.abs(minorToNaira(minor));
  return '₦' + val.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
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
