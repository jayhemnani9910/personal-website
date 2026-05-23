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

export default function AboutPage() {
  return (
    <main id="main-content" className="editorial min-h-screen" style={{ background: "var(--bg-primary)" }}>
      <EditorialMasthead active="about" />

      {/* Hero */}
      <section className="about-hero shell">
        <div className="about-hero-grid">
          <div>
            <div className="eyebrow"><span className="dot" /><span>Department C · The Particulars</span></div>
            <h1 className="display about-title"><span>About,</span><br /><span className="italic">in particular.</span></h1>
          </div>
          <div className="about-hero-side">
            <p className="lede">
              Born in Gujarat. Trained in computer engineering at PDEU. Have spent the last four years moving between data analyst, ML engineer, and full-stack engineer roles, usually because the project demanded it. Two IEEE papers. Three merged OSS patches. A long catalogue of finished things. Available for full-time and freelance.
            </p>
            <div className="about-quick">
              <div><span className="mono xs upper muted">Name</span><br /><b>Jay Hemnani</b></div>
              <div><span className="mono xs upper muted">Based</span><br /><b>Gujarat, India</b>, open to relocate</div>
              <div><span className="mono xs upper muted">Status</span><br /><b>Available</b>, full-time and freelance</div>
              <div><span className="mono xs upper muted">Reach</span><br /><a href="mailto:jayhemnani992000@gmail.com" className="underline-link">jayhemnani992000@gmail.com</a></div>
            </div>
          </div>
        </div>
      </section>

      <hr className="rule thick shell" style={{ marginInline: "var(--margin)" }} />

      {/* Experience */}
      <section className="experience shell" id="resume">
        <div className="section-head">
          <span className="num">§ 01</span>
          <span className="title">Curriculum vitae.</span>
          <span className="meta">{RESUME.experience.length} roles</span>
        </div>

        <div className="cv-list">
          {RESUME.experience.flatMap((company) =>
            company.roles.map((role) => (
              <article className="cv-row" key={`${company.name}-${role.title}`}>
                <div className="cv-side">
                  <div className="cv-year mono">{role.period?.label}</div>
                  <div className="cv-period mono xs upper muted">{role.employmentType}</div>
                </div>
                <div className="cv-body">
                  <header>
                    <h3>{role.title}</h3>
                    <span className="cv-company">
                      {company.name}
                      {(role.location || company.location) && <em> · {role.location || company.location}</em>}
                    </span>
                  </header>
                  <ul>
                    {role.bullets.map((b, i) => (
                      <li key={i}>{b.text}</li>
                    ))}
                  </ul>
                  {role.tech && role.tech.length > 0 && (
                    <div className="cv-stack mono">{role.tech.join(" · ")}</div>
                  )}
                </div>
              </article>
            ))
          )}
        </div>

        <div className="resume-pdfs">
          <span className="mono xs upper muted">Download the PDFs</span>
          {RESUME_PDFS.map((r) => (
            <a key={r.file} className="pdf" href={r.file} target="_blank" rel="noreferrer">{r.label}</a>
          ))}
        </div>
      </section>

      {/* Education */}
      <section className="education shell">
        <div className="section-head">
          <span className="num">§ 02</span>
          <span className="title">Education.</span>
          <span className="meta">one degree</span>
        </div>
        {RESUME.education.map((edu) => (
          <article className="edu-row" key={edu.institution}>
            <div className="edu-side">
              <div className="edu-year mono">{edu.start}-{edu.end}</div>
              {edu.gpa && <div className="edu-gpa mono xs upper">GPA <b>{edu.gpa}</b></div>}
            </div>
            <div className="edu-body">
              <h3>{edu.degree}.</h3>
              <p className="edu-company">{edu.institution}<em> · {edu.location}</em></p>
              <p className="edu-deck">Four years of computer engineering, two IEEE papers as an undergrad, and a developing taste for systems that other people end up using.</p>
              {edu.courses && edu.courses.length > 0 && (
                <div className="edu-coursework">
                  <span className="mono xs upper muted">Coursework</span>
                  {edu.courses.map((c) => <span key={c}>{c}</span>)}
                </div>
              )}
            </div>
          </article>
        ))}
      </section>

      {/* Publications */}
      <section className="publications shell">
        <div className="section-head">
          <span className="num">§ 03</span>
          <span className="title">Publications.</span>
          <span className="meta">two IEEE papers</span>
        </div>
        <div className="pub-grid">
          {RESUME.publications.map((pub, i) => (
            <article className="pub" key={pub.title}>
              <div className="pub-num">№ {pad(i + 1)}</div>
              <div className="pub-body">
                <div className="pub-meta mono xs upper">
                  <span>{pub.venue}</span><span>·</span><span>{pub.year}</span>
                </div>
                <h3>{pub.title}.</h3>
                <p>{pub.description}</p>
                <div className="pub-links">
                  {pub.link && <a href={pub.link} target="_blank" rel="noreferrer">Paper ↗</a>}
                  {pub.github && <a href={pub.github} target="_blank" rel="noreferrer">Code ↗</a>}
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Open source */}
      <section className="oss shell">
        <div className="section-head">
          <span className="num">§ 04</span>
          <span className="title">Open source, three merged.</span>
          <span className="meta">vLLM · MCP SDK · A2UI</span>
        </div>
        <p className="oss-intro lede">
          Three PRs into ecosystem-critical repositories, each landed by navigating an unfamiliar large codebase, finding the seam, and shipping the change.
        </p>
        <div className="oss-list">
          {OSS.map((o) => (
            <article className="oss-row" key={o.url}>
              <div className="oss-num mono">{o.pr}</div>
              <div className="oss-body">
                <div className="oss-repo mono xs upper">{o.repo}</div>
                <h3>{o.title}</h3>
                <p>{o.body}</p>
                <a href={o.url} target="_blank" rel="noreferrer" className="go">View pull request</a>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Skills */}
      <section className="skills shell">
        <div className="section-head">
          <span className="num">§ 05</span>
          <span className="title">Stack, by honest level.</span>
          <span className="meta">expert · proficient · working</span>
        </div>
        <div className="skill-grid">
          {SKILLS.map((col) => (
            <div className="skill-col" key={col.level}>
              <h4 className="skill-h">{col.level} <span className="muted small">{col.note}</span></h4>
              <ul>{col.items.map((s) => <li key={s}>{s}</li>)}</ul>
            </div>
          ))}
        </div>
      </section>

      {/* Facts */}
      <section className="facts shell">
        <div className="section-head">
          <span className="num">§ 06</span>
          <span className="title">A few non-trivial particulars.</span>
          <span className="meta">numbered, not ranked</span>
        </div>
        <ol className="fact-list">
          {FACTS.map((f, i) => (
            <li key={f.h}>
              <span className="fact-num">{pad(i + 1)}</span>
              <div className="fact-body">
                <h4>{f.h}</h4>
                <p>{f.p}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      {/* Contact */}
      <section className="contact-cta shell">
        <div className="section-head">
          <span className="num">§ 07</span>
          <span className="title">Get in touch.</span>
          <span className="meta">responses inside 48h</span>
        </div>
        <div className="contact-grid">
          <div>
            <h2 className="display contact-h">A note, an offer, or a problem worth solving.</h2>
            <p className="lede">I am looking for forward-deployed engineering, data engineering, agentic AI, and senior software roles. Staff-shaped problems welcome. India-remote, global-remote, and on-site with relocation all on the table.</p>
          </div>
          <div className="contact-side">
            <a className="cta-button" href="mailto:jayhemnani992000@gmail.com">
              <span className="mono xs upper muted">Open the line</span>
              <span className="cta-mail">jayhemnani992000@gmail.com</span>
            </a>
            <div className="cta-links">
              <a href="https://github.com/jayhemnani9910" target="_blank" rel="noreferrer">GitHub ↗</a>
              <a href="https://linkedin.com/in/jayhemnani" target="_blank" rel="noreferrer">LinkedIn ↗</a>
              <a href="https://x.com/jeyhemnani9" target="_blank" rel="noreferrer">Twitter ↗</a>
              <Link href="/projects">Work →</Link>
            </div>
          </div>
        </div>
      </section>

      <EditorialColophon />
    </main>
  );
}
