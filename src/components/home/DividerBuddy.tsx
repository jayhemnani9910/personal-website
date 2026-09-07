"use client";

import { createContext, useContext, type ReactNode } from "react";
import { Buddy } from "@/components/Buddy";
import { useLastRuleInView } from "./useLastRuleInView";

/**
 * The five home sections that open with a hairline divider, in page order.
 * Not SECTIONS from src/data/home.ts: that list drives the right-hand rail and
 * starts at the hero, which has no rule above it, and it skips the log, which
 * has one. This is the list of actual rules on the page.
 */
export const DIVIDER_IDS = ["proof", "work", "method", "log", "contact"] as const;

const ActiveDivider = createContext(0);

/**
 * Publishes which divider Buddy is standing on. One IntersectionObserver for
 * the whole page, rather than one per section, which is the only reason this
 * is a context and not a hook each slot calls for itself.
 *
 * The rail next door runs its own observer on a different question, and the two
 * are meant to disagree: the rail highlights the section you are reading, while
 * Buddy follows the last rule to come into view, so he is on screen rather than
 * a screen behind. See useLastRuleInView.
 */
export function DividerBuddyProvider({ children }: { children: ReactNode }) {
  const active = useLastRuleInView(DIVIDER_IDS);
  // -1 is "before hydration, and before any rule has come into view", which is
  // the whole time the visitor is still at the top of the hero. The first rule
  // is the one visible from there, so that is where Buddy waits.
  return <ActiveDivider.Provider value={active < 0 ? 0 : active}>{children}</ActiveDivider.Provider>;
}

/**
 * Buddy standing on one section's divider, drawn only while that section is
 * the one being read.
 *
 * `bottom-full` puts its feet exactly on the parent's top edge, which is the
 * rule, so nothing here has to know a row height or measure an offset. It also
 * leaves the transform free for the entrance animation, which `top-0` plus a
 * translate would not.
 */
export function DividerBuddy({ index }: { index: number }) {
  const active = useContext(ActiveDivider);
  if (index !== active) return null;

  return (
    <span
      aria-hidden="true"
      className="absolute bottom-full left-1/2 z-[2] mb-[.15rem] -translate-x-1/2"
    >
      <span className="block animate-[v4-line-in_.45s_cubic-bezier(.16,1,.3,1)_both]">
        <Buddy variant="full" className="buddy-on-rule" />
      </span>
    </span>
  );
}
