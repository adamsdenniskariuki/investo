import type { Progress } from './progress';
import { streaks } from './streak';

export interface BadgeContext {
  /** Lesson ids per available track, e.g. { basics: ['b01', …] }. */
  trackLessons: Record<string, string[]>;
  toolIds: string[];
  now: Date;
}

export interface BadgeDef {
  id: string;
  title: string;
  description: string;
  icon: string;
  check: (p: Progress, ctx: BadgeContext) => boolean;
}

const done = (p: Progress, ids: string[] | undefined) => !!ids && ids.length > 0 && ids.every((id) => p.lessons[id]);

/** Append-only: never remove or rename a badge id. */
export const BADGES: BadgeDef[] = [
  { id: 'first-step', title: 'First step', description: 'Finish your first lesson.', icon: '🌱', check: (p) => Object.keys(p.lessons).length > 0 },
  { id: 'perfect-quiz', title: 'Sharp mind', description: 'Get every question right in a lesson quiz.', icon: '🎯', check: (p) => Object.values(p.lessons).some((l) => l.total > 0 && l.bestScore >= l.total) },
  { id: 'scam-spotter', title: 'Scam spotter', description: 'Finish the lesson on scams and red flags.', icon: '🛡️', check: (p) => !!p.lessons['b10'] },
  { id: 'basics-done', title: 'Foundations', description: 'Finish every lesson in Investing basics.', icon: '🧱', check: (p, c) => done(p, c.trackLessons['basics']) },
  { id: 'kenya-done', title: 'Kenya explorer', description: 'Finish every lesson in Investing in Kenya.', icon: '🇰🇪', check: (p, c) => done(p, c.trackLessons['kenya']) },
  { id: 'streak-3', title: 'On a roll', description: 'Learn on 3 days in a row.', icon: '🔥', check: (p, c) => streaks(p.activeDays, c.now).best >= 3 },
  { id: 'streak-7', title: 'Week of learning', description: 'Learn on 7 days in a row.', icon: '📅', check: (p, c) => streaks(p.activeDays, c.now).best >= 7 },
  { id: 'toolkit', title: 'Toolkit', description: 'Try every calculator.', icon: '🧮', check: (p, c) => c.toolIds.length > 0 && c.toolIds.every((t) => p.toolsUsed[t]) },
  { id: 'backed-up', title: 'Backed up', description: 'Export a backup of your progress.', icon: '💾', check: (p) => !!p.lastExportAt },
  { id: 'xp-250', title: '250 XP', description: 'Earn 250 XP.', icon: '⭐', check: (p) => p.xp >= 250 },
  { id: 'global-done', title: 'Globetrotter', description: 'Finish every lesson in Global stocks and ETFs.', icon: '🌍', check: (p, c) => done(p, c.trackLessons['global']) },
  { id: 'trading-done', title: 'Chart reader', description: 'Finish every lesson in Charts and paper trading.', icon: '📊', check: (p, c) => done(p, c.trackLessons['trading']) },
  { id: 'paper-trader', title: 'Paper trader', description: 'Finish a full paper replay session.', icon: '📝', check: (p) => !!p.toolsUsed['replay'] },
];

export function badgeById(id: string): BadgeDef | undefined {
  return BADGES.find((b) => b.id === id);
}

/** Adds any newly earned badges. Returns the same object when nothing changed. */
export function awardBadges(p: Progress, ctx: BadgeContext): { progress: Progress; newBadges: string[] } {
  const newBadges = BADGES.filter((b) => !p.badges[b.id] && b.check(p, ctx)).map((b) => b.id);
  if (!newBadges.length) return { progress: p, newBadges };
  const at = ctx.now.toISOString();
  const badges = { ...p.badges };
  for (const id of newBadges) badges[id] = at;
  return { progress: { ...p, badges }, newBadges };
}
