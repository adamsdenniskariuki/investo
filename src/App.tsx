import { useEffect, useRef, useState } from 'react';
import { href, parseHash, type Route } from './lib/router';
import { StoreProvider, useStore } from './state/store';
import { HomePage } from './pages/HomePage';
import { TrackPage } from './pages/TrackPage';
import { LessonPage } from './pages/LessonPage';
import { ProgressPage } from './pages/ProgressPage';
import { SettingsPage } from './pages/SettingsPage';
import { AboutPage } from './pages/AboutPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { ToolsPage, ToolPage } from './pages/ToolsPage';

function useRoute(): Route {
  const [route, setRoute] = useState<Route>(() => parseHash(window.location.hash));
  useEffect(() => {
    const on = () => setRoute(parseHash(window.location.hash));
    window.addEventListener('hashchange', on);
    return () => window.removeEventListener('hashchange', on);
  }, []);
  return route;
}

const NAV: { label: string; route: Route; match: Route['name'][] }[] = [
  { label: 'Learn', route: { name: 'home' }, match: ['home', 'track', 'lesson'] },
  { label: 'Tools', route: { name: 'tools' }, match: ['tools', 'tool'] },
  { label: 'Progress', route: { name: 'progress' }, match: ['progress'] },
  { label: 'Settings', route: { name: 'settings' }, match: ['settings'] },
  { label: 'About', route: { name: 'about' }, match: ['about'] },
];

function Logo() {
  return (
    <svg viewBox="0 0 32 32" aria-hidden="true" focusable="false">
      <rect width="32" height="32" rx="7" style={{ fill: 'var(--primary)' }} />
      <rect x="7" y="17" width="4" height="8" rx="1" style={{ fill: 'var(--on-primary)' }} />
      <rect x="14" y="12" width="4" height="13" rx="1" style={{ fill: 'var(--on-primary)' }} />
      <rect x="21" y="7" width="4" height="18" rx="1" style={{ fill: 'var(--on-primary)' }} />
    </svg>
  );
}

function Page({ route }: { route: Route }) {
  switch (route.name) {
    case 'home':
      return <HomePage />;
    case 'track':
      return <TrackPage id={route.id} />;
    case 'lesson':
      return <LessonPage key={route.id} id={route.id} />;
    case 'tools':
      return <ToolsPage />;
    case 'tool':
      return <ToolPage id={route.id} />;
    case 'progress':
      return <ProgressPage />;
    case 'settings':
      return <SettingsPage />;
    case 'about':
      return <AboutPage />;
    default:
      return <NotFoundPage />;
  }
}

function Shell() {
  const route = useRoute();
  const { progress, toasts, dismissToast, storageOk } = useStore();
  const mainRef = useRef<HTMLElement>(null);
  const first = useRef(true);

  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    window.scrollTo(0, 0);
    mainRef.current?.focus();
  }, [route]);

  const wide = route.name === 'home' || route.name === 'tools' || route.name === 'progress';

  return (
    <>
      <a className="skip-link" href="#main" onClick={(e) => { e.preventDefault(); mainRef.current?.focus(); }}>
        Skip to content
      </a>
      <header className="site-header">
        <div className="header-inner">
          <a className="brand" href={href({ name: 'home' })}>
            <Logo />
            Investo
          </a>
          <span className="xp-pill" aria-label={`${progress.xp} XP earned`}>
            {progress.xp} XP
          </span>
          <nav aria-label="Main">
            <ul className="nav">
              {NAV.map((n) => (
                <li key={n.label}>
                  <a href={href(n.route)} aria-current={n.match.includes(route.name) ? 'page' : undefined}>
                    {n.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </header>
      <main id="main" ref={mainRef} tabIndex={-1} className={wide ? 'wide' : undefined}>
        {!storageOk && (
          <div className="callout warning" role="alert">
            <p>Your browser is not letting Investo save progress (private mode or storage is full). Export a backup from Progress before you close this tab.</p>
          </div>
        )}
        <Page route={route} />
      </main>
      <footer className="site-footer">
        <div className="inner">
          <p>
            <strong>Educational only — not financial advice.</strong> Investo is not licensed by the Capital Markets Authority (CMA) and does not
            recommend any product or give buy or sell signals. Rates and rules change: check official sources and, for your own decisions, a
            licensed professional. <a href={href({ name: 'about' })}>About and disclaimer</a>
          </p>
          <p className="small">Progress is stored only in this browser. Back it up from the Progress page.</p>
        </div>
      </footer>
      <div className="toasts" role="status" aria-live="polite">
        {toasts.map((t) => (
          <div className="toast" key={t.id}>
            <span>{t.text}</span>
            <button type="button" className="btn secondary" onClick={() => dismissToast(t.id)} aria-label="Dismiss notification">
              ✕
            </button>
          </div>
        ))}
      </div>
    </>
  );
}

export default function App() {
  return (
    <StoreProvider>
      <Shell />
    </StoreProvider>
  );
}
