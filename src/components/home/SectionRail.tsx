"use client";

import type { SectionStep } from "@/data/home";
import { useJump } from "./useJump";
import { useScrolled } from "./useScrollState";
import { useSectionSpy } from "./useSectionSpy";

export function SectionRail({ steps }: { steps: SectionStep[] }) {
  const scrolled = useScrolled();
  const jump = useJump();
  const activeIndex = useSectionSpy(steps.map((s) => s.id));

  // Hidden at the top of the page, and `inert` then too: opacity 0 also hides
  // the focus ring, so the links must leave the tab order, not just the view.
  return (
    <nav
      aria-label="Sections"
      inert={!scrolled}
      className={`fixed top-1/2 right-[clamp(.75rem,2vw,1.5rem)] z-[35] hidden -translate-y-1/2 transition-[transform,opacity] duration-500 ease-[var(--tr-ease)] lg:block ${
        scrolled ? "translate-x-0 opacity-100 pointer-events-auto" : "translate-x-6 opacity-0 pointer-events-none"
      }`}
    >
      <ol className="m-0 flex list-none flex-col gap-[.9rem] p-0">
        {steps.map((s, i) => {
          const active = i === activeIndex;
          return (
            <li key={s.id}>
              <a
                href={s.href}
                onClick={jump(s.href)}
                aria-current={active ? "location" : undefined}
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
                    active ? "w-7 bg-tr-accent" : "w-3.5 bg-tr-hairline"
                  }`}
                />
              </a>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
