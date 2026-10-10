import Link from "next/link";
import type { Route } from "next";
import { getAllProjects } from "@/lib/content";
import { FEATURED, HOUSE_RULES, DAILY_FACTS, CUBE_PB, buildDeskStats, buildLogEntries } from "@/data/home";
import { SITE_CONFIG } from "@/../content/site";
import { SecretsProvider } from "./SecretsProvider";
import { DeskNav } from "./DeskNav";
import { PhysicsPlayground } from "./PhysicsPlayground";
import { TodayPick } from "./TodayPick";
import { dayOfYear } from "./day";
import { CubeCard } from "./CubeCard";
import { Guestbook } from "./Guestbook";
import { CopyEmail } from "./CopyEmail";
import { Greeting, VisitCount } from "./Visits";
import { ReaderToggle } from "@/components/ReaderToggle";
import { ShellButton } from "@/components/ShellButton";
import { CHIP, DOTS } from "@/components/desk";

const SECTION = "mx-auto max-w-[1200px] px-[clamp(16px,4vw,48px)] py-[60px]";
const H2 = "text-[length:clamp(32px,4.5vw,56px)] font-extrabold tracking-[-0.035em] leading-none";

const NUMBER_WORDS = ["zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten", "eleven", "twelve", "thirteen", "fourteen", "fifteen", "sixteen", "seventeen", "eighteen", "nineteen"];
const TENS = ["", "", "twenty", "thirty", "forty", "fifty", "sixty", "seventy", "eighty", "ninety"];

/** 28 → "twenty-eight". Up to 99, which is further than the archive will get. */
export function inWords(n: number): string {
  if (n < 20) return NUMBER_WORDS[n];
  if (n < 100) return TENS[Math.floor(n / 10)] + (n % 10 ? `-${NUMBER_WORDS[n % 10]}` : "");
  return String(n);
}

/** Cut at a word, near the length a four-line clamp on the pick card shows. */
const PICK_TEXT = 170;
function clip(text: string): string {
  if (text.length <= PICK_TEXT) return text;
  let cut = text.slice(0, text.lastIndexOf(" ", PICK_TEXT));
  // Never leave a "(" open: cut back to before it instead.
  const open = cut.lastIndexOf("(");
  if (open > cut.lastIndexOf(")")) cut = cut.slice(0, open).trimEnd();
  return `${cut.replace(/[,;:.]$/, "")}…`;
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
  // The daily pick is drawn from the projects the cards below do not show, so
  // over a month it walks the visitor through the shy ones.
  const featuredIds = new Set(featured.map((f) => f.id));
  // Every pick ships, because the visitor's clock picks the day; the text is
  // cut to what the card shows, so the list stays small in the page.
  const picks = projects
    .filter((p) => !featuredIds.has(p.id))
    .map((p) => ({
      id: p.id,
      title: p.title,
      brief: clip(p.description ?? p.summary),
      changed: clip(p.impact[0] ?? p.challenge),
      tags: p.tech.slice(0, 4),
    }));
  const shy = projectCount - featured.length;

  return (
    <div className="min-h-screen bg-tr-bg text-tr-text">
      <SecretsProvider>
        <DeskNav />

        <main id="main-content">
          <header className="mx-auto max-w-[1200px] px-[clamp(16px,4vw,48px)] pb-8 pt-[clamp(40px,7vw,90px)]">
            <Greeting />
            <h1 className="text-[length:clamp(44px,8vw,112px)] font-extrabold leading-[var(--tr-lh-display)] tracking-[-0.045em] [text-wrap:balance]">
              I take the vague version and ship the{" "}
              <span className="desk-hl rounded-md bg-tr-butter px-[0.12em] [box-decoration-break:clone]">real one.</span>
            </h1>
            <div className="mt-7 flex flex-wrap items-end justify-between gap-6">
              <p className="max-w-[520px] text-[length:clamp(17px,1.6vw,20px)] leading-[var(--tr-lh-body)] text-tr-text-mute [text-wrap:pretty]">
                Jay Hemnani. Forward Deployed Engineer from Gujarat. Data pipelines, ML, agents, and occasionally a
                Rubik&apos;s cube. Currently <b>open to work</b> and, apparently, to building toys for my own homepage.
              </p>
              <p aria-hidden="true" className="desk-grab-hint font-mono text-[12px] text-tr-text-faint">
                ↓ grab a tile. throw it. they don&apos;t mind.
              </p>
            </div>
            <PhysicsPlayground />
          </header>

          <TodayPick projects={picks} facts={DAILY_FACTS} renderedDay={dayOfYear(new Date())} />

          <section aria-label="By the numbers" className="mx-auto max-w-[1200px] px-[clamp(16px,4vw,48px)] pb-10 pt-5">
            <dl className="grid grid-cols-[repeat(auto-fit,minmax(110px,1fr))] border-y-[1.5px] border-tr-hairline">
              {buildDeskStats({ projectCount }).map((s) => (
                <div key={s.label} className="flex flex-col-reverse justify-end py-[22px] pr-4">
                  <dt className="mt-1.5 text-[14px] leading-[var(--tr-lh-card)] text-tr-text-faint">{s.label}</dt>
                  <dd className="text-[length:clamp(36px,4vw,52px)] font-extrabold leading-none tracking-[-0.04em]">{s.n}</dd>
                </div>
              ))}
            </dl>
          </section>

          <section id="work" aria-labelledby="work-h2" className={SECTION}>
            <h2 id="work-h2" className={`${H2} mb-2`}>
              Things I&apos;ve shipped
            </h2>
            <p className="mb-7 text-[17px] text-tr-text-faint">
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
                    className="desk-card flex w-full flex-col gap-3.5 rounded-[18px] border-[1.5px] border-tr-hairline bg-tr-surface-1 p-6 hover:text-tr-text"
                  >
                    <span className="flex items-center justify-between">
                      <span className="font-mono text-[12px] text-tr-text-faint">{p.num}</span>
                      <span aria-hidden="true" className="size-3.5 rounded-full border-[1.5px] border-tr-hairline" style={{ background: DOTS[i % DOTS.length] }} />
                    </span>
                    <span className="text-[26px] font-extrabold leading-[var(--tr-lh-h3)] tracking-[-0.025em]">{p.title}</span>
                    <span className="font-hand text-[24px] leading-[var(--tr-lh-hand)] text-tr-accent-hand">&ldquo;{p.arrived}&rdquo;</span>
                    <span className="text-[15px] leading-normal text-tr-text-mute">{p.changed}</span>
                    <span className="mt-auto flex flex-wrap gap-1.5">
                      {p.tech.slice(0, 4).map((t) => (
                        <span key={t} className={CHIP}>
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
              <p className="mb-7 max-w-[420px] text-[17px] text-tr-text-faint">Each one cost me a project to learn. You get them free.</p>
              <CubeCard pb={CUBE_PB} />
            </div>
            <ul className="grid grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-4">
              {HOUSE_RULES.map((r) => (
                <li key={r.n} className="flex flex-col gap-2 rounded-[14px] border-[1.5px] border-tr-hairline bg-tr-surface-1 p-5">
                  <span className="font-hand text-[28px] leading-none text-tr-accent-hand">{r.n}</span>
                  <h3 className="text-[20px] font-bold leading-[var(--tr-lh-h2)] tracking-[-0.02em]">{r.title}</h3>
                  <p className="text-[14px] leading-normal text-tr-text-mute">{r.why}</p>
                  <p className="mt-1 font-mono text-[11px] text-tr-text-faint">learned on: {r.from}</p>
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
                <li key={j.org} className="grid gap-1 border-t-[1.5px] border-tr-hairline py-[18px] sm:grid-cols-[minmax(110px,180px)_minmax(0,1fr)] sm:gap-5">
                  <p className="pt-1 font-mono text-[13px] text-tr-text-faint">{j.when}</p>
                  <div>
                    <h3 className="text-[21px] font-bold tracking-[-0.02em]">
                      {j.role} <span className="block font-normal text-tr-text-faint sm:inline">@ {j.org}</span>
                    </h3>
                    <p className="mt-1 text-[15px] leading-normal text-tr-text-mute">{j.what}</p>
                  </div>
                </li>
              ))}
            </ol>
          </section>

          <Guestbook />

          <section id="hi" aria-labelledby="hi-h2" className="ink-panel mt-[60px] bg-tr-text text-tr-on-ink">
            <div className="mx-auto max-w-[1200px] px-[clamp(16px,4vw,48px)] pt-[clamp(60px,9vw,110px)]">
              <h2 id="hi-h2" className="font-hand text-[28px] font-normal text-tr-butter">
                got a vague brief?
              </h2>
              <CopyEmail email={social.email} />
              <p className="font-mono text-[13px] text-tr-on-ink-mute">click to copy · software, data &amp; ML roles, forward-deployed included</p>
              <ul className="mt-10 flex flex-wrap gap-3">
                {SOCIALS.map((s) => (
                  <li key={s.label}>
                    <a
                      href={s.href}
                      className="inline-block rounded-full border-[1.5px] border-tr-on-ink-line px-4 py-2.5 font-mono text-[14px] text-tr-on-ink hover:border-tr-butter hover:text-tr-butter"
                    >
                      {s.label} <span aria-hidden="true">↗</span>
                    </a>
                  </li>
                ))}
              </ul>
              <nav aria-label="Site" className="mt-10 flex flex-wrap gap-x-5 gap-y-2 font-mono text-[13px]">
                {PAGES.map((p) => (
                  <Link key={p.href} href={p.href} className="text-tr-on-ink underline hover:text-tr-butter">
                    {p.label}
                  </Link>
                ))}
              </nav>
            </div>
          </section>
        </main>
        {/* Outside <main>, so / has a contentinfo landmark like every other
            page. The same ink as the contact band above, so it reads as one. */}
        <footer className="ink-panel bg-tr-text text-tr-on-ink">
          <div className="mx-auto max-w-[1200px] px-[clamp(16px,4vw,48px)] pb-10">
            <div className="flex flex-wrap justify-between gap-3 pt-16 font-mono text-[12px] text-tr-on-ink-faint">
              <p>
                {SITE_CONFIG.copyright}
                <VisitCount />
                {" · "}
                <ReaderToggle className="cursor-pointer hover:text-tr-butter" />
                {" · "}
                <ShellButton className="cursor-pointer hover:text-tr-butter" />
              </p>
              <p aria-hidden="true">psst. ↑ ↑ ↓ ↓ ← → ← → b a</p>
            </div>
          </div>
        </footer>
      </SecretsProvider>
    </div>
  );
}
