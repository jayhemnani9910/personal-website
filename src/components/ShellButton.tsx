"use client";

import { useTerminal } from "@/context/TerminalContext";

/**
 * The visible way into the shell. The keyboard shortcuts (backtick, Ctrl/Cmd+K)
 * stay; this is for a phone or a mouse, which have no backtick to press.
 */
export function ShellButton({ className }: { className?: string }) {
  const { toggleTerminal } = useTerminal();
  return (
    <button type="button" onClick={toggleTerminal} aria-keyshortcuts="` Control+K Meta+K" className={className}>
      open the shell
    </button>
  );
}
