"use client";

import { useSyncExternalStore } from "react";
import { cairoDay } from "@/lib/knowledge/daily-bank";

function subscribe(onChange: () => void) {
  const timer = window.setInterval(onChange, 1000);
  window.addEventListener("pageshow", onChange);
  document.addEventListener("visibilitychange", onChange);
  return () => {
    window.clearInterval(timer);
    window.removeEventListener("pageshow", onChange);
    document.removeEventListener("visibilitychange", onChange);
  };
}

const getToday = () => cairoDay(new Date());
const getServerSnapshot = () => null;

export function useLiveDay() {
  return useSyncExternalStore(subscribe, getToday, getServerSnapshot);
}
