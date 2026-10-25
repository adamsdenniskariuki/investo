export type PaletteId = 'savanna' | 'ocean' | 'sunset';
export type Mode = 'system' | 'light' | 'dark';
export type FontId = 'atkinson' | 'lexend' | 'literata' | 'system';
export type TextSize = 'md' | 'lg' | 'xl';

export interface ThemeTokens {
  bg: string;
  surface: string;
  accentBg: string;
  text: string;
  muted: string;
  border: string;
  primary: string;
  onPrimary: string;
  link: string;
  focus: string;
  successBg: string;
  successText: string;
  dangerBg: string;
  dangerText: string;
  warnBg: string;
  warnText: string;
  /** Data-series colours for charts and diagrams (non-text, ≥3:1 against surface). */
  chart1: string;
  chart2: string;
  chart3: string;
}

const lightStatus = {
  successBg: '#e3f4ea',
  successText: '#14532d',
  dangerBg: '#fde8e8',
  dangerText: '#8a1c1c',
  warnBg: '#fff4d6',
  warnText: '#6b4300',
};

const darkStatus = {
  successBg: '#12301f',
  successText: '#8ee3b2',
  dangerBg: '#3a1414',
  dangerText: '#ffb4b4',
  warnBg: '#332508',
  warnText: '#ffd98a',
};

export const PALETTES: Record<PaletteId, { label: string; light: ThemeTokens; dark: ThemeTokens }> = {
  savanna: {
    label: 'Savanna green',
    light: {
      bg: '#f7faf8',
      surface: '#ffffff',
      accentBg: '#e6f2ec',
      text: '#14201a',
      muted: '#4a5a52',
      border: '#6b7c73',
      primary: '#1b5e3b',
      onPrimary: '#ffffff',
      link: '#1b5e3b',
      focus: '#1b5e3b',
      ...lightStatus,
      chart1: '#1b5e3b',
      chart2: '#b45309',
      chart3: '#2563eb',
    },
    dark: {
      bg: '#0f1714',
      surface: '#18231e',
      accentBg: '#1c2b24',
      text: '#e8f0ec',
      muted: '#a9bdb3',
      border: '#6f857a',
      primary: '#5fd39a',
      onPrimary: '#0f1714',
      link: '#7fe0b0',
      focus: '#7fe0b0',
      ...darkStatus,
      chart1: '#5fd39a',
      chart2: '#fbbf24',
      chart3: '#93c5fd',
    },
  },
  ocean: {
    label: 'Ocean blue',
    light: {
      bg: '#f5f8fc',
      surface: '#ffffff',
      accentBg: '#e7effc',
      text: '#0f1b2d',
      muted: '#4a5568',
      border: '#66768c',
      primary: '#1d4ed8',
      onPrimary: '#ffffff',
      link: '#1d4ed8',
      focus: '#1d4ed8',
      ...lightStatus,
      chart1: '#1d4ed8',
      chart2: '#b45309',
      chart3: '#15803d',
    },
    dark: {
      bg: '#0b1220',
      surface: '#131c2e',
      accentBg: '#172540',
      text: '#e6edf7',
      muted: '#a7b4c8',
      border: '#6b7f9e',
      primary: '#7ab4ff',
      onPrimary: '#0b1220',
      link: '#9cc7ff',
      focus: '#9cc7ff',
      ...darkStatus,
      chart1: '#7ab4ff',
      chart2: '#fbbf24',
      chart3: '#86efac',
    },
  },
  sunset: {
    label: 'Sunset clay',
    light: {
      bg: '#fdf8f3',
      surface: '#ffffff',
      accentBg: '#fbeadf',
      text: '#2a1a12',
      muted: '#5c4a40',
      border: '#84705f',
      primary: '#a4401a',
      onPrimary: '#ffffff',
      link: '#a4401a',
      focus: '#a4401a',
      ...lightStatus,
      chart1: '#a4401a',
      chart2: '#2563eb',
      chart3: '#15803d',
    },
    dark: {
      bg: '#1a120d',
      surface: '#241912',
      accentBg: '#2e1f14',
      text: '#f6ece4',
      muted: '#cdb8a8',
      border: '#8f7866',
      primary: '#ffb07a',
      onPrimary: '#1a120d',
      link: '#ffc49c',
      focus: '#ffc49c',
      ...darkStatus,
      chart1: '#ffb07a',
      chart2: '#93c5fd',
      chart3: '#86efac',
    },
  },
};

export const FONTS: Record<FontId, { label: string; stack: string }> = {
  atkinson: {
    label: 'Atkinson Hyperlegible (most readable)',
    stack: '"Atkinson Hyperlegible", system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
  },
  lexend: { label: 'Lexend (wide, easy to scan)', stack: 'Lexend, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif' },
  literata: { label: 'Literata (book serif)', stack: 'Literata, Georgia, "Times New Roman", serif' },
  system: { label: 'Your device font', stack: 'system-ui, -apple-system, "Segoe UI", Roboto, sans-serif' },
};

export const TEXT_SIZES: Record<TextSize, { label: string; px: number }> = {
  md: { label: 'Standard', px: 17 },
  lg: { label: 'Large', px: 19 },
  xl: { label: 'Extra large', px: 21 },
};

const cssName = (key: string) => `--${key.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`)}`;

export function tokensToCss(tokens: ThemeTokens): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(tokens)) out[cssName(k)] = v;
  return out;
}
