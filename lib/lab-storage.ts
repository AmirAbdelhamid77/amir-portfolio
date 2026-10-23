"use client";

import { useSyncExternalStore } from "react";

export type StoredResult = { best: number; attempts: number; lastAt: string };
type LabStore = Record<string, StoredResult>;

export const LAB_STORAGE_KEY = "amir-lab-v1";

const EMPTY: LabStore = {};
let cachedRaw: string | null = null;
let cached: LabStore = EMPTY;
const listeners = new Set<() => void>();

function emit() {
  for (const listener of listeners) listener();
}

export function subscribeLabStore(listener: () => void) {
  listeners.add(listener);
  const onStorage = (event: StorageEvent) => {
    if (event.key === null || event.key === LAB_STORAGE_KEY) {
      cachedRaw = null;
      listener();
    }
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

export function getLabStore(): LabStore {
  try {
    const raw = window.localStorage.getItem(LAB_STORAGE_KEY);
    if (raw === cachedRaw) return cached;
    cachedRaw = raw;
    cached = raw ? (JSON.parse(raw) as LabStore) : EMPTY;
    return cached;
  } catch {
    return EMPTY;
  }
}

export function getServerLabStore(): LabStore {
  return EMPTY;
}

export function saveLabResult(slug: string, result: StoredResult) {
  try {
    const current = getLabStore();
    const next = { ...current, [slug]: result };
    window.localStorage.setItem(LAB_STORAGE_KEY, JSON.stringify(next));
    cachedRaw = null;
    cached = next;
    emit();
  } catch {
    // Storage can be blocked; the exam still works for this session.
  }
}

export function useLabStore() {
  return useSyncExternalStore(subscribeLabStore, getLabStore, getServerLabStore);
}
