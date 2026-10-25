import { TOOLS } from '../content/tracks';
import type { ToolId } from '../content/types';
import { href } from '../lib/router';

/** Inline calculator inside a lesson. Placeholder until the calculators ship. */
export function ToolEmbed({ id }: { id: ToolId }) {
  const tool = TOOLS.find((t) => t.id === id);
  return (
    <div className="card">
      <p style={{ margin: 0 }}>
        <a href={href({ name: 'tool', id })}>{tool?.title ?? 'Calculator'}</a> — the interactive calculator is coming in the next update.
      </p>
    </div>
  );
}
