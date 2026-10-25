import type { Block } from '../content/types';
import { Diagram } from '../diagrams/Diagram';
import { RichText } from './RichText';
import { ToolEmbed } from '../tools/ToolEmbed';

const CALLOUT_LABEL = { tip: 'Tip', warning: 'Warning', kenya: 'In Kenya' } as const;

/** Renders the body of one lesson step. The step heading is rendered by the caller. */
export function BlockView({ block }: { block: Block }) {
  switch (block.kind) {
    case 'text':
      return (
        <>
          {block.body.map((p, i) => (
            <p key={i}>
              <RichText text={p} />
            </p>
          ))}
        </>
      );
    case 'list': {
      const Tag = block.ordered ? 'ol' : 'ul';
      return (
        <>
          {block.intro && (
            <p>
              <RichText text={block.intro} />
            </p>
          )}
          <Tag>
            {block.items.map((it, i) => (
              <li key={i}>
                <RichText text={it} />
              </li>
            ))}
          </Tag>
        </>
      );
    }
    case 'callout':
      return (
        <div className={`callout ${block.tone}`}>
          <p className="small" style={{ margin: '0 0 0.25rem', fontWeight: 700 }}>
            {CALLOUT_LABEL[block.tone]}
          </p>
          {block.body.map((p, i) => (
            <p key={i}>
              <RichText text={p} />
            </p>
          ))}
        </div>
      );
    case 'diagram':
      return (
        <>
          {block.body?.map((p, i) => (
            <p key={i}>
              <RichText text={p} />
            </p>
          ))}
          <Diagram id={block.diagram} caption={block.caption} />
        </>
      );
    case 'tool':
      return (
        <>
          <p>{block.intro}</p>
          <ToolEmbed id={block.tool} />
        </>
      );
  }
}
