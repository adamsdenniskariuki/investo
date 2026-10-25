import { href } from '../lib/router';
import { useTitle } from './shared';

export function NotFoundPage() {
  useTitle('Not found');
  return (
    <>
      <h1>Page not found</h1>
      <p>That page does not exist, or it may have moved.</p>
      <p>
        <a className="btn" href={href({ name: 'home' })}>
          Go to the lessons
        </a>
      </p>
    </>
  );
}
