"use client";

// Browser-local learning state for the Fabric hub.
//
// Deliberately a *separate* namespace from the existing Data Lab key
// (`amir-lab-v1`) so an upgrade can never rewrite or reset an established exam
// history. Every write is guarded: private-mode storage, a full quota or a
// corrupted value degrade to "this session still works, nothing persists" rather
// than a broken exam.

import { useSyncExternalStore } from "react";
import type { FabricMode, SessionManifest, SessionResult } from "./engine";

export const FABRIC_STORAGE_KEY = "amir-fabric-v1";
export const FABRIC_EXPORT_APP = "hansa-fabric";
export const FABRIC_STORAGE_VERSION = 1 as const;

const MAX_ACTIVE_SESSIONS = 3;
const MAX_COMPLETED_SESSIONS = 30;
const MAX_HISTORY = 60;

export interface QuestionStats {
  attempts: number;
  correct: number;
  lastCorrect: boolean;
  lastAt: string;
  lastResponse: string[];
}

export interface StoredSession {
  id: string;
  mode: FabricMode;
  status: "active" | "completed";
  createdAt: string;
  updatedAt: string;
  manifest: SessionManifest;
  answers: Record<string, string[]>;
  flags: string[];
  /** Question ids already checked in a guided session. */
  revealed: string[];
  index: number;
  /** Epoch ms for timed sessions; `null` when untimed. */
  deadlineAt: number | null;
  remainingSeconds: number | null;
  elapsedSeconds: number;
  result?: SessionResult;
}

export interface AttemptHistoryEntry {
  id: string;
  mode: FabricMode;
  label: string;
  completedAt: string;
  score: number;
  total: number;
  percent: number;
  durationSeconds: number;
  autoSubmitted: boolean;
}

export interface FabricStore {
  version: typeof FABRIC_STORAGE_VERSION;
  updatedAt: string;
  bookmarks: string[];
  flags: string[];
  questions: Record<string, QuestionStats>;
  sessions: Record<string, StoredSession>;
  history: AttemptHistoryEntry[];
  settings: { shuffleQuestions: boolean; shuffleOptions: boolean };
}

export interface StorageState {
  store: FabricStore;
  /** `false` when the browser refused storage; the UI says so instead of failing. */
  available: boolean;
  /** Set when a previous value could not be read and was preserved defensively. */
  recovered: boolean;
}

let cachedRaw: string | null = null;
let cachedState: StorageState | null = null;
const listeners = new Set<() => void>();

function emptyStore(): FabricStore {
  return {
    version: FABRIC_STORAGE_VERSION,
    updatedAt: new Date(0).toISOString(),
    bookmarks: [],
    flags: [],
    questions: {},
    sessions: {},
    history: [],
    settings: { shuffleQuestions: true, shuffleOptions: true },
  };
}

function emit() {
  for (const listener of listeners) listener();
}

export function subscribeFabricStore(listener: () => void) {
  listeners.add(listener);
  const onStorage = (event: StorageEvent) => {
    if (event.key === null || event.key === FABRIC_STORAGE_KEY) {
      cachedRaw = null;
      cachedState = null;
      listener();
    }
  };
  if (typeof window !== "undefined") window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    if (typeof window !== "undefined") window.removeEventListener("storage", onStorage);
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function asStringArray(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
}

/** Accept only a value that matches the current schema closely enough to trust. */
export function normalizeStore(input: unknown): FabricStore | null {
  if (!isRecord(input)) return null;
  const base = emptyStore();
  if (input.version !== undefined && input.version !== FABRIC_STORAGE_VERSION) return null;

  const sessions: Record<string, StoredSession> = {};
  if (isRecord(input.sessions)) {
    for (const [id, raw] of Object.entries(input.sessions)) {
      if (!isRecord(raw)) continue;
      const manifest = raw.manifest;
      if (!isRecord(manifest) || !Array.isArray(manifest.questionIds)) continue;
      sessions[id] = {
        id: typeof raw.id === "string" ? raw.id : id,
        mode: (raw.mode as FabricMode) ?? (manifest.mode as FabricMode) ?? "guided",
        status: raw.status === "completed" ? "completed" : "active",
        createdAt: typeof raw.createdAt === "string" ? raw.createdAt : base.updatedAt,
        updatedAt: typeof raw.updatedAt === "string" ? raw.updatedAt : base.updatedAt,
        manifest: {
          v: 1,
          id: typeof manifest.id === "string" ? manifest.id : id,
          mode: (manifest.mode as FabricMode) ?? "guided",
          createdAt: typeof manifest.createdAt === "string" ? manifest.createdAt : base.updatedAt,
          seed: typeof manifest.seed === "number" ? manifest.seed : 1,
          label: typeof manifest.label === "string" ? manifest.label : "Session",
          questionIds: asStringArray(manifest.questionIds),
          optionOrder: isRecord(manifest.optionOrder)
            ? Object.fromEntries(
                Object.entries(manifest.optionOrder).map(([key, value]) => [key, asStringArray(value)]),
              )
            : {},
          minutes: typeof manifest.minutes === "number" ? manifest.minutes : null,
          filter: isRecord(manifest.filter) ? manifest.filter : {},
        },
        answers: isRecord(raw.answers)
          ? Object.fromEntries(
              Object.entries(raw.answers).map(([key, value]) => [key, asStringArray(value)]),
            )
          : {},
        flags: asStringArray(raw.flags),
        revealed: asStringArray(raw.revealed),
        index: typeof raw.index === "number" ? Math.max(0, Math.floor(raw.index)) : 0,
        deadlineAt: typeof raw.deadlineAt === "number" ? raw.deadlineAt : null,
        remainingSeconds: typeof raw.remainingSeconds === "number" ? raw.remainingSeconds : null,
        elapsedSeconds: typeof raw.elapsedSeconds === "number" ? raw.elapsedSeconds : 0,
        result: isRecord(raw.result) ? (raw.result as unknown as SessionResult) : undefined,
      };
    }
  }

  const questions: Record<string, QuestionStats> = {};
  if (isRecord(input.questions)) {
    for (const [id, raw] of Object.entries(input.questions)) {
      if (!isRecord(raw)) continue;
      questions[id] = {
        attempts: typeof raw.attempts === "number" ? Math.max(0, Math.floor(raw.attempts)) : 0,
        correct: typeof raw.correct === "number" ? Math.max(0, Math.floor(raw.correct)) : 0,
        lastCorrect: raw.lastCorrect === true,
        lastAt: typeof raw.lastAt === "string" ? raw.lastAt : base.updatedAt,
        lastResponse: asStringArray(raw.lastResponse),
      };
    }
  }

  const history: AttemptHistoryEntry[] = Array.isArray(input.history)
    ? input.history
        .filter(isRecord)
        .map((row) => ({
          id: String(row.id ?? ""),
          mode: (row.mode as FabricMode) ?? "guided",
          label: String(row.label ?? "Session"),
          completedAt: String(row.completedAt ?? base.updatedAt),
          score: Number(row.score ?? 0),
          total: Number(row.total ?? 0),
          percent: Number(row.percent ?? 0),
          durationSeconds: Number(row.durationSeconds ?? 0),
          autoSubmitted: row.autoSubmitted === true,
        }))
        .filter((row) => row.id.length > 0)
    : [];

  const settings = isRecord(input.settings) ? input.settings : {};

  return {
    ...base,
    updatedAt: typeof input.updatedAt === "string" ? input.updatedAt : base.updatedAt,
    bookmarks: asStringArray(input.bookmarks),
    flags: asStringArray(input.flags),
    questions,
    sessions,
    history,
    settings: {
      shuffleQuestions: settings.shuffleQuestions !== false,
      shuffleOptions: settings.shuffleOptions !== false,
    },
  };
}

function prune(store: FabricStore): FabricStore {
  const byMode = (status: StoredSession["status"]) =>
    Object.values(store.sessions)
      .filter((session) => session.status === status)
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));

  const keep = new Set<string>();
  for (const session of byMode("active").slice(0, MAX_ACTIVE_SESSIONS)) keep.add(session.id);
  for (const session of byMode("completed").slice(0, MAX_COMPLETED_SESSIONS)) keep.add(session.id);

  const sessions = Object.fromEntries(
    Object.entries(store.sessions).filter(([id]) => keep.has(id)),
  );
  const history = [...store.history]
    .sort((a, b) => b.completedAt.localeCompare(a.completedAt))
    .slice(0, MAX_HISTORY);

  return { ...store, sessions, history };
}

function readState(): StorageState {
  if (typeof window === "undefined") {
    return { store: emptyStore(), available: true, recovered: false };
  }
  try {
    const raw = window.localStorage.getItem(FABRIC_STORAGE_KEY);
    if (raw === cachedRaw && cachedState) return cachedState;
    cachedRaw = raw;
    if (!raw) {
      cachedState = { store: emptyStore(), available: true, recovered: false };
      return cachedState;
    }
    let parsed: unknown;
    try {
      parsed = JSON.parse(raw);
    } catch {
      // Keep the unreadable value under a backup key so nothing is silently lost.
      try {
        window.localStorage.setItem(`${FABRIC_STORAGE_KEY}-unreadable-${Date.now()}`, raw);
      } catch {
        // Backup is best-effort; the exam continues either way.
      }
      window.localStorage.removeItem(FABRIC_STORAGE_KEY);
      cachedState = { store: emptyStore(), available: true, recovered: true };
      return cachedState;
    }
    const normalized = normalizeStore(parsed);
    if (!normalized) {
      try {
        window.localStorage.setItem(`${FABRIC_STORAGE_KEY}-v${String((parsed as { version?: unknown }).version ?? "unknown")}`, raw);
      } catch {
        // Ignore: the backup is a courtesy, not a requirement.
      }
      cachedState = { store: emptyStore(), available: true, recovered: true };
      return cachedState;
    }
    cachedState = { store: normalized, available: true, recovered: false };
    return cachedState;
  } catch {
    cachedState = { store: emptyStore(), available: false, recovered: false };
    return cachedState;
  }
}

function writeStore(store: FabricStore) {
  const next = prune({ ...store, updatedAt: new Date().toISOString() });
  cachedState = { store: next, available: true, recovered: false };
  if (typeof window === "undefined") return next;
  try {
    const serialized = JSON.stringify(next);
    window.localStorage.setItem(FABRIC_STORAGE_KEY, serialized);
    cachedRaw = serialized;
  } catch {
    // Quota or private mode: keep the in-memory copy so this session survives.
    cachedRaw = null;
    cachedState = { store: next, available: false, recovered: false };
  }
  emit();
  return next;
}

export function getFabricState(): StorageState {
  return readState();
}

export function getServerFabricState(): StorageState {
  return { store: emptyStore(), available: true, recovered: false };
}

export function useFabricStore(): StorageState {
  return useSyncExternalStore(subscribeFabricStore, getFabricState, getServerFabricState);
}

// ---------------------------------------------------------------------------
// Mutations
// ---------------------------------------------------------------------------

export function saveSession(session: StoredSession) {
  const { store } = readState();
  writeStore({ ...store, sessions: { ...store.sessions, [session.id]: session } });
}

export function getSession(id: string): StoredSession | null {
  return readState().store.sessions[id] ?? null;
}

export function listSessions(status?: StoredSession["status"]) {
  const sessions = Object.values(readState().store.sessions);
  const filtered = status ? sessions.filter((session) => session.status === status) : sessions;
  return filtered.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

export function deleteSession(id: string) {
  const { store } = readState();
  const sessions = { ...store.sessions };
  delete sessions[id];
  writeStore({ ...store, sessions });
}

export function toggleBookmark(questionId: string, next?: boolean) {
  const { store } = readState();
  const set = new Set(store.bookmarks);
  const shouldAdd = next ?? !set.has(questionId);
  if (shouldAdd) set.add(questionId);
  else set.delete(questionId);
  writeStore({ ...store, bookmarks: [...set] });
  return shouldAdd;
}

export function toggleFlag(questionId: string, next?: boolean) {
  const { store } = readState();
  const set = new Set(store.flags);
  const shouldAdd = next ?? !set.has(questionId);
  if (shouldAdd) set.add(questionId);
  else set.delete(questionId);
  writeStore({ ...store, flags: [...set] });
  return shouldAdd;
}

export function setSettings(settings: Partial<FabricStore["settings"]>) {
  const { store } = readState();
  writeStore({ ...store, settings: { ...store.settings, ...settings } });
}

/** Record a finished attempt: per-question mastery plus a session summary. */
export function recordResult(result: SessionResult, questions: string[]) {
  const { store } = readState();
  const questionsState = { ...store.questions };
  for (const questionId of questions) {
    const previous = questionsState[questionId];
    const correct = result.perQuestion[questionId] === true;
    questionsState[questionId] = {
      attempts: (previous?.attempts ?? 0) + 1,
      correct: (previous?.correct ?? 0) + (correct ? 1 : 0),
      lastCorrect: correct,
      lastAt: result.completedAt,
      lastResponse: result.answers[questionId] ?? [],
    };
  }

  const sessions = { ...store.sessions };
  const session = sessions[result.sessionId];
  if (session) {
    sessions[result.sessionId] = {
      ...session,
      status: "completed",
      result,
      updatedAt: result.completedAt,
      deadlineAt: null,
    };
  }

  const history: AttemptHistoryEntry[] = [
    {
      id: result.sessionId,
      mode: result.mode,
      label: result.label,
      completedAt: result.completedAt,
      score: result.score,
      total: result.total,
      percent: result.percent,
      durationSeconds: result.durationSeconds,
      autoSubmitted: result.autoSubmitted,
    },
    ...store.history.filter((entry) => entry.id !== result.sessionId),
  ];

  writeStore({ ...store, questions: questionsState, sessions, history });
}

/** Snapshot of per-question state, used to build learner-aware sessions. */
export function learnerFromStore(store: FabricStore) {
  const attempted = new Set<string>();
  const incorrect = new Set<string>();
  const attempts: Record<string, number> = {};
  for (const [id, stats] of Object.entries(store.questions)) {
    if (stats.attempts > 0) attempted.add(id);
    if (stats.attempts > 0 && !stats.lastCorrect) incorrect.add(id);
    attempts[id] = stats.attempts;
  }
  return {
    attempted,
    incorrect,
    bookmarked: new Set(store.bookmarks),
    flagged: new Set(store.flags),
    attempts,
  };
}

// ---------------------------------------------------------------------------
// Export / import
// ---------------------------------------------------------------------------

export interface ExportEnvelope {
  app: typeof FABRIC_EXPORT_APP;
  version: typeof FABRIC_STORAGE_VERSION;
  exportedAt: string;
  data: FabricStore;
}

export function exportStore(): ExportEnvelope {
  const { store } = readState();
  return {
    app: FABRIC_EXPORT_APP,
    version: FABRIC_STORAGE_VERSION,
    exportedAt: new Date().toISOString(),
    data: store,
  };
}

export interface ImportSummary {
  ok: boolean
  error?: string;
  attemptsAdded: number;
  attemptsSkipped: number;
  bookmarksAdded: number;
  sessionsAdded: number;
  sessionsSkipped: number;
}

/**
 * Merge a previously exported file. Attempts are matched by session id, so
 * importing the same file twice cannot double-count a score.
 */
export function importStore(text: string): ImportSummary {
  const summary: ImportSummary = {
    ok: false,
    attemptsAdded: 0,
    attemptsSkipped: 0,
    bookmarksAdded: 0,
    sessionsAdded: 0,
    sessionsSkipped: 0,
  };
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    return { ...summary, error: "That file is not valid JSON." };
  }
  const payload = isRecord(parsed) && isRecord(parsed.data) ? parsed.data : parsed;
  if (isRecord(payload) && payload.app === FABRIC_EXPORT_APP && payload.version !== FABRIC_STORAGE_VERSION) {
    return { ...summary, error: `Unsupported export version ${String(payload.version)}.` };
  }
  const incoming = normalizeStore(payload);
  if (!incoming) {
    return {
      ...summary,
      error: "The file does not look like a Hansa Fabric progress export (schema version mismatch).",
    };
  }

  const { store } = readState();
  const questions = { ...store.questions };
  for (const [id, stats] of Object.entries(incoming.questions)) {
    const current = questions[id];
    if (!current) {
      questions[id] = stats;
      continue;
    }
    questions[id] = {
      attempts: Math.max(current.attempts, stats.attempts),
      correct: Math.max(current.correct, stats.correct),
      lastCorrect: stats.lastAt > current.lastAt ? stats.lastCorrect : current.lastCorrect,
      lastAt: stats.lastAt > current.lastAt ? stats.lastAt : current.lastAt,
      lastResponse: stats.lastAt > current.lastAt ? stats.lastResponse : current.lastResponse,
    };
  }

  const sessions = { ...store.sessions };
  for (const [id, session] of Object.entries(incoming.sessions)) {
    if (sessions[id]) {
      summary.sessionsSkipped += 1;
      if (sessions[id].updatedAt < session.updatedAt) sessions[id] = session;
      continue;
    }
    sessions[id] = session;
    summary.sessionsAdded += 1;
  }

  const history = [...store.history];
  const known = new Set(history.map((entry) => entry.id));
  for (const entry of incoming.history) {
    if (known.has(entry.id)) {
      summary.attemptsSkipped += 1;
      continue;
    }
    history.push(entry);
    known.add(entry.id);
    summary.attemptsAdded += 1;
  }

  const bookmarks = new Set(store.bookmarks);
  let bookmarksAdded = 0;
  for (const id of incoming.bookmarks) {
    if (!bookmarks.has(id)) {
      bookmarks.add(id);
      bookmarksAdded += 1;
    }
  }

  writeStore({
    ...store,
    questions,
    sessions,
    history,
    bookmarks: [...bookmarks],
    flags: [...new Set([...store.flags, ...incoming.flags])],
  });

  return {
    ...summary,
    ok: true,
    bookmarksAdded,
  };
}

export function clearFabricStore() {
  const { store } = readState();
  try {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(`${FABRIC_STORAGE_KEY}-cleared-${Date.now()}`, JSON.stringify(store));
      window.localStorage.removeItem(FABRIC_STORAGE_KEY);
    }
  } catch {
    // Nothing else to do; fall through to the in-memory reset.
  }
  cachedRaw = null;
  cachedState = null;
  writeStore(emptyStore());
}
