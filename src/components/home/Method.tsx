import type { ReactNode } from "react";
import Link from "next/link";
import type { Route } from "next";
import { METHOD, COPY } from "@/data/home";

const MONO = 'font-[family-name:var(--ff-mono)] text-[length:var(--tr-t-mono-sm)] tracking-[.1em] text-tr-text-faint';

/** `children` is the WCA cube card slot, a client component owned by another agent. */
export function Method({ children }: { children: ReactNode }) {
  const [methodH2Lead, methodH2Rest] = COPY.methodH2.split(", ");

  return (
    <section
      id="method"
      aria-labelledby="method-h2"
      className="border-t border-tr-hairline py-[clamp(3rem,6vw,5rem)] max-w-[1280px] mx-auto px-[clamp(1rem,4vw,2rem)] grid lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] gap-[clamp(2rem,5vw,5rem)]"
    >
      <div>
        <h2
          id="method-h2"
          className="text-[length:var(--tr-t-h2)] leading-[var(--tr-lh-h2)] tracking-[-.025em] font-medium [text-wrap:balance]"
        >
          {methodH2Lead},
          <br />
          {methodH2Rest}
        </h2>
        <p className="mt-5 max-w-[40ch] text-tr-text-mute [text-wrap:pretty]">{COPY.methodDeck}</p>
        <div className="mt-8">{children}</div>
      </div>

      <ol className="grid sm:grid-cols-2 gap-px bg-tr-hairline border border-tr-hairline rounded-[var(--tr-r-lg)] overflow-hidden list-none m-0 p-0">
        {METHOD.map((m) => (
          <li
            key={m.n}
            className="bg-tr-surface-1 hover:bg-tr-surface-2 transition-colors p-6 min-h-[210px] flex flex-col gap-4"
          >
            <span className={`${MONO} text-tr-accent`}>{m.n}</span>
            <p className="text-[length:var(--tr-t-h3)] leading-[var(--tr-lh-h3)] font-medium">{m.rule}</p>
            <p className="text-tr-text-mute">{m.why}</p>
            {/* Cast: typedRoutes needs the literal at the call site, and this one
                arrives from src/data/home.ts. Backed by home.test.ts, which checks
                every METHOD href points at a real content/projects file. */}
            <Link href={m.href as Route} data-cursor="OPEN" className={`${MONO} mt-auto hover:text-tr-accent`}>
              ← {m.from}
            </Link>
          </li>
        ))}
      </ol>
    </section>
  );
}
