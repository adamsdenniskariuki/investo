import { useEffect } from 'react';
import { AVAILABLE_TRACKS, totalLessons } from '../content/tracks';
import type { Lesson, Track } from '../content/types';
import type { Progress } from '../lib/progress';
import { streaks } from '../lib/streak';

export function useTitle(title: string) {
  useEffect(() => {
    document.title = title ? `${title} · Investo` : 'Investo — learn to invest, step by step';
  }, [title]);
}

export function nextUnfinished(p: Progress): Lesson | undefined {
  for (const t of AVAILABLE_TRACKS) for (const l of t.lessons) if (!p.lessons[l.id]) return l;
  return undefined;
}

export function trackDone(p: Progress, t: Track): number {
  return t.lessons.filter((l) => p.lessons[l.id]).length;
}

export function Meter({ value, max, label }: { value: number; max: number; label: string }) {
  const pctDone = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div className="meter" role="progressbar" aria-label={label} aria-valuemin={0} aria-valuemax={max} aria-valuenow={value} aria-valuetext={`${value} of ${max}`}>
      <span style={{ width: `${pctDone}%` }} />
    </div>
  );
}

export function Stats({ progress }: { progress: Progress }) {
  const s = streaks(progress.activeDays, new Date());
  const done = AVAILABLE_TRACKS.reduce((n, t) => n + trackDone(progress, t), 0);
  return (
    <ul className="stats">
      <li>
        <strong>{progress.xp}</strong> XP
      </li>
      <li>
        <strong>{s.current}</strong> day streak
      </li>
      <li>
        <strong>
          {done}/{totalLessons()}
        </strong>{' '}
        lessons
      </li>
      <li>
        <strong>{Object.keys(progress.badges).length}</strong> badges
      </li>
    </ul>
  );
}
