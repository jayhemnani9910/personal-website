import type { Metadata } from "next";
import { pageMetadata } from "@/lib/page-metadata";
import Link from "next/link";
import { CUBE_ACHIEVEMENT, RESUME, companyAnchor, parsePublishedVsReproduced } from "@/data/resume";
import { MERGED_PRS, MERGED_PRS_SEARCH, MERGED_PRS_SEARCH_LABEL } from "@/data/home";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { BTN_PRIMARY, CARD, CHIP, H1, H2, HAND, HIGHLIGHT, KICKER, LABEL, LEDE, PILL, SHELL, WRAP } from "@/components/desk";
import { SkillGroups } from "./SkillGroups";

export const metadata: Metadata = pageMetadata({
  title: "About",
  description:
    "Resume, experience, publications, open-source contributions, and a few things worth knowing about Jay Hemnani.",
  path: "/resume",
  type: "profile",
});

const RESUME_PDFS = [
  { label: "Forward-Deployed", file: "/resume/jay-hemnani-fde.pdf" },
  { label: "Data Engineer", file: "/resume/jay-hemnani-de.pdf" },
  { label: "ML Engineer", file: "/resume/jay-hemnani-ml.pdf" },
  { label: "Backend / SWE", file: "/resume/jay-hemnani-swe.pdf" },
  { label: "Data Analyst", file: "/resume/jay-hemnani-analyst.pdf" },
];

const SECTION = `${WRAP} ${SHELL} py-[60px]`;
const UNDERLINE_LINK = "underline hover:text-tr-accent-ink";
const OUT_LINK = "inline-flex min-h-6 items-center gap-1 py-1 hover:text-tr-accent-ink";
// OUT_LINK for every link inside the PR list, written once on the <ul>.
const PR_LIST_LINKS = "[&_a]:inline-flex [&_a]:min-h-6 [&_a]:items-center [&_a]:gap-1 [&_a]:py-1 [&_a]:hover:text-tr-accent-ink";
// The PDF pills press onto a 2px shadow, so they sink 2px, not the button's 3.
const PDF_PILL = `${PILL} desk-press shadow-[2px_2px_0_var(--tr-text)] [--desk-press:2px]`;

// A company's first role row carries its anchor (e.g. /resume#amnex), which
// the home page's receipts link to.
const roles = RESUME.experience.flatMap((company) =>
  company.roles.map((role, i) => ({ company, role, anchor: i === 0 ? companyAnchor(company.name) : undefined }))
);

// One row per repo, not per PR. Home prefetches this page, and a row per PR
// repeated its class strings into the RSC payload until it broke the budget.
const prsByRepo = Map.groupBy(MERGED_PRS, (pr) => pr.repo);

export default function AboutPage() {
  return (
    <>
      <SiteHeader />
      <main id="main-content" className="bg-tr-bg text-tr-text">
        {/* ========== INTRO ========== */}
        <section className={`${WRAP} ${SHELL} pb-6 pt-[clamp(40px,6vw,72px)]`}>
          <p className={KICKER}>/about · the particulars</p>
          <h1 className={`${H1} mt-3 max-w-[20ch]`}>
            Came from design. Stayed for <span className={HIGHLIGHT}>the mess.</span>
          </h1>
          <p className={`${LEDE} mt-6 max-w-[56ch]`}>
            Two design internships, a conference and three student clubs before a line of production
            code. Then iOS, fraud models, consulting, finance pipelines. The pattern: I get handed the
            vague part, and I come back with something that runs.
          </p>
          <p className="mt-4 font-mono text-[13px] text-tr-text-faint">
            {RESUME.location} ·{" "}
            <a href={`mailto:${RESUME.contact.email}`} className={`text-tr-text ${UNDERLINE_LINK}`}>
              {RESUME.contact.email}
            </a>
          </p>
          <p className={`${LABEL} mt-8`}>Résumé, by role</p>
          <ul className="mt-3 flex flex-wrap items-center gap-3">
            {RESUME_PDFS.map((r, i) => (
              <li key={r.file}>
                <a href={r.file} target="_blank" rel="noreferrer" className={i === 0 ? BTN_PRIMARY : PDF_PILL}>
                  {r.label} <span aria-hidden="true">↗</span>
                  <span className="sr-only"> résumé (PDF, opens in a new tab)</span>
                </a>
              </li>
            ))}
          </ul>
        </section>

        {/* ========== EXPERIENCE ========== */}
        <section className={SECTION}>
          <h2 className={H2}>Experience</h2>
          <p className={`${LEDE} mb-7 mt-2`}>{roles.length} roles. Bullets are outcomes, not duties.</p>
          {/* The home page's "Where I've been" row, with the bullets kept. */}
          <ol>
            {roles.map(({ company, role, anchor }) => (
              <li
                key={`${company.name}-${role.title}`}
                id={anchor}
                className="grid scroll-mt-16 gap-1 border-t-[1.5px] border-tr-hairline py-[18px] sm:grid-cols-[minmax(110px,180px)_minmax(0,1fr)] sm:gap-5"
              >
                <div className="pt-1 font-mono text-[13px] text-tr-text-faint">
                  <p>{role.period?.label}</p>
                  <p className="mt-1 text-[11px] uppercase tracking-[0.08em]">{role.employmentType}</p>
                </div>
                <div className="min-w-0">
                  <h3 className="text-[21px] font-bold tracking-[-0.02em]">
                    {role.title} <span className="block font-normal text-tr-text-faint sm:inline">@ {company.name}</span>
                  </h3>
                  <ul className="mt-2 grid max-w-[72ch] gap-2">
                    {role.bullets.map((b, i) => (
                      <li key={i} className="grid grid-cols-[1rem_1fr] gap-1.5">
                        <span className="font-mono text-tr-text" aria-hidden="true">✓</span>
                        <span className="text-[15px] leading-[var(--tr-lh-body)] text-tr-text-mute">{b.text}</span>
                      </li>
                    ))}
                  </ul>
                  {role.tech && role.tech.length > 0 ? (
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {role.tech.map((t) => (
                        <span key={t} className={CHIP}>
                          {t}
                        </span>
                      ))}
                    </div>
                  ) : null}
                </div>
              </li>
            ))}
          </ol>
        </section>

        {/* ========== STACK ========== */}
        <section className={`${SECTION} grid items-start gap-10 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]`}>
          <div>
            <h2 className={H2}>Stack</h2>
            <p className={`${LEDE} mt-2 max-w-[40ch]`}>
              Grouped the way the resume groups them. Click a group to see what is in it.
            </p>
            <p className={`${HAND} mt-5 inline-block -rotate-2`}>no percentage bars. nobody is 80% Python.</p>
          </div>
          <div className={`${CARD} p-6`}>
            <SkillGroups
              groups={RESUME.skills.map((s) => ({
                category: s.category,
                items: s.items.map((i) => i.name),
              }))}
            />
          </div>
        </section>

        {/* ========== PUBLICATIONS ========== */}
        <section className={SECTION}>
          <h2 className={H2}>Publications</h2>
          <p className={`${LEDE} mb-7 mt-2 max-w-[56ch]`}>
            {RESUME.publications.length}, IEEE AIMV {RESUME.publications[0]?.year}. Where the
            published number and the committed notebook disagree, the gap is stated plainly.
          </p>
          <ol className="grid gap-5 md:grid-cols-2">
            {RESUME.publications.map((pub) => {
              const gap = parsePublishedVsReproduced(pub.description);
              return (
                <li key={pub.title} className={`${CARD} flex min-w-0 flex-col gap-3 p-6`}>
                  <p className="font-mono text-[12px] text-tr-text-faint">{pub.year}</p>
                  <h3 className="text-[21px] font-bold leading-[var(--tr-lh-h2)] tracking-[-0.02em]">{pub.title}</h3>
                  <p className="text-[14px] leading-normal text-tr-text-faint">{pub.venue}</p>
                  <p className="text-[15px] leading-[var(--tr-lh-body)] text-tr-text-mute">{pub.description}</p>
                  {gap ? (
                    <p className="self-start rounded-[var(--tr-r-sm)] bg-tr-butter px-2.5 py-1 font-mono text-[12px] text-tr-text-mute">
                      Published {gap.published}% · reproduced {gap.reproduced}%.
                    </p>
                  ) : null}
                  {/* gap-x-5 plus py-1 on each link keeps the pair of targets
                      clear of the 24px minimum a tap target needs. */}
                  <p className="mt-auto flex flex-wrap gap-x-5 pt-1 font-mono text-[13px] text-tr-text">
                    {pub.link ? (
                      <a href={pub.link} target="_blank" rel="noreferrer" className={OUT_LINK}>
                        ieeexplore <span aria-hidden="true">↗</span>
                      </a>
                    ) : null}
                    {pub.github ? (
                      <a href={pub.github} target="_blank" rel="noreferrer" className={OUT_LINK}>
                        notebook <span aria-hidden="true">↗</span>
                      </a>
                    ) : null}
                  </p>
                </li>
              );
            })}
          </ol>
        </section>

        {/* ========== EDUCATION AND ELSEWHERE ========== */}
        <section className={SECTION}>
          <h2 className={`${H2} mb-7`}>Education and elsewhere</h2>
          <div className="grid items-start gap-5 lg:grid-cols-2">
            <div className="grid gap-5">
              {RESUME.education.map((edu) => (
                <div key={edu.institution} className={`${CARD} min-w-0 p-6`}>
                  <p className={LABEL}>
                    {edu.start} → {edu.end} · {edu.location}
                  </p>
                  <h3 className="mt-2 text-[21px] font-bold leading-[var(--tr-lh-h2)] tracking-[-0.02em]">{edu.degree}</h3>
                  <p className="mt-1 text-[15px] text-tr-text-mute">
                    {edu.institution}
                    {edu.gpa ? ` · GPA ${edu.gpa}` : ""}
                  </p>
                  {edu.courses && edu.courses.length > 0 ? (
                    <p className="mt-4 text-[15px] leading-[var(--tr-lh-body)] text-tr-text-mute">{edu.courses.join(" · ")}</p>
                  ) : null}
                </div>
              ))}
              <div className={`${CARD} min-w-0 p-6`}>
                <p className={LABEL}>Off the clock</p>
                <p className="mt-2 text-[15px] leading-[var(--tr-lh-body)] text-tr-text-mute">
                  {CUBE_ACHIEVEMENT}. Wrote{" "}
                  <Link href="/projects/rubiks-timer" className={`text-tr-text ${UNDERLINE_LINK}`}>
                    the timer
                  </Link>
                  .
                </p>
              </div>
            </div>
            <div className={`${CARD} min-w-0 p-6`}>
              <p className={LABEL}>Open source</p>
              <p className="mt-2 text-[15px] leading-[var(--tr-lh-body)] text-tr-text-mute">
                {MERGED_PRS.length} merged pull requests to repositories not my own, by repo and
                number so the diff can be read directly.
              </p>
              <ul className={`${PR_LIST_LINKS} mt-4 flex flex-col gap-1 font-mono text-[12px] text-tr-text-faint`}>
                {[...prsByRepo].map(([repo, prs]) => (
                  <li key={repo} className="flex flex-wrap items-center gap-x-3 border-t border-dashed border-tr-rule-soft pt-1">
                    <span className="text-tr-text">{repo}</span>
                    {prs.map((pr) => {
                      const link = (
                        <a key={pr.href} href={pr.href} target="_blank" rel="noreferrer">
                          {pr.number} <span aria-hidden="true">↗</span>
                        </a>
                      );
                      // Closed on GitHub, not merged: Modular lands outside PRs with
                      // Copybara, so the commit is the proof it went in. Kept on one
                      // line with its PR so the note can't wrap onto the next one.
                      return pr.landed ? (
                        <span key={pr.href} className="flex gap-x-3">
                          {link}
                          <a href={pr.landed} target="_blank" rel="noreferrer">
                            (closed, landed as a commit <span aria-hidden="true">↗</span>)
                          </a>
                        </span>
                      ) : (
                        link
                      );
                    })}
                  </li>
                ))}
              </ul>
              <a
                href={MERGED_PRS_SEARCH}
                target="_blank"
                rel="noreferrer"
                className={`${OUT_LINK} mt-3 font-mono text-[12px] text-tr-text-mute underline`}
              >
                verify {MERGED_PRS_SEARCH_LABEL} on GitHub <span aria-hidden="true">↗</span>
              </a>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
