/**
 * Copy and structured data for the Desk home page (src/components/home-desk).
 * Every count that can drift from the real content (project count, merged PRs,
 * papers, the cube time) is derived from the content or the résumé, never a
 * literal baked into this file.
 */
import { WEBMCP_TOOLS, WEBMCP_TOOL_COUNT } from "@/lib/webmcp-tools";
import { RESUME, CUBE_ACHIEVEMENT, companyAnchor, parsePublishedVsReproduced } from "@/data/resume";

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

export type ReceiptLine = { text: string; meta: string; href: string };

export type Receipt = {
  n: string;
  label: string;
  cta: string;
  title: string;
  note: string;
  lines: ReceiptLine[];
};

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

// HOUSE_RULES[3] quotes the diabetes paper's two numbers. They are parsed out
// of resume.ts the same way /resume parses them, so the two pages cannot disagree.
const PAPER_GAP = RESUME.publications
  .map((pub) => parsePublishedVsReproduced(pub.description))
  .find((gap) => gap !== null);
if (!PAPER_GAP) throw new Error("resume.ts: no publication states a published-vs-reproduced gap");

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

export const LOG_NOTES: Record<string, string> = {
  "Elite Hotel Group":
    "ETL in SQL + Python that cut manual prep 40%; occupancy and revenue dashboards; time-series demand forecasts for pricing.",
  "Independent": "Analytics and pipeline work for small businesses; A/B frameworks; reporting automation.",
  "Amnex": "Credit-fraud ensemble with SMOTE, 94% precision; anomaly dashboards.",
  "Cygnus SoftTech": "CodeLock: AES-encrypted iOS privacy app on Core Data.",
  "Cactus Creatives Pvt. Ltd.": "First-responder comms platform on Azure microservices; CI/CD cut deploys 60%.",
};

/**
 * The log, newest first, which is the order src/data/resume.ts already
 * declares. Each employer's first role is the one the log shows; the note comes
 * from LOG_NOTES, keyed by the employer name exactly as the resume spells it
 * (home.test.ts asserts those keys match in both directions, so a renamed
 * employer fails the test rather than rendering an empty line).
 *
 * `period` is optional on the Role type, so an entry without one is skipped
 * rather than rendered with an empty date column.
 */
export function buildLogEntries() {
  return RESUME.experience.flatMap((org) => {
    const role = org.roles[0];
    const when = role?.period?.label;
    if (!role || !when) return [];
    return [{ when, role: role.title, org: org.name, what: LOG_NOTES[org.name] ?? "" }];
  });
}

/** The cube time from the résumé's achievements line, e.g. "16.7". */
const cubeSeconds = CUBE_ACHIEVEMENT?.match(/([\d.]+)\s*sec/)?.[1];
if (!cubeSeconds) throw new Error("resume.ts: the Rubik's Cube achievement has no time in seconds");
export const CUBE_PB = cubeSeconds;

export type DeskStat = { n: string; label: string };

export function buildDeskStats(c: { projectCount: number }): DeskStat[] {
  return [
    { n: String(c.projectCount), label: "projects, each with a write-up" },
    { n: String(MERGED_PRS.length), label: "pull requests merged upstream" },
    { n: String(RESUME.publications.length), label: `IEEE papers (${RESUME.publications[0]?.year})` },
    { n: "94%", label: "fraud-model precision on live data" },
    { n: `${CUBE_PB}s`, label: "Rubik's PB, officially" },
  ];
}

export type HouseRule = { n: string; title: string; why: string; from: string };

export const HOUSE_RULES: HouseRule[] = [
  {
    n: "#1",
    title: "Boring parts first.",
    why: "Ingestion, schema, tests. The clever layer earns its place once the dull one holds.",
    from: "Stock Data Platform",
  },
  {
    n: "#2",
    title: "Re-runnable, then better.",
    why: "If a result can't be reproduced with one command, it isn't a result.",
    from: "FIFA Soccer DS",
  },
  {
    n: "#3",
    title: "Argue with the model.",
    why: "Agreement is not evidence. Give it an adversary and a judge.",
    from: "CAG Deep Research",
  },
  {
    n: "#4",
    title: "Publish the gap.",
    why: `${PAPER_GAP.published}% in the paper, ${PAPER_GAP.reproduced}% in the notebook. Both numbers live on the résumé.`,
    from: `IEEE ${RESUME.publications[0]?.year}`,
  },
];

/** One a day, picked by day of the year; "one more" steps through the rest. */
export const DAILY_FACTS = [
  "I can solve a Rubik's cube faster than most people can find the white center.",
  "My first internship shipped a first-responder comms platform. No pressure.",
  'I have two IEEE papers and zero idea how to pronounce "IEEE" confidently.',
  "This page has more easter eggs than tests. That's a lie. Probably.",
  "A credit-fraud model of mine hit 94% precision. It still doesn't trust me.",
  "I once wrote 23 Airflow DAGs and named exactly zero of them well.",
  "Favourite bug: the one that only appeared on Tuesdays.",
];
