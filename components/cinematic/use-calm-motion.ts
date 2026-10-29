"use client";
// `prefers-reduced-motion`, read without breaking hydration.
//
// `useSyncExternalStore` guarantees that hydration uses the *server* snapshot,
// so the statically exported HTML and the first client render always agree. Only
// after hydration does React read the real preference and re-render. The motion
// library's own `useReducedMotion` can resolve during the first client render,
// which turns any reduced-motion substitution into a text/attribute mismatch on
// a prerendered page; this hook exists to avoid that, not to replace the CSS
// media query (which remains the primary, JavaScript-free path).

import { useSyncExternalStore } from "react";

const QUERY = "(prefers-reduced-motion: reduce)";

function subscribe(onChange: () => void) {
  if (typeof window.matchMedia !== "function") return () => {};
  const query = window.matchMedia(QUERY);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}

function getSnapshot() {
  return typeof window.matchMedia === "function"
    ? window.matchMedia(QUERY).matches
    : false;
}

/** The server and the first client render always say "no preference". */
function getServerSnapshot() {
  return false;
}

export function useCalmMotion() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
