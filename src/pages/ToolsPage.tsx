import { TOOLS, findLesson } from '../content/tracks';
import { href } from '../lib/router';
import { useTitle } from './shared';
import { NotFoundPage } from './NotFoundPage';
import { ToolEmbed } from '../tools/ToolEmbed';

export function ToolsPage() {
  useTitle('Calculators');
  return (
    <>
      <h1>Calculators</h1>
      <p>Try the ideas from the lessons with your own numbers. Every rate is one you type in — Investo does not predict returns.</p>
      <div className="grid">
        {TOOLS.map((t) => (
          <section className="card" key={t.id} aria-labelledby={`tool-${t.id}`}>
            <h2 id={`tool-${t.id}`} style={{ fontSize: '1.12rem' }}>
              <a href={href({ name: 'tool', id: t.id })}>{t.title}</a>
            </h2>
            <p style={{ margin: 0 }}>{t.summary}</p>
          </section>
        ))}
      </div>
    </>
  );
}

export function ToolPage({ id }: { id: string }) {
  const tool = TOOLS.find((t) => t.id === id);
  useTitle(tool?.title ?? 'Not found');
  if (!tool) return <NotFoundPage />;
  const lesson = findLesson(tool.lesson)?.lesson;
  return (
    <>
      <p className="small muted" style={{ marginBottom: 0 }}>
        <a href={href({ name: 'tools' })}>Calculators</a> › {tool.title}
      </p>
      <h1>{tool.title}</h1>
      <p>{tool.summary}</p>
      <ToolEmbed id={tool.id} />
      {lesson && (
        <p>
          Learn the idea behind it: <a href={href({ name: 'lesson', id: lesson.id })}>{lesson.title}</a>
        </p>
      )}
      <p className="small muted">Results are illustrations based on the numbers you enter. They are not forecasts or advice.</p>
    </>
  );
}
