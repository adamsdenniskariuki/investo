import { SRC } from '../content/sources';
import { href } from '../lib/router';
import { useTitle } from './shared';

export function AboutPage() {
  useTitle('About and disclaimer');
  return (
    <>
      <h1>About Investo</h1>
      <p>
        Investo is a free, step-by-step course on how investing works, starting with the basics and the options available in Kenya. It is
        built to teach, not to sell: no products, no referral links and no tips.
      </p>

      <h2 id="disclaimer">Disclaimer</h2>
      <div className="callout warning">
        <p>
          <strong>Investo is for education only.</strong> Nothing here is financial, investment, tax or legal advice, or a recommendation to
          buy, sell or hold any investment. Investo and its authors are <strong>not licensed by the Capital Markets Authority (CMA)</strong>{' '}
          or any other regulator.
        </p>
        <p>
          Any money in Investo’s exercises and calculators is pretend. Calculators only use the numbers you enter; their results are
          illustrations, not forecasts. All investing involves risk, including losing money.
        </p>
      </div>

      <h2>How the content is checked</h2>
      <ul>
        <li>Facts that change — rates, minimum amounts, tax rules and procedures — are shown as examples with the month they were checked.</li>
        <li>Each lesson links to official sources. Always confirm current details there before acting.</li>
        <li>For decisions about your own money, speak to a professional licensed by the relevant regulator.</li>
      </ul>

      <h2>Official sources</h2>
      <ul>
        {[SRC.cbk, SRC.dhowcsd, SRC.cma, SRC.cmaLicensees, SRC.nse, SRC.cdsc, SRC.kra, SRC.rba, SRC.nssf, SRC.sasra, SRC.kdic, SRC.knbs].map((s) => (
          <li key={s.url}>
            <a href={s.url} target="_blank" rel="noopener noreferrer">
              {s.label}
              <span className="visually-hidden"> (opens in a new tab)</span>
            </a>
          </li>
        ))}
      </ul>

      <h2>Privacy</h2>
      <p>
        There is no account, no tracking and no server storing your data. Progress and settings are kept in your browser’s local storage. You
        can export or import them on the <a href={href({ name: 'progress' })}>Progress</a> page. Investo works offline after the first visit.
      </p>
    </>
  );
}
