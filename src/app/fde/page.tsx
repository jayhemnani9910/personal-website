/* FDE page: server component wrapper. Replaces the old static page.
   Interactive console is a client island. Static sections (Proofs, Fit, Contact)
   are plain server JSX. layout.tsx is untouched (provides metadata + JSON-LD). */

import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { FdeConsole } from "@/components/fde/FdeConsole";
import { PROOFS } from "@/components/fde/fdeData";

const MONO = "font-[family-name:var(--ff-mono)]";
const CONTAINER = "mx-auto max-w-[1280px] px-[clamp(1rem,4vw,2rem)]";
const TWO_COL = "lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]";
const H2 = "text-[length:var(--tr-t-h2)] leading-[var(--tr-lh-h2)] tracking-[-.025em] font-medium text-tr-text";
const BADGE = `inline-flex items-center gap-[7px] whitespace-nowrap rounded-full border px-3 py-1 ${MONO} text-[length:var(--tr-t-mono-sm)] tracking-[.04em]`;

export default function FDEPage() {
  return (
    <main id="main-content" className="bg-tr-bg text-tr-text">
      <SiteHeader />

      {/* ========== HERO ========== */}
      <header className={`${CONTAINER} pt-[clamp(2.5rem,5vw,4rem)] pb-10`}>
        <div className="mb-6 flex flex-wrap items-center gap-2">
          <span className={`${BADGE} border-tr-accent bg-[color-mix(in_srgb,var(--tr-accent)_12%,transparent)] text-tr-accent`}>
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-current" aria-hidden="true" />
            FDE.SIM.v1 · interactive
          </span>
          <span className={`${BADGE} border-tr-hairline bg-tr-surface-1 text-tr-text`}>2026.05.26 · last_built</span>
          <span className={`${BADGE} border-tr-hairline bg-tr-surface-1 text-tr-text`}>remote · gujarat, in · gmt+5:30</span>
        </div>

        <h1 className="max-w-[16ch] text-[length:var(--tr-t-display-sm)] leading-[var(--tr-lh-display)] tracking-[-.035em] font-medium text-tr-text">
          Stop reading. <span className="italic text-tr-accent">Brief me</span>.
        </h1>

        <p className="mt-6 max-w-[60ch] text-tr-text-mute [text-wrap:pretty]">
          <strong className="font-semibold text-tr-text">This page is a working Forward Deployed Engineer simulation.</strong>{" "}
          Give me your real, vague, messy problem. I&apos;ll perform the FDE &quot;decomposition&quot; interview on it live:
          scope it, draw the architecture, plan the sprint, and call out where it&apos;ll fail. Then map every phase back
          to projects I&apos;ve actually shipped.
        </p>

        <div className="mt-9">
          <FdeConsole />
        </div>
      </header>

      {/* ========== PROOFS ========== */}
      <section className="border-t border-tr-hairline">
        <div className={`${CONTAINER} py-[clamp(3rem,6vw,5rem)]`}>
          <div className={`mb-10 grid gap-[clamp(2rem,5vw,5rem)] ${TWO_COL} items-end`}>
            <p className={`${MONO} text-[length:var(--tr-t-mono)] tracking-[.1em] text-tr-text-faint`}>/02 · RECEIPTS</p>
            <div>
              <h2 className={H2}>
                The simulation above isn&apos;t <span className="italic text-tr-accent">vibes</span>. Here&apos;s the
                engineering substrate it runs on.
              </h2>
              <p className="mt-4 max-w-[48ch] text-tr-text-mute">
                Four proofs of the engineering breadth FDE work actually needs: agents, protocols, upstream code,
                distributed substrate.
              </p>
            </div>
          </div>

          <div className="grid gap-px overflow-hidden rounded-[var(--tr-r-lg)] border border-tr-hairline bg-tr-hairline sm:grid-cols-2">
            {PROOFS.map((p) => (
              <div key={p.id} className="flex flex-col gap-3 bg-tr-surface-1 p-6">
                <span className="text-[length:var(--tr-t-stat)] italic leading-[var(--tr-lh-numeral)] text-tr-accent">{p.id}</span>
                <span className={`${MONO} text-[length:var(--tr-t-mono-sm)] uppercase tracking-[.14em] text-tr-text-faint`}>
                  {p.cat} · {p.project}
                </span>
                <h3 className="max-w-[22ch] text-[length:var(--tr-t-h3)] leading-[var(--tr-lh-h3)] font-medium text-tr-text">
                  {p.title.pre}
                  <span className="italic text-tr-accent">{p.title.em}</span>
                  {p.title.post}
                </h3>
                <p className="text-tr-text-mute">{p.body}</p>
                <div className="flex flex-wrap gap-1.5">
                  {p.stack.map((s) => (
                    <span
                      key={s}
                      className={`whitespace-nowrap rounded-full border border-tr-hairline px-2 py-0.5 ${MONO} text-[length:var(--tr-t-mono-sm)] text-tr-text-mute`}
                    >
                      {s}
                    </span>
                  ))}
                </div>
                <a
                  className={`mt-auto w-fit border-b border-dashed border-tr-hairline pb-px ${MONO} text-[length:var(--tr-t-mono-sm)] text-tr-text no-underline transition-colors duration-[var(--tr-dur-base)] ease-[var(--tr-ease)] hover:border-tr-accent hover:text-tr-accent`}
                  href={p.link.href}
                  target="_blank"
                  rel="noreferrer"
                >
                  ↗ {p.link.label}
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========== FIT ========== */}
      <section className="border-t border-tr-hairline bg-tr-surface-1">
        <div className={`${CONTAINER} py-[clamp(3rem,6vw,5rem)]`}>
          <div className={`mb-10 grid gap-[clamp(2rem,5vw,5rem)] ${TWO_COL} items-end`}>
            <p className={`${MONO} text-[length:var(--tr-t-mono)] tracking-[.1em] text-tr-text-faint`}>/03 · CANDID</p>
            <div>
              <h2 className={H2}>
                Notes on <span className="italic text-tr-accent">fit</span>.
              </h2>
              <p className="mt-4 max-w-[48ch] text-tr-text-mute">
                The version where I&apos;m honest about what I can claim, and what I can&apos;t. Yet.
              </p>
            </div>
          </div>

          <div className="grid gap-9 sm:grid-cols-2">
            <div className="border-t-2 border-tr-text pt-6">
              <h3 className={`mb-4 ${MONO} text-[length:var(--tr-t-mono-sm)] uppercase tracking-[.14em] text-tr-text-mute`}>
                What I can credibly claim
              </h3>
              <p className="text-[length:var(--tr-t-h3)] leading-[var(--tr-lh-h3)] text-tr-text">
                The engineering substrate: agentic systems, protocols, upstream code, distributed services. The
                decomposition muscle the simulation above demonstrates.
              </p>
              <p className="mt-4 text-tr-text-mute">
                Plus real stakeholder-facing delivery experience: requirements alignment, metric and SLA definition
                with finance and operations at Elite Hotel Group.
              </p>
            </div>
            <div className="border-t-2 border-tr-accent pt-6">
              <h3 className={`mb-4 ${MONO} text-[length:var(--tr-t-mono-sm)] uppercase tracking-[.14em] text-tr-accent`}>
                What I haven&apos;t yet
              </h3>
              <p className="text-[length:var(--tr-t-h3)] leading-[var(--tr-lh-h3)] text-tr-text">
                The full FDE customer lifecycle in an <span className="italic text-tr-accent">external</span>{" "}
                environment. Internal stakeholder delivery isn&apos;t the same as external customer delivery. I
                won&apos;t pretend otherwise.
              </p>
              <p className="mt-4 text-tr-text-mute">
                I&apos;m actively closing this by shipping one small real deployment, publishing failure analyses,
                and converting an existing project into a deployment case study. Specifics on request.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ========== Contact ───────────────────────────────────────────── */}
      <FdeContact />

      <SiteFooter />
    </main>
  );
}

// Contact is extracted as a small function to keep the page component readable.
function FdeContact() {
  const links = [
    { lbl: 'email',    val: 'jayhemnani992000@gmail.com',       href: 'mailto:jayhemnani992000@gmail.com', primary: true },
    { lbl: 'essay',    val: 'what FDE means in 2026',           href: 'https://www.jayhemnani.me/blog/forward-deployed-engineer' },
    { lbl: 'resume',   val: 'the one-pager',                    href: 'https://www.jayhemnani.me/resume' },
    { lbl: 'github',   val: 'jayhemnani9910',                   href: 'https://github.com/jayhemnani9910' },
    { lbl: 'linkedin', val: 'in / jayhemnani',                  href: 'https://linkedin.com/in/jayhemnani' },
    { lbl: 'twitter',  val: '@jeyhemnani9',                     href: 'https://x.com/jeyhemnani9' },
  ];

  return (
    <section className="border-t border-tr-hairline">
      <div className={`${CONTAINER} py-[clamp(3rem,6vw,5rem)]`}>
        <div className={`grid gap-[clamp(2rem,5vw,5rem)] ${TWO_COL} items-end`}>
          <h2 className="text-[length:var(--tr-t-display-sm)] leading-[var(--tr-lh-display)] tracking-[-.03em] font-medium text-tr-text">
            If the simulation made you think, <span className="italic text-tr-accent">say so</span>.
          </h2>
          <p className="max-w-[46ch] text-tr-text-mute">
            Fastest path: email. I read every one. If you ran the sim on a real problem and it sparked an idea, send
            me the brief and I&apos;ll show you what the next 30 minutes of work would look like.
          </p>
        </div>

        <div className="mt-9 border-t border-tr-hairline">
          {links.map((l) => (
            <a
              key={l.lbl}
              href={l.href}
              target="_blank"
              rel="noreferrer"
              data-cursor="OPEN"
              className="group grid grid-cols-[6rem_1fr_auto] items-center gap-4 border-b border-tr-hairline py-4 no-underline sm:grid-cols-[8.75rem_1fr_auto]"
            >
              <span className={`${MONO} text-[length:var(--tr-t-mono-sm)] uppercase tracking-[.14em] text-tr-text-mute`}>
                {l.lbl}
              </span>
              <span
                className={`min-w-0 [overflow-wrap:anywhere] text-[length:var(--tr-t-h3)] font-medium transition-colors duration-[var(--tr-dur-base)] ease-[var(--tr-ease)] group-hover:text-tr-accent ${
                  l.primary ? "italic text-tr-accent" : "text-tr-text"
                }`}
              >
                {l.val}
              </span>
              <span
                aria-hidden="true"
                className={`${MONO} text-tr-accent transition-transform duration-[var(--tr-dur-base)] ease-[var(--tr-ease)] group-hover:translate-x-1 group-hover:-translate-y-1`}
              >
                ↗
              </span>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
