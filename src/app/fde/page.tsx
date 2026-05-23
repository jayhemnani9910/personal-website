"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Github, Mail, FileText, BookOpen, ExternalLink } from "lucide-react";
import { EditorialMasthead } from "@/components/EditorialMasthead";
import { EditorialColophon } from "@/components/EditorialColophon";
import { VARIANTS, SPRINGS } from "@/lib/motion";

// ─── Evidence cards ──────────────────────────────────────────────────────────
const EVIDENCE: {
  label: string;
  headline: string;
  detail: string;
  tag: string;
}[] = [
  {
    label: "CAG Deep Research",
    headline: "Scoping ambiguous problems into working agentic systems",
    detail:
      "Built a 5-agent LangGraph research system in 10 days from a vague problem statement. Hexagonal architecture, verification loops, local and cloud LLM fallback. The starting point was a rough idea, not a spec; the output was a system fast enough to run in pilot contexts.",
    tag: "0-to-1 speed",
  },
  {
    label: "WebMCP Portfolio Integration",
    headline: "Working in the connective tissue between agents and real tools",
    detail:
      "Made jayhemnani.me agent-queryable via the W3C WebMCP standard (8 tools). An early production WebMCP implementation, directly on the surface that Google, Anthropic, and OpenAI FDE postings now name as table-stakes.",
    tag: "MCP / protocol layer",
  },
  {
    label: "Merged PR: Anthropic MCP Python SDK",
    headline: "Entering external production codebases and shipping precise fixes",
    detail:
      "Contributed a merged PR to the Anthropic MCP Python SDK. Also navigated vLLM (200k+ LOC) for a separate investigation. The muscle FDEs use inside customer and platform environments: read unfamiliar code, find the concrete issue, fix it without breaking the contract.",
    tag: "upstream contribution",
  },
  {
    label: "Kayak metasearch + Airbnb microservices",
    headline: "Thinking in services, data flows, contracts, and failure boundaries",
    detail:
      "Kayak clone: Node, Kafka, API gateway, polyglot persistence (14 services). Airbnb clone: microservices on Kubernetes. These are the engineering substrates behind FDE deployment work, not academic exercises.",
    tag: "distributed systems",
  },
  {
    label: "Elite Hotel Group (Data Analyst)",
    headline: "Working in the loop between business stakeholders and technical delivery",
    detail:
      "Defined metrics and SLAs with finance and operations stakeholders. ETL across multiple properties, operational reporting, and forecasting. Note: internal stakeholders, not external customers. This is relevant context, not a claim of full FDE-grade customer delivery experience.",
    tag: "stakeholder delivery",
  },
];

// ─── 60-day plan ─────────────────────────────────────────────────────────────
const PLAN: { week: string; action: string }[] = [
  {
    week: "Week 1-2",
    action:
      "Add an eval harness to CAG Deep Research: 100 automated tests scoring for hallucination, context adherence, and token cost. Publish results. This proves Day 2 operations thinking, not just shipping.",
  },
  {
    week: "Week 2-4",
    action:
      "Ship one real external deployment for a small business, startup, or ops team (unpaid or low-paid is fine). Build with integrations, auth, evals, and a post-launch changelog. Get a written testimonial. This is the most important missing artifact.",
  },
  {
    week: "Week 3-5",
    action:
      "Publish two short technical posts: one on MCP in production (what breaks, what does not), one on failure analysis from the multi-agent build. Aligned with the exact FDE discourse in 2026.",
  },
  {
    week: "Week 5-8",
    action:
      "Convert one existing project into a deployment case study (not a project page): requirements, architecture diagram, success metrics, eval plan, rollout strategy, and what I would change. FDE hiring managers evaluate judgment, not just repos.",
  },
];

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function FDEPage() {
  return (
    <main
      className="editorial min-h-screen"
      style={{ background: "var(--bg-primary)", color: "var(--text-primary)" }}
    >
      <EditorialMasthead />

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="pt-32 pb-16 px-6">
        <div className="max-w-4xl mx-auto">
          <motion.div
            variants={VARIANTS.staggerContainer}
            initial="initial"
            animate="animate"
          >
            <motion.p
              variants={VARIANTS.fadeInUp}
              transition={{ ...SPRINGS.default, delay: 0 }}
              className="text-sm font-mono uppercase tracking-widest mb-4"
              style={{ color: "var(--accent)" }}
            >
              Forward Deployed Engineer
            </motion.p>

            <motion.h1
              variants={VARIANTS.fadeInUp}
              transition={{ ...SPRINGS.default, delay: 0.08 }}
              className="text-4xl md:text-5xl font-bold mb-6 leading-tight"
              style={{ color: "var(--text-primary)" }}
            >
              Engineer targeting<br className="hidden sm:block" /> Forward Deployed roles
            </motion.h1>

            <motion.p
              variants={VARIANTS.fadeInUp}
              transition={{ ...SPRINGS.default, delay: 0.16 }}
              className="text-lg max-w-2xl leading-relaxed"
              style={{ color: "var(--text-secondary)" }}
            >
              Full-stack and data breadth, agentic systems experience, and a track
              record of shipping from zero to something-working fast. The gap I am
              actively closing: external customer-facing deployment. That is what
              this page is about.
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* ── What an FDE is ───────────────────────────────────────────────── */}
      <section className="py-12 px-6">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={SPRINGS.default}
            className="rounded-2xl p-8"
            style={{
              background: "var(--bg-secondary)",
              border: "1px solid var(--border)",
            }}
          >
            <h2 className="text-xl font-semibold mb-4" style={{ color: "var(--text-primary)" }}>
              What an FDE actually is
            </h2>
            <p className="leading-relaxed mb-3" style={{ color: "var(--text-secondary)" }}>
              A Forward Deployed Engineer embeds directly with customers or
              strategic accounts, writes production code in that environment, and
              feeds field friction back into the product or model team. The role
              sits between engineering, customer delivery, and product feedback.
              It is not sales engineering or professional services with a fancier
              title: the output is deployed, production-grade code, not slide decks
              or architecture diagrams.
            </p>
            <p className="leading-relaxed mb-5" style={{ color: "var(--text-secondary)" }}>
              In 2026, AI labs and startups pushed the role toward agentic
              deployment, eval design, MCP integration, and measurable ROI, which
              made it distinct from the earlier Palantir-era framing. The
              distinguishing question for a given posting is whether the engineer
              owns a production deployment end-to-end, or just supports one.
            </p>
            <Link
              href="/blog/forward-deployed-engineer"
              className="inline-flex items-center gap-2 text-sm font-medium transition-colors"
              style={{ color: "var(--accent)" }}
            >
              Read the full breakdown on the blog
              <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ── Why I fit ────────────────────────────────────────────────────── */}
      <section className="py-12 px-6">
        <div className="max-w-4xl mx-auto">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={SPRINGS.default}
            className="text-2xl font-bold mb-8"
            style={{ color: "var(--text-primary)" }}
          >
            Why I fit, with the actual evidence
          </motion.h2>

          <div className="flex flex-col gap-5">
            {EVIDENCE.map((item, i) => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ ...SPRINGS.default, delay: i * 0.06 }}
                className="group rounded-2xl p-6"
                style={{
                  background: "var(--bg-secondary)",
                  border: "1px solid var(--border)",
                }}
              >
                <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
                  <span
                    className="text-xs font-mono uppercase tracking-wider px-2.5 py-1 rounded-full"
                    style={{
                      background: "rgba(var(--accent-rgb, 0, 240, 255), 0.08)",
                      color: "var(--accent)",
                      border: "1px solid rgba(var(--accent-rgb, 0, 240, 255), 0.2)",
                    }}
                  >
                    {item.tag}
                  </span>
                  <span
                    className="text-xs font-medium"
                    style={{ color: "var(--text-muted)" }}
                  >
                    {item.label}
                  </span>
                </div>
                <h3
                  className="text-base font-semibold mb-2"
                  style={{ color: "var(--text-primary)" }}
                >
                  {item.headline}
                </h3>
                <p
                  className="text-sm leading-relaxed"
                  style={{ color: "var(--text-secondary)" }}
                >
                  {item.detail}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Honest gap + plan ────────────────────────────────────────────── */}
      <section className="py-12 px-6">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={SPRINGS.default}
          >
            <h2
              className="text-2xl font-bold mb-3"
              style={{ color: "var(--text-primary)" }}
            >
              The honest gap
            </h2>
            <p
              className="text-base leading-relaxed mb-2"
              style={{ color: "var(--text-secondary)" }}
            >
              External customer-facing deployment is the gap. Every FDE posting at
              OpenAI, Anthropic, or HeyGen asks for evidence of scoping with
              external customers, owning a rollout end-to-end, and handling
              production failures in a client environment. My hotel-group
              stakeholder work is real (requirements alignment, metric definition,
              SLA-style delivery), but it was internal, not external customer
              deployment. I can credibly claim stakeholder-facing delivery; I
              cannot yet credibly claim the full FDE customer lifecycle.
            </p>
            <p
              className="text-sm mb-10"
              style={{ color: "var(--text-muted)" }}
            >
              The 60-day plan below is specific about how I am closing this.
            </p>

            <h3
              className="text-lg font-semibold mb-6"
              style={{ color: "var(--text-primary)" }}
            >
              60-day plan
            </h3>

            <div className="flex flex-col gap-4">
              {PLAN.map((step, i) => (
                <motion.div
                  key={step.week}
                  initial={{ opacity: 0, x: -16 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ ...SPRINGS.default, delay: i * 0.07 }}
                  className="flex gap-5 items-start"
                >
                  <span
                    className="shrink-0 text-xs font-mono px-2.5 py-1 rounded-full mt-0.5"
                    style={{
                      background: "var(--bg-secondary)",
                      border: "1px solid var(--border)",
                      color: "var(--text-muted)",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {step.week}
                  </span>
                  <p
                    className="text-sm leading-relaxed"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    {step.action}
                  </p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── CTA row ──────────────────────────────────────────────────────── */}
      <section className="py-16 px-6">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={SPRINGS.default}
            className="rounded-2xl p-8"
            style={{
              background: "var(--bg-secondary)",
              border: "1px solid var(--border)",
            }}
          >
            <h2
              className="text-xl font-semibold mb-2"
              style={{ color: "var(--text-primary)" }}
            >
              Get in touch or dig deeper
            </h2>
            <p
              className="text-sm mb-8"
              style={{ color: "var(--text-muted)" }}
            >
              Links to the blog post, resume, GitHub, and email below.
            </p>

            <div className="flex flex-wrap gap-3">
              <Link
                href="/blog/forward-deployed-engineer"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200"
                style={{
                  background: "var(--accent)",
                  color: "#000",
                }}
              >
                <BookOpen className="w-4 h-4" />
                Blog post
              </Link>

              <Link
                href="/resume"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200"
                style={{
                  background: "var(--bg-primary)",
                  border: "1px solid var(--border)",
                  color: "var(--text-primary)",
                }}
              >
                <FileText className="w-4 h-4" />
                Resume
              </Link>

              <a
                href="https://github.com/jayhemnani9910"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200"
                style={{
                  background: "var(--bg-primary)",
                  border: "1px solid var(--border)",
                  color: "var(--text-primary)",
                }}
              >
                <Github className="w-4 h-4" />
                GitHub
                <ExternalLink className="w-3 h-3" style={{ color: "var(--text-muted)" }} />
              </a>

              <a
                href="mailto:jayhemnani992000@gmail.com"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200"
                style={{
                  background: "var(--bg-primary)",
                  border: "1px solid var(--border)",
                  color: "var(--text-primary)",
                }}
              >
                <Mail className="w-4 h-4" />
                Email
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      <EditorialColophon />
    </main>
  );
}
