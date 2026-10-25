import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { applyTheme } from '../lib/applyTheme';
import { badgeById, type BadgeContext } from '../lib/badges';
import { emptyProgress, recordExport, recordLessonResult, recordToolUse, type LessonResultInput, type Outcome } from '../lib/progress';
import type { Settings } from '../lib/settings';
import { loadState, saveState, type AppState } from '../lib/storage';
import { TOOL_IDS, trackLessonIds } from '../content/tracks';

export interface Toast {
  id: number;
  text: string;
}

interface Store extends AppState {
  storageOk: boolean;
  toasts: Toast[];
  completeLesson: (input: LessonResultInput) => Outcome;
  markToolUsed: (toolId: string) => void;
  markExported: () => void;
  replaceState: (state: AppState) => void;
  resetProgress: () => void;
  updateSettings: (patch: Partial<Settings>) => void;
  dismissToast: (id: number) => void;
}

const StoreContext = createContext<Store | null>(null);

const storage = (): Storage | undefined => {
  try {
    return typeof window !== 'undefined' ? window.localStorage : undefined;
  } catch {
    return undefined;
  }
};

export function badgeContext(now = new Date()): BadgeContext {
  return { trackLessons: trackLessonIds(), toolIds: TOOL_IDS, now };
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>(() => loadState(storage()));
  const [storageOk, setStorageOk] = useState(true);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const stateRef = useRef(state);
  stateRef.current = state;
  const nextToast = useRef(1);

  useEffect(() => {
    setStorageOk(saveState(storage(), state));
  }, [state]);

  useEffect(() => {
    applyTheme(state.settings);
    if (state.settings.mode !== 'system' || !window.matchMedia) return;
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const onChange = () => applyTheme(stateRef.current.settings);
    mq.addEventListener?.('change', onChange);
    return () => mq.removeEventListener?.('change', onChange);
  }, [state.settings]);

  const toast = useCallback((text: string) => {
    const id = nextToast.current++;
    setToasts((t) => [...t.slice(-2), { id, text }]);
    window.setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 6000);
  }, []);

  const announce = useCallback(
    (o: Outcome) => {
      for (const id of o.newBadges) {
        const b = badgeById(id);
        if (b) toast(`${b.icon} Badge earned: ${b.title}`);
      }
    },
    [toast],
  );

  const apply = useCallback(
    (fn: (s: AppState) => Outcome): Outcome => {
      const outcome = fn(stateRef.current);
      stateRef.current = { ...stateRef.current, progress: outcome.progress };
      setState(stateRef.current);
      announce(outcome);
      return outcome;
    },
    [announce],
  );

  const value = useMemo<Store>(
    () => ({
      ...state,
      storageOk,
      toasts,
      completeLesson: (input) => apply((s) => recordLessonResult(s.progress, input, badgeContext())),
      markToolUsed: (toolId) => {
        if (stateRef.current.progress.toolsUsed[toolId]) return;
        apply((s) => recordToolUse(s.progress, toolId, badgeContext()));
      },
      markExported: () => {
        apply((s) => recordExport(s.progress, badgeContext()));
      },
      replaceState: (next) => {
        stateRef.current = next;
        setState(next);
      },
      resetProgress: () => {
        stateRef.current = { ...stateRef.current, progress: emptyProgress() };
        setState(stateRef.current);
      },
      updateSettings: (patch) => {
        stateRef.current = { ...stateRef.current, settings: { ...stateRef.current.settings, ...patch } };
        setState(stateRef.current);
      },
      dismissToast: (id) => setToasts((t) => t.filter((x) => x.id !== id)),
    }),
    [state, storageOk, toasts, apply],
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore(): Store {
  const s = useContext(StoreContext);
  if (!s) throw new Error('useStore must be used inside StoreProvider');
  return s;
}
