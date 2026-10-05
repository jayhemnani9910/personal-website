import { READER_KEY, writeStorage } from "@/lib/storage";

/**
 * Turn reader mode on or off: a calm, motion-free view. Saved for next visit,
 * then applied with applyReaderMode. Used by the footer toggle and the WebMCP
 * switch_mode tool.
 */
export function setReaderMode(on: boolean): void {
  writeStorage(READER_KEY, on ? "on" : "off");
  applyReaderMode(on);
}

/**
 * Applies reader mode to <html data-reader> and announces it with
 * `readermodechange`, which usePrefersReducedMotion listens for (the same path
 * as the OS setting). Does not save it.
 */
export function applyReaderMode(on: boolean): void {
  if (on) document.documentElement.dataset.reader = "on";
  else delete document.documentElement.dataset.reader;
  window.dispatchEvent(new Event("readermodechange"));
}

export function isReaderMode(): boolean {
  return document.documentElement.dataset.reader === "on";
}
