"use client";

import { LazyMotion, domAnimation } from "framer-motion";
import type { ReactNode } from "react";

// LazyMotion + `m` is the site's biggest bundle lever. Measured, not assumed:
// the shared framer-motion chunk went from 31.4 kB brotli to 20.4 kB, which every
// route pays, and that alone brought /projects/[id] back under its budget.
//
// Every animated component MUST use `m.*`, never `motion.*`. A single `motion.*`
// import anywhere re-pulls the full feature set and silently undoes this. (Proof
// it is real: /personal and /jh still import `motion` and now carry an extra
// 11.6 kB chunk that no other route loads.)
//
// The async feature loader — `features={() => import("framer-motion").then(m => m.domAnimation)}`
// — was tried and REVERTED. It is the form framer-motion's docs recommend for
// deferring the feature bundle out of first-load, but here it moved exactly zero
// bytes: Turbopack keeps framer-motion in one chunk regardless, because `m` and
// `LazyMotion` already pull the package into the shared graph, so the dynamic
// import resolves to the same chunk. It bought nothing and added a window where
// animations do not run. Do not reintroduce it without re-measuring.
export function MotionProvider({ children }: { children: ReactNode }) {
  return <LazyMotion features={domAnimation}>{children}</LazyMotion>;
}
