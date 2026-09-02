import type { Metadata } from "next";
import Link from "next/link";
import { RESUME } from "@/data/resume";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { SkillGroups } from "./SkillGroups";

export const metadata: Metadata = {
  title: "About",
  description:
    "Resume, experience, publications, open-source contributions, and a few things worth knowing about Jay Hemnani.",
  alternates: { canonical: "/resume" },
};

const RESUME_PDFS = [
  { label: "Forward-Deployed", file: "/resume/jay-hemnani-fde.pdf" },
  { label: "Data Engineer", file: "/resume/jay-hemnani-de.pdf" },
  { label: "ML Engineer", file: "/resume/jay-hemnani-ml.pdf" },
  { label: "Backend / SWE", file: "/resume/jay-hemnani-swe.pdf" },
  { label: "Data Analyst", file: "/resume/jay-hemnani-analyst.pdf" },
];

const MONO = "font-[family-name:var(--ff-mono)]";
const CONTAINER = "mx-auto max-w-[1280px] px-[clamp(1rem,4vw,2rem)]";
const TWO_COL = "lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]";
const H2 = "text-[length:var(--tr-t-h2)] leading-[var(--tr-lh-h2)] tracking-[-.025em] font-medium text-tr-text";

// A publication's description states the published-vs-reproduced gap inline
// (e.g. "82.68% accuracy as published; ... reproduces 74.46% ..."). Pulling
// both numbers out programmatically, rather than hardcoding them, keeps the
// callout tied to whatever resume.ts actually says.
function parsePublishedVsReproduced(description?: string) {
  if (!description) return null;
  const published = description.match(/([\d.]+)%[^.]*as published/i)?.[1];
  const reproduced = description.match(/reproduces\s*([\d.]+)%/i)?.[1];
  if (!published || !reproduced) return null;
  return { published, reproduced };
}

const roles = RESUME.experience.flatMap((company) =>
  company.roles.map((role) => ({ company, role }))
);

export default function AboutPage() {
  return (
    <main id="main-content" className="bg-tr-bg text-tr-text">
      <SiteHeader />

      {/* ========== INTRO ========== */}
      <section
        className={`${CONTAINER} grid gap-[clamp(2rem,5vw,5rem)] pt-[clamp(2.5rem,5vw,4rem)] pb-8 ${TWO_COL} lg:items-end`}
      >
        <div>
          <p className={`${MONO} mb-4 text-[length:var(--tr-t-mono)] tracking-[.1em] text-tr-text-faint`}>
            /ABOUT · THE PARTICULARS
          </p>
          <h1 className="text-[length:var(--tr-t-display-sm)] leading-[var(--tr-lh-display)] tracking-[-.035em] font-medium text-tr-text">
            Came from design. Stayed for the mess.
          </h1>
        </div>
        <div>
          <p className="max-w-[56ch] text-[length:var(--tr-t-body)] leading-[var(--tr-lh-body)] text-tr-text-mute [text-wrap:pretty]">
            Two design internships, a conference and three student clubs before a line of production
            code. Then iOS, fraud models, consulting, finance pipelines. The pattern: I get handed the
            vague part, and I come back with something that runs.
          </p>
          <p className={`${MONO} mt-4 text-[length:var(--tr-t-mono-sm)] text-tr-text-faint`}>
            {RESUME.location} · {RESUME.contact.email}
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-2">
            <span className={`${MONO} text-[length:var(--tr-t-mono-sm)] uppercase text-tr-text-faint`}>
              Résumé, by role ·
            </span>
            {RESUME_PDFS.map((r) => (
              <a
                key={r.file}
                href={r.file}
                target="_blank"
                rel="noreferrer"
                data-cursor="OPEN"
                className={`${MONO} text-[length:var(--tr-t-mono-sm)] uppercase text-tr-text-mute underline decoration-tr-hairline decoration-1 underline-offset-4 transition-colors duration-[var(--tr-dur-base)] ease-[var(--tr-ease)] hover:text-tr-ember hover:decoration-tr-ember`}
              >
                {r.label}
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* ========== EXPERIENCE ========== */}
      <section className="border-t border-tr-hairline">
        <div className={`${CONTAINER} grid gap-[clamp(2rem,5vw,5rem)] py-[clamp(3rem,6vw,5rem)] ${TWO_COL}`}>
          <div>
            <h2 className={H2}>Experience</h2>
            <p className="mt-4 max-w-[40ch] text-[length:var(--tr-t-body)] leading-[var(--tr-lh-body)] text-tr-text-mute">
              {roles.length} roles. Bullets are outcomes, not duties.
            </p>
          </div>
          <ol className="list-none">
            {roles.map(({ company, role }) => (
              <li
                key={`${company.name}-${role.title}`}
                className="grid gap-6 border-t border-tr-hairline py-5 lg:grid-cols-[7rem_minmax(0,1fr)]"
              >
                <div className={`${MONO} min-w-0 text-[length:var(--tr-t-mono-sm)] text-tr-text-faint`}>
                  <div>{role.period?.label}</div>
                  <div className="mt-1 text-[10px] uppercase tracking-[.06em]">{role.employmentType}</div>
                </div>
                <div className="min-w-0">
                  <p className="text-[length:var(--tr-t-body)] text-tr-text">
                    {role.title} ·{" "}
                    <span className="font-normal text-tr-text-mute">{company.name}</span>
                  </p>
                  <ul className="mt-3 grid gap-2">
                    {role.bullets.map((b, i) => (
                      <li key={i} className="grid grid-cols-[.9rem_1fr] gap-[.4rem]">
                        <span className={`${MONO} text-tr-ok`} aria-hidden="true">✓</span>
                        <span className="text-[length:var(--tr-t-body)] leading-[var(--tr-lh-body)] text-tr-text-mute">
                          {b.text}
                        </span>
                      </li>
                    ))}
                  </ul>
                  {role.tech && role.tech.length > 0 ? (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {role.tech.map((t) => (
                        <span
                          key={t}
                          className={`${MONO} rounded-[3px] border border-tr-hairline px-[5px] py-px text-[10px] text-tr-text-mute`}
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  ) : null}
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ========== STACK ========== */}
      <section className="border-t border-tr-hairline bg-tr-surface-1">
        <div className={`${CONTAINER} grid gap-[clamp(2rem,5vw,5rem)] py-[clamp(3rem,6vw,5rem)] ${TWO_COL}`}>
          <div>
            <h2 className={H2}>Stack</h2>
            <p className="mt-4 max-w-[40ch] text-[length:var(--tr-t-body)] leading-[var(--tr-lh-body)] text-tr-text-mute">
              Grouped the way the resume groups them. Click a group to see where it was used.
            </p>
            <p className={`${MONO} mt-4 text-[length:var(--tr-t-mono-sm)] text-tr-text-faint`}>
              {"// no percentage bars. nobody is 80% Python."}
            </p>
          </div>
          <SkillGroups
            groups={RESUME.skills.map((s) => ({
              category: s.category,
              items: s.items.map((i) => i.name),
            }))}
          />
        </div>
      </section>

      {/* ========== PUBLICATIONS ========== */}
      <section className="border-t border-tr-hairline">
        <div className={`${CONTAINER} grid gap-[clamp(2rem,5vw,5rem)] py-[clamp(3rem,6vw,5rem)] ${TWO_COL}`}>
          <div>
            <h2 className={H2}>Publications</h2>
            <p className="mt-4 max-w-[40ch] text-[length:var(--tr-t-body)] leading-[var(--tr-lh-body)] text-tr-text-mute">
              {RESUME.publications.length}, IEEE AIMV {RESUME.publications[0]?.year}. With the gap
              between the published number and the committed notebook stated plainly.
            </p>
          </div>
          <ol className="grid list-none gap-px overflow-hidden rounded-[var(--tr-r-lg)] border border-tr-hairline bg-tr-hairline">
            {RESUME.publications.map((pub) => {
              const gap = parsePublishedVsReproduced(pub.description);
              return (
                <li key={pub.title} className="grid gap-6 bg-tr-bg p-6 sm:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
                  <div className="min-w-0">
                    <h3 className="text-[1.1rem] font-medium tracking-[-.01em] text-tr-text">{pub.title}</h3>
                    <p className="mt-1 text-[length:var(--tr-t-body)] text-tr-text-mute">
                      {pub.venue} · {pub.year}
                    </p>
                    <p className="mt-3 text-[length:var(--tr-t-body)] leading-[var(--tr-lh-body)] text-tr-text-mute">
                      {pub.description}
                    </p>
                  </div>
                  {/* gap-3 plus py-1 on each link, so the two stacked targets
                      clear the 24px minimum a tap target needs. At gap-2 with no
                      padding they measured under it and Lighthouse flagged the
                      pair as overlapping. */}
                  <div className={`${MONO} min-w-0 grid content-start gap-3 text-[length:var(--tr-t-mono-sm)] text-tr-text-mute`}>
                    {pub.link ? (
                      <a
                        href={pub.link}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex min-h-6 items-center py-1 transition-colors duration-[var(--tr-dur-base)] ease-[var(--tr-ease)] hover:text-tr-ember"
                      >
                        ieeexplore ↗
                      </a>
                    ) : null}
                    {pub.github ? (
                      <a
                        href={pub.github}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex min-h-6 items-center py-1 transition-colors duration-[var(--tr-dur-base)] ease-[var(--tr-ease)] hover:text-tr-ember"
                      >
                        notebook ↗
                      </a>
                    ) : null}
                    {gap ? (
                      <p className="border border-tr-hairline rounded-[var(--tr-r-md)] px-3 py-2 text-tr-ember">
                        Published {gap.published}% · reproduced {gap.reproduced}%.
                      </p>
                    ) : null}
                  </div>
                </li>
              );
            })}
          </ol>
        </div>
      </section>

      {/* ========== EDUCATION AND ELSEWHERE ========== */}
      <section className="border-t border-tr-hairline bg-tr-surface-1">
        <div className={`${CONTAINER} grid gap-[clamp(2rem,5vw,5rem)] py-[clamp(3rem,6vw,5rem)] ${TWO_COL}`}>
          <div>
            <h2 className={H2}>Education and elsewhere</h2>
          </div>
          <div className="grid gap-px overflow-hidden rounded-[var(--tr-r-lg)] border border-tr-hairline bg-tr-hairline sm:grid-cols-2">
            {RESUME.education.map((edu) => (
              <div key={edu.institution} className="min-w-0 bg-tr-surface-1 p-6">
                <p className={`${MONO} text-[length:var(--tr-t-mono-sm)] uppercase text-tr-text-faint`}>
                  {edu.start} → {edu.end} · {edu.location}
                </p>
                <h3 className="mt-2 text-[length:var(--tr-t-h3)] font-medium text-tr-text">{edu.degree}</h3>
                <p className="mt-1 text-[length:var(--tr-t-body)] text-tr-text-mute">
                  {edu.institution}
                  {edu.gpa ? ` · GPA ${edu.gpa}` : ""}
                </p>
                {edu.courses && edu.courses.length > 0 ? (
                  <p className="mt-4 text-[length:var(--tr-t-body)] leading-[var(--tr-lh-body)] text-tr-text-mute">
                    {edu.courses.join(" · ")}
                  </p>
                ) : null}
              </div>
            ))}
            <div className="min-w-0 bg-tr-surface-1 p-6">
              <div>
                <p className={`${MONO} text-[length:var(--tr-t-mono-sm)] uppercase text-tr-text-faint`}>
                  Open source
                </p>
                <p className="mt-2 text-[length:var(--tr-t-body)] leading-[var(--tr-lh-body)] text-tr-text-mute">
                  Merged pull requests to repositories not my own.
                </p>
                <a
                  href="https://github.com/pulls?q=is%3Apr+author%3Ajayhemnani9910+is%3Amerged"
                  target="_blank"
                  rel="noreferrer"
                  className={`${MONO} mt-2 inline-block text-[length:var(--tr-t-mono-sm)] text-tr-text-mute transition-colors duration-[var(--tr-dur-base)] ease-[var(--tr-ease)] hover:text-tr-ember`}
                >
                  verify ↗
                </a>
              </div>
              <div className="mt-6">
                <p className={`${MONO} text-[length:var(--tr-t-mono-sm)] uppercase text-tr-text-faint`}>
                  Off the clock
                </p>
                <p className="mt-2 text-[length:var(--tr-t-body)] leading-[var(--tr-lh-body)] text-tr-text-mute">
                  {RESUME.education[0]?.achievements?.[0]}. Wrote{" "}
                  <Link
                    href="/projects/rubiks-timer"
                    data-cursor="OPEN"
                    className="text-tr-text-mute underline decoration-tr-hairline decoration-1 underline-offset-4 transition-colors duration-[var(--tr-dur-base)] ease-[var(--tr-ease)] hover:text-tr-ember hover:decoration-tr-ember"
                  >
                    the timer
                  </Link>
                  .
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
