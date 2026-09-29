import { useEffect } from "react";

// The shell's `brief` and `cube` commands act on the home page. From any other
// page they navigate to / first, and a window event fired across that
// navigation reaches no one: the home page's listeners mount only after the
// new route commits, and window events are not replayed. So the intent rides
// across in sessionStorage and the home page takes it once, on mount.

export type ShellIntent = { kind: "brief"; text: string } | { kind: "cube" };

const KEY = "shell-intent";

/** Fires the window event the home page listens for. */
export function dispatchShellIntent(intent: ShellIntent): void {
    window.dispatchEvent(
        intent.kind === "brief" ? new CustomEvent("v4:brief", { detail: intent.text }) : new Event("v4:cube"),
    );
}

export function saveShellIntent(intent: ShellIntent): void {
    try {
        window.sessionStorage.setItem(KEY, JSON.stringify(intent));
    } catch {
        // Blocked storage: the navigation still happens, the action does not.
    }
}

/** Removes and returns the stored intent, if there is one of this kind. */
export function takeShellIntent(kind: ShellIntent["kind"]): ShellIntent | null {
    try {
        const raw = window.sessionStorage.getItem(KEY);
        if (!raw) return null;
        const intent = JSON.parse(raw) as ShellIntent;
        if (intent.kind !== kind) return null;
        window.sessionStorage.removeItem(KEY);
        return intent;
    } catch {
        return null;
    }
}

/**
 * Replays a stored intent of this kind as its window event, once, on mount.
 * Call it after the effect that adds the listener: effects run in order, so
 * the listener is in place by then.
 */
export function useShellIntent(kind: ShellIntent["kind"]): void {
    useEffect(() => {
        const intent = takeShellIntent(kind);
        if (intent) dispatchShellIntent(intent);
    }, [kind]);
}
