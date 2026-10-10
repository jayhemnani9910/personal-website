"use client";

import { useSyncExternalStore } from "react";
import { readStorage, writeStorage } from "@/lib/storage";

// The two things the Desk page remembers per visitor: how many visits, and
// which secrets they found. Read through useSyncExternalStore so the server
// and the first client render agree (both see nothing), then the stored value
// lands a frame later without a setState in an effect.
//
// `memory` holds a write only when storage refused it, so a browser that
// blocks storage still keeps the count and the secrets for this page view.

export const VISITS_KEY = "jh_visits";
export const EGGS_KEY = "jh_eggs";
const SESSION_FLAG = "jh_visit_counted";

const listeners = new Set<() => void>();
const memory = new Map<string, string>();

function subscribe(callback: () => void) {
  listeners.add(callback);
  return () => {
    listeners.delete(callback);
  };
}

function read(key: string): string | null {
  return readStorage(key) ?? memory.get(key) ?? null;
}

export function writeStored(key: string, value: string): void {
  writeStorage(key, value);
  if (readStorage(key) === value) memory.delete(key);
  else memory.set(key, value);
  listeners.forEach((l) => l());
}

/** The raw stored string, or null on the server and before hydration. */
export function useStored(key: string): string | null {
  return useSyncExternalStore(subscribe, () => read(key), () => null);
}

export function parseEggs(raw: string | null): string[] {
  try {
    const value: unknown = JSON.parse(raw ?? "[]");
    return Array.isArray(value) ? value.filter((v): v is string => typeof v === "string") : [];
  } catch {
    return [];
  }
}

export function readEggs(): string[] {
  return parseEggs(read(EGGS_KEY));
}

let counted = false;

/**
 * Counts this visit once per browser session, so a reload is not a new visit.
 * The session flag is set before counting, so React's double effect in
 * development counts once too.
 */
export function countVisit(): void {
  try {
    if (window.sessionStorage.getItem(SESSION_FLAG)) return;
    window.sessionStorage.setItem(SESSION_FLAG, "1");
  } catch {
    // Blocked session storage: fall back to once per page load.
    if (counted) return;
    counted = true;
  }
  const visits = Number(read(VISITS_KEY)) || 0;
  writeStored(VISITS_KEY, String(visits + 1));
}

/** The visit count, or null until it is known on the client. */
export function useVisits(): number | null {
  const raw = useStored(VISITS_KEY);
  if (raw === null) return null;
  return Math.max(1, Number(raw) || 1);
}
