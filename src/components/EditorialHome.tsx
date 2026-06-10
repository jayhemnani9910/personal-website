"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useReducedMotion } from "framer-motion";
import { EditorialMasthead } from "@/components/EditorialMasthead";
import { EditorialColophon } from "@/components/EditorialColophon";
import { StarSchemaFigure } from "@/components/featured/StarSchemaFigure";
import { TacticalGraphFigure } from "@/components/featured/TacticalGraphFigure";
import { CausalAdversarialFigure } from "@/components/featured/CausalAdversarialFigure";
import { ProteinNMAFigure } from "@/components/featured/ProteinNMAFigure";
import { VDOSSpectrumFigure } from "@/components/featured/VDOSSpectrumFigure";
import { WebMCPFigure } from "@/components/featured/WebMCPFigure";

const ROLES = [
  "forward-deployed engineer",
  "agentic AI engineer",
  "ML engineer",
  "data engineer",
  "full-stack engineer",
];

function RoleRotator() {
  const prefersReducedMotion = useReducedMotion();
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (prefersReducedMotion) return;
    const tick = setInterval(() => {
      setVisible(false);
      const swap = setTimeout(() => {
        setIndex((i) => (i + 1) % ROLES.length);
        setVisible(true);
      }, 280);
      return () => clearTimeout(swap);
    }, 2400);
    return () => clearInterval(tick);
  }, [prefersReducedMotion]);

  return (
    <span className="cover-role" style={{ opacity: visible ? 1 : 0 }}>
      {ROLES[index]}
    </span>
  );
}

export function EditorialHome({ projectCount, deepDiveCount, essayCount }: { projectCount: number; deepDiveCount: number; essayCount: number }) {
  return (
    <main id="main-content" className="editorial">
      <EditorialMasthead active="cover" />

      {/* ========== COVER ========== */}
      <section className="cover shell">
        <div className="cover-grid">
          <aside className="cover-aside">
            <div className="eyebrow"><span className="dot" /><span>Cover Story · 01</span></div>
            <p className="cover-deck">
              An engineer who treats production as the medium, ships in days, and writes
              the post-mortem either way.
            </p>
            <div className="cover-meta">
              <div><span className="upper mono small muted">Based</span><br /><b>Gujarat, IN</b>, open to relocate</div>
              <div><span className="upper mono small muted">Available</span><br /><b>Full-time</b> and freelance</div>
              <div><span className="upper mono small muted">Reach</span><br /><a href="mailto:jayhemnani992000@gmail.com" className="underline-link">jayhemnani992000@gmail.com</a></div>
            </div>
          </aside>

          <div className="cover-main">
            <div className="cover-titlewrap">
              <h1 className="display"><span className="line">Jay</span><br /><span className="line italic">Hemnani.</span></h1>
            </div>
            <div className="cover-roleline">
              <span className="mono xs upper muted">currently positioning as</span>
              <RoleRotator />
            </div>
          </div>
        </div>

        <hr className="rule thick" style={{ marginTop: 48 }} />

        <div className="cover-lede-grid">
          <p className="lede">
            A data and AI engineer with a stubborn preference for systems that survive the
            Monday morning after the demo. Spent the last four years shipping production
            computer-vision pipelines, real-time data warehouses, and the kind of agentic AI
            plumbing that gets talked about more often than it gets built. Two IEEE papers as
            an undergrad. Three patches landed in vLLM, the Anthropic MCP SDK, and Google&apos;s
            A2UI. One personal site that an LLM can read directly.
          </p>

          <aside className="lede-side">
            <div className="eyebrow"><span>By the numbers</span></div>
            <ul className="stats">
              <li><b className="tabular">{projectCount}</b><span>projects in the index</span></li>
              <li><b className="tabular">2</b><span>IEEE publications</span></li>
              <li><b className="tabular">3</b><span>merged OSS PRs <span className="muted xs">vLLM · MCP · A2UI</span></span></li>
              <li><b className="tabular">10d</b><span>to a 5-agent research system</span></li>
              <li><b className="tabular">{deepDiveCount}</b><span>projects with deep-dives</span></li>
            </ul>
          </aside>
        </div>
      </section>

      {/* ========== FEATURED WORK ========== */}
      <section className="features shell">
        <div className="section-head">
          <span className="num">§ 02</span>
          <span className="title">Featured work, in six acts.</span>
          <span className="meta">the catalogue</span>
        </div>

        {/* Feature 01: FIFA Soccer DS */}
        <article className="feat feat-lead">
          <Link href="/projects/fifa-soccer-ds" className="cardlink">
            <div className="feat-media">
              <div className="ph" style={{ aspectRatio: "16 / 9" }}>
                <TacticalGraphFigure className="ph-img ph-fig" />
                <span className="ph-tag accent">Computer Vision · MLOps</span>
                <div className="ph-label"><span>fig. 01, tactical interaction graph, 22 fps</span><span className="mono">/work/fifa</span></div>
              </div>
            </div>
            <div className="feat-text">
              <div className="feat-num mono">№ 01</div>
              <div className="eyebrow"><span>Computer Vision · Sport Analytics</span></div>
              <h3 className="card-h">FIFA Soccer DS.</h3>
              <p className="deck">YOLOv8 detects, ByteTrack persists, a GraphSAGE scaffold builds the tactical graph, all wrapped in DVC, MLflow, and a FastAPI shipping container.</p>
              <p className="feat-body">A production-shaped computer-vision pipeline for soccer video, end-to-end and reproducible. Seven-stage DVC pipeline, MLflow experiment tracking, twenty-two frames per second. The thing actually runs.</p>
              <div className="specs"><span>YOLOv8</span><span>ByteTrack</span><span>PyTorch&nbsp;Geometric</span><span>MLflow</span><span>DVC</span><span>FastAPI</span></div>
              <span className="go">Read the dossier</span>
            </div>
          </Link>
        </article>

        {/* Feature 02 + 03 */}
        <div className="feat-row">
          <article className="feat">
            <Link href="/projects/revolu-idea" className="cardlink">
              <div className="ph small" style={{ aspectRatio: "5 / 3" }}>
                <CausalAdversarialFigure className="ph-img ph-fig" />
                <span className="ph-tag">Agentic AI</span>
                <div className="ph-label"><span>fig. 02, causal-adversarial graph</span><span className="mono">/work/cag</span></div>
              </div>
              <div className="feat-num mono">№ 02</div>
              <div className="eyebrow"><span>Agentic AI · Causal Reasoning</span></div>
              <h3 className="card-h">CAG Deep Research.</h3>
              <p className="deck">LangGraph plans a causal graph of a question; red and blue agents fight over each edge; a dialectical judge rules.</p>
              <p className="feat-body">A system built to falsify its own claims. Each causal link is attacked by a paired adversary and supporter before a judge returns verified, falsified, or unclear. Hexagonal architecture, swappable search and LLM providers, Ollama with a Groq fallback.</p>
              <div className="specs"><span>LangGraph</span><span>LangChain</span><span>Ollama</span><span>Groq</span><span>Pydantic</span></div>
              <span className="go">Read the dossier</span>
            </Link>
          </article>

          <article className="feat">
            <Link href="/projects/biotech-accelerator" className="cardlink">
              <div className="ph small alt" style={{ aspectRatio: "5 / 3" }}>
                <ProteinNMAFigure className="ph-img ph-fig" />
                <span className="ph-tag">Multi-Agent</span>
                <div className="ph-label"><span>fig. 03, protein chain, NMA</span><span className="mono">/work/biotech</span></div>
              </div>
              <div className="feat-num mono">№ 03</div>
              <div className="eyebrow"><span>Scientific Computing · Agents</span></div>
              <h3 className="card-h">Biotech Accelerator.</h3>
              <p className="deck">A LangGraph pipeline that pretends to be a research assistant, and increasingly succeeds.</p>
              <p className="feat-body">A query parser routes through UniProt, PubMed, the PDB, normal-mode analysis, and ChEMBL, then emerges with a structured list of experiments worth running next. Docker-shipped.</p>
              <div className="specs"><span>LangGraph</span><span>ProDy</span><span>httpx</span><span>Rich</span><span>Docker</span></div>
              <span className="go">Read the dossier</span>
            </Link>
          </article>
        </div>

        {/* Feature 04: Stock Data Platform */}
        <article className="feat feat-lead">
          <Link href="/projects/stock-data-platform" className="cardlink">
            <div className="feat-media">
              <div className="ph" style={{ aspectRatio: "21 / 9" }}>
                <StarSchemaFigure className="ph-img ph-fig" />
                <span className="ph-tag accent">Data Engineering</span>
                <div className="ph-label"><span>fig. 04, star schema, 25 yrs of ticks</span><span className="mono">/work/stock</span></div>
              </div>
            </div>
            <div className="feat-text">
              <div className="feat-num mono">№ 04</div>
              <div className="eyebrow"><span>Streaming · Warehouse</span></div>
              <h3 className="card-h">Stock Data Platform.</h3>
              <p className="deck">Kafka, eighteen Airflow DAGs, a TimescaleDB star schema, and a dashboard that wants to be Bloomberg.</p>
              <p className="feat-body">Ten tickers, twenty-five years of history, four upstream sources, a unit test suite, seven services in a single Docker compose. Built the way a production data platform ought to be built, which is to say, with relentless skepticism toward the data.</p>
              <div className="specs"><span>Kafka</span><span>Airflow</span><span>TimescaleDB</span><span>Docker</span><span>Dash</span></div>
              <span className="go">Read the dossier</span>
            </div>
          </Link>
        </article>

        {/* Feature 05 + 06 */}
        <div className="feat-row">
          <article className="feat">
            <Link href="/projects/webmcp-portfolio" className="cardlink">
              <div className="ph small" style={{ aspectRatio: "5 / 3" }}>
                <WebMCPFigure className="ph-img ph-fig" />
                <span className="ph-tag">AI-Native Web</span>
                <div className="ph-label"><span>fig. 05, webmcp tool registry</span><span className="mono">/work/webmcp</span></div>
              </div>
              <div className="feat-num mono">№ 05</div>
              <div className="eyebrow"><span>AI-Native Web · WebMCP</span></div>
              <h3 className="card-h">WebMCP, on this very site.</h3>
              <p className="deck">An LLM can browse this portfolio the way humans do, only faster, and without scrolling.</p>
              <p className="feat-body">Eight structured tools exposed via the WebMCP browser API. Project search, resume, skills, contact, theme, all callable by an agent with JSON Schema inputs and typed results, instead of scraping the DOM.</p>
              <div className="specs"><span>TypeScript</span><span>Next.js&nbsp;16</span><span>WebMCP</span><span>JSON&nbsp;Schema</span></div>
              <span className="go">Read the dossier</span>
            </Link>
          </article>

          <article className="feat">
            <Link href="/projects/nobel-dataintelligence" className="cardlink">
              <div className="ph small alt" style={{ aspectRatio: "5 / 3" }}>
                <VDOSSpectrumFigure className="ph-img ph-fig" />
                <span className="ph-tag">Tri-modal</span>
                <div className="ph-label"><span>fig. 06, vdos spectrum</span><span className="mono">/work/nobel</span></div>
              </div>
              <div className="feat-num mono">№ 06</div>
              <div className="eyebrow"><span>Research · Scientific ML</span></div>
              <h3 className="card-h">Nobel Data Intelligence.</h3>
              <p className="deck">Tri-modal deep learning for protein stability: sequence, structure, and a vibrational signal nobody else is using.</p>
              <p className="feat-body">ProtT5 for sequence. GATv2 over structural graphs. VDOS spectra from normal-mode analysis, the novel bit. ChemBERTa for chemistry, fused through learned gated attention. Unit-tested across the fusion stack, eight notebooks, Colab-ready.</p>
              <div className="specs"><span>PyTorch&nbsp;Geometric</span><span>ProDy</span><span>BioPython</span><span>RDKit</span><span>Transformers</span></div>
              <span className="go">Read the dossier</span>
            </Link>
          </article>
        </div>

        <div className="more-row">
          <Link href="/projects" className="go" style={{ fontSize: 13 }}>See all {projectCount} projects in the index</Link>
        </div>
      </section>

      {/* ========== CONTENTS (table of contents spread) ========== */}
      <section className="inside shell">
        <div className="section-head">
          <span className="num">§ 03</span>
          <span className="title">In this issue.</span>
          <span className="meta">contents</span>
        </div>

        <p className="toc-standfirst">Everything else on the site, indexed the way a magazine indexes itself.</p>

        <ol className="toc">
          <li>
            <Link className="toc-row" href="/projects">
              <span className="toc-folio">A</span>
              <span className="toc-body">
                <span className="toc-line">
                  <span className="toc-title">The Work</span>
                  <span className="toc-leader" aria-hidden="true" />
                  <span className="toc-ref mono xs upper">
                    <span className="toc-stat">{projectCount} entries</span>
                    <span className="toc-go">/work&nbsp;&rarr;</span>
                  </span>
                </span>
                <span className="toc-dek">Computer vision, agentic AI, a Rust stock platform, a Go voice-to-text tool. The full archive, with deep-dives on most of it.</span>
              </span>
            </Link>
          </li>

          <li>
            <Link className="toc-row" href="/blog">
              <span className="toc-folio">B</span>
              <span className="toc-body">
                <span className="toc-line">
                  <span className="toc-title">The Writing</span>
                  <span className="toc-leader" aria-hidden="true" />
                  <span className="toc-ref mono xs upper">
                    <span className="toc-stat">{essayCount} {essayCount === 1 ? "essay" : "essays"} · {projectCount} writeups</span>
                    <span className="toc-go">/writing&nbsp;&rarr;</span>
                  </span>
                </span>
                <span className="toc-dek">Project post-mortems and short essays on building in 2026. Unflattering details left in. Still under construction, in the honest sense of the phrase.</span>
              </span>
            </Link>
          </li>

          <li>
            <Link className="toc-row" href="/resume">
              <span className="toc-folio">C</span>
              <span className="toc-body">
                <span className="toc-line">
                  <span className="toc-title">The Particulars</span>
                  <span className="toc-leader" aria-hidden="true" />
                  <span className="toc-ref mono xs upper">
                    <span className="toc-stat">CV · OSS · Pubs</span>
                    <span className="toc-go">/about&nbsp;&rarr;</span>
                  </span>
                </span>
                <span className="toc-dek">Four years of work, two IEEE papers, three merged pull requests into ecosystem repositories, and a Rubik&apos;s cube record that will not make the resume.</span>
              </span>
            </Link>
          </li>
        </ol>
      </section>

      {/* ========== CONTACT CTA ========== */}
      <section className="cta shell">
        <div className="cta-grid">
          <div>
            <div className="eyebrow"><span className="dot" /><span>Correspondence · 04</span></div>
            <h2 className="display">Hiring? Building? Stuck?</h2>
            <p className="deck">I am looking for forward-deployed and data-engineering roles, though senior software is also on the table. Staff-shaped problems welcome.</p>
          </div>
          <div className="cta-side">
            <a className="cta-button" href="mailto:jayhemnani992000@gmail.com">
              <span className="mono xs upper muted">Open the line</span>
              <span className="cta-mail">jayhemnani992000@gmail.com</span>
            </a>
            <div className="cta-links">
              <a href="https://github.com/jayhemnani9910" target="_blank" rel="noreferrer">GitHub ↗</a>
              <a href="https://linkedin.com/in/jayhemnani" target="_blank" rel="noreferrer">LinkedIn ↗</a>
              <a href="https://x.com/jeyhemnani9" target="_blank" rel="noreferrer">Twitter ↗</a>
              <Link href="/resume">Résumé →</Link>
            </div>
          </div>
        </div>
      </section>

      <EditorialColophon />
    </main>
  );
}
