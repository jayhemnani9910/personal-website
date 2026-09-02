import type { ReactNode } from "react";
import { COPY } from "@/data/home";

const MONO = 'font-[family-name:var(--ff-mono)] text-[length:var(--tr-t-mono-xs)] text-tr-text-faint';

/**
 * `children` is the receipts grid, a client component. The heading lives out
 * here rather than inside it so it renders on the server: a section heading
 * that only appears after hydration is missing from the document a crawler or
 * a reader-mode visitor sees, and heading order is what the accessibility
 * score is measured on.
 */
export function Proof({ children }: { children: ReactNode }) {
  return (
    <section
      id="proof"
      aria-labelledby="proof-h2"
      className="border-t border-tr-hairline py-[clamp(3rem,6vw,5rem)] max-w-[1280px] mx-auto px-[clamp(1rem,4vw,2rem)]"
    >
      <div className="flex flex-wrap justify-between items-baseline gap-8 mb-6">
        <h2
          id="proof-h2"
          className="text-[length:var(--tr-t-h2)] leading-[var(--tr-lh-h2)] tracking-[-.025em] font-medium"
        >
          {COPY.proofH2}
        </h2>
        <p className={MONO}>{COPY.proofAside}</p>
      </div>
      {children}
    </section>
  );
}
