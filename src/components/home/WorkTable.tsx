import Link from "next/link";
import type { FeaturedProject } from "@/data/home";
import { COPY } from "@/data/home";

const MONO = 'font-[family-name:var(--ff-mono)] text-[length:var(--tr-t-mono-sm)] tracking-[.1em] text-tr-text-faint';
// Both of these spell the five-column track list out in full rather than
// sharing a constant, and the duplication is the point. Tailwind v4 discovers
// classes by scanning source text for literal candidates, so `lg:${HEADER_COLS}`
// produces a string at runtime that the scanner never saw at build time: the
// rule is simply never generated. That shipped. The row rendered as two stacked
// columns at every width, and the baselines locked it in, because a screenshot
// of a wrong layout looks exactly like a screenshot of a right one.
const HEADER_COLS = "grid-cols-[3rem_minmax(0,1.1fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,.8fr)]";
const ROW_COLS =
  "grid-cols-[2.5rem_minmax(0,1fr)] gap-[.9rem_1rem] lg:grid-cols-[3rem_minmax(0,1.1fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,.8fr)] lg:gap-6";

export function WorkTable({ projects, total }: { projects: FeaturedProject[]; total: number }) {
  return (
    <section
      id="work"
      aria-labelledby="work-h2"
      className="border-t border-tr-hairline py-[clamp(3rem,6vw,5rem)] max-w-[1280px] mx-auto px-[clamp(1rem,4vw,2rem)]"
    >
      <div className="grid lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] gap-[clamp(2rem,5vw,5rem)] items-end mb-8">
        <h2
          id="work-h2"
          className="text-[length:var(--tr-t-h2)] leading-[var(--tr-lh-h2)] tracking-[-.025em] font-medium"
        >
          {projects.length} of {total}.
        </h2>
        <p className="max-w-[56ch] text-tr-text-mute [text-wrap:pretty]">{COPY.workDeck}</p>
      </div>

      <div className={`hidden lg:grid ${HEADER_COLS} gap-6 pb-[.6rem] border-b border-tr-hairline ${MONO}`}>
        <span>#</span>
        <span>PROJECT</span>
        <span>ARRIVED AS</span>
        <span>WHAT I DID</span>
        <span>WHAT CHANGED</span>
      </div>

      <ol className="list-none m-0 p-0">
        {projects.map((p) => (
          <li key={p.id} className="relative border-b border-tr-hairline">
            {/* Absolutely positioned, so it can follow the link in the DOM (needed for
                the peer-hover selector below) without moving where it renders. */}
            <Link
              href={`/projects/${p.id}`}
              data-cursor="OPEN"
              className={`peer group grid ${ROW_COLS} py-[1.35rem] items-start`}
            >
              <span className={`${MONO} text-tr-text-faint group-hover:text-tr-ember`}>{p.num}</span>

              <span className="group-hover:translate-x-1.5 transition-transform">
                <span className="block text-[length:var(--tr-t-h3)] leading-[var(--tr-lh-h3)] tracking-[-.02em] font-medium">
                  {p.title}
                </span>
                <span className="flex flex-wrap gap-[.35rem] mt-[.6rem]">
                  {p.tech.map((t) => (
                    <span
                      key={t}
                      className={`${MONO} border border-tr-hairline rounded-[var(--tr-r-sm)] px-1.5 py-0.5 text-tr-text-mute tracking-normal`}
                    >
                      {t}
                    </span>
                  ))}
                </span>
              </span>

              <span className="text-[13.5px] leading-[var(--tr-lh-prose)] text-tr-text-mute">
                <span className={`${MONO} lg:hidden block mb-[2px]`}>ARRIVED AS</span>
                {p.arrived}
              </span>

              <span className="text-[13.5px] leading-[var(--tr-lh-prose)]">
                <span className={`${MONO} lg:hidden block mb-[2px]`}>WHAT I DID</span>
                {p.did}
              </span>

              <span className="text-[13.5px] leading-[var(--tr-lh-prose)] group-hover:text-tr-ok transition-colors">
                <span className={`${MONO} lg:hidden block mb-[2px]`}>WHAT CHANGED</span>
                {p.changed}
              </span>
            </Link>
            <span
              aria-hidden
              className="absolute left-[-1rem] top-0 bottom-0 w-0.5 bg-tr-ember origin-top scale-y-0 peer-hover:scale-y-100 transition-transform duration-300 ease-[var(--tr-ease)]"
            />
          </li>
        ))}
      </ol>

      <Link href="/projects" data-cursor="OPEN" className="inline-flex items-center gap-[.6rem] mt-6 text-[13.5px] border-b border-tr-hairline pb-[2px]">
        {COPY.workMore(total - projects.length)}
        <span className={MONO}>→</span>
      </Link>
    </section>
  );
}
