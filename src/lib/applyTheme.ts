import { FONTS, PALETTES, TEXT_SIZES, tokensToCss } from './themes';
import type { Settings } from './settings';

export function resolveDark(mode: Settings['mode']): boolean {
  if (mode === 'dark') return true;
  if (mode === 'light') return false;
  return typeof window !== 'undefined' && !!window.matchMedia?.('(prefers-color-scheme: dark)').matches;
}

/** Writes theme tokens, font and text size to CSS variables on <html>. */
export function applyTheme(settings: Settings): void {
  const root = document.documentElement;
  const dark = resolveDark(settings.mode);
  const tokens = PALETTES[settings.palette][dark ? 'dark' : 'light'];
  for (const [k, v] of Object.entries(tokensToCss(tokens))) root.style.setProperty(k, v);
  root.style.setProperty('--font', FONTS[settings.font].stack);
  root.style.setProperty('--base-size', `${TEXT_SIZES[settings.textSize].px}px`);
  root.style.colorScheme = dark ? 'dark' : 'light';
  root.dataset.theme = dark ? 'dark' : 'light';
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', tokens.surface);
}
