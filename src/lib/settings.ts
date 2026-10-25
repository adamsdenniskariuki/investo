import { FONTS, PALETTES, TEXT_SIZES, type FontId, type Mode, type PaletteId, type TextSize } from './themes';

export interface Settings {
  palette: PaletteId;
  mode: Mode;
  font: FontId;
  textSize: TextSize;
}

export const DEFAULT_SETTINGS: Settings = {
  palette: 'savanna',
  mode: 'system',
  font: 'atkinson',
  textSize: 'md',
};

const MODES: Mode[] = ['system', 'light', 'dark'];

export function sanitizeSettings(raw: unknown): Settings {
  const s = (raw && typeof raw === 'object' ? raw : {}) as Record<string, unknown>;
  const pick = <T extends string>(value: unknown, allowed: readonly T[], fallback: T): T =>
    typeof value === 'string' && (allowed as readonly string[]).includes(value) ? (value as T) : fallback;
  return {
    palette: pick(s.palette, Object.keys(PALETTES) as PaletteId[], DEFAULT_SETTINGS.palette),
    mode: pick(s.mode, MODES, DEFAULT_SETTINGS.mode),
    font: pick(s.font, Object.keys(FONTS) as FontId[], DEFAULT_SETTINGS.font),
    textSize: pick(s.textSize, Object.keys(TEXT_SIZES) as TextSize[], DEFAULT_SETTINGS.textSize),
  };
}
