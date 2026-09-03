"use client";

import { useState } from "react";
import Link from "next/link";
import type { Route } from "next";
import type { Receipt } from "@/data/home";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";

const STAGGER_MS = 70;

export function Receipts({ receipts }: { receipts: Receipt[] }) {
  const reduced = usePrefersReducedMotion();
  const [openIndex, setOpenIndex] = useState(-1);
  const open = openIndex >= 0 ? receipts[openIndex] : null;

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
              data-cursor="PROOF"
              onClick={() => toggle(i)}
              style={reduced ? undefined : { animationDelay: `${i * STAGGER_MS}ms` }}
              className={`flex flex-col gap-[.9rem] p-[1.25rem_1.1rem] text-left transition-colors ${
                isOpen ? "bg-tr-surface-2" : "bg-tr-surface-1 hover:bg-tr-surface-2"
              } ${reduced ? "" : "animate-[v4-line-in_.4s_cubic-bezier(.16,1,.3,1)_both]"}`}
            >
              <span
                className={`text-[length:var(--tr-t-stat)] leading-[var(--tr-lh-numeral)] tracking-[-.04em] font-medium tabular-nums ${
                  isOpen ? "text-tr-accent" : "text-tr-text"
                }`}
              >
                {r.n}
              </span>
              <span className="text-[12.5px] leading-[var(--tr-lh-card)] text-tr-text-mute">{r.label}</span>
              <span
                className={`mt-auto font-mono text-[length:var(--tr-t-mono-sm)] ${
                  isOpen ? "text-tr-accent" : "text-tr-text"
                }`}
              >
                {isOpen ? "▲ close" : `▼ ${r.cta}`}
              </span>
            </button>
          );
        })}
      </div>

      {open && (
        <div className="grid gap-8 p-6 bg-tr-surface-1 border border-t-0 border-tr-hairline rounded-b-[var(--tr-r-lg)] lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]">
          <div>
            <p className="m-0 mb-2 font-mono text-[length:var(--tr-t-mono-sm)] tracking-[.1em] text-tr-text-faint">
              RECEIPT · {open.n}
            </p>
            <p className="m-0 text-[17px] font-medium">{open.title}</p>
            <p className="mt-2 mb-0 text-tr-text-mute">{open.note}</p>
          </div>
          <ul className="list-none m-0 p-0 flex flex-col">
            {open.lines.map((l) => {
              const external = l.href.startsWith("https://");
              const inner = (
                <>
                  <span className="text-tr-ok font-mono text-[11px]">✓</span>
                  {l.text}
                </>
              );
              return (
                <li
                  key={l.href}
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
                  <span className="font-mono text-[11px] text-tr-text-faint">{l.meta}</span>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
