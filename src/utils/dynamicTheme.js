/**
 * Premium Dynamic Theme Utility
 * Extracts/Samples colors and provides dynamic UI tokens based on visual context.
 */

export async function getDominantColor(imageUrl) {
  // Sampler for a "Premium" look usually involves picking a muted/elegant color
  // or a vibrant accent that doesn't overwhelm.
  // Real implementions might use a canvas or library, but here we provide a 
  // deterministic mapping helper for speed and consistency in this demo.
  
  if (!imageUrl) return null;
  
  // Deterministic sampling based on URL string (for demo consistency)
  let hash = 0;
  for (let i = 0; i < imageUrl.length; i++) {
    hash = imageUrl.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  const h = Math.abs(hash) % 360;
  return {
    primary: `hsl(${h}, 70%, 50%)`,
    light: `hsl(${h}, 70%, 95%)`,
    dark: `hsl(${h}, 70%, 20%)`,
    soft: `hsl(${h}, 40%, 60%)`,
    accent: `hsl(${(h + 40) % 360}, 80%, 60%)`,
    alpha: `hsla(${h}, 70%, 50%, 0.1)`,
  };
}

/**
 * Injects CSS variables into a target element or document
 */
export function injectDynamicTheme(colors, element = document.documentElement) {
  if (!colors) return;
  
  element.style.setProperty('--pd-accent-primary', colors.primary);
  element.style.setProperty('--pd-accent-light', colors.light);
  element.style.setProperty('--pd-accent-dark', colors.dark);
  element.style.setProperty('--pd-accent-soft', colors.soft);
  element.style.setProperty('--pd-accent-alpha', colors.alpha);
}
