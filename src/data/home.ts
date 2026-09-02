/**
 * Copy and structured data for the v4 home page (see docs/design/portfolio-home).
 * Every count that can drift from the real content (project count, MCP tool
 * count, essay count) arrives as a function argument computed at build time,
 * never a literal baked into this file.
 *
 * Two claims from the design export were dropped because nothing in the repo
 * backs them: the "4 YRS" experience chip (the earliest role on record is a
 * May 2019 internship, not four years of anything) and the "project 19" aside
 * in the cube-scramble copy (no such project exists). Neither survives here.
 */

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

export type MethodRule = { n: string; rule: string; why: string; from: string; href: string };

export type NavItem = { label: string; alt: string; href: string };

export type SectionStep = { n: string; label: string; href: string; id: string };

export const FEATURED: FeaturedProject[] = [
  {
    id: "fifa-soccer-ds",
    num: "01",
    title: "FIFA Soccer DS",
    tags: ["vision", "video", "pipeline", "ml"],
    tech: ["YOLOv8", "ByteTrack", "DVC", "MLflow", "FastAPI"],
    arrived: "Match footage and a question: can we track every player and turn it into tactics?",
    did: "Detection → multi-object tracking → tactical graph, wired as a 7-stage DVC pipeline with MLflow tracking and a FastAPI service.",
    changed: "22 fps end to end. Reproducible from raw video with one command.",
  },
  {
    id: "revolu-idea",
    num: "02",
    title: "CAG Deep Research",
    tags: ["agents", "llm", "research"],
    tech: ["LangGraph", "LangChain", "Ollama", "Groq"],
    arrived: "Research agents that confidently agree with themselves.",
    did: "Planned a causal graph per question; paired adversary and supporter agents per edge; a judge rules and loops back through an auditor.",
    changed: "Every claim exits tagged VERIFIED, CONTESTED or UNVERIFIED, with the evidence attached.",
  },
  {
    id: "stock-data-platform",
    num: "03",
    title: "Stock Data Platform",
    tags: ["data", "streaming", "warehouse", "dashboard"],
    tech: ["Kafka", "Airflow", "TimescaleDB", "Dash"],
    arrived: "Tick data nobody could query and a dashboard everyone wanted.",
    did: "Kafka ingestion, 18 Airflow DAGs, a TimescaleDB star schema, live candlesticks.",
    changed: "Real-time multi-symbol OHLC from tick to chart; a warehouse a BI tool can join.",
  },
  {
    id: "webmcp-portfolio",
    num: "04",
    title: "WebMCP, on this site",
    tags: ["web", "agents", "standards"],
    tech: ["TypeScript", "Next.js 16", "WebMCP"],
    arrived: "Could a portfolio be read by a machine as easily as by a person?",
    did: "Registered 8 tools on navigator.modelContext: search, résumé, skills, contact, experiments, theme, mode.",
    changed: "An agent in Chrome 146+ reads this site without scraping it.",
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
    did: "Fused sequence (ProtT5), structure (graph) and a vibrational VDOS signal into one head.",
    changed: "The vibrational channel is the part that moves the number.",
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

export function buildReceipts(c: { projectCount: number; toolCount: number }): Receipt[] {
  return [
    {
      n: String(c.projectCount),
      label: "projects in the archive, each with a write-up",
      cta: "open index",
      title: "The archive",
      note: "Computer vision, agentic AI, data platforms, on-device ML, a Go voice tool. Sorted by priority, then id.",
      lines: [
        { text: "Work index, filterable by domain and stack", meta: "/work", href: "/projects" },
        {
          text: "Every entry has challenge · solution · impact",
          meta: "content/projects/*.mdx",
          href: "https://github.com/jayhemnani9910/personal-website/tree/main/content/projects",
        },
      ],
    },
    {
      n: "3",
      label: "pull requests merged into ecosystem repositories",
      cta: "show PRs",
      title: "Merged upstream",
      note: "Small changes in large repos. Listed by repo and number so you can read the diff yourself.",
      lines: [
        { text: "vllm-project/vllm", meta: "#31513", href: "https://github.com/vllm-project/vllm/pull/31513" },
        {
          text: "modelcontextprotocol/python-sdk",
          meta: "#1826",
          href: "https://github.com/modelcontextprotocol/python-sdk/pull/1826",
        },
        { text: "google/A2UI", meta: "#407", href: "https://github.com/google/A2UI/pull/407" },
        {
          text: "All merged PRs by author, on GitHub",
          meta: "search",
          href: "https://github.com/pulls?q=is%3Apr+author%3Ajayhemnani9910+is%3Amerged",
        },
      ],
    },
    {
      n: "2",
      label: "peer-reviewed IEEE papers, 2021",
      cta: "show papers",
      title: "IEEE AIMV 2021",
      note: "Both include the honest gap between the published number and the reproducible notebook.",
      lines: [
        {
          text: "Diabetes Prediction using Stacking Classifier",
          meta: "ieeexplore 9670920",
          href: "https://ieeexplore.ieee.org/document/9670920",
        },
        {
          text: "CPU Scheduling Algorithms Analysis",
          meta: "ieeexplore 9670986",
          href: "https://ieeexplore.ieee.org/document/9670986",
        },
      ],
    },
    {
      n: "22",
      label: "frames per second, soccer tracking, end to end",
      cta: "show pipeline",
      title: "FIFA Soccer DS",
      note: "YOLOv8 detection, ByteTrack persistence, GraphSAGE scaffold. Seven DVC stages you can re-run.",
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
      lines: [{ text: "AI/ML Intern · Amnex · Gujarat", meta: "Jan-May 2022", href: "/resume" }],
    },
    {
      n: String(c.toolCount),
      label: "MCP tools an agent can call on this page right now",
      cta: "list tools",
      title: "navigator.modelContext",
      note: "Registered in webmcp.ts and asserted by a test, so the count can't drift from the code.",
      lines: [
        {
          text: "search_projects · get_project · get_resume · search_skills",
          meta: "webmcp.ts · read",
          href: "/projects/webmcp-portfolio",
        },
        { text: "get_contact · list_experiments", meta: "webmcp.ts · read", href: "/projects/webmcp-portfolio" },
        { text: "toggle_theme · switch_mode", meta: "webmcp.ts · write", href: "/projects/webmcp-portfolio" },
      ],
    },
  ];
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
    why: "Seven DVC stages from raw video. If a result can't be reproduced it isn't a result.",
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
    why: "82.68% in the paper; 74.46% in the committed notebook. Both numbers are on the résumé.",
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

export const HERO = {
  status: ["FORWARD DEPLOYED ENGINEER", "GUJARAT, IN → RELOCATING", "OPEN TO WORK"],
  h1: "Give me the vague version.",
  deck: "Briefs never arrive clean. Paste one the way it actually shows up and watch how I take it apart, then see what I have already shipped that looks like it.",
  aside: [
    "// this is the job. the rest of the page is the evidence.",
    "// yes, it actually runs. no, it won't judge your typos.",
  ],
};

export const COPY = {
  proofH2: "Numbers with receipts.",
  proofAside: "// numbers without sources are just fonts. click one.",
  workDeck:
    "Each one is written the same way on purpose: the problem as it arrived, what I actually did, what changed. If a line here can't be checked, it isn't here.",
  workMore: (n: number) => `The other ${n}, with filters`,
  methodH2: "How I work, with the project that taught me.",
  methodDeck: "Principles are cheap. Each of these is attached to the place it cost me something.",
  logH2: "The log.",
  logDeck: "Five roles, one habit: whichever part nobody wanted, I took it.",
  logAside: "// git log --oneline, but for a person",
  contactLabel: "ONE INBOX",
  contactDeck:
    "Looking for forward-deployed and data-engineering roles. Senior software is on the table. Send the vague version. That is the point.",
  footerLine: (toolCount: number) =>
    `© 2026 Jay Hemnani · set in Instrument Sans + Geist Mono · readable by people and by ${toolCount} MCP tools`,
  footerTop: "// you scrolled all the way. respect.",
  idleNote: "// output lands here: scope / architecture / plan / risks, plus the projects that prove it",
  offlineNote:
    "// offline: this is the closest preset, not a reading of your brief. the live version calls a model.",
};
