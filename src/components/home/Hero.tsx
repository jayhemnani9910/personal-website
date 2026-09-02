import type { ReactNode } from "react";
import { HERO } from "@/data/home";

// Status line (role / location / live badge): 11.5px mono, .06em tracking, per comp.
const STATUS_MONO =
  'font-[family-name:var(--ff-mono)] text-[length:var(--tr-t-mono)] tracking-[.06em] text-tr-text-faint';
// The hero's `//` asides: 11.5px mono, normal tracking, 1.8 line-height, per comp.
const ASIDE_MONO =
  'font-[family-name:var(--ff-mono)] text-[length:var(--tr-t-mono)] tracking-normal leading-[var(--tr-lh-loose)] text-tr-text-faint';

/**
 * The brief console. `children` is the Decomposer slot (a client component
 * owned by another agent) rendered to the right of the h1 + deck.
 */
export function Hero({ children }: { children: ReactNode }) {
  const [line1, line2, live] = HERO.status;

  return (
    <section
      id="brief"
      className="pt-[clamp(3rem,7vw,6rem)] pb-[clamp(3rem,6vw,5rem)] max-w-[1280px] mx-auto px-[clamp(1rem,4vw,2rem)]"
    >
      <p className={`${STATUS_MONO} mb-8 flex flex-wrap gap-[.5rem_1.25rem]`}>
        <span className="text-tr-text-mute">{line1}</span>
        <span className="text-tr-text-faint">{line2}</span>
        <span className="inline-flex items-center gap-[.4rem] text-tr-ok">
          <span aria-hidden className="w-1.5 h-1.5 rounded-full bg-tr-ok" />
          {live}
        </span>
      </p>

      <div className="grid lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] gap-[clamp(2rem,5vw,5rem)] items-start">
        <div>
          <h1 className="text-[length:var(--tr-t-display)] leading-[var(--tr-lh-display)] tracking-[-.035em] font-medium [text-wrap:balance]">
            {HERO.h1}
          </h1>
          <p className="mt-6 max-w-[36ch] text-[length:var(--tr-t-deck)] leading-[var(--tr-lh-prose)] text-tr-text-mute [text-wrap:pretty]">
            {HERO.deck}
          </p>
          <p className={`${ASIDE_MONO} mt-6`}>
            {HERO.aside.map((line, i) => (
              <span key={line}>
                {line}
                {i < HERO.aside.length - 1 && <br />}
              </span>
            ))}
          </p>
        </div>

        {children}
      </div>
    </section>
  );
}
