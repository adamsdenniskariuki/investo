import { TRACKS } from '../content/tracks';
import { href } from '../lib/router';
import { useStore } from '../state/store';
import { Diagram } from '../diagrams/Diagram';
import { Meter, Stats, nextUnfinished, trackDone, useTitle } from './shared';

export function HomePage() {
  useTitle('');
  const { progress } = useStore();
  const next = nextUnfinished(progress);
  const started = Object.keys(progress.lessons).length > 0;

  return (
    <>
      <h1>Learn to invest, step by step</h1>
      <p>
        Short, illustrated lessons on how investing works — starting with the basics and the options open to people in Kenya. Practise with
        calculators, check yourself with quick quizzes, and earn XP and badges as you go. No account needed.
      </p>
      <div className="callout warning">
        <p>
          <strong>Educational only.</strong> Investo is not financial advice and is not licensed by the Capital Markets Authority. It never
          tells you what to buy or sell.
        </p>
      </div>
      <div className="btn-row">
        {next ? (
          <a className="btn" href={href({ name: 'lesson', id: next.id })}>
            {started ? `Continue: ${next.title}` : `Start: ${next.title}`}
          </a>
        ) : (
          <a className="btn" href={href({ name: 'progress' })}>
            All lessons done — see your progress
          </a>
        )}
        <a className="btn secondary" href={href({ name: 'tools' })}>
          Open the calculators
        </a>
      </div>

      {started && <Stats progress={progress} />}

      <h2>Your path</h2>
      <div className="grid">
        {TRACKS.map((t) => {
          const done = trackDone(progress, t);
          return (
            <section className="card" key={t.id} aria-labelledby={`track-${t.id}`}>
              <p className="small muted" style={{ margin: 0 }}>
                Stage {t.stage}
              </p>
              <h3 id={`track-${t.id}`}>
                {t.status === 'available' ? <a href={href({ name: 'track', id: t.id })}>{t.title}</a> : t.title}
              </h3>
              <p>{t.tagline}</p>
              {t.status === 'available' ? (
                <>
                  <Meter value={done} max={t.lessons.length} label={`${t.title} progress`} />
                  <p className="small muted" style={{ margin: '0.4rem 0 0' }}>
                    {done} of {t.lessons.length} lessons done
                  </p>
                </>
              ) : (
                <span className="tag">Coming later</span>
              )}
            </section>
          );
        })}
      </div>

      <h2>Why start with risk?</h2>
      <p>Every investment sits somewhere on a ladder of risk and return. Knowing where is the first step to avoiding nasty surprises.</p>
      <Diagram id="risk-ladder" caption="A general pattern you will meet throughout Investo." />
    </>
  );
}
