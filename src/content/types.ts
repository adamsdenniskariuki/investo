import type { DiagramId } from '../diagrams/specs';

export type ToolId = 'compound' | 'inflation' | 'fees' | 'mmf-tbill' | 'bond' | 'emergency' | 'fx-return' | 'position-size' | 'risk-reward' | 'replay';

export type Block =
  | { kind: 'text'; heading: string; body: string[] }
  | { kind: 'list'; heading: string; intro?: string; items: string[]; ordered?: boolean }
  | { kind: 'callout'; tone: 'tip' | 'warning' | 'kenya'; heading: string; body: string[] }
  | { kind: 'diagram'; heading: string; diagram: DiagramId; caption: string; body?: string[] }
  | { kind: 'tool'; heading: string; tool: ToolId; intro: string };

export interface QuizQuestion {
  /** Stable, append-only id. Never reuse or rename. */
  id: string;
  prompt: string;
  choices: string[];
  answer: number;
  explanation: string;
}

export interface Source {
  label: string;
  url: string;
}

export interface Lesson {
  /** Stable, append-only id used as the progress key. Never reuse or rename. */
  id: string;
  /** Bump when the lesson's content changes materially. */
  rev: number;
  title: string;
  summary: string;
  minutes: number;
  /** Month the time-sensitive facts were last checked, e.g. "2026-10". */
  reviewed?: string;
  steps: Block[];
  quiz: QuizQuestion[];
  sources: Source[];
}

export interface Track {
  id: string;
  stage: number;
  title: string;
  tagline: string;
  status: 'available' | 'coming-soon';
  lessons: Lesson[];
}
