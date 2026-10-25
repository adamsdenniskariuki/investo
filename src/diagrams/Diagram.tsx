import type { ReactNode } from 'react';
import { DIAGRAMS, type DiagramId } from './specs';
import { Figure, renderBody } from './primitives';

export function Diagram({ id, caption }: { id: DiagramId; caption?: ReactNode }) {
  const spec = DIAGRAMS[id];
  const { height, node, legend } = renderBody(spec);
  return (
    <Figure title={spec.title} desc={spec.desc} caption={caption} height={height} legend={legend}>
      {node}
    </Figure>
  );
}
