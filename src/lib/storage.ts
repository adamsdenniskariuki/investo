import { emptyProgress, sanitizeProgress, type Progress } from './progress';
import { DEFAULT_SETTINGS, sanitizeSettings, type Settings } from './settings';

export const STORAGE_KEY = 'investo:v1';
export const BACKUP_FORMAT = 1;

export interface AppState {
  progress: Progress;
  settings: Settings;
}

export interface Backup {
  app: 'investo';
  format: number;
  exportedAt: string;
  progress: Progress;
  settings: Settings;
}

type KV = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>;

export function loadState(store: KV | undefined): AppState {
  const fallback = { progress: emptyProgress(), settings: { ...DEFAULT_SETTINGS } };
  if (!store) return fallback;
  try {
    const raw = store.getItem(STORAGE_KEY);
    if (!raw) return fallback;
    const data = JSON.parse(raw) as Record<string, unknown>;
    return { progress: sanitizeProgress(data?.progress), settings: sanitizeSettings(data?.settings) };
  } catch {
    return fallback;
  }
}

/** Returns false when storage is unavailable or full. */
export function saveState(store: KV | undefined, state: AppState): boolean {
  if (!store) return false;
  try {
    store.setItem(STORAGE_KEY, JSON.stringify(state));
    return true;
  } catch {
    return false;
  }
}

export function makeBackup(state: AppState, now: Date): Backup {
  return { app: 'investo', format: BACKUP_FORMAT, exportedAt: now.toISOString(), progress: state.progress, settings: state.settings };
}

export type ParseResult = { ok: true; state: AppState } | { ok: false; error: string };

export function parseBackup(text: string): ParseResult {
  let data: unknown;
  try {
    data = JSON.parse(text);
  } catch {
    return { ok: false, error: 'That file is not valid JSON.' };
  }
  if (typeof data !== 'object' || data === null || Array.isArray(data)) return { ok: false, error: 'That file is not an Investo backup.' };
  const d = data as Record<string, unknown>;
  if (d.app !== 'investo') return { ok: false, error: 'That file is not an Investo backup.' };
  if (typeof d.format !== 'number' || d.format < 1) return { ok: false, error: 'The backup format is not recognised.' };
  if (d.format > BACKUP_FORMAT) return { ok: false, error: 'This backup was made by a newer version of Investo. Reload the app to update, then try again.' };
  return { ok: true, state: { progress: sanitizeProgress(d.progress), settings: sanitizeSettings(d.settings) } };
}

export function backupFileName(now: Date): string {
  const p = (n: number) => String(n).padStart(2, '0');
  return `investo-backup-${now.getFullYear()}-${p(now.getMonth() + 1)}-${p(now.getDate())}.json`;
}
