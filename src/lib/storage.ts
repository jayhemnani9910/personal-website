// localStorage throws (SecurityError) when a browser blocks site data, and is
// null in some privacy modes. Every read and write goes through these, so a
// blocked store means "nothing saved", never a crashed page.

/**
 * The visitor's own theme choice. Written only when they (or the WebMCP
 * toggle_theme tool) change it, never for the default, so a stored value always
 * means a real choice. The name moved from "theme" in 2026-09: the old key was
 * written on every visit, including the pre-ADR-0015 OS-light default, so its
 * values cannot be trusted as choices.
 */
export const THEME_KEY = "theme-choice";
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
