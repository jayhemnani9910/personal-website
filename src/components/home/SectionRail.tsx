"use client";

import { useLenis } from "lenis/react";
import { Buddy } from "@/components/Buddy";
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
          <li key={s.id} className="relative">
            {/* Buddy rides the rail: it renders inside whichever step is
                current, so it steps down the markers as you scroll instead of
                sitting in the footer where nobody looks. Mounting it in the
                active <li> rather than translating one shared instance means
                no measured row pitch to keep in sync with the gap, at the cost
                of remounting it on each section change. That reset is not
                visible: its blink and idle-word timers restart from a random
                delay anyway. `right-full` is the <li>'s edge, and flex-col
                stretches every <li> to the widest label, so it lands on the
                same x for all five. */}
            {active && (
              <span
                aria-hidden="true"
                className="absolute right-full top-1/2 mr-[.7rem] -translate-y-1/2"
              >
                {/* Separate element for the entrance: v4-line-in ends on
                    `transform: none`, which on the positioning span would
                    cancel its -translate-y-1/2 and drop Buddy half a row. */}
                <span className="block animate-[v4-line-in_.4s_cubic-bezier(.16,1,.3,1)_both]">
                  <Buddy variant="mini" />
                </span>
              </span>
            )}
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
                  active ? "w-7 bg-tr-accent" : "w-3.5 bg-tr-hairline"
                }`}
              />
            </a>
          </li>
        );
      })}
    </ol>
  );
}
