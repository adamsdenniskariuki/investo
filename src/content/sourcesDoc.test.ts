import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { renderSourcesDoc } from './sourcesDoc';

const FILE = resolve(__dirname, '../../docs/SOURCES.md');

describe('docs/SOURCES.md', () => {
  it('matches the sources listed in the lessons', () => {
    const expected = renderSourcesDoc();
    const actual = existsSync(FILE) ? readFileSync(FILE, 'utf8').replace(/\r\n/g, '\n') : '';
    if (actual !== expected && !process.env.CI) {
      mkdirSync(dirname(FILE), { recursive: true });
      writeFileSync(FILE, expected);
      return;
    }
    expect(actual, 'docs/SOURCES.md is out of date: run `npm test` locally and commit it').toBe(expected);
  });
});
