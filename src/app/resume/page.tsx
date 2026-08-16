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
  alternates: { canonical: "/resume" },
};

// Mono UI chrome: labels, kickers, buttons. Uppercase + wide tracking.
const mono: CSSProperties = { fontFamily: "var(--font-jetbrains)", letterSpacing: ".08em" };
// Mono DATA: proper-noun casing survives (vLLM, Next.js), no forced caps.
const monoData: CSSProperties = { fontFamily: "var(--font-jetbrains)" };
const serif: CSSProperties = { fontFamily: "var(--font-newsreader)" };

const SHELL = "px-[clamp(1.25rem,5vw,2rem)]";
const WRAP = "mx-auto max-w-[72rem]";

const RESUME_PDFS = [
  { label: "Forward-Deployed", file: "/resume/jay-hemnani-fde.pdf" },
  { label: "Data Engineer", file: "/resume/jay-hemnani-de.pdf" },
  { label: "ML Engineer", file: "/resume/jay-hemnani-ml.pdf" },
  { label: "Backend / SWE", file: "/resume/jay-hemnani-swe.pdf" },
  { label: "Data Analyst", file: "/resume/jay-hemnani-analyst.pdf" },
];

// The signature: proof read first. Real, load-bearing numbers, not vanity metrics.
const PROOF = [
  { n: "2", unit: "", head: "IEEE papers", sub: "peer-reviewed, as an undergrad" },
  { n: "3", unit: "", head: "OSS PRs merged", sub: "vLLM · MCP SDK · A2UI" },
  { n: "10", unit: "days", head: "CAG Deep Research", sub: "5-agent LangGraph, shipped" },
  { n: "8", unit: "tools", head: "WebMCP, in production", sub: "early W3C adopter", live: true },
];

const OSS = [
  {
    pr: "PR #31513",
    repo: "vllm-project / vllm",
    title: "LoRA support for the LLaVA tower and connector.",
    body: "Enabled LoRA training for the LLaVA vision tower and connector inside vLLM, the high-throughput LLM inference engine.",
    when: "Merged Jan 2026",
    url: "https://github.com/vllm-project/vllm/pull/31513",
  },
  {
    pr: "PR #1826",
    repo: "modelcontextprotocol / python-sdk",
    title: "Type annotation for the call_tool decorator.",
    body: "Fixed a missing type annotation on call_tool in the Anthropic MCP Python SDK, the SDK that powers MCP-based integrations.",
    when: "Merged Jan 2026",
    url: "https://github.com/modelcontextprotocol/python-sdk/pull/1826",
  },
  {
    pr: "PR #407",
    repo: "google / A2UI",
    title: ".env.example templates for safer secret setup.",
    body: "Added env templates to Google's A2UI, the open standard for agent-to-user interfaces. A small patch with real surface area.",
    when: "Merged Jan 2026",
    url: "https://github.com/google/A2UI/pull/407",
  },
];

const PUBLICATIONS = RESUME.publications;

const SKILLS = [
  {
    level: "Expert",
    note: "ship daily, design from scratch",
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

// The human details that don't belong in the ledger but are true regardless.
const OFF_RESUME = [
  "Two production data platforms, two languages: Stock Data Platform in Python (Kafka, Airflow, TimescaleDB); an Indian-market platform in Rust (Axum, WASM, Neon).",
  "Cursor, Claude Code, and Codex daily for over a year: faster ramps on unfamiliar codebases, tighter feedback loops.",
  "WCA-registered speedcuber, 16.7-second best. Not on the resume, true regardless.",
];

const pad = (n: number) => String(n).padStart(2, "0");
const roleCount = RESUME.experience.reduce((n, c) => n + c.roles.length, 0);

// Section label: a mono eyebrow that names the section (not a forced 01/02/03
// sequence — these sections aren't ordered steps) + a serif heading.
function SectionHead({ label, meta, title }: { label: string; meta?: string; title: string }) {
  return (
    <div className="mb-[var(--tr-s-6)] border-t border-tr-hairline pt-[var(--tr-s-4)]">
      <div className="flex flex-wrap items-baseline justify-between gap-x-[var(--tr-s-4)] gap-y-[var(--tr-s-1)]">
        <p className="text-[length:var(--tr-t-mono-sm)] uppercase text-tr-text-mute" style={mono}>
          {label}
        </p>
        {meta ? (
          <p className="text-[length:var(--tr-t-mono-sm)] text-tr-text-faint" style={monoData}>
            {meta}
          </p>
        ) : null}
      </div>
      <h2
        className="mt-[var(--tr-s-3)] text-[length:var(--tr-t-h2)] font-light leading-[1.02] tracking-[-.015em] text-tr-text"
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

      {/* ========== HERO — thesis ========== */}
      <section className={`${SHELL} pt-[6.5rem] pb-[var(--tr-s-7)]`}>
        <div className={WRAP}>
          <div className="max-w-[54rem]">
            <p className="mb-[var(--tr-s-4)] text-[length:var(--tr-t-mono)] uppercase text-tr-text-mute" style={mono}>
              Forward Deployed Engineer · Gujarat, India (open to relocate)
            </p>
            <h1
              className="mb-[var(--tr-s-5)] text-[length:var(--tr-t-display)] font-light leading-[.92] tracking-[-.02em] text-tr-text"
              style={serif}
            >
              Jay Hemnani.
            </h1>
            <p
              className="max-w-[44ch] text-[length:var(--tr-t-h3)] font-light leading-[1.25] text-tr-text"
              style={serif}
            >
              Four years of finished things: production data platforms, computer-vision research, and
              merged code in repositories I did not own.
            </p>
            <p className="mt-[var(--tr-s-5)] max-w-[62ch] text-[length:var(--tr-t-body)] leading-[1.6] text-tr-text-mute" style={serif}>
              Trained in computer engineering at PDEU. I have moved between data-analyst, ML-engineer, and
              full-stack roles, usually because the project demanded it, and I take prototypes to production
              quickly. Available for full-time and freelance.
            </p>
          </div>
        </div>
      </section>

      {/* ========== PROOF LEDGER — the signature ========== */}
      <section className={`${SHELL} pb-[var(--tr-s-9)]`}>
        <div className={WRAP}>
          <div className="border border-tr-hairline bg-tr-surface-1">
            <p
              className="border-b border-tr-hairline px-[var(--tr-s-5)] py-[var(--tr-s-3)] text-[length:var(--tr-t-mono-sm)] uppercase text-tr-text-faint"
              style={mono}
            >
              {"// the case, read first"}
            </p>
            <dl className="grid grid-cols-1 gap-px bg-tr-hairline sm:grid-cols-2">
              {PROOF.map((p) => (
                <div
                  key={p.head}
                  className="min-w-0 bg-tr-surface-1 px-[var(--tr-s-5)] py-[var(--tr-s-6)]"
                >
                  <dd className="flex items-baseline gap-[.15em]">
                    <span
                      className="text-[length:var(--tr-t-display)] font-light leading-[.85] tracking-[-.03em] text-tr-text"
                      style={serif}
                    >
                      {p.n}
                    </span>
                    {p.unit ? (
                      <span className="text-[length:var(--tr-t-h3)] font-light text-tr-text-mute" style={serif}>
                        {p.unit}
                      </span>
                    ) : null}
                    {p.live ? (
                      <span
                        aria-hidden="true"
                        className="ml-[.4em] inline-block h-[.5em] w-[.5em] translate-y-[-.6em] rounded-full bg-tr-ember shadow-[var(--tr-glow-box)]"
                      />
                    ) : null}
                  </dd>
                  <dt className="mt-[var(--tr-s-3)] text-[length:var(--tr-t-body)] text-tr-text" style={serif}>
                    {p.head}
                  </dt>
                  <p className="mt-[var(--tr-s-1)] text-[length:var(--tr-t-mono-sm)] text-tr-text-faint" style={monoData}>
                    {p.sub}
                  </p>
                </div>
              ))}
            </dl>
          </div>

          {/* résumé downloads sit right under the ledger — the action after the pitch */}
          <div className="mt-[var(--tr-s-5)] flex flex-wrap items-center gap-x-[var(--tr-s-4)] gap-y-[var(--tr-s-3)]">
            <p className="text-[length:var(--tr-t-mono-sm)] uppercase text-tr-text-mute" style={mono}>
              Résumé, by role ·
            </p>
            {RESUME_PDFS.map((r) => (
              <a
                key={r.file}
                href={r.file}
                target="_blank"
                rel="noreferrer"
                data-cursor="OPEN"
                className="text-[length:var(--tr-t-mono-sm)] uppercase text-tr-text-mute underline decoration-tr-hairline decoration-1 underline-offset-4 transition-colors duration-[var(--tr-dur-base)] ease-[var(--tr-ease)] hover:text-tr-ember hover:decoration-tr-ember"
                style={mono}
              >
                {r.label}
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* ========== EVIDENCE — open source ========== */}
      <section className={`${SHELL} py-[var(--tr-s-9)]`}>
        <div className={WRAP}>
          <SectionHead label="// evidence · open source" meta="3 merged" title="Merged into repos I don't own." />
          <p className="mb-[var(--tr-s-6)] max-w-[60ch] text-[length:var(--tr-t-body)] leading-[1.6] text-tr-text-mute" style={serif}>
            Landing a change inside an unfamiliar large codebase is the whole forward-deployed skill in
            miniature: read the seam, respect the conventions, ship the patch.
          </p>
          <ol className="grid list-none gap-[var(--tr-s-4)] lg:grid-cols-3">
            {OSS.map((o) => (
              <li key={o.url} className="flex min-w-0 flex-col border border-tr-hairline bg-tr-surface-1 p-[var(--tr-s-5)]">
                <div className="flex items-baseline justify-between gap-[var(--tr-s-2)]">
                  <span className="text-[length:var(--tr-t-mono)] text-tr-text" style={monoData}>{o.pr}</span>
                  <span className="text-[length:var(--tr-t-mono-sm)] uppercase text-tr-text-faint" style={mono}>{o.when}</span>
                </div>
                <p className="mt-[var(--tr-s-1)] break-words text-[length:var(--tr-t-mono-sm)] text-tr-text-faint" style={monoData}>
                  {o.repo}
                </p>
                <h3 className="mt-[var(--tr-s-4)] text-[length:var(--tr-t-h3)] font-light leading-[1.15] text-tr-text" style={serif}>
                  {o.title}
                </h3>
                <p className="mt-[var(--tr-s-3)] flex-1 text-[length:var(--tr-t-body)] leading-[1.55] text-tr-text-mute" style={serif}>
                  {o.body}
                </p>
                <a
                  href={o.url}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-[var(--tr-s-4)] text-[length:var(--tr-t-mono-sm)] uppercase text-tr-text-mute no-underline transition-colors duration-[var(--tr-dur-base)] ease-[var(--tr-ease)] hover:text-tr-ember"
                  style={mono}
                >
                  View PR ↗
                </a>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ========== EVIDENCE — publications ========== */}
      <section className={`${SHELL} py-[var(--tr-s-9)]`}>
        <div className={WRAP}>
          <SectionHead label="// evidence · research" meta="two IEEE papers" title="Published as an undergrad." />
          <ol className="list-none">
            {PUBLICATIONS.map((pub, i) => (
              <li key={pub.title} className="border-t border-tr-hairline py-[var(--tr-s-6)] first:border-t-0">
                <div className="grid gap-[var(--tr-s-3)] lg:grid-cols-[9rem_1fr] lg:gap-[var(--tr-s-6)]">
                  <div className="text-[length:var(--tr-t-h2)] font-light leading-none text-tr-text-faint" style={serif}>
                    №{pad(i + 1)}
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-[length:var(--tr-t-h3)] font-light leading-[1.15] text-tr-text" style={serif}>
                      {pub.title}.
                    </h3>
                    <p className="mt-[var(--tr-s-1)] text-[length:var(--tr-t-mono-sm)] uppercase text-tr-text-mute" style={mono}>
                      {pub.venue} · {pub.year}
                    </p>
                    <p className="mt-[var(--tr-s-3)] max-w-[64ch] text-[length:var(--tr-t-body)] leading-[1.6] text-tr-text-mute" style={serif}>
                      {pub.description}
                    </p>
                    <div className="mt-[var(--tr-s-3)] flex flex-wrap gap-x-[var(--tr-s-5)] gap-y-[var(--tr-s-2)] text-[length:var(--tr-t-mono-sm)] uppercase text-tr-text-mute" style={mono}>
                      {pub.link ? (
                        <a href={pub.link} target="_blank" rel="noreferrer" className="no-underline transition-colors duration-[var(--tr-dur-base)] ease-[var(--tr-ease)] hover:text-tr-ember">
                          Paper ↗
                        </a>
                      ) : null}
                      {pub.github ? (
                        <a href={pub.github} target="_blank" rel="noreferrer" className="no-underline transition-colors duration-[var(--tr-dur-base)] ease-[var(--tr-ease)] hover:text-tr-ember">
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

      {/* ========== STACK — matrix ========== */}
      <section className={`${SHELL} py-[var(--tr-s-9)]`}>
        <div className={WRAP}>
          <SectionHead label="// stack" meta="by honest level" title="What I reach for." />
          <div className="grid gap-px overflow-hidden border border-tr-hairline bg-tr-hairline lg:grid-cols-3">
            {SKILLS.map((col) => (
              <div key={col.level} className="min-w-0 bg-tr-bg p-[var(--tr-s-5)]">
                <div className="flex items-baseline justify-between gap-[var(--tr-s-2)]">
                  <h3 className="text-[length:var(--tr-t-h3)] font-light text-tr-text" style={serif}>{col.level}</h3>
                  <span className="text-[length:var(--tr-t-mono-sm)] text-tr-text-faint" style={monoData}>{col.items.length}</span>
                </div>
                <p className="mt-[var(--tr-s-1)] text-[length:var(--tr-t-mono-sm)] text-tr-text-mute" style={monoData}>{col.note}</p>
                <div className="mt-[var(--tr-s-4)] flex flex-wrap gap-[.4em] text-[length:var(--tr-t-mono-sm)] text-tr-text-mute" style={monoData}>
                  {col.items.map((s) => (
                    <span key={s} className="border border-tr-hairline px-[.6em] py-[.25em]">{s}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========== EXPERIENCE — the honest CV, quieter ========== */}
      <section className={`${SHELL} py-[var(--tr-s-9)]`} id="resume">
        <div className={WRAP}>
          <SectionHead label="// experience" meta={`${roleCount} roles · 2019–2025`} title="The working record." />
          <ol className="list-none">
            {RESUME.experience.flatMap((company) =>
              company.roles.map((role) => {
                const place = role.location || company.location;
                return (
                  <li key={`${company.name}-${role.title}`} className="border-t border-tr-hairline py-[var(--tr-s-5)] first:border-t-0">
                    <div className="grid gap-[var(--tr-s-2)] lg:grid-cols-[13rem_1fr] lg:gap-[var(--tr-s-6)]">
                      <div className="min-w-0">
                        <div className="text-[length:var(--tr-t-mono-sm)] text-tr-text-mute" style={monoData}>{role.period?.label}</div>
                        <div className="mt-[var(--tr-s-1)] text-[length:var(--tr-t-mono-sm)] uppercase text-tr-text-faint" style={mono}>{role.employmentType}</div>
                      </div>
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-baseline gap-x-[var(--tr-s-3)] gap-y-[var(--tr-s-1)]">
                          <h3 className="text-[length:var(--tr-t-h3)] font-light text-tr-text" style={serif}>{role.title}</h3>
                          <p className="text-[length:var(--tr-t-mono-sm)] uppercase text-tr-text-mute" style={mono}>
                            {company.name}{place ? ` · ${place}` : ""}
                          </p>
                        </div>
                        <ul className="mt-[var(--tr-s-3)] max-w-[64ch] list-disc space-y-[var(--tr-s-2)] pl-[1.15em] marker:text-tr-text-faint">
                          {role.bullets.map((b, i) => (
                            <li key={i} className="text-[length:var(--tr-t-body)] leading-[1.55] text-tr-text-mute" style={serif}>
                              {b.text}
                            </li>
                          ))}
                        </ul>
                        {role.tech && role.tech.length > 0 ? (
                          <div className="mt-[var(--tr-s-3)] flex flex-wrap gap-x-[1em] gap-y-[.3em] text-[length:var(--tr-t-mono-sm)] text-tr-text-faint" style={monoData}>
                            {role.tech.map((t) => <span key={t}>{t}</span>)}
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

      {/* ========== EDUCATION + OFF-RESUME ========== */}
      <section className={`${SHELL} py-[var(--tr-s-9)]`}>
        <div className={WRAP}>
          <div className="grid gap-[var(--tr-s-9)] lg:grid-cols-2">
            <div>
              <SectionHead label="// education" meta="one degree" title="Education." />
              {RESUME.education.map((edu) => (
                <div key={edu.institution}>
                  <h3 className="text-[length:var(--tr-t-h3)] font-light text-tr-text" style={serif}>{edu.degree}.</h3>
                  <p className="mt-[var(--tr-s-1)] text-[length:var(--tr-t-mono-sm)] uppercase text-tr-text-mute" style={mono}>
                    {edu.institution} · {edu.location}
                  </p>
                  <p className="mt-[var(--tr-s-2)] text-[length:var(--tr-t-mono-sm)] text-tr-text-faint" style={monoData}>
                    {edu.start}–{edu.end}{edu.gpa ? ` · GPA ${edu.gpa}` : ""}
                  </p>
                  {edu.courses && edu.courses.length > 0 ? (
                    <div className="mt-[var(--tr-s-4)] flex flex-wrap gap-x-[1em] gap-y-[.3em] text-[length:var(--tr-t-mono-sm)] text-tr-text-faint" style={monoData}>
                      {edu.courses.map((c) => <span key={c}>{c}</span>)}
                    </div>
                  ) : null}
                </div>
              ))}
            </div>
            <div>
              <SectionHead label="// off the resume" meta="true regardless" title="A few particulars." />
              <ul className="list-none space-y-[var(--tr-s-4)]">
                {OFF_RESUME.map((f) => (
                  <li key={f} className="flex gap-[var(--tr-s-3)] text-[length:var(--tr-t-body)] leading-[1.55] text-tr-text-mute" style={serif}>
                    <span aria-hidden="true" className="mt-[.55em] h-[1px] w-[1.1em] shrink-0 bg-tr-ember" />
                    <span className="min-w-0">{f}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ========== CONTACT ========== */}
      <section className={`${SHELL} py-[var(--tr-s-12)]`}>
        <div className={WRAP}>
          <SectionHead label="// correspondence" meta="responses inside 48h" title="Get in touch." />
          <div className="grid gap-[var(--tr-s-8)] lg:grid-cols-2 lg:items-end">
            <div>
              <p className="max-w-[26ch] text-[length:var(--tr-t-h2)] font-light leading-[1.1] text-tr-text" style={serif}>
                A note, an offer, or a problem worth solving.
              </p>
              <p className="mt-[var(--tr-s-4)] max-w-[52ch] text-[length:var(--tr-t-body)] leading-[1.6] text-tr-text-mute" style={serif}>
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
                <span className="text-[length:var(--tr-t-mono-sm)] uppercase text-tr-on-ember" style={mono}>Open the line</span>
                <span className="mt-[var(--tr-s-1)] break-words text-[length:var(--tr-t-body)] text-tr-on-ember" style={monoData}>
                  jayhemnani992000@gmail.com
                </span>
              </a>
              <div className="flex flex-wrap gap-x-[var(--tr-s-5)] gap-y-[var(--tr-s-2)] text-[length:var(--tr-t-mono)] uppercase text-tr-text-mute" style={mono}>
                <a href="https://github.com/jayhemnani9910" target="_blank" rel="noreferrer" className="no-underline transition-colors duration-[var(--tr-dur-base)] ease-[var(--tr-ease)] hover:text-tr-ember">GitHub ↗</a>
                <a href="https://linkedin.com/in/jayhemnani" target="_blank" rel="noreferrer" className="no-underline transition-colors duration-[var(--tr-dur-base)] ease-[var(--tr-ease)] hover:text-tr-ember">LinkedIn ↗</a>
                <a href="https://x.com/jeyhemnani9" target="_blank" rel="noreferrer" className="no-underline transition-colors duration-[var(--tr-dur-base)] ease-[var(--tr-ease)] hover:text-tr-ember">Twitter ↗</a>
                <Link href="/projects" className="no-underline transition-colors duration-[var(--tr-dur-base)] ease-[var(--tr-ease)] hover:text-tr-ember">Work →</Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <EditorialColophon />
    </main>
  );
}
