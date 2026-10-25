import { describe, expect, it } from 'vitest';
import { href, parseHash } from './router';

describe('parseHash', () => {
  it('parses known routes', () => {
    expect(parseHash('')).toEqual({ name: 'home' });
    expect(parseHash('#/')).toEqual({ name: 'home' });
    expect(parseHash('#/tools')).toEqual({ name: 'tools' });
    expect(parseHash('#/tools/compound')).toEqual({ name: 'tool', id: 'compound' });
    expect(parseHash('#/lesson/b01')).toEqual({ name: 'lesson', id: 'b01' });
    expect(parseHash('#/track/kenya/')).toEqual({ name: 'track', id: 'kenya' });
    expect(parseHash('#/progress')).toEqual({ name: 'progress' });
    expect(parseHash('#/settings')).toEqual({ name: 'settings' });
    expect(parseHash('#/about')).toEqual({ name: 'about' });
  });

  it('returns notfound for unknown or malformed paths', () => {
    expect(parseHash('#/nope').name).toBe('notfound');
    expect(parseHash('#/lesson/a/b').name).toBe('notfound');
    expect(parseHash('#/lesson/%E0%A4%A').name).toBe('notfound');
    expect(parseHash('#/lesson//x').name).toBe('notfound');
  });

  it('round-trips with href', () => {
    for (const r of [{ name: 'lesson', id: 'k03' }, { name: 'tool', id: 'mmf-tbill' }, { name: 'tools' }, { name: 'home' }] as const) {
      expect(parseHash(href(r))).toEqual(r);
    }
  });
});
