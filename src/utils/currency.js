/**
 * Currency conversion utilities.
 *
 * In our system, ALL monetary values stored in the database are in
 * "minor" units (Kobo for NGN). 1 Naira = 100 Kobo.
 *
 * - nairaToMinor: use BEFORE writing to the database
 * - minorToNaira: use BEFORE displaying to the user
 */

/** Convert a Naira amount (as entered by the user) → Kobo (minor units for DB) */
export function nairaToMinor(naira) {
  if (naira === null || naira === undefined || naira === '') return 0;
  return Math.round(Number(naira) * 100);
}

/** Convert Kobo (minor units from DB) → Naira (for display) */
export function minorToNaira(minor) {
  if (minor === null || minor === undefined) return 0;
  return Number(minor) / 100;
}

/** Format minor units as a Naira string, e.g. 20000 → "₦200.00" */
export function formatNaira(minor, opts = {}) {
  const val = minorToNaira(minor);
  return '₦' + val.toLocaleString('en-NG', {
    minimumFractionDigits: opts.decimals ?? 2,
    maximumFractionDigits: opts.decimals ?? 2,
    ...opts,
  });
}
