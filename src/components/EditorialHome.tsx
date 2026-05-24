"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useReducedMotion } from "framer-motion";
import { EditorialMasthead } from "@/components/EditorialMasthead";
import { EditorialColophon } from "@/components/EditorialColophon";

const ROLES = [
  "forward-deployed engineer",
  "data engineer",
  "data analyst",
  "ML engineer",
  "agentic AI engineer",
  "software engineer",
  "full-stack builder",
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

export function EditorialHome() {
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
              <li><b className="tabular">50+</b><span>projects shipped</span></li>
              <li><b className="tabular">2</b><span>IEEE publications</span></li>
              <li><b className="tabular">3</b><span>merged OSS PRs <span className="muted xs">vLLM · MCP · A2UI</span></span></li>
              <li><b className="tabular">10d</b><span>to a 5-agent research system</span></li>
              <li><b className="tabular">18+</b><span>long-form project writeups</span></li>
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
                <Image className="ph-img" src="/featured/fifa.png" alt="" fill sizes="(max-width: 860px) 100vw, 66vw" />
                <span className="ph-tag accent">Computer Vision · Production</span>
                <div className="ph-label"><span>fig. 01, tactical interaction graph, 22 fps</span><span className="mono">/work/fifa</span></div>
              </div>
            </div>
            <div className="feat-text">
              <div className="feat-num mono">№ 01</div>
              <div className="eyebrow"><span>Computer Vision · Sport Analytics</span></div>
              <h3 className="card-h">FIFA Soccer DS.</h3>
              <p className="deck">YOLOv8 detects, ByteTrack persists, GraphSAGE classifies tactical interactions, all wrapped in DVC, MLflow, and a FastAPI shipping container.</p>
              <p className="feat-body">A production computer-vision pipeline for soccer video, end-to-end and reproducible. Seven-stage DVC pipeline, fifty-plus MLflow runs, twenty-two frames per second on a 3070. The thing actually runs.</p>
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
                <Image className="ph-img" src="/featured/cag.png" alt="" fill sizes="(max-width: 860px) 100vw, 33vw" />
                <span className="ph-tag">Agentic AI</span>
                <div className="ph-label"><span>fig. 02, LangGraph state diagram</span><span className="mono">/work/cag</span></div>
              </div>
              <div className="feat-num mono">№ 02</div>
              <div className="eyebrow"><span>Multi-Agent · 10-Day Build</span></div>
              <h3 className="card-h">CAG Deep Research.</h3>
              <p className="deck">Five agents in a LangGraph state machine, hexagonal architecture, twenty-page reports out the other end.</p>
              <p className="feat-body">Search, analyzer, fact-checker, synthesizer, editor. Ollama with a cloud fallback for when the laptop fan refuses. Built in ten days from a blank repository to a published deliverable.</p>
              <div className="specs"><span>LangGraph</span><span>LangChain</span><span>Ollama</span><span>Groq</span><span>Pydantic</span></div>
              <span className="go">Read the dossier</span>
            </Link>
          </article>

          <article className="feat">
            <Link href="/projects/biotech-accelerator" className="cardlink">
              <div className="ph small alt" style={{ aspectRatio: "5 / 3" }}>
                <Image className="ph-img" src="/featured/biotech.png" alt="" fill sizes="(max-width: 860px) 100vw, 33vw" />
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

        {/* Feature 04 + 05 */}
        <div className="feat-row asymm">
          <article className="feat wide">
            <Link href="/projects/stock-data-platform" className="cardlink">
              <div className="ph small" style={{ aspectRatio: "21 / 9" }}>
                <Image className="ph-img" src="/featured/stock.png" alt="" fill sizes="(max-width: 860px) 100vw, 66vw" />
                <span className="ph-tag accent">Data Engineering</span>
                <div className="ph-label"><span>fig. 04, star schema, 25 yrs of ticks</span><span className="mono">/work/stock</span></div>
              </div>
              <div className="feat-num mono">№ 04</div>
              <div className="eyebrow"><span>Streaming · Warehouse</span></div>
              <h3 className="card-h">Stock Data Platform.</h3>
              <p className="deck">Kafka, eighteen Airflow DAGs, a TimescaleDB star schema, and a dashboard that wants to be Bloomberg.</p>
              <p className="feat-body">Ten tickers, twenty-five years of history, four upstream sources, sixty-two unit tests, seven services in a single Docker compose. Built the way a production data platform ought to be built, which is to say, with relentless skepticism toward the data.</p>
              <div className="specs"><span>Kafka</span><span>Airflow</span><span>TimescaleDB</span><span>Docker</span><span>Dash</span></div>
              <span className="go">Read the dossier</span>
            </Link>
          </article>

          <article className="feat narrow">
            <Link href="/projects/webmcp-portfolio" className="cardlink">
              <div className="feat-num mono">№ 05</div>
              <div className="eyebrow"><span>AI-Native Web · WebMCP</span></div>
              <h3 className="card-h">WebMCP, on this very site.</h3>
              <p className="deck">An LLM can browse this portfolio the way humans do, only faster, and without scrolling.</p>
              <p className="feat-body">Eight structured tools exposed via the W3C WebMCP standard. Project search, resume, skills, contact, lab, theme, all queryable by an agent. Eighty-nine percent token efficiency over screenshot pipelines.</p>
              <div className="specs"><span>TypeScript</span><span>Next.js&nbsp;16</span><span>WebMCP</span><span>JSON&nbsp;Schema</span></div>
              <span className="go">Read the dossier</span>
              <div className="pull-aside mono xs muted" aria-hidden="true">
                <span>↘</span> try asking your browser-agent: <em className="serif italic">&ldquo;find Jay&apos;s CV pipeline projects.&rdquo;</em>
              </div>
            </Link>
          </article>
        </div>

        {/* Feature 06: Nobel */}
        <article className="feat feat-tail">
          <Link href="/projects/nobel-dataintelligence" className="cardlink">
            <div className="feat-tail-grid">
              <div className="feat-text">
                <div className="feat-num mono">№ 06</div>
                <div className="eyebrow"><span>Research · Scientific ML</span></div>
                <h3 className="card-h">Nobel Data Intelligence.</h3>
                <p className="deck">Tri-modal deep learning for protein stability: sequence, structure, and a vibrational signal nobody else is using.</p>
                <p className="feat-body">ProtT5 for sequence. GATv2 over structural graphs. VDOS spectra from normal-mode analysis, the novel bit. ChemBERTa for chemistry. R² above 0.75, one hundred thirty-nine unit tests, eight notebooks, Colab-ready.</p>
                <div className="specs"><span>PyTorch&nbsp;Geometric</span><span>ProDy</span><span>BioPython</span><span>RDKit</span><span>Transformers</span></div>
                <span className="go">Read the dossier</span>
              </div>
              <div className="ph small" style={{ aspectRatio: "4 / 5" }}>
                <Image className="ph-img" src="/featured/nobel.png" alt="" fill sizes="(max-width: 860px) 100vw, 33vw" />
                <span className="ph-tag">R² &gt; 0.75</span>
                <div className="ph-label"><span>fig. 05, VDOS spectrum</span><span className="mono">/work/nobel</span></div>
              </div>
            </div>
          </Link>
        </article>

        <div className="more-row">
          <Link href="/projects" className="go" style={{ fontSize: 13 }}>See all 50+ projects in the index</Link>
        </div>
      </section>

      {/* ========== INSIDE THIS ISSUE ========== */}
      <section className="inside shell">
        <div className="section-head">
          <span className="num">§ 03</span>
          <span className="title">Also inside this issue.</span>
          <span className="meta">departments</span>
        </div>

        <div className="dept-grid">
          <Link className="dept" href="/projects">
            <div className="dept-num mono">A</div>
            <h3 className="dept-h">The Work.</h3>
            <p className="deck">An index of fifty-plus projects, filterable by stack, shape, and tier.</p>
            <p className="dept-body">Production data pipelines. Computer-vision research. Agentic AI experiments. A Rust stock platform. A Go voice-to-text tool. The full archive, with deep-dives on the ones that mattered.</p>
            <div className="dept-foot mono xs upper"><span>50+ entries</span><span className="muted">/work</span></div>
          </Link>

          <Link className="dept" href="/blog">
            <div className="dept-num mono">B</div>
            <h3 className="dept-h">The Writing.</h3>
            <p className="deck">Notes from the bench: project post-mortems and short essays on building in 2026.</p>
            <p className="dept-body">Eighteen long-form project writeups with the unflattering details left in. A blog still under construction, in the honest sense of the phrase.</p>
            <div className="dept-foot mono xs upper"><span>18 deep-dives · 1 essay</span><span className="muted">/writing</span></div>
          </Link>

          <Link className="dept" href="/resume">
            <div className="dept-num mono">C</div>
            <h3 className="dept-h">The Particulars.</h3>
            <p className="deck">Resume, open-source patches, publications, and a few things worth knowing.</p>
            <p className="dept-body">Four years of experience, two IEEE papers, three merged pull requests into ecosystem-critical repositories, and a Rubik&apos;s cube personal record that will not appear on the resume but is true.</p>
            <div className="dept-foot mono xs upper"><span>CV · OSS · Pubs</span><span className="muted">/about</span></div>
          </Link>
        </div>
      </section>

      {/* ========== PULL QUOTE ========== */}
      <section className="pull-section shell">
        <hr className="rule" />
        <blockquote className="pullq">
          <p className="display italic">
            &ldquo;The shortest distance between an idea and a production system is somebody who
            has done it before, on time, and is willing to do it again.&rdquo;
          </p>
          <footer className="mono xs upper muted">the working hypothesis</footer>
        </blockquote>
        <hr className="rule" />
      </section>

      {/* ========== CONTACT CTA ========== */}
      <section className="cta shell">
        <div className="cta-grid">
          <div>
            <div className="eyebrow"><span className="dot" /><span>Correspondence · 04</span></div>
            <h2 className="display">Hiring? Building? Stuck?</h2>
            <p className="deck">I am looking for forward-deployed, data-engineering, and senior software roles. Staff-shaped problems welcome.</p>
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
