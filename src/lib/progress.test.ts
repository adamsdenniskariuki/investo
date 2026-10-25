import { describe, expect, it } from 'vitest';
import { BADGES, awardBadges, type BadgeContext } from './badges';
import { emptyProgress, recordExport, recordLessonResult, recordToolUse, sanitizeProgress, XP } from './progress';
import { addDays, localDay, streaks } from './streak';
import { STORAGE_KEY, loadState, makeBackup, parseBackup, saveState } from './storage';
import { DEFAULT_SETTINGS } from './settings';

const ctx = (now = new Date(2026, 9, 10, 12)): BadgeContext => ({
  trackLessons: { basics: ['b01', 'b02'], kenya: ['k01'] },
  toolIds: ['compound', 'fees'],
  now,
});

describe('streaks', () => {
  it('handles month boundaries in local time', () => {
    expect(addDays('2026-10-31', 1)).toBe('2026-11-01');
    expect(addDays('2026-03-01', -1)).toBe('2026-02-28');
    expect(localDay(new Date(2026, 0, 5, 23, 59))).toBe('2026-01-05');
  });

  it('counts current and best streaks', () => {
    const now = new Date(2026, 9, 10, 9);
    expect(streaks([], now)).toEqual({ current: 0, best: 0 });
    expect(streaks(['2026-10-08', '2026-10-09', '2026-10-10'], now)).toEqual({ current: 3, best: 3 });
    // Yesterday still counts while today is not yet active.
    expect(streaks(['2026-10-08', '2026-10-09'], now)).toEqual({ current: 2, best: 2 });
    expect(streaks(['2026-10-01', '2026-10-02', '2026-10-03', '2026-10-04', '2026-10-09'], now)).toEqual({ current: 1, best: 4 });
    expect(streaks(['2026-10-05'], now).current).toBe(0);
  });
});

describe('recordLessonResult', () => {
  it('awards XP for completion, new correct answers and a first perfect score', () => {
    const r = recordLessonResult(emptyProgress(), { lessonId: 'b01', rev: 1, total: 3, correctIds: ['q1', 'q2', 'q3'] }, ctx());
    expect(r.xpGained).toBe(XP.lesson + 3 * XP.question + XP.perfect);
    expect(r.progress.lessons.b01).toMatchObject({ bestScore: 3, total: 3, attempts: 1, rev: 1 });
    expect(r.newBadges).toEqual(expect.arrayContaining(['first-step', 'perfect-quiz']));
    expect(r.progress.activeDays).toEqual(['2026-10-10']);
  });

  it('does not award the same XP twice on retries', () => {
    const a = recordLessonResult(emptyProgress(), { lessonId: 'b01', rev: 1, total: 3, correctIds: ['q1'] }, ctx());
    expect(a.xpGained).toBe(XP.lesson + XP.question);
    const b = recordLessonResult(a.progress, { lessonId: 'b01', rev: 1, total: 3, correctIds: ['q1', 'q2', 'q3'] }, ctx());
    expect(b.xpGained).toBe(2 * XP.question + XP.perfect);
    const c = recordLessonResult(b.progress, { lessonId: 'b01', rev: 1, total: 3, correctIds: ['q1', 'q2', 'q3'] }, ctx());
    expect(c.xpGained).toBe(0);
    expect(c.progress.lessons.b01.attempts).toBe(3);
    expect(c.progress.lessons.b01.bestScore).toBe(3);
  });

  it('awards track badges when every lesson is done', () => {
    let p = recordLessonResult(emptyProgress(), { lessonId: 'b01', rev: 1, total: 1, correctIds: [] }, ctx()).progress;
    expect(p.badges['basics-done']).toBeUndefined();
    const r = recordLessonResult(p, { lessonId: 'b02', rev: 1, total: 1, correctIds: [] }, ctx());
    p = r.progress;
    expect(r.newBadges).toContain('basics-done');
    expect(p.badges['kenya-done']).toBeUndefined();
  });

  it('awards streak badges', () => {
    let p = emptyProgress();
    for (let i = 0; i < 3; i++) p = recordLessonResult(p, { lessonId: `x${i}`, rev: 1, total: 1, correctIds: [] }, ctx(new Date(2026, 9, 10 + i, 8))).progress;
    expect(p.badges['streak-3']).toBeDefined();
    expect(p.badges['streak-7']).toBeUndefined();
  });
});

describe('tools and export', () => {
  it('records tool use once and awards the toolkit badge', () => {
    const a = recordToolUse(emptyProgress(), 'compound', ctx());
    const again = recordToolUse(a.progress, 'compound', ctx());
    expect(again.progress).toBe(a.progress);
    const b = recordToolUse(a.progress, 'fees', ctx());
    expect(b.newBadges).toContain('toolkit');
  });

  it('records export and awards backed-up', () => {
    const r = recordExport(emptyProgress(), ctx());
    expect(r.progress.lastExportAt).toBeDefined();
    expect(r.newBadges).toContain('backed-up');
  });

  it('awardBadges returns the same object when nothing is new', () => {
    const p = emptyProgress();
    expect(awardBadges(p, ctx()).progress).toBe(p);
  });

  it('badge ids are unique', () => {
    expect(new Set(BADGES.map((b) => b.id)).size).toBe(BADGES.length);
  });
});

describe('sanitizeProgress', () => {
  it('drops junk and keeps unknown lesson ids', () => {
    const p = sanitizeProgress({
      xp: -5,
      lessons: { future99: { completedAt: '2027-01-01', bestScore: 9, total: 4, attempts: 2, rev: 3 }, bad: { bestScore: 1 }, also: 4 },
      correct: { q1: '2026', q2: 5 },
      activeDays: ['2026-10-02', 'nope', '2026-10-01', '2026-10-01'],
      badges: 'x',
    });
    expect(p.xp).toBe(0);
    expect(Object.keys(p.lessons)).toEqual(['future99']);
    expect(p.lessons.future99.bestScore).toBe(4);
    expect(p.correct).toEqual({ q1: '2026' });
    expect(p.activeDays).toEqual(['2026-10-01', '2026-10-02']);
    expect(p.badges).toEqual({});
    expect(sanitizeProgress(null)).toEqual(emptyProgress());
  });
});

describe('storage and backup', () => {
  const mem = () => {
    const m = new Map<string, string>();
    return { getItem: (k: string) => m.get(k) ?? null, setItem: (k: string, v: string) => void m.set(k, v), removeItem: (k: string) => void m.delete(k), m };
  };

  it('saves and loads state', () => {
    const s = mem();
    const state = { progress: { ...emptyProgress(), xp: 40 }, settings: { ...DEFAULT_SETTINGS, mode: 'dark' as const } };
    expect(saveState(s, state)).toBe(true);
    expect(loadState(s)).toEqual(state);
  });

  it('falls back on corrupt storage', () => {
    const s = mem();
    s.setItem(STORAGE_KEY, '{oops');
    expect(loadState(s).progress).toEqual(emptyProgress());
    expect(loadState(undefined).settings).toEqual(DEFAULT_SETTINGS);
  });

  it('round-trips a backup', () => {
    const state = { progress: recordLessonResult(emptyProgress(), { lessonId: 'b01', rev: 1, total: 2, correctIds: ['a'] }, ctx()).progress, settings: DEFAULT_SETTINGS };
    const text = JSON.stringify(makeBackup(state, new Date('2026-10-10T00:00:00Z')));
    const r = parseBackup(text);
    expect(r.ok && r.state).toEqual(state);
  });

  it('rejects other apps, newer formats and invalid JSON', () => {
    expect(parseBackup('nope').ok).toBe(false);
    expect(parseBackup('[]').ok).toBe(false);
    expect(parseBackup(JSON.stringify({ app: 'langto', format: 1 })).ok).toBe(false);
    const newer = parseBackup(JSON.stringify({ app: 'investo', format: 99 }));
    expect(newer.ok).toBe(false);
    expect(!newer.ok && newer.error).toMatch(/newer/);
  });
});
