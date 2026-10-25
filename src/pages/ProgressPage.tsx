import { useRef, useState } from 'react';
import { AVAILABLE_TRACKS } from '../content/tracks';
import { BADGES } from '../lib/badges';
import { href } from '../lib/router';
import { backupFileName, makeBackup, parseBackup, type AppState } from '../lib/storage';
import { useStore } from '../state/store';
import { Meter, Stats, trackDone, useTitle } from './shared';

type Notice = { tone: 'tip' | 'warning' | 'danger'; text: string } | null;

export function ProgressPage() {
  useTitle('Your progress');
  const store = useStore();
  const { progress, settings } = store;
  const fileRef = useRef<HTMLInputElement>(null);
  const [notice, setNotice] = useState<Notice>(null);
  const [pending, setPending] = useState<AppState | null>(null);
  const [confirmReset, setConfirmReset] = useState(false);

  const exportBackup = () => {
    const now = new Date();
    const blob = new Blob([JSON.stringify(makeBackup({ progress, settings }, now), null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = backupFileName(now);
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    store.markExported();
    setNotice({ tone: 'tip', text: `Backup saved as ${a.download}. Keep it somewhere safe, such as your email or cloud storage.` });
  };

  const onFile = async (file: File | undefined) => {
    if (!file) return;
    const result = parseBackup(await file.text());
    if (fileRef.current) fileRef.current.value = '';
    if (!result.ok) {
      setPending(null);
      setNotice({ tone: 'danger', text: result.error });
      return;
    }
    setNotice(null);
    setPending(result.state);
  };

  const pendingLessons = pending ? Object.keys(pending.progress.lessons).length : 0;

  return (
    <>
      <h1>Your progress</h1>
      <Stats progress={progress} />

      <h2>Tracks</h2>
      {AVAILABLE_TRACKS.map((t) => {
        const done = trackDone(progress, t);
        return (
          <div className="card" key={t.id}>
            <h3>
              <a href={href({ name: 'track', id: t.id })}>{t.title}</a>
            </h3>
            <Meter value={done} max={t.lessons.length} label={`${t.title} progress`} />
            <p className="small muted" style={{ margin: '0.4rem 0 0' }}>
              {done} of {t.lessons.length} lessons done
            </p>
          </div>
        );
      })}

      <h2>Badges</h2>
      <ul className="badges">
        {BADGES.map((b) => {
          const earned = progress.badges[b.id];
          return (
            <li key={b.id} className={earned ? undefined : 'locked'}>
              <span className="icon" aria-hidden="true">
                {b.icon}
              </span>
              <span>
                <strong>{b.title}</strong>
                <span className="visually-hidden">{earned ? ' (earned)' : ' (not earned yet)'}</span>
                <br />
                <span className="small">{b.description}</span>
              </span>
            </li>
          );
        })}
      </ul>

      <h2 id="backup">Back up and restore</h2>
      <p>
        Your progress lives only in this browser. Export a backup file to keep it safe or move it to another device, then import it there.
      </p>
      <div className="btn-row">
        <button type="button" className="btn" onClick={exportBackup}>
          Export backup
        </button>
        <button type="button" className="btn secondary" onClick={() => fileRef.current?.click()}>
          Import backup…
        </button>
        <input
          id="import-file"
          ref={fileRef}
          type="file"
          accept="application/json,.json"
          className="visually-hidden"
          tabIndex={-1}
          aria-hidden="true"
          onChange={(e) => onFile(e.target.files?.[0])}
        />
      </div>
      <div aria-live="polite">
        {notice && (
          <div className={`callout ${notice.tone}`}>
            <p>{notice.text}</p>
          </div>
        )}
        {pending && (
          <div className="callout warning">
            <p>
              This backup has {pending.progress.xp} XP and {pendingLessons} finished lesson{pendingLessons === 1 ? '' : 's'}. Importing replaces
              your current progress and settings.
            </p>
            <div className="btn-row">
              <button
                type="button"
                className="btn"
                onClick={() => {
                  store.replaceState(pending);
                  setPending(null);
                  setNotice({ tone: 'tip', text: 'Backup imported.' });
                }}
              >
                Replace my progress
              </button>
              <button type="button" className="btn secondary" onClick={() => setPending(null)}>
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      <h2>Start over</h2>
      {!confirmReset ? (
        <button type="button" className="btn danger" onClick={() => setConfirmReset(true)}>
          Reset progress…
        </button>
      ) : (
        <div className="callout danger">
          <p>This deletes your XP, badges and lesson history from this browser. Your settings are kept. This cannot be undone unless you have a backup.</p>
          <div className="btn-row">
            <button
              type="button"
              className="btn danger"
              onClick={() => {
                store.resetProgress();
                setConfirmReset(false);
                setNotice({ tone: 'tip', text: 'Progress reset.' });
              }}
            >
              Yes, reset my progress
            </button>
            <button type="button" className="btn secondary" onClick={() => setConfirmReset(false)}>
              Cancel
            </button>
          </div>
        </div>
      )}
    </>
  );
}
