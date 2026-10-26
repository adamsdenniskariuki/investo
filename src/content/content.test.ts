import { describe, expect, it } from 'vitest';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { TRACKS, TOOLS, TOOL_IDS, findLesson, nextLesson } from './tracks';
import { LOCKED_BADGE_IDS, LOCKED_LESSON_IDS, LOCKED_QUESTION_IDS, LOCKED_TOOL_IDS, LOCKED_TRACK_IDS } from './ids.lock';
import { BADGES } from '../lib/badges';
import { DIAGRAMS, isDiagramId } from '../diagrams/specs';
import { Diagram } from '../diagrams/Diagram';
import type { Block, Lesson } from './types';

const lessons: Lesson[] = TRACKS.flatMap((t) => t.lessons);
const diagramBlocks = (l: Lesson) => l.steps.filter((s): s is Extract<Block, { kind: 'diagram' }> => s.kind === 'diagram');
const textOf = (b: Block): string[] => {
  switch (b.kind) {
    case 'text':
    case 'callout':
      return [b.heading, ...b.body];
    case 'list':
      return [b.heading, b.intro ?? '', ...b.items];
    case 'diagram':
      return [b.heading, b.caption, ...(b.body ?? [])];
    case 'tool':
      return [b.heading, b.intro];
  }
};

describe('content ids', () => {
  it('lesson ids are unique and locked', () => {
    const ids = lessons.map((l) => l.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const id of LOCKED_LESSON_IDS) expect(ids, `shipped lesson ${id} was removed`).toContain(id);
    for (const id of ids) expect(LOCKED_LESSON_IDS, `add ${id} to ids.lock.ts`).toContain(id);
  });

  it('question ids are unique and locked', () => {
    const ids = lessons.flatMap((l) => l.quiz.map((q) => q.id));
    expect(new Set(ids).size).toBe(ids.length);
    for (const id of LOCKED_QUESTION_IDS) expect(ids, `shipped question ${id} was removed`).toContain(id);
    for (const id of ids) expect(LOCKED_QUESTION_IDS, `add ${id} to ids.lock.ts`).toContain(id);
  });

  it('track, badge and tool ids are locked', () => {
    expect(TRACKS.map((t) => t.id)).toEqual(expect.arrayContaining(LOCKED_TRACK_IDS));
    expect(BADGES.map((b) => b.id)).toEqual(expect.arrayContaining(LOCKED_BADGE_IDS));
    expect(TOOL_IDS).toEqual(expect.arrayContaining(LOCKED_TOOL_IDS));
  });

  it('stages are ordered and unique', () => {
    expect(TRACKS.map((t) => t.stage)).toEqual([1, 2, 3, 4, 5, 6]);
  });
});

describe('lessons', () => {
  it.each(lessons.map((l) => [l.id, l] as const))('%s is well formed', (_id, l) => {
    expect(l.title.trim()).not.toBe('');
    expect(l.summary.trim()).not.toBe('');
    expect(l.rev).toBeGreaterThanOrEqual(1);
    expect(l.steps.length).toBeGreaterThanOrEqual(3);
    expect(l.quiz.length).toBeGreaterThanOrEqual(3);
    expect(l.sources.length).toBeGreaterThanOrEqual(1);
    for (const s of l.sources) expect(s.url).toMatch(/^https:\/\//);
    for (const q of l.quiz) {
      expect(q.id.startsWith(`${l.id}-`)).toBe(true);
      expect(q.choices.length).toBeGreaterThanOrEqual(2);
      expect(new Set(q.choices).size).toBe(q.choices.length);
      expect(Number.isInteger(q.answer) && q.answer >= 0 && q.answer < q.choices.length).toBe(true);
      expect(q.explanation.trim()).not.toBe('');
    }
    if (l.reviewed) expect(l.reviewed).toMatch(/^\d{4}-\d{2}$/);
  });

  it('every lesson that quotes a rate or minimum has a reviewed date', () => {
    for (const l of lessons) {
      const text = l.steps.flatMap(textOf).join(' ');
      if (/KES\s?[\d,]+|\b\d+(\.\d+)?%/.test(text) && /as of/i.test(text)) expect(l.reviewed, l.id).toBeTruthy();
    }
  });

  it('inline links are https', () => {
    for (const l of lessons)
      for (const t of l.steps.flatMap(textOf))
        for (const m of t.matchAll(/\]\(([^)]+)\)/g)) expect(m[1], l.id).toMatch(/^https:\/\//);
  });

  it('quiz answers are not all in the same position', () => {
    const positions = new Set(lessons.flatMap((l) => l.quiz.map((q) => q.answer)));
    expect(positions.size).toBeGreaterThanOrEqual(3);
  });

  it('tool blocks reference real tools', () => {
    for (const l of lessons) for (const s of l.steps) if (s.kind === 'tool') expect(TOOL_IDS).toContain(s.tool);
    for (const t of TOOLS) expect(findLesson(t.lesson), t.id).toBeTruthy();
  });

  it('nextLesson walks through tracks in order', () => {
    expect(nextLesson('b01')?.id).toBe('b02');
    expect(nextLesson('b10')?.id).toBe('k01');
    expect(nextLesson('k09')?.id).toBe('g01');
    expect(nextLesson('g06')?.id).toBe('t01');
    expect(nextLesson('t08')?.id).toBe('f01');
    expect(nextLesson('f05')?.id).toBe('c01');
    expect(nextLesson('c05')).toBeUndefined();
  });
});

describe('diagrams', () => {
  it.each(lessons.map((l) => [l.id, l] as const))('%s has at least 2 accessible diagrams', (_id, l) => {
    const blocks = diagramBlocks(l);
    expect(blocks.length).toBeGreaterThanOrEqual(2);
    expect(blocks.length).toBeLessThanOrEqual(4);
    for (const b of blocks) {
      expect(isDiagramId(b.diagram)).toBe(true);
      expect(b.caption.trim().length).toBeGreaterThan(10);
      const spec = DIAGRAMS[b.diagram];
      expect(spec.title.trim()).not.toBe('');
      expect(spec.desc.trim().length).toBeGreaterThan(40);

      const html = renderToStaticMarkup(createElement(Diagram, { id: b.diagram, caption: b.caption }));
      expect(html).toMatch(/^<figure/);
      expect(html).toMatch(/<svg[^>]*role="img"/);
      const labelled = html.match(/aria-labelledby="([^"]+)"/);
      expect(labelled).toBeTruthy();
      for (const ref of labelled![1].split(' ')) expect(html).toContain(`id="${ref}"`);
      expect(html).toMatch(/<title[^>]*>[^<]+<\/title>/);
      expect(html).toMatch(/<desc[^>]*>[^<]+<\/desc>/);
      expect(html).toMatch(/<figcaption[^>]*>.+<\/figcaption>/);
    }
  });

  it('no diagram is used twice across lessons', () => {
    const used = lessons.flatMap((l) => diagramBlocks(l).map((b) => b.diagram));
    expect(new Set(used).size).toBe(used.length);
  });

  it('every diagram in the registry renders without errors', () => {
    for (const id of Object.keys(DIAGRAMS)) {
      if (!isDiagramId(id)) throw new Error(id);
      const html = renderToStaticMarkup(createElement(Diagram, { id, caption: 'Caption' }));
      expect(html).not.toMatch(/NaN|undefined|Infinity/);
    }
  });
});
