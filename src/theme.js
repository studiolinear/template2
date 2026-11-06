// Turns one hex color into the full brand scale and applies it as CSS variables.
const clamp = (n) => Math.max(0, Math.min(255, Math.round(n)));

export function hexToRgb(hex) {
  const m = /^#?([0-9a-f]{6})$/i.exec((hex || '').trim());
  if (!m) return null;
  const n = parseInt(m[1], 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}
const mix = (rgb, target, t) => rgb.map((c, i) => clamp(c + (target[i] - c) * t));
const triplet = (rgb) => rgb.join(' ');

export function applyTheme(hex) {
  const base = hexToRgb(hex) || [229, 57, 53];
  const W = [255, 255, 255];
  const K = [0, 0, 0];
  const scale = {
    '': base,
    50: mix(base, W, 0.92), 100: mix(base, W, 0.85), 200: mix(base, W, 0.7),
    300: mix(base, W, 0.5), 400: mix(base, W, 0.25), 500: mix(base, W, 0.08),
    600: mix(base, K, 0.1), 700: mix(base, K, 0.25), 800: mix(base, K, 0.4), 900: mix(base, K, 0.55),
  };
  const root = document.documentElement.style;
  Object.entries(scale).forEach(([k, rgb]) => root.setProperty(k === '' ? '--brand' : `--brand-${k}`, triplet(rgb)));
}

export const THEME_PRESETS = [
  ['#e53935', 'Red'], ['#f4511e', 'Orange'], ['#f9a825', 'Amber'], ['#2e7d32', 'Green'],
  ['#00897b', 'Teal'], ['#1e88e5', 'Blue'], ['#5e35b1', 'Purple'], ['#d81b60', 'Pink'], ['#212121', 'Black'],
];
