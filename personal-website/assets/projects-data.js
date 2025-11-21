/* Case-study dataset for the Projects page.
   Each item supports:
   id, title, headline, role, period, tags[],
   challenge, solution[], impact[], tech[],
   diagram (ASCII), images[], video, links:{code,demo,paper}
*/

window.PROJECTS = [
  {
    id: "stock-data-platform",
    title: "Stock Data Platform",
    headline: "Batch + streaming platform for market data with minute-level analytics.",
    role: "Data/Analytics Engineer",
    period: "SJSU",
    tags: ["kafka","airflow","timescaledb","dash","etl","streaming","warehouse"],
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
    tech: ["Python","Kafka","Airflow","TimescaleDB/Postgres","Dash","SQL"],
    diagram:
`           +---------+         +---------+
Market API | Batch   |         | Streams |
(OHLC/tick)+----+----+         +----+----+
                |                   |
                | Airflow DAGs      | Kafka producers
                v                   v
           +---------+        +-----------+
           | Staging |        |  Kafka    |
           +----+----+        |  topics   |
                |             +-----------+
                | ELT (SQL)         |
                v                   v
          +-------------------------------+
          | TimescaleDB (hypertables)    |
          | + Star schema (OLAP marts)   |
          +-------------------------------+
                         |
                         v
                +----------------+
                | Dash Analytics |
                +----------------+`,
    images: [],
    links: {}
  },

  {
    id: "barcabrain",
    title: "BarçaBrain",
    headline: "Football intelligence with vector search and player insights UI.",
    role: "Builder",
    period: "SJSU",
    tags: ["vector-search","analytics","ui","sports"],
    challenge: "Discover similar players/tactics and surface insights quickly for scouting and analysis.",
    solution: [
      "Feature engineering on match events + player metadata → dense vector embeddings.",
      "Vector index for fast k-NN retrieval; hybrid search for filters.",
      "Insights UI: similarity, role clusters, and attribute deltas."
    ],
    impact: [
      "Rapid like-for-like player discovery.",
      "Actionable scouting views (clusters, comps, deltas)."
    ],
    tech: ["Python","Pandas","Vector index","Streamlit/Dash"],
    diagram:
`Data + Events --> Feature vectors --> Vector Index --> Similar players/roles
                                         |
                                         +--> UI (clusters, comps, deltas)`
  },

  {
    id: "laliga-live",
    title: "La Liga Live",
    headline: "Streaming match analytics (xG, heatmaps, formations) in Streamlit.",
    role: "Builder",
    period: "SJSU",
    tags: ["streaming","streamlit","sports"],
    challenge: "Surface live game context with intuitive visuals.",
    solution: [
      "Ingest live event feeds; normalize into compact model.",
      "Real-time charts: xG curves, shot maps, possession/pressing zones."
    ],
    impact: [
      "One screen for state of play; reduces manual cross-checking."
    ],
    tech: ["Python","Streamlit","Pandas"]
  },

  {
    id: "diabetes-stacking",
    title: "Diabetes Prediction (Stacking)",
    headline: "Stacking ensemble for diabetes prediction.",
    role: "Research",
    period: "AIMV-21 / IEEE Xplore",
    tags: ["ml","research"],
    challenge: "Improve predictive performance on structured health data.",
    solution: [
      "Preprocessing & feature scaling; train base learners + meta-model.",
      "Model selection via cross-validation and error analysis."
    ],
    impact: ["Reported accuracy ≈ 82.68% on the study dataset."],
    tech: ["Python","scikit-learn"]
  },

  {
    id: "vaccine-scheduler",
    title: "Efficient Vaccine Scheduler",
    headline: "CPU-scheduling-inspired vaccine prioritization.",
    role: "Research",
    period: "AIMV-21 / IEEE Xplore",
    tags: ["algorithms","research"],
    challenge: "Design fair scheduling for limited vaccine supply.",
    solution: [
      "Priority scoring for healthcare/front-line/vulnerable groups.",
      "Comparison of FCFS vs Priority-based policies."
    ],
    impact: ["Framework for transparent, auditable prioritization policies."],
    tech: ["Algorithms","Python"]
  },

  {
    id: "crime-analytics",
    title: "Indian Crime Data Analytics",
    headline: "Pattern mining and schema for incident forecasting.",
    role: "Research (ongoing)",
    period: "",
    tags: ["analytics","timeseries"],
    challenge: "Explore relationships and trends across incident categories.",
    solution: [
      "Unify multi-source datasets, normalize taxonomy.",
      "Time-series features for seasonality and location clustering."
    ],
    impact: ["Reusable schema for exploratory + predictive analysis."],
    tech: ["Python","SQL"]
  },

  {
    id: "wikipedia-analysis",
    title: "Wikipedia Analysis",
    headline: "URL → scrape → tokenize → top frequent words with visuals.",
    role: "Developer",
    period: "",
    tags: ["python","flask","nlp","web"],
    challenge: "Quickly summarize long articles.",
    solution: [
      "BeautifulSoup to scrape; tokenization + stopword removal.",
      "Frequency counts → charts; simple Flask UI."
    ],
    impact: ["Minutes to insights; handy for research & notes."],
    tech: ["Python","Flask","BeautifulSoup","HTML/CSS"]
  },

  {
    id: "chatbot-intents",
    title: "Chatbot (NLP)",
    headline: "Intent-based bot trained from JSON corpus.",
    role: "Developer",
    period: "",
    tags: ["python","nlp"],
    challenge: "Lightweight Q/A without heavy infra.",
    solution: ["Tokenization, stemming, bag-of-words; intent matching.", "Modular intents for rapid updates."],
    impact: ["Snappy prototype for FAQs & utilities."],
    tech: ["Python"]
  },

  {
    id: "smart-water-iot",
    title: "Smart Water Management (IoT)",
    headline: "Raspberry Pi + sensors for usage tracking and saving alerts.",
    role: "Developer",
    period: "",
    tags: ["iot","raspberry-pi"],
    challenge: "Detect anomalies and reduce wastage.",
    solution: [
      "Sensor data ingestion to local hub; thresholds + rolling averages.",
      "Alerts + usage summaries; optional cloud sync."
    ],
    impact: ["Data-driven water saving & maintenance scheduling."],
    tech: ["Raspberry Pi","Python","IoT sensors"]
  },

  {
    id: "patching-security",
    title: "Patching — Software Security",
    headline: "Automatic binary-hardening to neutralize vulnerability classes.",
    role: "Developer",
    period: "",
    tags: ["security"],
    challenge: "Reduce exposure without source-code access.",
    solution: ["Binary patching on vulnerable patterns; regression tests."],
    impact: ["Rapid mitigation while upstream fixes land."],
    tech: ["Security","Scripting"]
  },

  {
    id: "mobile-connect-suite",
    title: "Mobile Connectivity Suite",
    headline: "Android connectivity manager with REST sync and offline cache.",
    role: "Developer",
    period: "",
    tags: ["android","java","kotlin"],
    challenge: "Stable connectivity in flaky network conditions.",
    solution: [
      "Connection watcher + exponential backoff; background sync.",
      "Clean architecture modules; Gradle build flavors."
    ],
    impact: ["Smoother UX and fewer failed operations."],
    tech: ["Java","Kotlin","Gradle","REST"]
  },

  {
    id: "optisupply",
    title: "OptiSupply",
    headline: "Analytics for a fashion retailer: shipping −15%, delays −20%, inventory −10%.",
    role: "Analyst/Engineer",
    period: "",
    tags: ["analytics","python","supply-chain"],
    challenge: "Costly shipping and supplier delays; high carrying costs.",
    solution: [
      "Data model across orders, lanes, and SLAs; risk scoring.",
      "What-if analysis to rebalance vendors and lanes."
    ],
    impact: ["Reduced shipping costs (−15%), delays (−20%), inventory (−10%)."],
    tech: ["Python","Analytics","Dashboards"]
  },

  {
    id: "basic-banking",
    title: "Basic Banking System",
    headline: "Simple login + transactions with PHP backend.",
    role: "Web Dev Intern",
    period: "Feb 2020",
    tags: ["web","php"],
    challenge: "Minimal banking flow for learning + demo.",
    solution: ["Auth, transfers, and ledger views; clean UI."],
    impact: ["Good primer on forms, security basics, and SQL ops."],
    tech: ["PHP","MySQL","HTML/CSS"],
    links: { code: "https://github.com/jeyhemnani99/Basic-banking-system" }
  },

  {
    id: "immigration-db",
    title: "Immigration Management System",
    headline: "Relational schema + CRUD for immigration ops.",
    role: "Developer",
    period: "",
    tags: ["sql"],
    challenge: "Normalize complex person-/case-centric data.",
    solution: ["ERD → SQL DDL; indexes for frequent lookups; CRUD console."],
    impact: ["Predictable performance & cleaner data model."],
    tech: ["SQL","MySQL/Postgres"]
  },

  {
    id: "accurate-guesser",
    title: "Accurate Guesser",
    headline: "Java desktop guessing game (GUI).",
    role: "Developer",
    period: "",
    tags: ["java","desktop"],
    challenge: "Fun UI with simple state machine.",
    solution: ["Swing GUI; input validation; scoring and replay."],
    impact: ["Lightweight demo of event-driven UI."],
    tech: ["Java","Swing"]
  },

  {
    id: "rubiks-timer",
    title: "Rubik’s Cube Timer & Visualization",
    headline: "Timer, stats, and 3-D visualization.",
    role: "Developer",
    period: "",
    tags: ["js","graphics"],
    challenge: "Accurate timing + visualization for cubing sessions.",
    solution: ["Timer loop with jitter handling; session stats; cube renderer."],
    impact: ["Practice insights and shareable summaries."],
    tech: ["JavaScript","Canvas/WebGL"]
  },

  {
    id: "scheduling-visualizer",
    title: "Scheduling Algorithms Visualizer (OS)",
    headline: "Interactive FCFS, SJF, Priority, RR visualizations (Electron).",
    role: "Developer",
    period: "",
    tags: ["os","visualization","desktop"],
    challenge: "Explain CPU scheduling clearly to learners.",
    solution: ["Gantt views; step-through; compare policies on the same set."],
    impact: ["Better intuition for fairness vs throughput trade-offs."],
    tech: ["HTML/CSS/JS","Electron"]
  }
];
