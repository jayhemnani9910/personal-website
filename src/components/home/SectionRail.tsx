"use client";

import { useLenis } from "lenis/react";
import type { MouseEvent } from "react";
import type { SectionStep } from "@/data/home";
import { scrollToTarget } from "@/lib/scroll";
import { useScrollState } from "./useScrollState";
import { useSectionSpy } from "./useSectionSpy";

export function SectionRail({ steps }: { steps: SectionStep[] }) {
  const { scrolled } = useScrollState();
  const lenis = useLenis();
  const activeIndex = useSectionSpy(steps.map((s) => s.id));

  const jump = (href: string) => (e: MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    scrollToTarget(href, lenis);
  };

  return (
    <ol
      aria-label="Sections"
      className={`fixed top-1/2 right-[clamp(.75rem,2vw,1.5rem)] z-[35] m-0 hidden -translate-y-1/2 list-none flex-col gap-[.9rem] p-0 transition-[transform,opacity] duration-500 ease-[var(--tr-ease)] lg:flex ${
        scrolled ? "translate-x-0 opacity-100 pointer-events-auto" : "translate-x-6 opacity-0 pointer-events-none"
      }`}
    >
      {steps.map((s, i) => {
        const active = i === activeIndex;
        return (
          <li key={s.id}>
            <a
              href={s.href}
              onClick={jump(s.href)}
              data-cursor="JUMP"
              className={`flex items-center justify-end gap-[.6rem] font-mono text-[10.5px] tracking-[.08em] ${
                active ? "text-tr-text" : "text-tr-text-faint"
              }`}
            >
              <span>
                {s.n} {s.label}
              </span>
              <span
                aria-hidden="true"
                className={`h-0.5 rounded-sm transition-[width] duration-[350ms] ${
                  active ? "w-7 bg-tr-ember" : "w-3.5 bg-tr-hairline"
                }`}
              />
            </a>
          </li>
        );
      })}
    </ol>
  );
}
