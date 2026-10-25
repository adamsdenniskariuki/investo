import { useEffect } from 'react';
import { applyTheme } from './lib/applyTheme';
import { DEFAULT_SETTINGS } from './lib/settings';

export function App() {
  useEffect(() => applyTheme(DEFAULT_SETTINGS), []);
  return (
    <>
      <a className="skip-link" href="#main">Skip to content</a>
      <main id="main" tabIndex={-1}>
        <h1>Investo</h1>
        <p>Learn to invest step by step, starting with Kenyan markets. Lessons are on the way.</p>
        <div className="callout warning" role="note">
          <h2 className="h3">Educational only</h2>
          <p>
            Investo teaches general concepts with practice (paper) money. It is not financial advice, does not recommend
            any investment, and is not licensed by the Capital Markets Authority (CMA).
          </p>
        </div>
      </main>
    </>
  );
}
