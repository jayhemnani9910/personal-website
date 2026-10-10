/* FDE page: server component wrapper. Replaces the old static page.
   Interactive console is a client island. Static sections (Proofs, Fit, Contact)
   are plain server JSX. */

import type { Metadata } from "next";
import { pageMetadata } from "@/lib/page-metadata";
import Link from "next/link";
import type { Route } from "next";
import { SITE_CONFIG } from "@/../content/site";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { FdeConsole } from "@/components/fde/FdeConsole";
import { PROOFS } from "@/components/fde/fdeData";
import { CARD, CHIP, H1, H2, HIGHLIGHT, LABEL, LEDE, PILL, PILL_ACTIVE, SHELL, WRAP } from "@/components/desk";

const TWO_COL = "lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]";
const SECTION = `${WRAP} ${SHELL} py-[60px]`;

export const metadata: Metadata = {
  ...pageMetadata({
    title: "Forward Deployed Engineer",
    description:
      "Jay Hemnani, open to Forward Deployed Engineer (FDE) roles. Proof in LangGraph multi-agent systems, Model Context Protocol work, RAG, and distributed systems.",
    path: "/fde",
    type: "profile",
  }),
  keywords: [
    "Forward Deployed Engineer",
    "FDE",
    "Forward Deployed Software Engineer",
    "Applied AI Engineer",
    "AI agents",
    "agentic AI",
    "Model Context Protocol",
    "MCP",
    "RAG",
    "LangGraph",
    "distributed systems",
    "full-stack engineer",
    "Jay Hemnani",
    "FDE India",
    "remote FDE",
  ],
};

export default function FDEPage() {
  return (
    <>
      <SiteHeader />
      <main id="main-content" className="bg-tr-bg text-tr-text">
        {/* ========== HERO ========== */}
        <header className={`${WRAP} ${SHELL} pb-10 pt-[clamp(40px,6vw,72px)]`}>
          <div className="mb-6 flex flex-wrap items-center gap-2">
            <span className={`${PILL} ${PILL_ACTIVE}`}>
              <span className="size-1.5 animate-pulse rounded-full bg-current" aria-hidden="true" />
              FDE.SIM.v1 · interactive
            </span>
            <span className={PILL}>remote · gujarat, in · gmt+5:30</span>
          </div>

          <h1 className={`${H1} max-w-[16ch]`}>
            Stop reading. <span className={HIGHLIGHT}>Brief me</span>.
          </h1>

          <p className={`${LEDE} mt-6 max-w-[60ch]`}>
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
        <section className="border-t-[1.5px] border-tr-hairline">
          <div className={SECTION}>
            <div className="mb-10 max-w-[760px]">
              <p className={`${LABEL} mb-3`}>Receipts</p>
              <h2 className={H2}>
                The simulation above isn&apos;t <span className={HIGHLIGHT}>vibes</span>. Here&apos;s the
                engineering substrate it runs on.
              </h2>
              <p className={`${LEDE} mt-4 max-w-[48ch]`}>
                Four proofs of the engineering breadth FDE work actually needs: agents, protocols, upstream code,
                distributed substrate.
              </p>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              {PROOFS.map((p) => (
                <div key={p.id} className={`${CARD} flex flex-col gap-3 p-6 shadow-[var(--tr-shadow-card)]`}>
                  <span className="font-hand text-[30px] leading-none text-tr-accent-hand">{p.id}</span>
                  <span className={LABEL}>
                    {p.cat} · {p.project}
                  </span>
                  <h3 className="max-w-[22ch] text-[24px] leading-[var(--tr-lh-h3)]">
                    {p.title.pre}
                    <span className={HIGHLIGHT}>{p.title.em}</span>
                    {p.title.post}
                  </h3>
                  <p className="text-[15px] leading-normal text-tr-text-mute">{p.body}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {p.stack.map((s) => (
                      <span key={s} className={CHIP}>
                        {s}
                      </span>
                    ))}
                  </div>
                  <div className="mt-auto flex flex-wrap gap-x-4 gap-y-1.5 pt-2">
                    {p.links.map((l) => (
                      <a
                        key={l.href}
                        className="w-fit font-mono text-[12px] text-tr-text underline"
                        href={l.href}
                        {...(l.href.startsWith("http") ? { target: "_blank", rel: "noreferrer" } : {})}
                      >
                        ↗ {l.label}
                      </a>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ========== FIT ========== */}
        <section className="border-t-[1.5px] border-tr-hairline">
          <div className={SECTION}>
            <div className="mb-10 max-w-[760px]">
              <p className={`${LABEL} mb-3`}>Candid</p>
              <h2 className={H2}>
                Notes on <span className={HIGHLIGHT}>fit</span>.
              </h2>
              <p className={`${LEDE} mt-4 max-w-[48ch]`}>
                The version where I&apos;m honest about what I can claim, and what I can&apos;t. Yet.
              </p>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div className={`${CARD} p-6`}>
                <h3 className={`${LABEL} mb-4`}>What I can credibly claim</h3>
                <p className="text-[20px] font-semibold leading-[var(--tr-lh-h2)]">
                  The engineering substrate: agentic systems, protocols, upstream code, distributed services. The
                  decomposition muscle the simulation above demonstrates.
                </p>
                <p className="mt-4 text-[15px] leading-normal text-tr-text-mute">
                  Plus real stakeholder-facing delivery experience: requirements alignment, metric and SLA definition
                  with finance and operations at Elite Hotel Group.
                </p>
              </div>
              <div className={`${CARD} overflow-hidden p-6 shadow-[inset_0_6px_0_var(--tr-accent)]`}>
                <h3 className={`${LABEL} mb-4`}>What I haven&apos;t yet</h3>
                <p className="text-[20px] font-semibold leading-[var(--tr-lh-h2)]">
                  The full FDE customer lifecycle in an <span className={HIGHLIGHT}>external</span>{" "}
                  environment. Internal stakeholder delivery isn&apos;t the same as external customer delivery. I
                  won&apos;t pretend otherwise.
                </p>
                <p className="mt-4 text-[15px] leading-normal text-tr-text-mute">
                  I&apos;m actively closing this by shipping one small real deployment, publishing failure analyses,
                  and converting an existing project into a deployment case study. Specifics on request.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ========== Contact ───────────────────────────────────────────── */}
        <FdeContact />
      </main>
      <SiteFooter />
    </>
  );
}

// Contact is extracted as a small function to keep the page component readable.
function FdeContact() {
  const { social, handles } = SITE_CONFIG;
  const links = [
    { lbl: 'email',    val: social.email,            href: `mailto:${social.email}`, primary: true },
    { lbl: 'essay',    val: 'what FDE means in 2026', href: '/blog/forward-deployed-engineer', internal: true },
    { lbl: 'resume',   val: 'the one-pager',          href: '/resume', internal: true },
    { lbl: 'github',   val: handles.github,           href: social.github },
    { lbl: 'linkedin', val: handles.linkedin,         href: social.linkedin },
    { lbl: 'twitter',  val: handles.twitter,          href: social.twitter },
  ];

  return (
    <section className="border-t-[1.5px] border-tr-hairline">
      <div className={SECTION}>
        <div className={`grid items-end gap-[clamp(2rem,5vw,5rem)] ${TWO_COL}`}>
          <h2 className={H2}>
            If the simulation made you think, <span className={HIGHLIGHT}>say so</span>.
          </h2>
          <p className={`${LEDE} max-w-[46ch]`}>
            Fastest path: email. I read every one. If you ran the sim on a real problem and it sparked an idea, send
            me the brief and I&apos;ll show you what the next 30 minutes of work would look like.
          </p>
        </div>

        <div className="mt-9 border-t-[1.5px] border-tr-hairline">
          {links.map((l) => {
            const row = (
              <>
                <span className={LABEL}>{l.lbl}</span>
                <span
                  className={`min-w-0 [overflow-wrap:anywhere] tracking-[-0.02em] transition-colors duration-[var(--tr-dur-base)] ease-[var(--tr-ease)] group-hover:text-tr-accent-ink ${
                    l.primary ? "text-[26px] font-extrabold" : "text-[20px] font-semibold"
                  }`}
                >
                  {l.val}
                </span>
                <span
                  aria-hidden="true"
                  className="font-mono text-tr-accent-ink transition-transform duration-[var(--tr-dur-base)] ease-[var(--tr-ease)] group-hover:-translate-y-1 group-hover:translate-x-1"
                >
                  ↗
                </span>
              </>
            );
            const className = "group grid grid-cols-[6rem_1fr_auto] items-center gap-4 border-b-[1.5px] border-tr-hairline py-4 no-underline hover:text-tr-text sm:grid-cols-[8.75rem_1fr_auto]";
            // The essay and the resume are pages on this site: same tab, client-side.
            if (l.internal) {
              return (
                <Link key={l.lbl} href={l.href as Route} className={className}>
                  {row}
                </Link>
              );
            }
            const external = l.href.startsWith("http");
            return (
              <a
                key={l.lbl}
                href={l.href}
                {...(external ? { target: "_blank", rel: "noreferrer" } : {})}
                className={className}
              >
                {row}
              </a>
            );
          })}
        </div>
      </div>
    </section>
  );
}
