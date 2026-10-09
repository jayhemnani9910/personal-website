"use client";

import { useEffect, useRef, useState } from "react";
import { useDesk } from "./SecretsProvider";
import { SECRETS } from "./secrets";
import { useJump } from "./useJump";

const ANCHORS = [
  { label: "today", href: "#today" },
  { label: "work", href: "#work" },
  { label: "guestbook", href: "#guestbook" },
  { label: "say hi", href: "#hi" },
];

const KNOCKS = 5;

export function DeskNav() {
  const { eggs, found } = useDesk();
  const jump = useJump();
  const [open, setOpen] = useState(false);
  const knocks = useRef(0);
  const chipRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      setOpen(false);
      chipRef.current?.focus();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const knock = () => {
    knocks.current += 1;
    if (knocks.current === KNOCKS) found("logo", "Knock knock. Who's there? Still Jay.");
  };

  return (
    <>
      <nav
        aria-label="Page"
        className="sticky top-0 z-20 flex items-center justify-between gap-4 border-b-[1.5px] border-tr-hairline bg-tr-bg/92 px-[clamp(16px,4vw,48px)] py-3.5 backdrop-blur-[8px]"
      >
        <button
          type="button"
          onClick={knock}
          aria-label="jay.hemnani"
          className="cursor-pointer select-none text-[20px] font-extrabold tracking-[-0.02em]"
        >
          jay<span aria-hidden="true" className="text-tr-accent-hand">.</span>hemnani
        </button>
        <div className="hidden flex-wrap gap-[clamp(12px,3vw,28px)] font-mono text-[13px] sm:flex">
          {ANCHORS.map((a) => (
            <a key={a.href} href={a.href} onClick={jump(a.href)}>
              {a.label}
            </a>
          ))}
        </div>
        <button
          ref={chipRef}
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-controls="desk-secrets"
          className="desk-press cursor-pointer rounded-full border-[1.5px] border-tr-hairline bg-tr-butter px-3 py-[7px] font-mono text-[12px] shadow-[2px_2px_0_var(--tr-text)] [--desk-press:2px]"
        >
          secrets {eggs.length}/{SECRETS.length}
        </button>
      </nav>

      <div
        id="desk-secrets"
        hidden={!open}
        className="fixed right-[clamp(16px,4vw,48px)] top-16 z-30 w-[min(300px,calc(100vw-32px))] rounded-[14px] border-[1.5px] border-tr-hairline bg-tr-surface-1 p-[18px] shadow-[5px_5px_0_var(--tr-text)]"
      >
        <p className="mb-2.5 font-mono text-[11px] uppercase tracking-[0.08em] text-tr-text-faint">hidden around this page</p>
        <ul>
          {SECRETS.map((s) => {
            const got = eggs.includes(s.id);
            return (
              <li key={s.id} className="flex items-start gap-2.5 border-t border-dashed border-tr-rule-soft py-2">
                <span aria-hidden="true" className="w-[18px] text-[16px]">
                  {got ? "★" : "☆"}
                </span>
                <div>
                  <p className="text-[15px] font-semibold">
                    {got ? s.title : "???"}
                    <span className="sr-only">{got ? " (found)" : " (not found yet)"}</span>
                  </p>
                  <p className="text-[13px] text-tr-text-faint">{s.hint}</p>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </>
  );
}
