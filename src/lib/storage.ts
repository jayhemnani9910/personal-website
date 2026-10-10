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
