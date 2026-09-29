"use client";

import { useId, useState } from "react";
import Link from "next/link";
import type { Route } from "next";
import type { Receipt } from "@/data/home";

// No per-tile stagger: it ran at first paint, while RevealSection still held
// the proof section at opacity 0, so anyone who scrolled here never saw it.
// The section's own reveal is the entrance.
export function Receipts({ receipts }: { receipts: Receipt[] }) {
  const [openIndex, setOpenIndex] = useState(-1);
  const open = openIndex >= 0 ? receipts[openIndex] : null;
  const panelId = useId();
  const titleId = useId();

  const toggle = (i: number) => setOpenIndex((current) => (current === i ? -1 : i));

  return (
    <div>
      <div
        className={`grid grid-cols-2 gap-px bg-tr-hairline border border-tr-hairline overflow-hidden sm:grid-cols-3 lg:grid-cols-6 ${
          open ? "rounded-t-[var(--tr-r-lg)]" : "rounded-[var(--tr-r-lg)]"
        }`}
      >
        {receipts.map((r, i) => {
          const isOpen = i === openIndex;
          return (
            <button
              key={`${r.title}-${r.n}`}
              type="button"
              aria-expanded={isOpen}
              aria-controls={panelId}
              data-cursor="PROOF"
              onClick={() => toggle(i)}
              className={`group flex flex-col gap-[.9rem] p-[1.25rem_1.1rem] text-left focus-visible:-outline-offset-2 transition-colors ${
                isOpen ? "bg-tr-surface-2" : "bg-tr-surface-1 hover:bg-tr-surface-2"
              }`}
            >
              <span
                className={`text-[length:var(--tr-t-stat)] leading-[var(--tr-lh-numeral)] tracking-[-.04em] font-medium tabular-nums transition-colors ${
                  isOpen ? "text-tr-accent-ink" : "text-tr-text group-hover:text-tr-accent-ink"
                }`}
              >
                {r.n}
              </span>
              <span className="text-[12.5px] leading-[var(--tr-lh-card)] text-tr-text-mute">{r.label}</span>
              <span
                className={`mt-auto font-mono text-[length:var(--tr-t-mono-sm)] ${
                  isOpen ? "text-tr-accent-ink" : "text-tr-text"
                }`}
              >
                <span aria-hidden="true">{isOpen ? "▲" : "▼"}</span> {isOpen ? "close" : r.cta}
              </span>
            </button>
          );
        })}
      </div>

      {open && (
        <div
          id={panelId}
          role="region"
          aria-labelledby={titleId}
          className="grid gap-8 p-6 bg-tr-surface-1 border border-t-0 border-tr-hairline rounded-b-[var(--tr-r-lg)] lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]"
        >
          <div>
            <p className="m-0 mb-2 font-mono text-[length:var(--tr-t-mono)] tracking-[.1em] text-tr-text-mute">
              RECEIPT · {open.n}
            </p>
            <p id={titleId} className="m-0 text-[17px] font-medium">
              {open.title}
            </p>
            <p className="mt-2 mb-0 text-tr-text-mute">{open.note}</p>
          </div>
          <ul className="list-none m-0 p-0 flex flex-col">
            {open.lines.map((l) => {
              const external = l.href.startsWith("https://");
              const inner = (
                <>
                  <span aria-hidden="true" className="text-tr-ok font-mono text-[11px]">
                    ✓
                  </span>
                  {l.text}
                </>
              );
              // href alone is not unique: the tools receipt has three lines
              // pointing at the same project page.
              return (
                <li
                  key={`${l.href}-${l.text}`}
                  className="grid grid-cols-[minmax(0,1fr)_auto] gap-4 py-[.6rem] border-t border-tr-hairline text-[13.5px]"
                >
                  {external ? (
                    <a
                      href={l.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      data-cursor="OPEN"
                      className="flex items-baseline gap-[.6rem]"
                    >
                      {inner}
                    </a>
                  ) : (
                    /* Cast: typedRoutes needs the literal at the call site, and this
                       one comes from src/data/home.ts. home.test.ts asserts every
                       internal receipt href is a known route or a real project file. */
                    <Link href={l.href as Route} data-cursor="OPEN" className="flex items-baseline gap-[.6rem]">
                      {inner}
                    </Link>
                  )}
                  <span className="font-mono text-[length:var(--tr-t-mono)] text-tr-text-mute">{l.meta}</span>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
