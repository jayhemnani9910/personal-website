"use client";

import { useEffect, useRef, useState } from "react";
import { useDesk } from "./SecretsProvider";
import { SECRETS } from "./secrets";
import { useJump } from "./useJump";
import { SHELL, WRAP } from "@/components/desk";
import { SCROLL_KEYS } from "./scrollKeys";

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
  const navRef = useRef<HTMLElement>(null);

  // Once the visitor scrolls on, a #section in the URL (from a nav jump or a
  // "say hi" link) no longer says where they are, and Back or a reload would
  // jump to it instead of restoring their place. Any real scroll drops it.
  useEffect(() => {
    const clear = (e: Event) => {
      if (e instanceof KeyboardEvent && !SCROLL_KEYS.has(e.key)) return;
      if (location.hash) history.replaceState(history.state, "", location.pathname + location.search);
    };
    const events = ["wheel", "touchmove", "keydown"] as const;
    events.forEach((e) => window.addEventListener(e, clear, { passive: true }));
    return () => events.forEach((e) => window.removeEventListener(e, clear));
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      // defaultPrevented: the shell above already used this Escape.
      if (e.key !== "Escape" || e.defaultPrevented) return;
      setOpen(false);
      chipRef.current?.focus();
    };
    // A tap anywhere outside the nav closes the panel too; on a phone it
    // covers most of the screen.
    const onPointer = (e: PointerEvent) => {
      if (!navRef.current?.contains(e.target as Node)) setOpen(false);
    };
    // And when keyboard focus leaves the nav: the panel would otherwise cover
    // whatever Tab moves to next, on a narrow screen most of the page.
    const onFocus = (e: FocusEvent) => {
      if (!navRef.current?.contains(e.target as Node)) setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("pointerdown", onPointer);
    window.addEventListener("focusin", onFocus);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("pointerdown", onPointer);
      window.removeEventListener("focusin", onFocus);
    };
  }, [open]);

  const knock = () => {
    knocks.current += 1;
    if (knocks.current === KNOCKS) found("logo", "Knock knock. Who's there? Still Jay.");
  };

  return (
    // A header, so / has the same banner landmark as every other page; the
    // sticky box is the header, so the nav inside it still sticks.
    <header className="sticky-bar sticky top-0 z-20 border-b-[1.5px] border-tr-hairline bg-tr-bg/92 backdrop-blur-[8px]">
      <nav ref={navRef} aria-label="Main">
        {/* The same 1200px column as every inner page's header (SiteHeader), so
            the logo does not jump sideways between / and the rest of the site.
            Relative, so the secrets panel hangs off the column's right edge. */}
        <div className={`${WRAP} ${SHELL} relative flex flex-wrap items-center justify-between gap-x-4 gap-y-2 py-3.5`}>
          <button
            type="button"
            onClick={knock}
            aria-label="jay.hemnani"
            className="cursor-pointer select-none text-[20px] font-extrabold tracking-[-0.02em]"
          >
            jay<span aria-hidden="true" className="text-tr-accent-hand">.</span>hemnani
          </button>
          <div className="order-last flex w-full flex-wrap gap-x-[clamp(12px,3vw,28px)] gap-y-1 font-mono text-[13px] sm:order-none sm:w-auto">
            {ANCHORS.map((a) => (
              <a
                key={a.href}
                href={a.href}
                onClick={(e) => {
                  // A jump closes the secrets panel; on a phone it would cover
                  // the section just jumped to.
                  setOpen(false);
                  jump(a.href)(e);
                }}
              >
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
            className="desk-press cursor-pointer rounded-full border-[1.5px] border-tr-hairline bg-tr-butter px-3 py-[5px] font-mono text-[12px] shadow-[2px_2px_0_var(--tr-text)] [--desk-press:2px]"
          >
            secrets {eggs.length}/{SECRETS.length}
          </button>
          <div
            id="desk-secrets"
            hidden={!open}
            className="absolute right-[clamp(16px,4vw,48px)] top-full z-30 mt-2 max-h-[calc(100dvh-90px)] w-[min(300px,calc(100vw-32px))] overflow-y-auto overscroll-contain rounded-[14px] border-[1.5px] border-tr-hairline bg-tr-surface-1 p-[18px] shadow-[5px_5px_0_var(--tr-text)]"
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
        </div>
      </nav>
    </header>
  );
}
