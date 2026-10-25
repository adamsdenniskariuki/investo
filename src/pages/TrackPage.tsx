import { TRACKS } from '../content/tracks';
import { href } from '../lib/router';
import { useStore } from '../state/store';
import { Meter, trackDone, useTitle } from './shared';
import { NotFoundPage } from './NotFoundPage';

export function TrackPage({ id }: { id: string }) {
  const track = TRACKS.find((t) => t.id === id);
  useTitle(track?.title ?? 'Not found');
  const { progress } = useStore();
  if (!track) return <NotFoundPage />;
  const done = trackDone(progress, track);

  return (
    <>
      <p className="small muted" style={{ marginBottom: 0 }}>
        <a href={href({ name: 'home' })}>Learn</a> › Stage {track.stage}
      </p>
      <h1>{track.title}</h1>
      <p>{track.tagline}</p>
      {track.status === 'coming-soon' ? (
        <div className="callout kenya">
          <p>This stage is planned. Finish the earlier stages first — the ideas there are the foundation for it.</p>
        </div>
      ) : (
        <>
          <Meter value={done} max={track.lessons.length} label={`${track.title} progress`} />
          <p className="small muted">
            {done} of {track.lessons.length} lessons done. Lessons are best taken in order, but none are locked.
          </p>
          <ol className="lesson-list">
            {track.lessons.map((l, i) => {
              const rec = progress.lessons[l.id];
              return (
                <li key={l.id}>
                  <a className={`lesson-link${rec ? ' done' : ''}`} href={href({ name: 'lesson', id: l.id })}>
                    <span className="num" aria-hidden="true">
                      {rec ? '✓' : i + 1}
                    </span>
                    <span>
                      <span className="title">{l.title}</span>
                      <span className="small muted">
                        {l.summary} · {l.minutes} min
                        {rec ? ` · Done, best ${rec.bestScore}/${rec.total}` : ''}
                      </span>
                    </span>
                  </a>
                </li>
              );
            })}
          </ol>
        </>
      )}
    </>
  );
}
