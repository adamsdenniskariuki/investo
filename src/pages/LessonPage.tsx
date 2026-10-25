import { useEffect, useRef, useState } from 'react';
import { findLesson, nextLesson } from '../content/tracks';
import type { Lesson } from '../content/types';
import { BlockView } from '../components/BlockView';
import { badgeById } from '../lib/badges';
import { href } from '../lib/router';
import type { Outcome } from '../lib/progress';
import { useStore } from '../state/store';
import { Meter, useTitle } from './shared';
import { NotFoundPage } from './NotFoundPage';

type Phase = { kind: 'step'; index: number } | { kind: 'quiz'; index: number } | { kind: 'done'; outcome: Outcome; score: number };

export function LessonPage({ id }: { id: string }) {
  const ref = findLesson(id);
  useTitle(ref?.lesson.title ?? 'Not found');
  if (!ref) return <NotFoundPage />;
  return <LessonPlayer lesson={ref.lesson} trackId={ref.track.id} trackTitle={ref.track.title} />;
}

function LessonPlayer({ lesson, trackId, trackTitle }: { lesson: Lesson; trackId: string; trackTitle: string }) {
  const { completeLesson, progress } = useStore();
  const [phase, setPhase] = useState<Phase>({ kind: 'step', index: 0 });
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [checked, setChecked] = useState<Record<string, number>>({});
  const headingRef = useRef<HTMLHeadingElement>(null);
  const firstRender = useRef(true);

  const total = lesson.steps.length + lesson.quiz.length;
  const position = phase.kind === 'step' ? phase.index + 1 : phase.kind === 'quiz' ? lesson.steps.length + phase.index + 1 : total;

  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    headingRef.current?.focus();
  }, [phase]);

  const goStep = (index: number) => setPhase({ kind: 'step', index });

  const finish = () => {
    const correctIds = lesson.quiz.filter((q) => checked[q.id] === q.answer).map((q) => q.id);
    const outcome = completeLesson({ lessonId: lesson.id, rev: lesson.rev, total: lesson.quiz.length, correctIds });
    setPhase({ kind: 'done', outcome, score: correctIds.length });
  };

  const restart = () => {
    setAnswers({});
    setChecked({});
    setPhase({ kind: 'step', index: 0 });
  };

  const header = (
    <>
      <p className="small muted" style={{ marginBottom: 0 }}>
        <a href={href({ name: 'track', id: trackId })}>{trackTitle}</a> › {lesson.title}
      </p>
      <h1>{lesson.title}</h1>
      <Meter value={position} max={total} label="Lesson progress" />
      <p className="small muted" style={{ margin: '0.3rem 0 0' }}>
        {phase.kind === 'done' ? 'Finished' : `Step ${position} of ${total}`}
        {lesson.reviewed && ` · Facts checked ${formatMonth(lesson.reviewed)}`}
      </p>
    </>
  );

  if (phase.kind === 'step') {
    const block = lesson.steps[phase.index];
    const isLast = phase.index === lesson.steps.length - 1;
    return (
      <>
        {header}
        <section aria-labelledby="step-heading">
          <h2 id="step-heading" ref={headingRef} tabIndex={-1}>
            {block.heading}
          </h2>
          <BlockView block={block} />
        </section>
        <div className="btn-row">
          {phase.index > 0 && (
            <button type="button" className="btn secondary" onClick={() => goStep(phase.index - 1)}>
              Back
            </button>
          )}
          <span className="spacer" />
          <button type="button" className="btn" onClick={() => (isLast ? setPhase({ kind: 'quiz', index: 0 }) : goStep(phase.index + 1))}>
            {isLast ? 'Start the quiz' : 'Next'}
          </button>
        </div>
      </>
    );
  }

  if (phase.kind === 'quiz') {
    const q = lesson.quiz[phase.index];
    const selected = answers[q.id];
    const isChecked = checked[q.id] !== undefined;
    const right = isChecked && checked[q.id] === q.answer;
    const isLast = phase.index === lesson.quiz.length - 1;
    const name = `q-${q.id}`;
    return (
      <>
        {header}
        <section aria-labelledby="step-heading">
          <h2 id="step-heading" ref={headingRef} tabIndex={-1}>
            Quiz: question {phase.index + 1} of {lesson.quiz.length}
          </h2>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!isChecked && selected !== undefined) setChecked((c) => ({ ...c, [q.id]: selected }));
            }}
          >
            <fieldset>
              <legend>{q.prompt}</legend>
              {q.choices.map((c, i) => {
                const state = isChecked ? (i === q.answer ? ' correct' : i === checked[q.id] ? ' wrong' : '') : '';
                return (
                  <label className={`choice${state}`} key={i}>
                    <input
                      type="radio"
                      name={name}
                      value={i}
                      checked={selected === i}
                      disabled={isChecked}
                      onChange={() => setAnswers((a) => ({ ...a, [q.id]: i }))}
                    />
                    <span>
                      {c}
                      {isChecked && i === q.answer && <span className="visually-hidden"> (correct answer)</span>}
                      {isChecked && i === checked[q.id] && i !== q.answer && <span className="visually-hidden"> (your answer)</span>}
                    </span>
                  </label>
                );
              })}
            </fieldset>
            <div aria-live="polite">
              {isChecked && (
                <div className={`callout ${right ? 'tip' : 'warning'}`}>
                  <p>
                    <strong>{right ? 'Correct.' : 'Not quite.'}</strong> {q.explanation}
                  </p>
                </div>
              )}
            </div>
            <div className="btn-row">
              {phase.index === 0 ? (
                <button type="button" className="btn secondary" onClick={() => goStep(lesson.steps.length - 1)}>
                  Back to the lesson
                </button>
              ) : null}
              <span className="spacer" />
              {!isChecked ? (
                <button type="submit" className="btn" disabled={selected === undefined}>
                  Check answer
                </button>
              ) : (
                <button type="button" className="btn" onClick={() => (isLast ? finish() : setPhase({ kind: 'quiz', index: phase.index + 1 }))}>
                  {isLast ? 'See results' : 'Next question'}
                </button>
              )}
            </div>
          </form>
        </section>
      </>
    );
  }

  const next = nextLesson(lesson.id);
  const { outcome, score } = phase;
  const best = progress.lessons[lesson.id]?.bestScore ?? score;
  return (
    <>
      {header}
      <section aria-labelledby="step-heading">
        <h2 id="step-heading" ref={headingRef} tabIndex={-1}>
          Lesson complete
        </h2>
        <ul className="results">
          <li>
            <span className="label">Score</span>
            <span className="value">
              {score} / {lesson.quiz.length}
            </span>
          </li>
          <li>
            <span className="label">XP earned</span>
            <span className="value">+{outcome.xpGained}</span>
          </li>
          <li>
            <span className="label">Best score</span>
            <span className="value">
              {best} / {lesson.quiz.length}
            </span>
          </li>
        </ul>
        {outcome.xpGained === 0 && <p className="small muted">You have already earned the XP for this lesson. Retakes are still great practice.</p>}
        {outcome.newBadges.length > 0 && (
          <>
            <h3>New badges</h3>
            <ul className="badges">
              {outcome.newBadges.map((b) => {
                const def = badgeById(b);
                return def ? (
                  <li key={b}>
                    <span className="icon" aria-hidden="true">
                      {def.icon}
                    </span>
                    <span>
                      <strong>{def.title}</strong>
                      <br />
                      <span className="small">{def.description}</span>
                    </span>
                  </li>
                ) : null;
              })}
            </ul>
          </>
        )}
        <div className="btn-row">
          {next ? (
            <a className="btn" href={href({ name: 'lesson', id: next.id })}>
              Next: {next.title}
            </a>
          ) : (
            <a className="btn" href={href({ name: 'progress' })}>
              See your progress
            </a>
          )}
          <button type="button" className="btn secondary" onClick={restart}>
            Take it again
          </button>
          <a className="btn secondary" href={href({ name: 'track', id: trackId })}>
            Back to {trackTitle}
          </a>
        </div>
        <h3>Sources and further reading</h3>
        <ul>
          {lesson.sources.map((s) => (
            <li key={s.url}>
              <a href={s.url} target="_blank" rel="noopener noreferrer">
                {s.label}
                <span className="visually-hidden"> (opens in a new tab)</span>
              </a>
            </li>
          ))}
        </ul>
        <p className="small muted">Educational only, not financial advice. Rates and rules change — check the official source before acting.</p>
      </section>
    </>
  );
}

function formatMonth(ym: string): string {
  const [y, m] = ym.split('-').map(Number);
  return new Date(y, m - 1, 1).toLocaleDateString('en-KE', { month: 'short', year: 'numeric' });
}
