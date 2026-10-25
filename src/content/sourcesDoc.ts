import { TRACKS } from './tracks';

/** Builds docs/SOURCES.md from the lesson content so the list never drifts. */
export function renderSourcesDoc(): string {
  const out: string[] = [
    '# Sources',
    '',
    '<!-- Generated from src/content by src/content/sourcesDoc.test.ts. Do not edit by hand: run `npm test` to refresh. -->',
    '',
    'Official sources used to check each lesson. Rates, limits, tax rules and procedures change, so lessons present them as',
    'dated examples and link here for the current position. “Checked” is the month the lesson’s facts were last reviewed.',
    '',
  ];
  for (const track of TRACKS) {
    if (track.lessons.length === 0) continue;
    out.push(`## ${track.title}`, '');
    for (const lesson of track.lessons) {
      out.push(`### ${lesson.id} — ${lesson.title}`, '');
      if (lesson.reviewed) out.push(`Checked: ${lesson.reviewed}`, '');
      for (const s of lesson.sources) out.push(`- [${s.label}](${s.url})`);
      out.push('');
    }
  }
  return out.join('\n');
}
