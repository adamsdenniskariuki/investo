import { awardBadges, type BadgeContext } from './badges';
import { DAY_RE, localDay } from './streak';

export interface LessonRecord {
  completedAt: string;
  bestScore: number;
  total: number;
  attempts: number;
  rev: number;
}

export interface Progress {
  schema: 1;
  xp: number;
  lessons: Record<string, LessonRecord>;
  /** Question id → when it was first answered correctly. */
  correct: Record<string, string>;
  /** Local days (YYYY-MM-DD) with any learning activity. */
  activeDays: string[];
  badges: Record<string, string>;
  toolsUsed: Record<string, string>;
  lastExportAt?: string;
}

export const XP = { lesson: 20, question: 5, perfect: 10 } as const;
const MAX_DAYS = 400;

export function emptyProgress(): Progress {
  return { schema: 1, xp: 0, lessons: {}, correct: {}, activeDays: [], badges: {}, toolsUsed: {} };
}

const isObj = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null && !Array.isArray(v);
const num = (v: unknown, fallback = 0) => (typeof v === 'number' && Number.isFinite(v) && v >= 0 ? v : fallback);

function stringMap(v: unknown): Record<string, string> {
  const out: Record<string, string> = {};
  if (!isObj(v)) return out;
  for (const [k, val] of Object.entries(v)) if (typeof val === 'string') out[k] = val;
  return out;
}

/** Cleans untrusted data (localStorage or an imported backup). Unknown lesson ids are kept. */
export function sanitizeProgress(raw: unknown): Progress {
  const p = emptyProgress();
  if (!isObj(raw)) return p;
  p.xp = Math.floor(num(raw.xp));
  if (isObj(raw.lessons)) {
    for (const [id, r] of Object.entries(raw.lessons)) {
      if (!isObj(r) || typeof r.completedAt !== 'string') continue;
      const total = Math.floor(num(r.total));
      p.lessons[id] = {
        completedAt: r.completedAt,
        total,
        bestScore: Math.min(Math.floor(num(r.bestScore)), total),
        attempts: Math.max(1, Math.floor(num(r.attempts, 1))),
        rev: Math.max(1, Math.floor(num(r.rev, 1))),
      };
    }
  }
  p.correct = stringMap(raw.correct);
  p.badges = stringMap(raw.badges);
  p.toolsUsed = stringMap(raw.toolsUsed);
  if (Array.isArray(raw.activeDays)) {
    const days = [...new Set(raw.activeDays.filter((d): d is string => typeof d === 'string' && DAY_RE.test(d)))].sort();
    p.activeDays = days.slice(-MAX_DAYS);
  }
  if (typeof raw.lastExportAt === 'string') p.lastExportAt = raw.lastExportAt;
  return p;
}

function markActive(p: Progress, now: Date): Progress {
  const today = localDay(now);
  if (p.activeDays.includes(today)) return p;
  return { ...p, activeDays: [...p.activeDays, today].sort().slice(-MAX_DAYS) };
}

export interface LessonResultInput {
  lessonId: string;
  rev: number;
  total: number;
  /** Ids of questions answered correctly in this attempt. */
  correctIds: string[];
}

export interface Outcome {
  progress: Progress;
  xpGained: number;
  newBadges: string[];
}

export function recordLessonResult(p: Progress, input: LessonResultInput, ctx: BadgeContext): Outcome {
  const at = ctx.now.toISOString();
  const prev = p.lessons[input.lessonId];
  const score = Math.min(new Set(input.correctIds).size, input.total);
  let xpGained = 0;
  if (!prev) xpGained += XP.lesson;
  const correct = { ...p.correct };
  for (const q of new Set(input.correctIds)) {
    if (!correct[q]) {
      correct[q] = at;
      xpGained += XP.question;
    }
  }
  const wasPerfect = !!prev && prev.total > 0 && prev.bestScore >= prev.total;
  if (input.total > 0 && score >= input.total && !wasPerfect) xpGained += XP.perfect;
  const record: LessonRecord = {
    completedAt: prev?.completedAt ?? at,
    total: input.total,
    bestScore: Math.max(score, prev && prev.total === input.total ? prev.bestScore : 0),
    attempts: (prev?.attempts ?? 0) + 1,
    rev: input.rev,
  };
  let next: Progress = { ...p, xp: p.xp + xpGained, correct, lessons: { ...p.lessons, [input.lessonId]: record } };
  next = markActive(next, ctx.now);
  const awarded = awardBadges(next, ctx);
  return { progress: awarded.progress, xpGained, newBadges: awarded.newBadges };
}

/** Records a calculator use. Returns the same object when nothing changed. */
export function recordToolUse(p: Progress, toolId: string, ctx: BadgeContext): Outcome {
  let next = p;
  if (!p.toolsUsed[toolId]) next = { ...p, toolsUsed: { ...p.toolsUsed, [toolId]: ctx.now.toISOString() } };
  next = markActive(next, ctx.now);
  const awarded = awardBadges(next, ctx);
  return { progress: awarded.progress, xpGained: 0, newBadges: awarded.newBadges };
}

export function recordExport(p: Progress, ctx: BadgeContext): Outcome {
  const next = { ...p, lastExportAt: ctx.now.toISOString() };
  const awarded = awardBadges(next, ctx);
  return { progress: awarded.progress, xpGained: 0, newBadges: awarded.newBadges };
}
