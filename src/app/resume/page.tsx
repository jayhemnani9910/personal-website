import type { CSSProperties } from "react";
import Link from "next/link";
import type { Metadata } from "next";
import { RESUME } from "@/data/resume";
import { EditorialMasthead } from "@/components/EditorialMasthead";
import { EditorialColophon } from "@/components/EditorialColophon";

export const metadata: Metadata = {
  title: "About",
  description:
    "Resume, experience, publications, open-source contributions, and a few things worth knowing about Jay Hemnani.",
};

// Mono UI chrome: labels, kickers, buttons. Uppercase + wide tracking.
const mono: CSSProperties = {
  fontFamily: "var(--font-jetbrains)",
  letterSpacing: ".08em",
};

// Mono machine-channel DATA: stats, tech tags, identifiers. No forced
// uppercase and no extra tracking, so proper-noun casing (vLLM, PyTorch,
// Next.js) survives instead of being shouted into caps.
const monoData: CSSProperties = {
  fontFamily: "var(--font-jetbrains)",
};

const serif: CSSProperties = {
  fontFamily: "var(--font-newsreader)",
};

const SHELL = "px-[clamp(1.25rem,5vw,2rem)]";
const WRAP = "mx-auto max-w-[68rem]";

const RESUME_PDFS = [
  { label: "Forward-Deployed", file: "/resume/jay-hemnani-fde.pdf" },
  { label: "Data Engineer", file: "/resume/jay-hemnani-de.pdf" },
  { label: "ML Engineer", file: "/resume/jay-hemnani-ml.pdf" },
  { label: "Backend / SWE", file: "/resume/jay-hemnani-swe.pdf" },
  { label: "Data Analyst", file: "/resume/jay-hemnani-analyst.pdf" },
];

const OSS = [
  {
    pr: "PR #31513",
    repo: "vllm-project / vllm",
    title: "Enable LoRA support for tower and connector in LLaVA.",
    body: "Enabled LoRA training for the LLaVA vision tower and connector inside vLLM, the high-throughput LLM inference engine. Merged 2 January 2026.",
    url: "https://github.com/vllm-project/vllm/pull/31513",
  },
  {
    pr: "PR #1826",
    repo: "modelcontextprotocol / python-sdk",
    title: "Add an explicit type annotation for the call_tool decorator.",
    body: "Fixed a missing type annotation on the call_tool decorator in the Anthropic MCP Python SDK, the SDK that powers MCP-based integrations. Merged 6 January 2026.",
    url: "https://github.com/modelcontextprotocol/python-sdk/pull/1826",
  },
  {
    pr: "PR #407",
    repo: "google / A2UI",
    title: "Add .env.example templates for safer secret setup.",
    body: "Added env templates to Google's A2UI, the open standard for agent-to-user interfaces. A small patch with real surface area. Merged 5 January 2026.",
    url: "https://github.com/google/A2UI/pull/407",
  },
];

const SKILLS = [
  {
    level: "Expert",
    note: "ship daily, can design from scratch",
    items: ["Python", "TypeScript", "SQL", "PyTorch", "PostgreSQL", "Docker", "Kafka", "Airflow", "LangChain", "LangGraph", "MCP", "Next.js", "FastAPI", "Node.js / Express"],
  },
  {
    level: "Proficient",
    note: "ship confidently, may reference docs",
    items: ["YOLOv8", "ByteTrack", "TimescaleDB", "MongoDB", "Redis", "MLflow", "DVC", "Tableau", "Power BI", "AWS", "Ollama", "vLLM"],
  },
  {
    level: "Working",
    note: "shipped once or twice, ready to ramp",
    items: ["Go", "Rust", "Kubernetes", "pgvector", "Pinecone", "Weights & Biases", "GCP", "Azure", "Chrome Extensions", "WebMCP", "Three.js", "C++"],
  },
];

const FACTS = [
  { h: "Two IEEE publications, as an undergraduate.", p: "A research credential without a master's degree." },
  { h: "Three merged OSS PRs into flagship repositories.", p: "vLLM, the Anthropic MCP SDK, and Google's A2UI. Evidence of landing changes inside unfamiliar large codebases." },
  { h: "CAG Deep Research, built in ten days.", p: "Five-agent LangGraph system, hexagonal architecture, production-shipped. A signal for speed and ownership." },
  { h: "Early WebMCP implementation in production.", p: "One of the first sites exposing structured tools via the W3C WebMCP standard. Eight tools, real adoption." },
  { h: "Cursor, Claude Code, and Codex, daily for over a year.", p: "The honest version: faster ramps on unfamiliar codebases, tighter feedback loops, more time on the interesting work." },
  { h: "Two production data platforms, two languages.", p: "Stock Data Platform in Python (Kafka, Airflow, TimescaleDB). Indian Stock Platform in Rust (Axum, WASM, Neon, GitHub Actions cron)." },
  { h: "WCA-registered speedcuber.", p: "Personal best of 16.7 seconds. Not on the resume, true regardless." },
];

const pad = (n: number) => String(n).padStart(2, "0");

const roleCount = RESUME.experience.reduce((n, c) => n + c.roles.length, 0);

// Section kicker + serif heading, repeated across the seven numbered sections.
function SectionHead({
  num,
  label,
  meta,
  title,
}: {
  num: string;
  label: string;
  meta?: string;
  title: string;
}) {
  return (
    <div className="mb-[var(--tr-s-6)]">
      <div className="flex flex-wrap items-baseline gap-x-[var(--tr-s-3)] gap-y-[var(--tr-s-1)]">
        <p className="text-[length:var(--tr-t-mono-sm)] uppercase text-tr-text-mute" style={mono}>
          § {num} / {label}
        </p>
        {meta ? (
          <p className="text-[length:var(--tr-t-mono-sm)] text-tr-text-faint" style={monoData}>
            {meta}
          </p>
        ) : null}
      </div>
      <h2
        className="mt-[var(--tr-s-2)] text-[length:var(--tr-t-h2)] font-light leading-[1.1] text-tr-text"
        style={serif}
      >
        {title}
      </h2>
    </div>
  );
}

export default function AboutPage() {
  return (
    <main id="main-content" className="bg-tr-bg text-tr-text">
      <EditorialMasthead active="about" />

      {/* ========== HERO ========== */}
      <section className={`${SHELL} pt-[6.5rem] pb-[var(--tr-s-8)]`}>
        <div className={WRAP}>
          <div className="max-w-[52rem]">
            <p
              className="mb-[var(--tr-s-4)] text-[length:var(--tr-t-mono)] uppercase text-tr-text-mute"
              style={mono}
            >
              Forward Deployed Engineer / Gujarat, India (open to relocate)
            </p>
            <h1
              className="mb-[var(--tr-s-5)] text-[length:var(--tr-t-display)] font-light leading-[.95] tracking-[-.02em] text-tr-text"
              style={serif}
            >
              Jay Hemnani.
            </h1>
            <p
              className="max-w-[60ch] text-[length:var(--tr-t-body)] leading-[1.6] text-tr-text-mute"
              style={serif}
            >
              Born in Gujarat. Trained in computer engineering at PDEU. Have spent the last four years moving
              between data analyst, ML engineer, and full-stack engineer roles, usually because the project
              demanded it. Two IEEE papers. Three merged OSS patches. A long catalogue of finished things.
              Available for full-time and freelance.
            </p>
          </div>
        </div>
      </section>

      {/* ========== RÉSUMÉ DOWNLOADS (primary action) ========== */}
      <section className={`${SHELL} pb-[var(--tr-s-10)]`}>
        <div className={WRAP}>
          <div className="border border-tr-hairline bg-tr-surface-1 p-[var(--tr-s-5)] sm:p-[var(--tr-s-6)]">
            <div className="mb-[var(--tr-s-5)] flex flex-wrap items-baseline justify-between gap-[var(--tr-s-2)]">
              <h2 className="text-[length:var(--tr-t-h3)] font-light text-tr-text" style={serif}>
                Résumé, by role.
              </h2>
              <p className="text-[length:var(--tr-t-mono-sm)] uppercase text-tr-text-mute" style={mono}>
                Five one-pagers · PDF
              </p>
            </div>
            <div className="flex flex-wrap gap-[var(--tr-s-3)]">
              {RESUME_PDFS.map((r) => (
                <a
                  key={r.file}
                  href={r.file}
                  target="_blank"
                  rel="noreferrer"
                  data-cursor="OPEN"
                  className="inline-flex items-center border border-tr-hairline px-[1.25em] py-[.75em] text-[length:var(--tr-t-mono)] uppercase text-tr-text-mute no-underline transition-colors duration-[var(--tr-dur-base)] ease-[var(--tr-ease)] hover:border-tr-ember hover:text-tr-ember"
                  style={mono}
                >
                  {r.label}
                </a>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ========== § 01 CURRICULUM VITAE ========== */}
      <section className={`${SHELL} py-[var(--tr-s-10)]`} id="resume">
        <div className={WRAP}>
          <SectionHead num="01" label="experience" meta={`${roleCount} roles`} title="Curriculum vitae." />
          <ol className="list-none border-t border-tr-hairline">
            {RESUME.experience.flatMap((company) =>
              company.roles.map((role) => {
                const place = role.location || company.location;
                return (
                  <li
                    key={`${company.name}-${role.title}`}
                    className="border-b border-tr-hairline py-[var(--tr-s-6)]"
                  >
                    <div className="grid gap-[var(--tr-s-3)] lg:grid-cols-[12rem_1fr] lg:gap-[var(--tr-s-6)]">
                      <div className="min-w-0">
                        <div className="text-[length:var(--tr-t-mono)] text-tr-text-mute" style={monoData}>
                          {role.period?.label}
                        </div>
                        <div
                          className="mt-[var(--tr-s-1)] text-[length:var(--tr-t-mono-sm)] uppercase text-tr-text-faint"
                          style={mono}
                        >
                          {role.employmentType}
                        </div>
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-[length:var(--tr-t-h3)] font-light text-tr-text" style={serif}>
                          {role.title}
                        </h3>
                        <p
                          className="mt-[var(--tr-s-1)] text-[length:var(--tr-t-mono-sm)] uppercase text-tr-text-mute"
                          style={mono}
                        >
                          {company.name}
                          {place ? ` / ${place}` : ""}
                        </p>
                        <ul className="mt-[var(--tr-s-3)] max-w-[62ch] list-disc space-y-[var(--tr-s-2)] pl-[1.25em] marker:text-tr-text-faint">
                          {role.bullets.map((b, i) => (
                            <li
                              key={i}
                              className="text-[length:var(--tr-t-body)] leading-[1.6] text-tr-text-mute"
                              style={serif}
                            >
                              {b.text}
                            </li>
                          ))}
                        </ul>
                        {role.tech && role.tech.length > 0 ? (
                          <div
                            className="mt-[var(--tr-s-3)] flex flex-wrap gap-x-[1em] gap-y-[.3em] text-[length:var(--tr-t-mono-sm)] text-tr-text-faint"
                            style={monoData}
                          >
                            {role.tech.map((t) => (
                              <span key={t}>{t}</span>
                            ))}
                          </div>
                        ) : null}
                      </div>
                    </div>
                  </li>
                );
              })
            )}
          </ol>
        </div>
      </section>

      {/* ========== § 02 EDUCATION ========== */}
      <section className={`${SHELL} py-[var(--tr-s-10)]`}>
        <div className={WRAP}>
          <SectionHead num="02" label="education" meta="one degree" title="Education." />
          <ol className="list-none border-t border-tr-hairline">
            {RESUME.education.map((edu) => (
              <li key={edu.institution} className="border-b border-tr-hairline py-[var(--tr-s-6)]">
                <div className="grid gap-[var(--tr-s-3)] lg:grid-cols-[12rem_1fr] lg:gap-[var(--tr-s-6)]">
                  <div className="min-w-0">
                    <div className="text-[length:var(--tr-t-mono)] text-tr-text-mute" style={monoData}>
                      {edu.start}-{edu.end}
                    </div>
                    {edu.gpa ? (
                      <div
                        className="mt-[var(--tr-s-1)] text-[length:var(--tr-t-mono-sm)] uppercase text-tr-text-faint"
                        style={mono}
                      >
                        GPA {edu.gpa}
                      </div>
                    ) : null}
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-[length:var(--tr-t-h3)] font-light text-tr-text" style={serif}>
                      {edu.degree}.
                    </h3>
                    <p
                      className="mt-[var(--tr-s-1)] text-[length:var(--tr-t-mono-sm)] uppercase text-tr-text-mute"
                      style={mono}
                    >
                      {edu.institution} / {edu.location}
                    </p>
                    <p
                      className="mt-[var(--tr-s-3)] max-w-[62ch] text-[length:var(--tr-t-body)] leading-[1.6] text-tr-text-mute"
                      style={serif}
                    >
                      Four years of computer engineering, two IEEE papers as an undergrad, and a developing
                      taste for systems that other people end up using.
                    </p>
                    {edu.courses && edu.courses.length > 0 ? (
                      <div className="mt-[var(--tr-s-4)]">
                        <p
                          className="mb-[var(--tr-s-2)] text-[length:var(--tr-t-mono-sm)] uppercase text-tr-text-faint"
                          style={mono}
                        >
                          Coursework
                        </p>
                        <div
                          className="flex flex-wrap gap-x-[1em] gap-y-[.3em] text-[length:var(--tr-t-mono-sm)] text-tr-text-faint"
                          style={monoData}
                        >
                          {edu.courses.map((c) => (
                            <span key={c}>{c}</span>
                          ))}
                        </div>
                      </div>
                    ) : null}
                  </div>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ========== § 03 PUBLICATIONS ========== */}
      <section className={`${SHELL} py-[var(--tr-s-10)]`}>
        <div className={WRAP}>
          <SectionHead num="03" label="publications" meta="two IEEE papers" title="Publications." />
          <ol className="list-none border-t border-tr-hairline">
            {RESUME.publications.map((pub, i) => (
              <li key={pub.title} className="border-b border-tr-hairline py-[var(--tr-s-6)]">
                <div className="grid gap-[var(--tr-s-3)] lg:grid-cols-[12rem_1fr] lg:gap-[var(--tr-s-6)]">
                  <div className="text-[length:var(--tr-t-h3)] text-tr-text-mute" style={monoData}>
                    № {pad(i + 1)}
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-[length:var(--tr-t-h3)] font-light text-tr-text" style={serif}>
                      {pub.title}.
                    </h3>
                    <p
                      className="mt-[var(--tr-s-1)] text-[length:var(--tr-t-mono-sm)] uppercase text-tr-text-mute"
                      style={mono}
                    >
                      {pub.venue} · {pub.year}
                    </p>
                    <p
                      className="mt-[var(--tr-s-3)] max-w-[62ch] text-[length:var(--tr-t-body)] leading-[1.6] text-tr-text-mute"
                      style={serif}
                    >
                      {pub.description}
                    </p>
                    <div
                      className="mt-[var(--tr-s-3)] flex flex-wrap gap-x-[var(--tr-s-5)] gap-y-[var(--tr-s-2)] text-[length:var(--tr-t-mono)] uppercase text-tr-text-mute"
                      style={mono}
                    >
                      {pub.link ? (
                        <a
                          href={pub.link}
                          target="_blank"
                          rel="noreferrer"
                          className="no-underline transition-colors duration-[var(--tr-dur-base)] ease-[var(--tr-ease)] hover:text-tr-ember"
                        >
                          Paper ↗
                        </a>
                      ) : null}
                      {pub.github ? (
                        <a
                          href={pub.github}
                          target="_blank"
                          rel="noreferrer"
                          className="no-underline transition-colors duration-[var(--tr-dur-base)] ease-[var(--tr-ease)] hover:text-tr-ember"
                        >
                          Code ↗
                        </a>
                      ) : null}
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ========== § 04 OPEN SOURCE ========== */}
      <section className={`${SHELL} py-[var(--tr-s-10)]`}>
        <div className={WRAP}>
          <SectionHead
            num="04"
            label="open source"
            meta="vLLM · MCP SDK · A2UI"
            title="Open source, three merged."
          />
          <p
            className="mb-[var(--tr-s-6)] max-w-[62ch] text-[length:var(--tr-t-body)] leading-[1.6] text-tr-text-mute"
            style={serif}
          >
            Three PRs into ecosystem-critical repositories, each landed by navigating an unfamiliar large
            codebase, finding the seam, and shipping the change.
          </p>
          <ol className="list-none border-t border-tr-hairline">
            {OSS.map((o) => (
              <li key={o.url} className="border-b border-tr-hairline py-[var(--tr-s-6)]">
                <div className="grid gap-[var(--tr-s-3)] lg:grid-cols-[12rem_1fr] lg:gap-[var(--tr-s-6)]">
                  <div className="min-w-0">
                    <div className="text-[length:var(--tr-t-body)] text-tr-text" style={monoData}>
                      {o.pr}
                    </div>
                    <div
                      className="mt-[var(--tr-s-1)] text-[length:var(--tr-t-mono-sm)] text-tr-text-faint"
                      style={monoData}
                    >
                      {o.repo}
                    </div>
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-[length:var(--tr-t-h3)] font-light text-tr-text" style={serif}>
                      {o.title}
                    </h3>
                    <p
                      className="mt-[var(--tr-s-2)] max-w-[62ch] text-[length:var(--tr-t-body)] leading-[1.6] text-tr-text-mute"
                      style={serif}
                    >
                      {o.body}
                    </p>
                    <a
                      href={o.url}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-[var(--tr-s-3)] inline-block text-[length:var(--tr-t-mono)] uppercase text-tr-text-mute no-underline transition-colors duration-[var(--tr-dur-base)] ease-[var(--tr-ease)] hover:text-tr-ember"
                      style={mono}
                    >
                      View pull request ↗
                    </a>
                  </div>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ========== § 05 STACK ========== */}
      <section className={`${SHELL} py-[var(--tr-s-10)]`}>
        <div className={WRAP}>
          <SectionHead
            num="05"
            label="stack"
            meta="expert · proficient · working"
            title="Stack, by honest level."
          />
          <div className="grid gap-[var(--tr-s-8)] sm:grid-cols-2 lg:grid-cols-3">
            {SKILLS.map((col) => (
              <div key={col.level}>
                <h3 className="text-[length:var(--tr-t-h3)] font-light text-tr-text" style={serif}>
                  {col.level}
                </h3>
                <p className="mt-[var(--tr-s-1)] text-[length:var(--tr-t-mono-sm)] text-tr-text-mute" style={monoData}>
                  {col.note}
                </p>
                <div
                  className="mt-[var(--tr-s-3)] flex flex-wrap gap-x-[1em] gap-y-[.35em] text-[length:var(--tr-t-mono-sm)] text-tr-text-faint"
                  style={monoData}
                >
                  {col.items.map((s) => (
                    <span key={s}>{s}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========== § 06 PARTICULARS ========== */}
      <section className={`${SHELL} py-[var(--tr-s-10)]`}>
        <div className={WRAP}>
          <SectionHead
            num="06"
            label="particulars"
            meta="numbered, not ranked"
            title="A few non-trivial particulars."
          />
          <ol className="list-none border-t border-tr-hairline">
            {FACTS.map((f, i) => (
              <li key={f.h} className="border-b border-tr-hairline py-[var(--tr-s-6)]">
                <div className="grid gap-[var(--tr-s-2)] lg:grid-cols-[12rem_1fr] lg:gap-[var(--tr-s-6)]">
                  <div className="text-[length:var(--tr-t-h3)] text-tr-text-mute" style={monoData}>
                    {pad(i + 1)}
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-[length:var(--tr-t-h3)] font-light text-tr-text" style={serif}>
                      {f.h}
                    </h3>
                    <p
                      className="mt-[var(--tr-s-2)] max-w-[62ch] text-[length:var(--tr-t-body)] leading-[1.6] text-tr-text-mute"
                      style={serif}
                    >
                      {f.p}
                    </p>
                  </div>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ========== § 07 CORRESPONDENCE ========== */}
      <section className={`${SHELL} py-[var(--tr-s-12)]`}>
        <div className={WRAP}>
          <SectionHead num="07" label="correspondence" meta="responses inside 48h" title="Get in touch." />
          <div className="grid gap-[var(--tr-s-8)] lg:grid-cols-2 lg:items-end">
            <div>
              <p
                className="max-w-[24ch] text-[length:var(--tr-t-h3)] font-light leading-[1.2] text-tr-text"
                style={serif}
              >
                A note, an offer, or a problem worth solving.
              </p>
              <p
                className="mt-[var(--tr-s-4)] max-w-[52ch] text-[length:var(--tr-t-body)] leading-[1.6] text-tr-text-mute"
                style={serif}
              >
                I am looking for forward-deployed engineering, data engineering, agentic AI, and senior
                software roles. Staff-shaped problems welcome. India-remote, global-remote, and on-site with
                relocation all on the table.
              </p>
            </div>

            <div className="flex flex-col items-start gap-[var(--tr-s-5)] lg:items-end">
              <a
                href="mailto:jayhemnani992000@gmail.com"
                data-cursor="OPEN"
                className="flex max-w-full flex-col border border-transparent bg-tr-ember px-[var(--tr-s-5)] py-[var(--tr-s-4)] no-underline shadow-[var(--tr-glow-box)]"
              >
                <span className="text-[length:var(--tr-t-mono-sm)] uppercase text-tr-on-ember" style={mono}>
                  Open the line
                </span>
                <span
                  className="mt-[var(--tr-s-1)] break-words text-[length:var(--tr-t-body)] text-tr-on-ember"
                  style={monoData}
                >
                  jayhemnani992000@gmail.com
                </span>
              </a>
              <div
                className="flex flex-wrap gap-x-[var(--tr-s-5)] gap-y-[var(--tr-s-2)] text-[length:var(--tr-t-mono)] uppercase text-tr-text-mute"
                style={mono}
              >
                <a
                  href="https://github.com/jayhemnani9910"
                  target="_blank"
                  rel="noreferrer"
                  className="no-underline transition-colors duration-[var(--tr-dur-base)] ease-[var(--tr-ease)] hover:text-tr-ember"
                >
                  GitHub ↗
                </a>
                <a
                  href="https://linkedin.com/in/jayhemnani"
                  target="_blank"
                  rel="noreferrer"
                  className="no-underline transition-colors duration-[var(--tr-dur-base)] ease-[var(--tr-ease)] hover:text-tr-ember"
                >
                  LinkedIn ↗
                </a>
                <a
                  href="https://x.com/jeyhemnani9"
                  target="_blank"
                  rel="noreferrer"
                  className="no-underline transition-colors duration-[var(--tr-dur-base)] ease-[var(--tr-ease)] hover:text-tr-ember"
                >
                  Twitter ↗
                </a>
                <Link
                  href="/projects"
                  className="no-underline transition-colors duration-[var(--tr-dur-base)] ease-[var(--tr-ease)] hover:text-tr-ember"
                >
                  Work →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <EditorialColophon />
    </main>
  );
}
