import type { CSSProperties } from "react";
import Link from "next/link";
import { EditorialMasthead } from "@/components/EditorialMasthead";
import { EditorialColophon } from "@/components/EditorialColophon";
import { DecompositionScene } from "@/components/motion/DecompositionScene";
import { Reveal } from "@/components/motion/Reveal";
import { Stagger, StaggerItem } from "@/components/motion/Stagger";
import { Magnetic } from "@/components/motion/Magnetic";
import { TacticalGraphFigure } from "@/components/featured/TacticalGraphFigure";
import { CausalAdversarialFigure } from "@/components/featured/CausalAdversarialFigure";
import { ProteinNMAFigure } from "@/components/featured/ProteinNMAFigure";
import { StarSchemaFigure } from "@/components/featured/StarSchemaFigure";
import { WebMCPFigure } from "@/components/featured/WebMCPFigure";
import { VDOSSpectrumFigure } from "@/components/featured/VDOSSpectrumFigure";

// Mono UI chrome: labels, kickers, buttons. Uppercase + wide tracking, matching
// the mockup's `.mono-label` (redesign/concepts/two-readers.html ~line 262).
const mono: CSSProperties = {
  fontFamily: "var(--font-jetbrains)",
  letterSpacing: ".08em",
};

// Mono machine-channel DATA: stats, receipts, tech tags, code. No forced
// uppercase and no extra tracking, so proper-noun casing (vLLM, PyTorch,
// ByteTrack) survives instead of being shouted into caps. Matches the
// mockup's `.mono-data` (~line 267), which is deliberately the opposite of
// `.mono-label` above.
const monoData: CSSProperties = {
  fontFamily: "var(--font-jetbrains)",
};

const serif: CSSProperties = {
  fontFamily: "var(--font-newsreader)",
};

const SHELL = "px-[clamp(1.25rem,5vw,2rem)]";
const WRAP = "mx-auto max-w-[1400px]";

// The five secondary featured projects. FIFA Soccer DS (the dominant lead) is
// hand-written below since it's structurally different (bigger media, an
// extra body paragraph). Kept as a data array + .map() so the five near-
// identical cards don't drift, matching the NAV_LINKS / INSIDE_LINKS pattern
// already used in EditorialMasthead.tsx / EditorialColophon.tsx.
const SECONDARY_PROJECTS = [
  {
    href: "/projects/revolu-idea",
    figure: CausalAdversarialFigure,
    ratio: "aspect-[5/3]",
    num: "№ 02",
    title: "CAG Deep Research.",
    deck: "LangGraph plans a causal graph of a question; red and blue agents fight over each edge; a dialectical judge rules.",
    tech: ["LangGraph", "LangChain", "Ollama", "Groq", "Pydantic"],
  },
  {
    href: "/projects/biotech-accelerator",
    figure: ProteinNMAFigure,
    ratio: "aspect-[5/3]",
    num: "№ 03",
    title: "Biotech Accelerator.",
    deck: "A LangGraph pipeline that pretends to be a research assistant, and increasingly succeeds.",
    tech: ["LangGraph", "ProDy", "httpx", "Rich", "Docker"],
  },
  {
    href: "/projects/stock-data-platform",
    figure: StarSchemaFigure,
    ratio: "aspect-[7/3]",
    num: "№ 04",
    title: "Stock Data Platform.",
    deck: "Kafka, eighteen Airflow DAGs, a TimescaleDB star schema, and a dashboard that wants to be Bloomberg.",
    tech: ["Kafka", "Airflow", "TimescaleDB", "Docker", "Dash"],
  },
  {
    href: "/projects/webmcp-portfolio",
    figure: WebMCPFigure,
    ratio: "aspect-[5/3]",
    num: "№ 05",
    title: "WebMCP, on this very site.",
    deck: "An LLM can browse this portfolio the way humans do, only faster, and without scrolling.",
    tech: ["TypeScript", "Next.js 16", "WebMCP", "JSON Schema"],
  },
  {
    href: "/projects/nobel-dataintelligence",
    figure: VDOSSpectrumFigure,
    ratio: "aspect-[5/3]",
    num: "№ 06",
    title: "Nobel Data Intelligence.",
    deck: "Tri-modal deep learning for protein stability: sequence, structure, and a vibrational signal nobody else is using.",
    tech: ["PyTorch Geometric", "ProDy", "BioPython", "RDKit", "Transformers"],
  },
] as const;

export function EditorialHome({
  projectCount,
  deepDiveCount,
  essayCount,
}: {
  projectCount: number;
  deepDiveCount: number;
  essayCount: number;
}) {
  const tocItems = [
    {
      folio: "A",
      href: "/projects" as const,
      slug: "work",
      title: "The Work",
      stat: `${projectCount} entries · ${deepDiveCount} deep-dives`,
      dek: "Computer vision, agentic AI, data platforms, a Go voice-to-text tool. The full archive, with deep-dives on most of it.",
    },
    {
      folio: "B",
      href: "/blog" as const,
      slug: "writing",
      title: "The Writing",
      stat: `${essayCount} ${essayCount === 1 ? "essay" : "essays"} · ${projectCount} writeups`,
      dek: "Project post-mortems and short essays on building in 2026. Unflattering details left in. Still under construction, in the honest sense of the phrase.",
    },
    {
      folio: "C",
      href: "/resume" as const,
      slug: "about",
      title: "The Particulars",
      stat: "CV · OSS · Pubs",
      dek: "Four years of work, two IEEE papers, three merged pull requests into ecosystem repositories, and a Rubik's cube record that will not make the resume.",
    },
  ] as const;

  return (
    <main id="main-content" className="bg-tr-bg text-tr-text">
      <EditorialMasthead active="cover" />

      {/* ========== HERO ==========
          Not wrapped in Reveal: this is the LCP surface and must paint on
          first render. Structure and copy ported verbatim from
          redesign/concepts/two-readers.html ~line 861. */}
      <section className={`${SHELL} pt-[6.5rem] pb-[3rem]`}>
        <div className={WRAP}>
          <div className="max-w-[46rem]">
            <p
              className="mb-[var(--tr-s-4)] text-[length:var(--tr-t-mono)] uppercase text-tr-text-mute"
              style={mono}
            >
              Forward Deployed Engineer / Gujarat, IN / Open to relocate
            </p>

            <h1
              className="mb-[var(--tr-s-5)] text-[length:var(--tr-t-display)] font-light leading-[.95] tracking-[-.02em] text-tr-text"
              style={serif}
            >
              I take vague, broken problems and{" "}
              <em>
                <span className="italic text-tr-ember [text-shadow:var(--tr-glow-text)]">ship</span> the fix.
              </em>
            </h1>

            <p
              className="mb-[var(--tr-s-6)] max-w-[52ch] text-[length:var(--tr-t-body)] leading-[1.5] text-tr-text-mute"
              style={serif}
            >
              Four years building agentic AI systems, data pipelines and distributed backends. I go into the
              messy part, decompose it, and leave something that still runs on Monday.
            </p>

            <div className="mb-[var(--tr-s-6)]">
              <div
                className="mb-[var(--tr-s-3)] flex flex-wrap items-center text-[length:var(--tr-t-mono-sm)] text-tr-text-mute"
                style={monoData}
              >
                <span>{projectCount} PROJECTS</span>
                <span aria-hidden="true" className="mx-[.75em] inline-block h-[.9em] w-px bg-tr-hairline" />
                <span>3 MERGED OSS PRS</span>
                <span aria-hidden="true" className="mx-[.75em] inline-block h-[.9em] w-px bg-tr-hairline" />
                <span>2 IEEE PAPERS</span>
                <span aria-hidden="true" className="mx-[.75em] inline-block h-[.9em] w-px bg-tr-hairline" />
                <span>1 LIVE SIMULATION</span>
              </div>
              <p
                className="flex flex-wrap gap-x-[1.25em] gap-y-[.25em] text-[length:var(--tr-t-mono-sm)] text-tr-text-faint"
                style={monoData}
              >
                <span>vLLM#31513</span>
                <span>ANTHROPIC/MCP#1826</span>
                <span>A2UI#407</span>
              </p>
            </div>

            <div className="flex flex-wrap gap-x-[1rem] gap-y-[.75rem]">
              <Magnetic>
                <Link
                  href="/fde"
                  data-cursor="RUN"
                  className="inline-flex items-center justify-center border border-transparent bg-tr-ember px-[1.5em] py-[.875em] text-[length:var(--tr-t-mono)] uppercase text-tr-on-ember no-underline shadow-[var(--tr-glow-box)]"
                  style={mono}
                >
                  Run the simulation
                </Link>
              </Magnetic>
              <Link
                href="/resume"
                data-cursor="OPEN"
                className="inline-flex items-center justify-center border border-tr-hairline px-[1.5em] py-[.875em] text-[length:var(--tr-t-mono)] uppercase text-tr-text no-underline transition-colors duration-[var(--tr-dur-base)] ease-[var(--tr-ease)] hover:border-tr-ember hover:text-tr-ember"
                style={mono}
              >
                Resume
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ========== DECOMPOSITION SCENE ========== */}
      <DecompositionScene />

      {/* ========== FEATURED WORK ==========
          One dominant lead (Reveal) + a secondary grid (Stagger), as
          SIBLINGS rather than nesting Stagger inside Reveal. Nesting would
          put the grid's own whileInView-observed root inside Reveal's
          clip-path-hidden mask div, which Reveal.tsx documents as a Chrome
          bug: a node clipped via clip-path can report a permanently-stuck
          intersectionRatio of 0, so the grid would never reveal. */}
      <section className={`${SHELL} py-[var(--tr-s-12)]`}>
        <div className={WRAP}>
          <Reveal>
            <div>
              <h2 className="sr-only">Featured work</h2>
              <p
                className="mb-[var(--tr-s-6)] text-[length:var(--tr-t-mono-sm)] uppercase tracking-[.08em] text-tr-text-mute"
                style={mono}
              >
                § 02 / featured work
              </p>

              <Link href="/projects/fifa-soccer-ds" data-cursor="OPEN" className="group block no-underline">
                <div className="mb-[var(--tr-s-5)] aspect-[16/9]">
                  <TacticalGraphFigure className="h-full w-full" />
                </div>
                <div className="grid gap-[var(--tr-s-3)] lg:grid-cols-[auto_1fr] lg:gap-[var(--tr-s-5)]">
                  <span className="text-[length:var(--tr-t-mono-sm)] text-tr-text-mute" style={monoData}>
                    № 01
                  </span>
                  <div>
                    <h3
                      className="mb-[var(--tr-s-2)] text-[length:var(--tr-t-h3)] font-light text-tr-text"
                      style={serif}
                    >
                      FIFA Soccer DS.
                    </h3>
                    <p
                      className="mb-[var(--tr-s-2)] max-w-[60ch] text-[length:var(--tr-t-body)] text-tr-text"
                      style={serif}
                    >
                      YOLOv8 detects, ByteTrack persists, a GraphSAGE scaffold builds the tactical graph, all
                      wrapped in DVC, MLflow, and a FastAPI shipping container.
                    </p>
                    <p
                      className="mb-[var(--tr-s-3)] max-w-[60ch] text-[length:var(--tr-t-body)] text-tr-text-mute"
                      style={serif}
                    >
                      A production-shaped computer-vision pipeline for soccer video, end-to-end and
                      reproducible. Seven-stage DVC pipeline, MLflow experiment tracking, twenty-two frames per
                      second. The thing actually runs.
                    </p>
                    <div
                      className="flex flex-wrap gap-x-[1em] gap-y-[.4em] text-[length:var(--tr-t-mono-sm)] text-tr-text-faint"
                      style={monoData}
                    >
                      <span>YOLOv8</span>
                      <span>ByteTrack</span>
                      <span>PyTorch Geometric</span>
                      <span>MLflow</span>
                      <span>DVC</span>
                      <span>FastAPI</span>
                    </div>
                  </div>
                </div>
              </Link>
            </div>
          </Reveal>

          <Stagger className="mt-[var(--tr-s-10)] grid gap-[var(--tr-s-6)] sm:grid-cols-2 lg:grid-cols-3">
            {SECONDARY_PROJECTS.map((p) => {
              const Figure = p.figure;
              return (
                <StaggerItem key={p.href}>
                  <Link href={p.href} data-cursor="OPEN" className="group block h-full no-underline">
                    <div className={`mb-[var(--tr-s-3)] ${p.ratio}`}>
                      <Figure className="h-full w-full" />
                    </div>
                    <span className="text-[length:var(--tr-t-mono-sm)] text-tr-text-mute" style={monoData}>
                      {p.num}
                    </span>
                    <h3
                      className="mb-[var(--tr-s-1)] text-[length:var(--tr-t-h3)] font-light text-tr-text"
                      style={serif}
                    >
                      {p.title}
                    </h3>
                    <p className="mb-[var(--tr-s-2)] text-[length:var(--tr-t-body)] text-tr-text-mute" style={serif}>
                      {p.deck}
                    </p>
                    <div
                      className="flex flex-wrap gap-x-[.75em] gap-y-[.3em] text-[length:var(--tr-t-mono-sm)] text-tr-text-faint"
                      style={monoData}
                    >
                      {p.tech.map((t) => (
                        <span key={t}>{t}</span>
                      ))}
                    </div>
                  </Link>
                </StaggerItem>
              );
            })}
          </Stagger>

          <p className="mt-[var(--tr-s-8)]">
            <Link
              href="/projects"
              data-cursor="OPEN"
              className="text-[length:var(--tr-t-mono)] uppercase text-tr-text-mute no-underline transition-colors duration-[var(--tr-dur-base)] ease-[var(--tr-ease)] hover:text-tr-ember"
              style={mono}
            >
              See all {projectCount} projects →
            </Link>
          </p>
        </div>
      </section>

      {/* ========== TWO READERS (WebMCP payoff) ========== */}
      <Reveal>
        <section className={`${SHELL} py-[var(--tr-s-12)]`}>
          <div className={WRAP}>
            <p
              className="mb-[var(--tr-s-3)] text-[length:var(--tr-t-mono-sm)] uppercase tracking-[.08em] text-tr-text-mute"
              style={mono}
            >
              § 03 / two readers
            </p>
            <h2
              className="mb-[var(--tr-s-3)] text-[length:var(--tr-t-h2)] font-light leading-[1.1] text-tr-text"
              style={serif}
            >
              Two readers.
            </h2>
            <p
              className="mb-[var(--tr-s-8)] max-w-[46ch] text-[length:var(--tr-t-body)] text-tr-text-mute"
              style={serif}
            >
              This site has a human reader and a machine reader.
            </p>

            {/* [&>*]:min-w-0 lets the code column shrink to its grid track. Grid/flex
                items default to min-width:auto (won't shrink below content), so the
                wide whitespace-pre JSON would otherwise blow the page past 390px and
                the pre's own overflow-x-auto would never engage. */}
            <div className="grid gap-[var(--tr-s-6)] lg:grid-cols-2 lg:items-start [&>*]:min-w-0">
              <p className="text-[length:var(--tr-t-body)] leading-[1.6] text-tr-text" style={serif}>
                An LLM can read this portfolio the way you do, only faster, through eight tools it calls
                directly instead of scraping the page.
              </p>

              <div className="border border-tr-hairline bg-tr-surface-1 p-[var(--tr-s-5)]">
                <pre
                  className="overflow-x-auto whitespace-pre text-[length:var(--tr-t-mono-sm)] leading-[1.6] text-tr-text-mute"
                  style={monoData}
                >
                  <code>
                    <span className="text-tr-ember">{">"}</span>
                    {" navigator.modelContext.callTool("}
                    <span className="text-tr-text">{'"get_project"'}</span>
                    {", { id: "}
                    <span className="text-tr-text">{'"webmcp-portfolio"'}</span>
                    {" })"}
                    {"\n{\n"}
                    {'  "id": '}
                    <span className="text-tr-text">{'"webmcp-portfolio"'}</span>
                    {",\n"}
                    {'  "role": '}
                    <span className="text-tr-text">{'"Builder"'}</span>
                    {",\n"}
                    {'  "stack": ['}
                    <span className="text-tr-text">{'"TypeScript"'}</span>
                    {", "}
                    <span className="text-tr-text">{'"Next.js 16"'}</span>
                    {", "}
                    <span className="text-tr-text">{'"WebMCP"'}</span>
                    {"],\n"}
                    {'  "tools_registered": 8,\n'}
                    {'  "url": '}
                    <span className="text-tr-text">{'"https://www.jayhemnani.me/projects/webmcp-portfolio"'}</span>
                    {"\n}"}
                  </code>
                </pre>
              </div>
            </div>
          </div>
        </section>
      </Reveal>

      {/* ========== CONTENTS ========== */}
      <Reveal>
        <section className={`${SHELL} py-[var(--tr-s-12)]`}>
          <div className={WRAP}>
            <p
              className="mb-[var(--tr-s-3)] text-[length:var(--tr-t-mono-sm)] uppercase tracking-[.08em] text-tr-text-mute"
              style={mono}
            >
              § 04 / in this issue
            </p>
            <h2 className="mb-[var(--tr-s-6)] text-[length:var(--tr-t-h2)] font-light text-tr-text" style={serif}>
              In this issue.
            </h2>

            <ol className="border-t border-tr-hairline">
              {tocItems.map((item) => (
                <li key={item.href} className="border-b border-tr-hairline">
                  <Link
                    href={item.href}
                    className="flex flex-col gap-[var(--tr-s-2)] py-[var(--tr-s-5)] no-underline sm:flex-row sm:items-baseline sm:gap-[var(--tr-s-5)]"
                  >
                    <span className="text-[length:var(--tr-t-mono-sm)] text-tr-text-mute" style={monoData}>
                      {item.folio}
                    </span>
                    <div className="flex-1">
                      <div className="flex flex-wrap items-baseline justify-between gap-[var(--tr-s-2)]">
                        <span
                          className="text-[length:var(--tr-t-h3)] font-light text-tr-text"
                          style={serif}
                        >
                          {item.title}
                        </span>
                        <span
                          className="text-[length:var(--tr-t-mono-sm)] uppercase text-tr-text-mute"
                          style={mono}
                        >
                          {item.stat} · /{item.slug} →
                        </span>
                      </div>
                      <p
                        className="mt-[var(--tr-s-1)] max-w-[60ch] text-[length:var(--tr-t-body)] text-tr-text-mute"
                        style={serif}
                      >
                        {item.dek}
                      </p>
                    </div>
                  </Link>
                </li>
              ))}
            </ol>
          </div>
        </section>
      </Reveal>

      {/* ========== CONTACT ========== */}
      <Reveal>
        <section className={`${SHELL} py-[var(--tr-s-12)]`}>
          <div className={`${WRAP} grid gap-[var(--tr-s-8)] lg:grid-cols-2 lg:items-end`}>
            <div>
              <p
                className="mb-[var(--tr-s-3)] text-[length:var(--tr-t-mono-sm)] uppercase tracking-[.08em] text-tr-text-mute"
                style={mono}
              >
                § 05 / correspondence
              </p>
              <h2
                className="mb-[var(--tr-s-4)] text-[length:var(--tr-t-h2)] font-light leading-[1.05] text-tr-text"
                style={serif}
              >
                Hiring? Building? Stuck?
              </h2>
              <p className="max-w-[52ch] text-[length:var(--tr-t-body)] text-tr-text-mute" style={serif}>
                I am looking for forward-deployed and data-engineering roles, though senior software is also on
                the table. Staff-shaped problems welcome.
              </p>
            </div>

            <div className="flex flex-col items-start gap-[var(--tr-s-5)] lg:items-end">
              <a
                href="mailto:jayhemnani992000@gmail.com"
                className="flex flex-col border border-tr-hairline bg-tr-surface-1 px-[var(--tr-s-5)] py-[var(--tr-s-4)] no-underline transition-colors duration-[var(--tr-dur-base)] ease-[var(--tr-ease)] hover:border-tr-ember"
              >
                <span
                  className="text-[length:var(--tr-t-mono-sm)] uppercase text-tr-text-mute"
                  style={mono}
                >
                  Open the line
                </span>
                <span className="text-[length:var(--tr-t-h3)] font-light text-tr-text" style={serif}>
                  jayhemnani992000@gmail.com
                </span>
              </a>
              <div
                className="flex flex-wrap gap-x-[var(--tr-s-5)] gap-y-[var(--tr-s-2)] text-[length:var(--tr-t-mono)] uppercase text-tr-text-mute"
                style={mono}
              >
                <a href="https://github.com/jayhemnani9910" target="_blank" rel="noreferrer" className="no-underline hover:text-tr-ember">
                  GitHub ↗
                </a>
                <a href="https://linkedin.com/in/jayhemnani" target="_blank" rel="noreferrer" className="no-underline hover:text-tr-ember">
                  LinkedIn ↗
                </a>
                <a href="https://x.com/jeyhemnani9" target="_blank" rel="noreferrer" className="no-underline hover:text-tr-ember">
                  Twitter ↗
                </a>
                <Link href="/resume" className="no-underline hover:text-tr-ember">
                  Résumé →
                </Link>
              </div>
            </div>
          </div>
        </section>
      </Reveal>

      <EditorialColophon />
    </main>
  );
}
