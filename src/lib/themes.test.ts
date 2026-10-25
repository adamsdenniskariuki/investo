import { describe, expect, it } from 'vitest';
import { contrastRatio } from './contrast';
import { PALETTES, type ThemeTokens } from './themes';

const TEXT_PAIRS: Array<[keyof ThemeTokens, keyof ThemeTokens]> = [
  ['text', 'bg'],
  ['text', 'surface'],
  ['text', 'accentBg'],
  ['muted', 'bg'],
  ['muted', 'surface'],
  ['muted', 'accentBg'],
  ['link', 'bg'],
  ['link', 'surface'],
  ['link', 'accentBg'],
  ['onPrimary', 'primary'],
  ['successText', 'successBg'],
  ['dangerText', 'dangerBg'],
  ['warnText', 'warnBg'],
];

const NON_TEXT_PAIRS: Array<[keyof ThemeTokens, keyof ThemeTokens]> = [
  ['border', 'bg'],
  ['border', 'surface'],
  ['focus', 'bg'],
  ['focus', 'surface'],
  ['primary', 'surface'],
  ['chart1', 'surface'],
  ['chart2', 'surface'],
  ['chart3', 'surface'],
  ['chart1', 'accentBg'],
  ['chart2', 'accentBg'],
  ['chart3', 'accentBg'],
];

describe('theme contrast (WCAG AA)', () => {
  for (const [paletteId, palette] of Object.entries(PALETTES)) {
    for (const mode of ['light', 'dark'] as const) {
      const t = palette[mode];
      describe(`${paletteId} ${mode}`, () => {
        for (const [fg, bg] of TEXT_PAIRS) {
          it(`${fg} on ${bg} is at least 4.5:1`, () => {
            expect(contrastRatio(t[fg], t[bg])).toBeGreaterThanOrEqual(4.5);
          });
        }
        for (const [fg, bg] of NON_TEXT_PAIRS) {
          it(`${fg} against ${bg} is at least 3:1`, () => {
            expect(contrastRatio(t[fg], t[bg])).toBeGreaterThanOrEqual(3);
          });
        }
      });
    }
  }

  it('computes known reference ratios', () => {
    expect(contrastRatio('#000000', '#ffffff')).toBeCloseTo(21, 5);
    expect(contrastRatio('#777777', '#ffffff')).toBeCloseTo(4.48, 1);
  });
});
