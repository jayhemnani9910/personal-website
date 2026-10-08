/**
 * Copy and structured data for the v4 home page (see docs/design/portfolio-home).
 * Every count that can drift from the real content (project count, MCP tool
 * count, essay count) arrives as a function argument computed at build time,
 * never a literal baked into this file.
 *
 * Two claims from the design export were dropped because nothing in the repo
 * backs them: the "project 19" aside in the cube-scramble copy (no such project
 * exists) and the "4 YRS" experience chip.
 */
import type { Route } from "next";
import { SITE_CONFIG } from "@/../content/site";
import { WEBMCP_TOOLS, WEBMCP_TOOL_COUNT } from "@/lib/webmcp-tools";
import { RESUME, companyAnchor, parsePublishedVsReproduced } from "@/data/resume";

export type FeaturedProject = {
  id: string;
  num: string;
  title: string;
  tags: string[];
  tech: string[];
  arrived: string;
  did: string;
  changed: string;
};

export type DecomposeOutput = {
  scope: string[];
  architecture: string[];
  plan: string[];
  risks: string[];
  match: string[];
};

export type Preset = { short: string; text: string; out: DecomposeOutput };

export type ReceiptLine = { text: string; meta: string; href: string };

export type Receipt = {
  n: string;
  label: string;
  cta: string;
  title: string;
  note: string;
  lines: ReceiptLine[];
};

// next.config.ts sets typedRoutes, so a Link's href has to be a route the
// compiler recognises. `Route` covers static routes, hashes and external URLs,
// which is everything the nav and the rail use, so those are checked here.
//
// It cannot cover the method and receipt hrefs: those point at the dynamic
// /projects/[id] route, and Next only accepts a dynamic route when the literal
// is visible at the Link call site, which it is not once the value has been
// through this module. Those two stay `string` and are cast at the call site.
// What makes that safe is src/data/home.test.ts, which asserts every
// /projects/... href in this file resolves to a real content/projects/*.mdx.
export type MethodRule = { n: string; rule: string; why: string; from: string; href: string };

export type NavItem = { label: string; alt: string; href: Route };

export type SectionStep = { n: string; label: string; href: Route; id: string };

export const FEATURED: FeaturedProject[] = [
  {
    id: "fifa-soccer-ds",
    num: "01",
    title: "FIFA Soccer DS",
    tags: ["vision", "video", "pipeline", "ml"],
    tech: ["YOLOv8", "ByteTrack", "DVC", "MLflow", "FastAPI"],
    arrived: "Match footage and a question: can we track every player and turn it into tactics?",
    did: "Detection → multi-object tracking → tactical graph, wired as one reproducible DVC stage (analyze_frames) with MLflow tracking and a FastAPI service.",
    changed: "22 fps end to end. Reproducible from extracted frames with one command.",
  },
  {
    id: "revolu-idea",
    num: "02",
    title: "CAG Deep Research",
    tags: ["agents", "llm", "research"],
    tech: ["LangGraph", "LangChain", "Ollama", "Groq"],
    arrived: "Research agents that confidently agree with themselves.",
    did: "Planned a causal graph per question; paired adversary and supporter agents per edge; a judge rules and loops back through an auditor.",
    changed: "Every claim exits tagged VERIFIED, FALSIFIED or UNCLEAR, with the evidence.",
  },
  {
    id: "stock-data-platform",
    num: "03",
    title: "Stock Data Platform",
    tags: ["data", "streaming", "warehouse", "dashboard"],
    tech: ["Kafka", "Airflow", "TimescaleDB", "Chart.js"],
    arrived: "Tick data nobody could query and a dashboard everyone wanted.",
    did: "Kafka ingestion, 23 Airflow DAGs, a TimescaleDB star schema, a Chart.js dashboard.",
    changed: "Multi-symbol OHLC from ingest to a Chart.js dashboard; a warehouse a BI tool can join.",
  },
  {
    id: "webmcp-portfolio",
    num: "04",
    title: "WebMCP, on this site",
    tags: ["web", "agents", "standards"],
    tech: ["TypeScript", "Next.js 16", "WebMCP"],
    arrived: "Could a portfolio be read by a machine as easily as by a person?",
    did: `Registered ${WEBMCP_TOOL_COUNT} tools with the WebMCP browser API: search, résumé, skills, contact, experiments, theme, mode.`,
    changed: "An agent in Chrome, with the WebMCP flag on, reads this site without scraping it.",
  },
  {
    id: "biotech-accelerator",
    num: "05",
    title: "Biotech Accelerator",
    tags: ["agents", "bio", "research", "llm"],
    tech: ["LangGraph", "ProDy", "httpx", "Docker"],
    arrived: "A week of tab-hopping across UniProt, PDB and ChEMBL for every hypothesis.",
    did: "A LangGraph pipeline that queries the databases, runs normal-mode analysis and writes a cited report.",
    changed: "Question in, ranked candidates and citations out, in minutes.",
  },
  {
    id: "nobel-dataintelligence",
    num: "06",
    title: "Nobel Data Intelligence",
    tags: ["ml", "bio", "deep-learning"],
    tech: ["PyTorch Geometric", "ProDy", "RDKit", "Transformers"],
    arrived: "Protein stability prediction stuck on sequence alone.",
    did: "Fused sequence (ProtT5), a vibrational VDOS spectrum (SpectralCNN) and substrate chemistry (ChemBERTa + DRFP) through a learned gate.",
    changed: "Still predicts when no structure is available. Whether the vibrational branch helps is not benchmarked yet.",
  },
];

export const PRESETS: Preset[] = [
  {
    short: "support tickets",
    text: "our support team is drowning in tickets and nobody knows which ones actually matter",
    out: {
      scope: [
        "Triage first: what does 'matters' mean to the team? SLA breach, churn risk, revenue?",
        "Pull 90 days of tickets, outcomes, and who touched them.",
        "Define a scored queue as the deliverable, not a model.",
      ],
      architecture: [
        "Ingest tickets → normalise → urgency score → route to queue.",
        "Start with rules + embeddings; a model only if the rules plateau.",
        "Log every score with its inputs so drift is visible.",
      ],
      plan: [
        "Week 1: scored queue on historical data, reviewed with two agents.",
        "Week 2: live, shadow mode, compare against human triage.",
        "Week 3: switch the queue; keep the human override.",
      ],
      risks: [
        "Labels encode who was loud, not what mattered.",
        "Priority inflation once people learn the score.",
        "Silent drift when product changes the ticket form.",
      ],
      match: ["revolu-idea", "stock-data-platform"],
    },
  },
  {
    short: "untrusted numbers",
    text: "we have plenty of data but nobody trusts the numbers in the dashboards",
    out: {
      scope: [
        "Find the three numbers people argue about most.",
        "Trace each one back to its source table and its owner.",
        "Make agreement the deliverable, not a prettier chart.",
      ],
      architecture: [
        "One warehouse with declared grain per table.",
        "Star schema for the contested metrics; tests on every join.",
        "Dashboards read only from certified marts.",
      ],
      plan: [
        "Week 1: lineage for the three metrics, documented.",
        "Week 2: rebuild them once, with tests, side by side with the old.",
        "Week 3: retire the old; publish the definitions.",
      ],
      risks: [
        "Two teams have two correct definitions.",
        "Upstream schema changes with no contract.",
        "The fix is political, not technical. Say so early.",
      ],
      match: ["stock-data-platform", "fifa-soccer-ds"],
    },
  },
  {
    short: "notebook → product",
    text: "our ML model works in a notebook and we need it in front of customers next month",
    out: {
      scope: [
        "Define 'works': on which data, at what latency, judged by whom?",
        "Pick the smallest surface a customer can touch.",
        "Reproducibility before performance.",
      ],
      architecture: [
        "Versioned data + model (DVC), tracked runs (MLflow).",
        "Inference behind a FastAPI service with a typed contract.",
        "Export path (ONNX) decided now, not later.",
      ],
      plan: [
        "Week 1: pipeline re-runs from raw data, end to end.",
        "Week 2: service + one screen, internal users.",
        "Week 3 to 4: shadow with real traffic; ship.",
      ],
      risks: [
        "The notebook depends on one laptop's state.",
        "Latency budget was never written down.",
        "Nobody owns the model after launch.",
      ],
      match: ["fifa-soccer-ds", "nobel-dataintelligence"],
    },
  },
];

/**
 * The merged upstream pull requests, by repo and number.
 *
 * One list, two readers: the home page's proof ledger and the about page's
 * open-source block. It lives here rather than in resume.ts because resume.ts
 * has no field for it, and duplicating these URLs across two pages is how a
 * verified claim drifts into an unverified one. Sourced from
 * the job-search MASTER_PROFILE.md section 7, which is the canonical list.
 *
 * modular/modular #6954, #6967 and #7235 show as Closed on GitHub rather than
 * Merged, because Modular lands outside contributions with Copybara instead of
 * pressing merge. They landed in commits 39b94179d6c9c5be6334888f119fcb51469c3ad0
 * on 2026-09-02, 71437b1e23b7aae926295767f38162e300608953 on 2026-09-17 and
 * 189bd1393e2c35bfe777c97b1b3c8b1a31be8f8e on 2026-10-08, which the modularbot
 * comments on the PRs state, so those commits are linked as
 * `landed`. That is also why they do not appear in MERGED_PRS_SEARCH below.
 *
 * A2UI #407 was merged under google/A2UI; the repo has since moved to
 * a2ui-project/a2ui, so the name and link use its current home.
 */
export const MERGED_PRS: { repo: string; number: string; href: string; landed?: string }[] = [
  { repo: "vllm-project/vllm", number: "#31513", href: "https://github.com/vllm-project/vllm/pull/31513" },
  { repo: "modelcontextprotocol/python-sdk", number: "#1826", href: "https://github.com/modelcontextprotocol/python-sdk/pull/1826" },
  { repo: "a2ui-project/a2ui", number: "#407", href: "https://github.com/a2ui-project/a2ui/pull/407" },
  {
    repo: "modular/modular",
    number: "#6954",
    href: "https://github.com/modular/modular/pull/6954",
    landed: "https://github.com/modular/modular/commit/39b94179d6c9c5be6334888f119fcb51469c3ad0",
  },
  {
    repo: "modular/modular",
    number: "#6967",
    href: "https://github.com/modular/modular/pull/6967",
    landed: "https://github.com/modular/modular/commit/71437b1e23b7aae926295767f38162e300608953",
  },
  { repo: "lightpanda-io/browser", number: "#3716", href: "https://github.com/lightpanda-io/browser/pull/3716" },
  { repo: "lightpanda-io/browser", number: "#3717", href: "https://github.com/lightpanda-io/browser/pull/3717" },
  { repo: "lightpanda-io/browser", number: "#3718", href: "https://github.com/lightpanda-io/browser/pull/3718" },
  { repo: "lightpanda-io/browser", number: "#3719", href: "https://github.com/lightpanda-io/browser/pull/3719" },
  { repo: "lightpanda-io/browser", number: "#3720", href: "https://github.com/lightpanda-io/browser/pull/3720" },
  { repo: "lightpanda-io/browser", number: "#3721", href: "https://github.com/lightpanda-io/browser/pull/3721" },
  { repo: "lightpanda-io/browser", number: "#3722", href: "https://github.com/lightpanda-io/browser/pull/3722" },
  { repo: "lightpanda-io/browser", number: "#3761", href: "https://github.com/lightpanda-io/browser/pull/3761" },
  { repo: "lightpanda-io/browser", number: "#3762", href: "https://github.com/lightpanda-io/browser/pull/3762" },
  { repo: "lightpanda-io/browser", number: "#3819", href: "https://github.com/lightpanda-io/browser/pull/3819" },
  { repo: "Effect-TS/effect", number: "#8752", href: "https://github.com/Effect-TS/effect/pull/8752" },
  { repo: "Effect-TS/effect", number: "#8753", href: "https://github.com/Effect-TS/effect/pull/8753" },
  { repo: "Effect-TS/effect", number: "#8857", href: "https://github.com/Effect-TS/effect/pull/8857" },
  { repo: "Effect-TS/effect", number: "#8858", href: "https://github.com/Effect-TS/effect/pull/8858" },
  { repo: "Effect-TS/effect", number: "#8877", href: "https://github.com/Effect-TS/effect/pull/8877" },
  { repo: "Effect-TS/effect", number: "#8878", href: "https://github.com/Effect-TS/effect/pull/8878" },
  { repo: "caddyserver/caddy", number: "#8159", href: "https://github.com/caddyserver/caddy/pull/8159" },
  { repo: "caddyserver/caddy", number: "#8160", href: "https://github.com/caddyserver/caddy/pull/8160" },
  { repo: "p-e-w/heretic", number: "#482", href: "https://github.com/p-e-w/heretic/pull/482" },
  { repo: "morluto/rea", number: "#890", href: "https://github.com/morluto/rea/pull/890" },
  { repo: "morluto/rea", number: "#891", href: "https://github.com/morluto/rea/pull/891" },
  { repo: "AlexsJones/llmfit", number: "#1114", href: "https://github.com/AlexsJones/llmfit/pull/1114" },
  { repo: "lightpanda-io/browser", number: "#3818", href: "https://github.com/lightpanda-io/browser/pull/3818" },
  { repo: "caddyserver/caddy", number: "#8149", href: "https://github.com/caddyserver/caddy/pull/8149" },
  { repo: "lightpanda-io/browser", number: "#3831", href: "https://github.com/lightpanda-io/browser/pull/3831" },
  { repo: "AlexsJones/llmfit", number: "#1113", href: "https://github.com/AlexsJones/llmfit/pull/1113" },
  { repo: "AlexsJones/llmfit", number: "#1120", href: "https://github.com/AlexsJones/llmfit/pull/1120" },
  { repo: "mvanhorn/last30days-skill", number: "#1191", href: "https://github.com/mvanhorn/last30days-skill/pull/1191" },
  { repo: "mvanhorn/last30days-skill", number: "#1195", href: "https://github.com/mvanhorn/last30days-skill/pull/1195" },
  {
    repo: "modular/modular",
    number: "#7235",
    href: "https://github.com/modular/modular/pull/7235",
    landed: "https://github.com/modular/modular/commit/189bd1393e2c35bfe777c97b1b3c8b1a31be8f8e",
  },
];

/**
 * The PRs above in one GitHub search, for anyone who wants to check the list.
 * A github.com/search URL loads without signing in (github.com/pulls does not),
 * and the repo: qualifiers keep it to these repos. It finds the ones GitHub
 * marks merged, so not #6954, #6967 or #7235: see the Copybara note on MERGED_PRS.
 */
export const MERGED_PRS_SEARCH = `https://github.com/search?q=${encodeURIComponent(
  ["is:pr", "is:merged", "author:jayhemnani9910", ...new Set(MERGED_PRS.map((pr) => `repo:${pr.repo}`))].join(" "),
)}&type=pullrequests`;

/** How many of MERGED_PRS that search finds, e.g. "3 of 4". */
export const MERGED_PRS_SEARCH_LABEL = `${MERGED_PRS.filter((pr) => !pr.landed).length} of ${MERGED_PRS.length}`;

// METHOD[3] quotes the diabetes paper's two numbers. They are parsed out of
// resume.ts the same way /resume parses them, so the two pages cannot disagree.
const PAPER_GAP = RESUME.publications
  .map((pub) => parsePublishedVsReproduced(pub.description))
  .find((gap) => gap !== null);
if (!PAPER_GAP) throw new Error("resume.ts: no publication states a published-vs-reproduced gap");

const ROLE_COUNT = RESUME.experience.flatMap((company) => company.roles).length;

export function buildReceipts(c: { projectCount: number; toolCount: number }): Receipt[] {
  return [
    {
      n: String(c.projectCount),
      label: "projects in the archive, each with a write-up",
      cta: "open index",
      title: "The archive",
      note: "Computer vision, agentic AI, data platforms, on-device ML, a Go voice tool. Sorted by priority, then id.",
      lines: [
        { text: "Work index, filterable by domain and stack", meta: "/projects", href: "/projects" },
        {
          text: "Every entry has challenge · solution · impact",
          meta: "content/projects/*.mdx",
          href: "https://github.com/jayhemnani9910/personal-website/tree/main/content/projects",
        },
      ],
    },
    {
      n: String(MERGED_PRS.length),
      label: "pull requests merged into ecosystem repositories",
      cta: "show PRs",
      title: "Merged upstream",
      note: "Small changes in large repos. Listed by repo and number so you can read the diff yourself.",
      lines: [
        ...MERGED_PRS.flatMap((pr) => [
          { text: pr.repo, meta: pr.number, href: pr.href },
          ...(pr.landed ? [{ text: `${pr.number} closed, landed as this commit`, meta: "commit", href: pr.landed }] : []),
        ]),
        { text: "The merged ones, in one GitHub search", meta: MERGED_PRS_SEARCH_LABEL, href: MERGED_PRS_SEARCH },
      ],
    },
    {
      n: String(RESUME.publications.length),
      label: `peer-reviewed IEEE papers, ${RESUME.publications[0]?.year}`,
      cta: "show papers",
      title: `IEEE AIMV ${RESUME.publications[0]?.year}`,
      note: "The diabetes paper includes the honest gap between the published number and the reproducible notebook.",
      lines: RESUME.publications.flatMap((pub) =>
        pub.link ? [{ text: pub.title, meta: `ieeexplore ${pub.link.split("/").pop()}`, href: pub.link }] : [],
      ),
    },
    {
      n: "22",
      label: "frames per second, soccer tracking, end to end",
      cta: "show pipeline",
      title: "FIFA Soccer DS",
      note: "YOLOv8 detection, ByteTrack persistence, GraphSAGE scaffold. One DVC stage (analyze_frames) you can re-run.",
      lines: [
        { text: "Project write-up and demo", meta: "/projects/fifa-soccer-ds", href: "/projects/fifa-soccer-ds" },
        {
          text: "Live before/after overlay",
          meta: "github.io",
          href: "https://jayhemnani9910.github.io/fifa-soccer-ds/",
        },
      ],
    },
    {
      n: "94%",
      label: "precision, credit-fraud ensemble on live transaction data",
      cta: "show role",
      title: "Amnex, 2022",
      note: "Random Forest + XGBoost with SMOTE for imbalance. Internship, but it ran on real transactions.",
      lines: [{ text: "AI/ML Intern · Amnex · Gujarat", meta: "Jan-May 2022", href: `/resume#${companyAnchor("Amnex")}` }],
    },
    {
      n: String(c.toolCount),
      label: "MCP tools an agent can call on this page right now",
      cta: "list tools",
      title: "document.modelContext",
      note: "Registered in webmcp.ts and asserted by a test, so the count can't drift from the code.",
      lines: toolLines(),
    },
  ];
}

// The tool receipt's lines, built from the registry so a new tool shows up
// here without anyone retyping the list: read tools four to a line, then the
// write tools.
function toolLines(): ReceiptLine[] {
  const href = "/projects/webmcp-portfolio" as const;
  const read = WEBMCP_TOOLS.filter((t) => t.kind === "read").map((t) => t.name);
  const write = WEBMCP_TOOLS.filter((t) => t.kind === "write").map((t) => t.name);
  const lines: ReceiptLine[] = [];
  for (let i = 0; i < read.length; i += 4) {
    lines.push({ text: read.slice(i, i + 4).join(" · "), meta: "webmcp.ts · read", href });
  }
  if (write.length) lines.push({ text: write.join(" · "), meta: "webmcp.ts · write", href });
  return lines;
}

export const METHOD: MethodRule[] = [
  {
    n: "01",
    rule: "Boring parts first.",
    why: "Ingestion, schema, tests. The clever layer only earns its place once the dull one holds.",
    from: "Stock Data Platform",
    href: "/projects/stock-data-platform",
  },
  {
    n: "02",
    rule: "Make it re-runnable before making it better.",
    why: "One DVC stage re-runs detection, tracking and the graph. If a result can't be reproduced it isn't a result.",
    from: "FIFA Soccer DS",
    href: "/projects/fifa-soccer-ds",
  },
  {
    n: "03",
    rule: "Argue with the model.",
    why: "A supporter and an adversary per claim, then a judge. Agreement is not evidence.",
    from: "CAG Deep Research",
    href: "/projects/revolu-idea",
  },
  {
    n: "04",
    rule: "Publish the gap.",
    why: `${PAPER_GAP.published}% in the paper; ${PAPER_GAP.reproduced}% in the committed notebook. Both numbers are on the résumé.`,
    from: "Diabetes stacking, IEEE 2021",
    href: "/projects/diabetes-stacking",
  },
];

export const LOG_NOTES: Record<string, string> = {
  "Elite Hotel Group":
    "ETL in SQL + Python that cut manual prep 40%; occupancy and revenue dashboards; time-series demand forecasts for pricing.",
  "Independent": "Analytics and pipeline work for small businesses; A/B frameworks; reporting automation.",
  "Amnex": "Credit-fraud ensemble with SMOTE, 94% precision; anomaly dashboards.",
  "Cygnus SoftTech": "CodeLock: AES-encrypted iOS privacy app on Core Data.",
  "Cactus Creatives Pvt. Ltd.": "First-responder comms platform on Azure microservices; CI/CD cut deploys 60%.",
};

export function buildNav(c: { projectCount: number; essayCount: number }): NavItem[] {
  return [
    { label: "Work", alt: `${c.projectCount} shipped`, href: "/projects" },
    { label: "Writing", alt: `${c.essayCount} essays`, href: "/blog" },
    { label: "About", alt: "the log", href: "/resume" },
    { label: "Channel", alt: "on video", href: "/youtube" },
  ];
}

export const SECTIONS: SectionStep[] = [
  { n: "00", label: "brief", href: "#brief", id: "brief" },
  { n: "01", label: "proof", href: "#proof", id: "proof" },
  { n: "02", label: "work", href: "#work", id: "work" },
  { n: "03", label: "method", href: "#method", id: "method" },
  { n: "04", label: "contact", href: "#contact", id: "contact" },
];

/**
 * The titles the hero cycles through. One person, eight labels that hiring
 * pages use for overlapping work, so the line rotates rather than picking one
 * and shrinking the range. ROLES[0] is what server-rendered HTML, a crawler and
 * a reduced-motion visitor see first, so it stays the most specific one.
 */
export const ROLES = [
  "FORWARD DEPLOYED ENGINEER",
  "SOFTWARE ENGINEER",
  "DATA ENGINEER",
  "DATA SCIENTIST",
  "DATA ANALYST",
  "ML ENGINEER",
  "AI ENGINEER",
  "FULL-STACK ENGINEER",
] as const;

export const HERO = {
  status: ["GUJARAT, IN", "OPEN TO WORK"],
  h1: "Give me the vague version.",
  deck: "Briefs never arrive clean. Paste one the way it actually shows up and watch how I take it apart, then see what I've already shipped that looks like it.",
};

export const COPY = {
  proofH2: "Numbers with receipts.",
  proofAside: "Every number here opens its sources. Click one.",
  workDeck:
    "Each one is written the same way on purpose: the problem as it arrived, what I actually did, what changed. If a line here can't be checked, it isn't here.",
  workMore: (n: number) => `The other ${n}, with filters`,
  methodH2: "How I work, with the project that taught me.",
  methodDeck: "Principles are cheap. Each of these is attached to the place it cost me something.",
  logH2: "The log.",
  logDeck: `${ROLE_COUNT} roles, one habit: whichever part nobody wanted, I took it.`,
  contactLabel: "ONE INBOX",
  contactDeck:
    "Looking for software, data and ML roles, forward-deployed ones included. Send the vague version, that's the point.",
  footerLine: SITE_CONFIG.copyright,
  idleNote: "You get back a scope, an architecture, a plan and the risks, plus the projects that prove it.",
  offlineNote:
    "Offline right now, so this is the closest saved example rather than a reading of your brief. The live version calls a model.",
  limitedNote:
    "That's the limit of live runs for this minute, so this is the closest saved example rather than a reading of your brief. Try again in a minute.",
  tooLongNote: (max: number) =>
    `That brief is over ${max} characters, so this is the closest saved example rather than a reading of it. Trim it and run again.`,
};
