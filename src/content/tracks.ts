import type { Lesson, ToolId, Track } from './types';
import { BASICS } from './basics';
import { KENYA } from './kenya';
import { GLOBAL } from './global';
import { TRADING } from './trading';
import { FOREX } from './forex';

/** Track ids are append-only; never rename. */
export const TRACKS: Track[] = [
  { id: 'basics', stage: 1, title: 'Investing basics', tagline: 'How money grows, what can go wrong, and how to spot scams.', status: 'available', lessons: BASICS },
  { id: 'kenya', stage: 2, title: 'Investing in Kenya', tagline: 'MMFs, Saccos, T-bills and bonds, NSE shares, REITs, pensions and tax.', status: 'available', lessons: KENYA },
  { id: 'global', stage: 3, title: 'Global stocks and ETFs', tagline: 'Investing beyond Kenya: currencies, platforms and costs.', status: 'available', lessons: GLOBAL },
  { id: 'trading', stage: 4, title: 'Charts and paper trading', tagline: 'Read charts and practise on made-up markets with risk tools — paper money only.', status: 'available', lessons: TRADING },
  { id: 'forex', stage: 5, title: 'Forex', tagline: 'How currency markets work and why most retail traders lose.', status: 'available', lessons: FOREX },
  { id: 'crypto', stage: 6, title: 'Crypto', tagline: 'What crypto assets are, the risks, and how to avoid scams.', status: 'coming-soon', lessons: [] },
];

export const TOOLS: { id: ToolId; title: string; summary: string; lesson: string }[] = [
  { id: 'compound', title: 'Compound growth', summary: 'See how a starting amount and monthly saving could grow.', lesson: 'b03' },
  { id: 'inflation', title: 'Inflation and real return', summary: 'What your return is worth after inflation.', lesson: 'b04' },
  { id: 'fees', title: 'Fee drag', summary: 'How much a yearly fee costs over time.', lesson: 'b08' },
  { id: 'mmf-tbill', title: 'MMF vs T-bill', summary: 'Compare what you keep after withholding tax.', lesson: 'k01' },
  { id: 'bond', title: 'Bond yield and coupons', summary: 'Coupons, current yield and yield to maturity.', lesson: 'k04' },
  { id: 'emergency', title: 'Emergency-fund planner', summary: 'Your target and how long it takes to build.', lesson: 'b02' },
  { id: 'fx-return', title: 'Currency and return', summary: 'How exchange-rate moves change a foreign return in shillings.', lesson: 'g04' },
  { id: 'position-size', title: 'Position size', summary: 'How many shares keep a loss within the amount you choose to risk.', lesson: 't05' },
  { id: 'risk-reward', title: 'Win rate and reward/risk', summary: 'The average result per trade once wins, losses and fees are counted.', lesson: 't06' },
  { id: 'replay', title: 'Paper replay', summary: 'Practise on a made-up market with paper money, then review your session.', lesson: 't08' },
  { id: 'leverage', title: 'Leverage and margin', summary: 'How small price moves turn into big gains or losses with leverage.', lesson: 'f03' },
];

export const TOOL_IDS = TOOLS.map((t) => t.id);

export const AVAILABLE_TRACKS = TRACKS.filter((t) => t.status === 'available');

export interface LessonRef {
  lesson: Lesson;
  track: Track;
  index: number;
}

const index = new Map<string, LessonRef>();
for (const track of TRACKS) track.lessons.forEach((lesson, i) => index.set(lesson.id, { lesson, track, index: i }));

export function findLesson(id: string): LessonRef | undefined {
  return index.get(id);
}

export function nextLesson(id: string): Lesson | undefined {
  const ref = index.get(id);
  if (!ref) return undefined;
  const sameTrack = ref.track.lessons[ref.index + 1];
  if (sameTrack) return sameTrack;
  const ti = AVAILABLE_TRACKS.indexOf(ref.track);
  return AVAILABLE_TRACKS[ti + 1]?.lessons[0];
}

export function trackLessonIds(): Record<string, string[]> {
  return Object.fromEntries(AVAILABLE_TRACKS.map((t) => [t.id, t.lessons.map((l) => l.id)]));
}

export function totalLessons(): number {
  return AVAILABLE_TRACKS.reduce((n, t) => n + t.lessons.length, 0);
}
