import type { ReactNode } from "react";
import { buildHero } from "@/data/home";
import { RoleCycle } from "./RoleCycle";

// Status line (rotating role / location / live badge). The comp set this at
// 11.5px in --tr-text-faint, which measures 3.39:1; it is the first line a
// visitor reads, so it is a step larger and in --tr-text-mute at 7.41:1.
const STATUS_MONO =
  'font-[family-name:var(--ff-mono)] text-[length:var(--tr-t-mono-lg)] tracking-[.06em] text-tr-text-mute';

/**
 * The brief console. `children` is the Decomposer slot (a client component
 * owned by another agent) rendered to the right of the h1 + deck.
 */
export function Hero({ children }: { children: ReactNode }) {
  const HERO = buildHero();

  return (
    <section
      id="brief"
      className="pt-[clamp(3rem,7vw,6rem)] pb-[clamp(3rem,6vw,5rem)] max-w-[1280px] mx-auto px-[clamp(1rem,4vw,2rem)]"
    >
      <p className={`${STATUS_MONO} mb-8 flex flex-wrap items-center gap-[.5rem_1.25rem]`}>
        <RoleCycle className="text-tr-accent-ink" />
        {HERO.status.map((item, i) =>
          i === HERO.status.length - 1 ? (
            <span key={item} className="inline-flex items-center gap-[.4rem] text-tr-ok">
              <span aria-hidden className="w-1.5 h-1.5 rounded-full bg-tr-ok" />
              {item}
            </span>
          ) : (
            <span key={item} className="text-tr-text-mute">
              {item}
            </span>
          ),
        )}
      </p>

      <div className="grid lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] gap-[clamp(2rem,5vw,5rem)] items-start">
        <div>
          <h1 className="text-[length:var(--tr-t-display)] leading-[var(--tr-lh-display)] tracking-[-.035em] font-medium [text-wrap:balance]">
            {HERO.h1}
          </h1>
          <p className="mt-6 max-w-[36ch] text-[length:var(--tr-t-deck)] leading-[var(--tr-lh-prose)] text-tr-text-mute [text-wrap:pretty]">
            {HERO.deck}
          </p>
        </div>

        {children}
      </div>
    </section>
  );
}
