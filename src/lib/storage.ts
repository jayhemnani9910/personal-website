// localStorage throws (SecurityError) when a browser blocks site data, and is
// null in some privacy modes. Every read and write goes through these, so a
// blocked store means "nothing saved", never a crashed page.

export const READER_KEY = "reader-mode";

export function readStorage(key: string): string | null {
    try {
        return window.localStorage.getItem(key);
    } catch {
        return null;
    }
}

export function writeStorage(key: string, value: string): void {
    try {
        window.localStorage.setItem(key, value);
    } catch {
        // Blocked storage: the choice lasts for this page view only.
    }
}

export function removeStorage(key: string): void {
    try {
        window.localStorage.removeItem(key);
    } catch {
        // Blocked storage held nothing to remove.
    }
}

// Saved by earlier versions of the site (the dark theme, the intro preloader,
// the old site modes) and read by nothing now. Cleared on load so a returning
// visitor's browser holds only what the privacy page lists.
const RETIRED_KEYS = ["theme", "theme-choice", "tr-intro-seen", "site-mode", "shell-intent"];

export function dropRetiredKeys(): void {
    RETIRED_KEYS.forEach(removeStorage);
}
