import Link from "next/link";
import type { Route } from "next";
import { getAllProjects } from "@/lib/content";
import { FEATURED, HOUSE_RULES, DAILY_FACTS, CUBE_PB, buildDeskStats, buildLogEntries } from "@/data/home";
import { SITE_CONFIG } from "@/../content/site";
import { DESK_FONTS } from "./fonts";
import { SecretsProvider } from "./SecretsProvider";
import { DeskNav } from "./DeskNav";
import { PhysicsPlayground } from "./PhysicsPlayground";
import { TodayPick } from "./TodayPick";
import { CubeCard } from "./CubeCard";
import { Guestbook } from "./Guestbook";
import { CopyEmail } from "./CopyEmail";
import { Greeting, VisitCount } from "./Visits";

const SECTION = "mx-auto max-w-[1200px] px-[clamp(16px,4vw,48px)] py-[60px]";
const H2 = "text-[length:clamp(32px,4.5vw,56px)] font-extrabold tracking-[-0.035em] leading-none";
const DOTS = ["var(--desk-tomato)", "var(--desk-butter)", "var(--desk-sky)", "var(--desk-mint)", "var(--desk-lilac)", "var(--desk-pink)"];

const NUMBER_WORDS = ["zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten", "eleven", "twelve", "thirteen", "fourteen", "fifteen", "sixteen", "seventeen", "eighteen", "nineteen"];
const TENS = ["", "", "twenty", "thirty", "forty", "fifty", "sixty", "seventy", "eighty", "ninety"];

/** 28 → "twenty-eight". Up to 99, which is further than the archive will get. */
export function inWords(n: number): string {
  if (n < 20) return NUMBER_WORDS[n];
  if (n < 100) return TENS[Math.floor(n / 10)] + (n % 10 ? `-${NUMBER_WORDS[n % 10]}` : "");
  return String(n);
}

const capitalise = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

const { social } = SITE_CONFIG;
const SOCIALS = [
  { label: "github", href: social.github },
  { label: "linkedin", href: social.linkedin },
  { label: "x", href: social.twitter },
  { label: "youtube", href: social.youtube },
];

const PAGES: { label: string; href: Route }[] = [
  { label: "all projects", href: "/projects" },
  { label: "writing", href: "/blog" },
  { label: "résumé", href: "/resume" },
  { label: "channel", href: "/youtube" },
];

export async function HomeDesk() {
  const projects = await getAllProjects();
  const projectCount = projects.length;

  // A featured entry naming a project that no longer has a file would link to
  // a 404. Filtering here means deleting content can only shorten the list.
  const ids = new Set(projects.map((p) => p.id));
  const featured = FEATURED.filter((f) => ids.has(f.id));
  const picks = featured.map((p) => ({ id: p.id, title: p.title, brief: p.arrived, changed: p.changed, tags: p.tech.slice(0, 4) }));
  const shy = projectCount - featured.length;

  return (
    <div className={`desk ${DESK_FONTS} min-h-screen bg-desk-paper font-desk text-desk-ink antialiased`}>
      <SecretsProvider>
        <DeskNav />

        <main id="main-content">
          <header className="mx-auto max-w-[1200px] px-[clamp(16px,4vw,48px)] pb-8 pt-[clamp(40px,7vw,90px)]">
            <Greeting />
            <h1 className="text-[length:clamp(44px,8vw,112px)] font-extrabold leading-[var(--desk-lh-display)] tracking-[-0.045em] [text-wrap:balance]">
              I take the vague version and ship the{" "}
              <span className="rounded-md bg-desk-butter px-[0.12em] [box-decoration-break:clone]">real one.</span>
            </h1>
            <div className="mt-7 flex flex-wrap items-end justify-between gap-6">
              <p className="max-w-[520px] text-[length:clamp(17px,1.6vw,20px)] leading-[var(--desk-lh-lede)] text-desk-ink-2 [text-wrap:pretty]">
                Jay Hemnani. Forward-deployed engineer from Gujarat. Data pipelines, ML, agents, and occasionally a
                Rubik&apos;s cube. Currently <b>open to work</b> and, apparently, to building toys for my own homepage.
              </p>
              <p aria-hidden="true" className="font-desk-mono text-[12px] text-desk-muted">
                ↓ grab a tile. throw it. they don&apos;t mind.
              </p>
            </div>
            <PhysicsPlayground />
          </header>

          <TodayPick projects={picks} facts={DAILY_FACTS} />

          <section aria-label="By the numbers" className="mx-auto max-w-[1200px] px-[clamp(16px,4vw,48px)] pb-10 pt-5">
            <dl className="grid grid-cols-[repeat(auto-fit,minmax(150px,1fr))] border-y-[1.5px] border-desk-ink">
              {buildDeskStats({ projectCount }).map((s) => (
                <div key={s.label} className="flex flex-col-reverse py-[22px] pr-4">
                  <dt className="mt-1.5 text-[14px] leading-[var(--desk-lh-label)] text-desk-muted">{s.label}</dt>
                  <dd className="text-[length:clamp(36px,4vw,52px)] font-extrabold leading-none tracking-[-0.04em]">{s.n}</dd>
                </div>
              ))}
            </dl>
          </section>

          <section id="work" aria-labelledby="work-h2" className={SECTION}>
            <h2 id="work-h2" className={`${H2} mb-2`}>
              Things I&apos;ve shipped
            </h2>
            <p className="mb-7 text-[17px] text-desk-muted">
              {capitalise(inWords(featured.length))} of {inWords(projectCount)}. The other{" "}
              <Link href="/projects" className="underline">
                {inWords(shy)} are shy
              </Link>
              .
            </p>
            <ul className="grid grid-cols-[repeat(auto-fill,minmax(min(100%,330px),1fr))] gap-5">
              {featured.map((p, i) => (
                <li key={p.id} className="flex">
                  <Link
                    href={`/projects/${p.id}` as Route}
                    className="desk-card flex w-full flex-col gap-3.5 rounded-[18px] border-[1.5px] border-desk-ink bg-desk-card p-6 hover:text-desk-ink"
                  >
                    <span className="flex items-center justify-between">
                      <span className="font-desk-mono text-[12px] text-desk-muted">{p.num}</span>
                      <span aria-hidden="true" className="size-3.5 rounded-full border-[1.5px] border-desk-ink" style={{ background: DOTS[i % DOTS.length] }} />
                    </span>
                    <span className="text-[26px] font-extrabold leading-[var(--desk-lh-title)] tracking-[-0.025em]">{p.title}</span>
                    <span className="font-desk-hand text-[22px] leading-[var(--desk-lh-hand)] text-desk-tomato">&ldquo;{p.arrived}&rdquo;</span>
                    <span className="text-[15px] leading-normal text-desk-ink-2">{p.changed}</span>
                    <span className="mt-auto flex flex-wrap gap-1.5">
                      {p.tech.slice(0, 4).map((t) => (
                        <span key={t} className="rounded-md bg-desk-paper px-2 py-[3px] font-desk-mono text-[11px]">
                          {t}
                        </span>
                      ))}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>

          <section aria-labelledby="rules-h2" className={`${SECTION} grid grid-cols-[repeat(auto-fit,minmax(min(100%,420px),1fr))] items-start gap-10`}>
            <div>
              <h2 id="rules-h2" className={`${H2} mb-2.5`}>
                House rules
              </h2>
              <p className="mb-7 max-w-[420px] text-[17px] text-desk-muted">Each one cost me a project to learn. You get them free.</p>
              <CubeCard pb={CUBE_PB} />
            </div>
            <ul className="grid grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-4">
              {HOUSE_RULES.map((r) => (
                <li key={r.n} className="flex flex-col gap-2 rounded-[14px] border-[1.5px] border-desk-ink bg-desk-card p-5">
                  <span className="font-desk-hand text-[28px] leading-none text-desk-tomato">{r.n}</span>
                  <h3 className="text-[20px] font-bold leading-[var(--desk-lh-snug)] tracking-[-0.02em]">{r.title}</h3>
                  <p className="text-[14px] leading-normal text-desk-ink-2">{r.why}</p>
                  <p className="mt-1 font-desk-mono text-[11px] text-desk-muted">learned on: {r.from}</p>
                </li>
              ))}
            </ul>
          </section>

          <section aria-labelledby="log-h2" className={SECTION}>
            <h2 id="log-h2" className={`${H2} mb-7`}>
              Where I&apos;ve been
            </h2>
            <ol>
              {buildLogEntries().map((j) => (
                <li key={j.org} className="grid gap-1 border-t-[1.5px] border-desk-ink py-[18px] sm:grid-cols-[minmax(110px,180px)_minmax(0,1fr)] sm:gap-5">
                  <p className="pt-1 font-desk-mono text-[13px] text-desk-muted">{j.when}</p>
                  <div>
                    <h3 className="text-[21px] font-bold tracking-[-0.02em]">
                      {j.role} <span className="font-normal text-desk-muted">@ {j.org}</span>
                    </h3>
                    <p className="mt-1 text-[15px] leading-normal text-desk-ink-2">{j.what}</p>
                  </div>
                </li>
              ))}
            </ol>
          </section>

          <Guestbook />

          <section id="hi" aria-labelledby="hi-h2" className="mt-[60px] bg-desk-ink text-desk-paper">
            <div className="mx-auto max-w-[1200px] px-[clamp(16px,4vw,48px)] pb-10 pt-[clamp(60px,9vw,110px)]">
              <h2 id="hi-h2" className="font-desk-hand text-[28px] font-normal text-desk-butter">
                got a vague brief?
              </h2>
              <CopyEmail email={social.email} />
              <p className="font-desk-mono text-[13px] text-desk-muted-dark">click to copy · software, data &amp; ML roles, forward-deployed included</p>
              <ul className="mt-10 flex flex-wrap gap-3">
                {SOCIALS.map((s) => (
                  <li key={s.label}>
                    <a
                      href={s.href}
                      className="inline-block rounded-full border-[1.5px] border-desk-line-dark px-4 py-2.5 font-desk-mono text-[14px] text-desk-paper hover:border-desk-butter hover:text-desk-butter"
                    >
                      {s.label} <span aria-hidden="true">↗</span>
                    </a>
                  </li>
                ))}
              </ul>
              <nav aria-label="Site" className="mt-10 flex flex-wrap gap-x-5 gap-y-2 font-desk-mono text-[13px]">
                {PAGES.map((p) => (
                  <Link key={p.href} href={p.href} className="text-desk-paper underline hover:text-desk-butter">
                    {p.label}
                  </Link>
                ))}
              </nav>
              <footer className="mt-16 flex flex-wrap justify-between gap-3 font-desk-mono text-[12px] text-desk-faint-dark">
                <p>
                  {SITE_CONFIG.copyright}
                  <VisitCount />
                </p>
                <p aria-hidden="true">psst. ↑ ↑ ↓ ↓ ← → ← → b a</p>
              </footer>
            </div>
          </section>
        </main>
      </SecretsProvider>
    </div>
  );
}
