import type { ToolId } from '../content/types';
import { Calculator } from './Calculator';
import { TOOL_DEFS } from './model';
import { PaperReplay } from './PaperReplay';

/** Interactive calculator, used both inside lessons and on its own page. */
export function ToolEmbed({ id }: { id: ToolId }) {
  if (id === 'replay') return <PaperReplay />;
  return <Calculator key={id} def={TOOL_DEFS[id]} />;
}
