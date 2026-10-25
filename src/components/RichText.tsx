import { Fragment, type ReactNode } from 'react';

const TOKEN = /\*\*([^*]+)\*\*|\[([^\]]+)\]\(([^)\s]+)\)/g;

/** Renders a tiny, safe subset of Markdown: **bold** and [links](https://…). */
export function RichText({ text }: { text: string }) {
  const out: ReactNode[] = [];
  let last = 0;
  let key = 0;
  for (const m of text.matchAll(TOKEN)) {
    const at = m.index ?? 0;
    if (at > last) out.push(text.slice(last, at));
    if (m[1] !== undefined) out.push(<strong key={key++}>{m[1]}</strong>);
    else {
      const url = m[3];
      const external = /^https?:\/\//.test(url);
      out.push(
        <a key={key++} href={url} {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}>
          {m[2]}
          {external && <span className="visually-hidden"> (opens in a new tab)</span>}
        </a>,
      );
    }
    last = at + m[0].length;
  }
  if (last < text.length) out.push(text.slice(last));
  return <Fragment>{out}</Fragment>;
}
