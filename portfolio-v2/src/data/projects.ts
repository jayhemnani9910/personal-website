import { Project } from "@/data/types";

/**
 * Single source of truth for projects / case studies.
 * Both the Selected Works grid and the /projects/[id] pages read from here.
 */
export const PROJECTS: Project[] = [
  {
    id: "stock-data-platform",
    title: "Stock Data Platform",
    summary: "Batch + streaming platform for market data with minute-level analytics.",
    role: "Data/Analytics Engineer",
    period: "SJSU",
    domain: "Market data",
    tags: ["data-platform", "streaming", "analytics"],
    tech: ["Python", "Kafka", "Airflow", "TimescaleDB/Postgres", "Dash", "SQL"],
    challenge: "Unify real-time ticks and batch OHLC data into a single, query-friendly warehouse with reproducible jobs.",
    solution: [
      "Kafka topics (ticks, news) for near-real-time ingestion; producers buffer/retry with idempotent writes.",
      "Airflow schedules batch ingests & backfills, orchestrates validation and dimensional loads.",
      "TimescaleDB hypertables for ticks; star schema (FactPrices + dimensions) for analytics.",
      "Dash UI: time-window filters, rolling indicators (SMA/EMA), intraday heatmaps."
    ],
    impact: [
      "Single source of truth for intraday + historical; reproducible backfills.",
      "Interactive dashboards with smooth time-window slicing.",
      "Clear lineage for KPIs and derived indicators."
    ],
    architecture: {
      description: "Streaming + batch ELT into TimescaleDB powering analytics dashboards.",
      legend: [
        { type: "stream", label: "Streams" },
        { type: "service", label: "Processing" },
        { type: "database", label: "Storage" },
        { type: "client", label: "Experience" }
      ],
      nodes: [
        { id: "market-batch", label: "Market API (Batch)", type: "service", x: 80, y: 0 },
        { id: "market-stream", label: "Market API (Streams)", type: "stream", x: 360, y: 0 },
        { id: "staging", label: "Staging Area", type: "database", x: 80, y: 160 },
        { id: "kafka", label: "Kafka Cluster", type: "stream", x: 360, y: 160 },
        { id: "warehouse", label: "TimescaleDB", type: "database", x: 220, y: 320 },
        { id: "dash", label: "Dash Analytics", type: "client", x: 220, y: 470 }
      ],
      edges: [
        { source: "market-batch", target: "staging", label: "Airflow DAGs" },
        { source: "market-stream", target: "kafka", label: "Producers", animated: true },
        { source: "staging", target: "warehouse", label: "ELT (SQL)" },
        { source: "kafka", target: "warehouse", label: "Consumers", animated: true },
        { source: "warehouse", target: "dash", label: "Queries" }
      ]
    },
    featured: true,
    priority: 1,
    links: {}
  },
  {
    id: "barcabrain",
    title: "BarçaBrain",
    summary: "Football intelligence with vector search and player insights UI.",
    role: "Builder",
    period: "SJSU",
    domain: "Sports analytics",
    tags: ["vector-search", "analytics", "ui", "sports"],
    tech: ["Python", "Pandas", "Vector index", "Streamlit/Dash"],
    challenge: "Discover similar players/tactics and surface insights quickly for scouting and analysis.",
    solution: [
      "Feature engineering on match events + player metadata → dense vector embeddings.",
      "Vector index for fast k-NN retrieval with hybrid filters for role/league constraints.",
      "Insights UI showing similarity, role clusters, and attribute deltas."
    ],
    impact: [
      "Rapid like-for-like player discovery.",
      "Actionable scouting views (clusters, comps, deltas)."
    ],
    architecture: {
      description: "Vector search workflow from event feeds to scouting UI.",
      legend: [
        { type: "stream", label: "Feeds" },
        { type: "service", label: "Processing" },
        { type: "database", label: "Store" },
        { type: "search", label: "Vector Index" },
        { type: "client", label: "Insights UI" }
      ],
      nodes: [
        { id: "events", label: "Match/Event Feeds", type: "stream", x: 60, y: 0 },
        { id: "features", label: "Feature Engineering", type: "service", x: 60, y: 160 },
        { id: "store", label: "Feature Store", type: "database", x: 260, y: 160 },
        { id: "index", label: "Vector Index", type: "search", x: 460, y: 160 },
        { id: "api", label: "Similarity API", type: "service", x: 460, y: 300 },
        { id: "ui", label: "Insights UI", type: "client", x: 460, y: 440 }
      ],
      edges: [
        { source: "events", target: "features", label: "Ingest + clean", animated: true },
        { source: "features", target: "store", label: "Persist features" },
        { source: "features", target: "index", label: "Embed + upsert", animated: true },
        { source: "index", target: "api", label: "k-NN + filters" },
        { source: "store", target: "api", label: "Attributes" },
        { source: "api", target: "ui", label: "Insights" }
      ]
    },
    featured: true,
    priority: 2
  },
  {
    id: "laliga-live",
    title: "La Liga Live",
    summary: "Streaming match analytics (xG, heatmaps, formations) in Streamlit.",
    role: "Builder",
    period: "SJSU",
    domain: "Sports analytics",
    tags: ["streaming", "streamlit", "sports"],
    tech: ["Python", "Streamlit", "Pandas"],
    challenge: "Surface live game context with intuitive visuals.",
    solution: [
      "Ingest live event feeds; normalize into a compact model for latency-sensitive charts.",
      "Real-time charts: xG curves, shot maps, possession/pressing zones."
    ],
    impact: [
      "One screen for state of play; reduces manual cross-checking."
    ],
    architecture: {
      description: "Live feed normalization into Streamlit dashboards.",
      nodes: [
        { id: "feed", label: "Live Event API", type: "stream", x: 120, y: 0 },
        { id: "normalizer", label: "Event Normalizer", type: "service", x: 120, y: 140 },
        { id: "cache", label: "In-memory Cache", type: "cache", x: 320, y: 220 },
        { id: "ui", label: "Streamlit UI", type: "client", x: 520, y: 320 }
      ],
      edges: [
        { source: "feed", target: "normalizer", label: "Websocket", animated: true },
        { source: "normalizer", target: "cache", label: "Curated events" },
        { source: "cache", target: "ui", label: "Live queries", animated: true }
      ]
    },
    featured: true,
    priority: 3
  },
  {
    id: "diabetes-stacking",
    title: "Diabetes Prediction (Stacking)",
    summary: "Stacking ensemble for diabetes prediction.",
    role: "Research",
    period: "AIMV-21 / IEEE Xplore",
    tags: ["ml", "research"],
    tech: ["Python", "scikit-learn"],
    challenge: "Improve predictive performance on structured health data.",
    solution: [
      "Preprocessing & feature scaling; train base learners + meta-model.",
      "Model selection via cross-validation and error analysis."
    ],
    impact: ["Reported accuracy ≈ 82.68% on the study dataset."],
    featured: true,
    priority: 4
  },
  {
    id: "vaccine-scheduler",
    title: "Efficient Vaccine Scheduler",
    summary: "CPU-scheduling-inspired vaccine prioritization.",
    role: "Research",
    period: "AIMV-21 / IEEE Xplore",
    tags: ["algorithms", "research"],
    tech: ["Algorithms", "Python"],
    challenge: "Design fair scheduling for limited vaccine supply.",
    solution: [
      "Priority scoring for healthcare/front-line/vulnerable groups.",
      "Comparison of FCFS vs Priority-based policies."
    ],
    impact: ["Framework for transparent, auditable prioritization policies."],
    featured: true,
    priority: 5
  },
  {
    id: "crime-analytics",
    title: "Indian Crime Data Analytics",
    summary: "Pattern mining and schema for incident forecasting.",
    role: "Research (ongoing)",
    tags: ["analytics", "timeseries"],
    tech: ["Python", "SQL"],
    challenge: "Explore relationships and trends across incident categories.",
    solution: [
      "Unify multi-source datasets, normalize taxonomy.",
      "Time-series features for seasonality and location clustering."
    ],
    impact: ["Reusable schema for exploratory + predictive analysis."],
    featured: true,
    priority: 6
  },
  {
    id: "wikipedia-analysis",
    title: "Wikipedia Analysis",
    summary: "URL → scrape → tokenize → top frequent words with visuals.",
    role: "Developer",
    tags: ["python", "flask", "nlp", "web"],
    tech: ["Python", "Flask", "BeautifulSoup", "HTML/CSS"],
    challenge: "Quickly summarize long articles.",
    solution: [
      "BeautifulSoup to scrape; tokenization + stopword removal.",
      "Frequency counts → charts; simple Flask UI."
    ],
    impact: ["Minutes to insights; handy for research & notes."]
  },
  {
    id: "chatbot-intents",
    title: "Chatbot (NLP)",
    summary: "Intent-based bot trained from JSON corpus.",
    role: "Developer",
    tags: ["python", "nlp"],
    tech: ["Python"],
    challenge: "Lightweight Q/A without heavy infra.",
    solution: ["Tokenization, stemming, bag-of-words; intent matching.", "Modular intents for rapid updates."],
    impact: ["Snappy prototype for FAQs & utilities."]
  },
  {
    id: "smart-water-iot",
    title: "Smart Water Management (IoT)",
    summary: "Raspberry Pi + sensors for usage tracking and saving alerts.",
    role: "Developer",
    tags: ["iot", "raspberry-pi"],
    tech: ["Raspberry Pi", "Python", "IoT sensors"],
    challenge: "Detect anomalies and reduce wastage.",
    solution: [
      "Sensor data ingestion to local hub; thresholds + rolling averages.",
      "Alerts + usage summaries; optional cloud sync."
    ],
    impact: ["Data-driven water saving & maintenance scheduling."]
  },
  {
    id: "patching-security",
    title: "Patching — Software Security",
    summary: "Automatic binary-hardening to neutralize vulnerability classes.",
    role: "Developer",
    tags: ["security"],
    tech: ["Security", "Scripting"],
    challenge: "Reduce exposure without source-code access.",
    solution: ["Binary patching on vulnerable patterns; regression tests."],
    impact: ["Rapid mitigation while upstream fixes land."]
  },
  {
    id: "mobile-connect-suite",
    title: "Mobile Connectivity Suite",
    summary: "Android connectivity manager with REST sync and offline cache.",
    role: "Developer",
    tags: ["android", "java", "kotlin"],
    tech: ["Java", "Kotlin", "Gradle", "REST"],
    challenge: "Stable connectivity in flaky network conditions.",
    solution: [
      "Connection watcher + exponential backoff; background sync.",
      "Clean architecture modules; Gradle build flavors."
    ],
    impact: ["Smoother UX and fewer failed operations."]
  },
  {
    id: "optisupply",
    title: "OptiSupply",
    summary: "Analytics for a fashion retailer: shipping −15%, delays −20%, inventory −10%.",
    role: "Analyst/Engineer",
    tags: ["analytics", "python", "supply-chain"],
    tech: ["Python", "Analytics", "Dashboards"],
    challenge: "Costly shipping and supplier delays; high carrying costs.",
    solution: [
      "Data model across orders, lanes, and SLAs; risk scoring.",
      "What-if analysis to rebalance vendors and lanes."
    ],
    impact: ["Reduced shipping costs (−15%), delays (−20%), inventory (−10%)."]
  },
  {
    id: "basic-banking",
    title: "Basic Banking System",
    summary: "Simple login + transactions with PHP backend.",
    role: "Web Dev Intern",
    period: "Feb 2020",
    tags: ["web", "php"],
    tech: ["PHP", "MySQL", "HTML/CSS"],
    challenge: "Minimal banking flow for learning + demo.",
    solution: ["Auth, transfers, and ledger views; clean UI."],
    impact: ["Good primer on forms, security basics, and SQL ops."],
    links: { code: "https://github.com/jeyhemnani99/Basic-banking-system" }
  },
  {
    id: "immigration-db",
    title: "Immigration Management System",
    summary: "Relational schema + CRUD for immigration ops.",
    role: "Developer",
    tags: ["sql"],
    tech: ["SQL", "MySQL/Postgres"],
    challenge: "Normalize complex person-/case-centric data.",
    solution: ["ERD → SQL DDL; indexes for frequent lookups; CRUD console."],
    impact: ["Predictable performance & cleaner data model."]
  },
  {
    id: "accurate-guesser",
    title: "Accurate Guesser",
    summary: "Java desktop guessing game (GUI).",
    role: "Developer",
    tags: ["java", "desktop"],
    tech: ["Java", "Swing"],
    challenge: "Fun UI with simple state machine.",
    solution: ["Swing GUI; input validation; scoring and replay."],
    impact: ["Lightweight demo of event-driven UI."]
  },
  {
    id: "rubiks-timer",
    title: "Rubik’s Cube Timer & Visualization",
    summary: "Timer, stats, and 3-D visualization.",
    role: "Developer",
    tags: ["js", "graphics"],
    tech: ["JavaScript", "Canvas/WebGL"],
    challenge: "Accurate timing + visualization for cubing sessions.",
    solution: ["Timer loop with jitter handling; session stats; cube renderer."],
    impact: ["Practice insights and shareable summaries."]
  },
  {
    id: "scheduling-visualizer",
    title: "Scheduling Algorithms Visualizer (OS)",
    summary: "Interactive FCFS, SJF, Priority, RR visualizations (Electron).",
    role: "Developer",
    tags: ["os", "visualization", "desktop"],
    tech: ["HTML/CSS/JS", "Electron"],
    challenge: "Explain CPU scheduling clearly to learners.",
    solution: ["Gantt views; step-through; compare policies on the same set."],
    impact: ["Better intuition for fairness vs throughput trade-offs."]
  }
];

export const FEATURED_PROJECTS = PROJECTS.filter((p) => p.featured).sort(
  (a, b) => (a.priority ?? 99) - (b.priority ?? 99)
);

export const PROJECT_LOOKUP = PROJECTS.reduce<Record<string, Project>>((acc, project) => {
  acc[project.id] = project;
  return acc;
}, {});

export const getProjectById = (id: string) => PROJECT_LOOKUP[id];
