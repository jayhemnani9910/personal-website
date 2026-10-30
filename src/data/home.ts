/**
 * Copy and structured data for the Desk home page (src/components/home-desk).
 * Every count that can drift from the real content (project count, merged PRs,
 * papers, the cube time) is derived from the content or the résumé, never a
 * literal baked into this file.
 */
import { WEBMCP_TOOLS, WEBMCP_TOOL_COUNT } from "@/lib/webmcp-tools";
import { RESUME, CUBE_ACHIEVEMENT, companyAnchor, parsePublishedVsReproduced } from "@/data/resume";

/** The fraud model's precision from the Amnex bullet on the résumé, e.g. "94". */
const fraudPrecision = RESUME.experience
  .find((org) => org.name === "Amnex")
  ?.roles.flatMap((r) => r.bullets)
  .map((b) => b.text.match(/(\d+)% precision/)?.[1])
  .find(Boolean);
if (!fraudPrecision) throw new Error("resume.ts: the Amnex role has no '<n>% precision' bullet");
const FRAUD_PRECISION = `${fraudPrecision}%`;

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
  title: string;
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
    changed: "Detection and tracking at 22 fps on my RTX 3070 laptop. Reproducible from extracted frames with one command.",
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
    did: `Registered ${WEBMCP_TOOL_COUNT} tools with the WebMCP browser API: search, project, résumé, skills, contact, experiments, reader mode.`,
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
 * One list, two readers: the /oss page and the shell's
 * `receipts`. It lives here rather than in resume.ts because resume.ts
 * has no field for it, and duplicating these URLs across two pages is how a
 * verified claim drifts into an unverified one. Sourced from
 * the job-search MASTER_PROFILE.md section 7, which is the canonical list.
 *
 * modular/modular #6954, #6967, #7235 and #7273 show as Closed on GitHub rather than
 * Merged, because Modular lands outside contributions with Copybara instead of
 * pressing merge. They landed in commits 39b94179d6c9c5be6334888f119fcb51469c3ad0
 * on 2026-09-02, 71437b1e23b7aae926295767f38162e300608953 on 2026-09-17,
 * 189bd1393e2c35bfe777c97b1b3c8b1a31be8f8e on 2026-10-08 and
 * 8ad5954acde7c96caf8a12e8b96abb75e211730f on 2026-10-22, which the modularbot
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
  { repo: "caddyserver/caddy", number: "#8169", href: "https://github.com/caddyserver/caddy/pull/8169" },
  { repo: "Effect-TS/effect", number: "#8952", href: "https://github.com/Effect-TS/effect/pull/8952" },
  { repo: "lightpanda-io/browser", number: "#3873", href: "https://github.com/lightpanda-io/browser/pull/3873" },
  { repo: "caddyserver/caddy", number: "#8150", href: "https://github.com/caddyserver/caddy/pull/8150" },
  { repo: "morluto/rea", number: "#1216", href: "https://github.com/morluto/rea/pull/1216" },
  { repo: "AlexsJones/llmfit", number: "#1121", href: "https://github.com/AlexsJones/llmfit/pull/1121" },
  { repo: "morluto/rea", number: "#1215", href: "https://github.com/morluto/rea/pull/1215" },
  { repo: "lightpanda-io/browser", number: "#3874", href: "https://github.com/lightpanda-io/browser/pull/3874" },
  { repo: "AlexsJones/llmfit", number: "#1126", href: "https://github.com/AlexsJones/llmfit/pull/1126" },
  { repo: "caddyserver/caddy", number: "#8168", href: "https://github.com/caddyserver/caddy/pull/8168" },
  { repo: "Effect-TS/effect", number: "#8986", href: "https://github.com/Effect-TS/effect/pull/8986" },
  { repo: "Effect-TS/effect", number: "#8987", href: "https://github.com/Effect-TS/effect/pull/8987" },
  { repo: "AlexsJones/llmfit", number: "#1125", href: "https://github.com/AlexsJones/llmfit/pull/1125" },
  { repo: "lightpanda-io/browser", number: "#3896", href: "https://github.com/lightpanda-io/browser/pull/3896" },
  { repo: "pocket-id/pocket-id", number: "#1830", href: "https://github.com/pocket-id/pocket-id/pull/1830" },
  { repo: "caddyserver/caddy", number: "#8189", href: "https://github.com/caddyserver/caddy/pull/8189" },
  { repo: "caddyserver/caddy", number: "#8183", href: "https://github.com/caddyserver/caddy/pull/8183" },
  { repo: "pocket-id/pocket-id", number: "#1829", href: "https://github.com/pocket-id/pocket-id/pull/1829" },
  { repo: "mvschwarz/openrig", number: "#1057", href: "https://github.com/mvschwarz/openrig/pull/1057" },
  { repo: "mvschwarz/openrig", number: "#1102", href: "https://github.com/mvschwarz/openrig/pull/1102" },
  { repo: "lightpanda-io/browser", number: "#3895", href: "https://github.com/lightpanda-io/browser/pull/3895" },
  { repo: "morluto/rea", number: "#1476", href: "https://github.com/morluto/rea/pull/1476" },
  { repo: "casdoor/casdoor", number: "#5915", href: "https://github.com/casdoor/casdoor/pull/5915" },
  { repo: "casdoor/casdoor", number: "#5916", href: "https://github.com/casdoor/casdoor/pull/5916" },
  { repo: "pocket-id/pocket-id", number: "#1834", href: "https://github.com/pocket-id/pocket-id/pull/1834" },
  { repo: "eugenioenko/ttt", number: "#814", href: "https://github.com/eugenioenko/ttt/pull/814" },
  { repo: "pocket-id/pocket-id", number: "#1835", href: "https://github.com/pocket-id/pocket-id/pull/1835" },
  { repo: "Effect-TS/effect", number: "#9014", href: "https://github.com/Effect-TS/effect/pull/9014" },
  { repo: "Effect-TS/effect", number: "#9013", href: "https://github.com/Effect-TS/effect/pull/9013" },
  { repo: "eugenioenko/ttt", number: "#815", href: "https://github.com/eugenioenko/ttt/pull/815" },
  { repo: "lightpanda-io/browser", number: "#3911", href: "https://github.com/lightpanda-io/browser/pull/3911" },
  { repo: "lightpanda-io/browser", number: "#3910", href: "https://github.com/lightpanda-io/browser/pull/3910" },
  { repo: "radareorg/radare2", number: "#26948", href: "https://github.com/radareorg/radare2/pull/26948" },
  { repo: "caddyserver/caddy", number: "#8195", href: "https://github.com/caddyserver/caddy/pull/8195" },
  { repo: "radareorg/radare2", number: "#26947", href: "https://github.com/radareorg/radare2/pull/26947" },
  { repo: "MHSanaei/3x-ui", number: "#6781", href: "https://github.com/MHSanaei/3x-ui/pull/6781" },
  { repo: "Effect-TS/effect", number: "#9048", href: "https://github.com/Effect-TS/effect/pull/9048" },
  { repo: "Effect-TS/effect", number: "#9049", href: "https://github.com/Effect-TS/effect/pull/9049" },
  { repo: "AlexsJones/llmfit", number: "#1130", href: "https://github.com/AlexsJones/llmfit/pull/1130" },
  { repo: "AlexsJones/llmfit", number: "#1131", href: "https://github.com/AlexsJones/llmfit/pull/1131" },
  { repo: "seaweedfs/seaweedfs", number: "#11724", href: "https://github.com/seaweedfs/seaweedfs/pull/11724" },
  { repo: "stanfordnlp/dspy", number: "#10574", href: "https://github.com/stanfordnlp/dspy/pull/10574" },
  { repo: "skylot/jadx", number: "#3002", href: "https://github.com/skylot/jadx/pull/3002" },
  { repo: "seaweedfs/seaweedfs", number: "#11723", href: "https://github.com/seaweedfs/seaweedfs/pull/11723" },
  { repo: "eugenioenko/ttt", number: "#877", href: "https://github.com/eugenioenko/ttt/pull/877" },
  { repo: "eugenioenko/ttt", number: "#878", href: "https://github.com/eugenioenko/ttt/pull/878" },
  { repo: "Effect-TS/effect", number: "#9096", href: "https://github.com/Effect-TS/effect/pull/9096" },
  { repo: "Effect-TS/effect", number: "#9095", href: "https://github.com/Effect-TS/effect/pull/9095" },
  { repo: "radareorg/radare2", number: "#26957", href: "https://github.com/radareorg/radare2/pull/26957" },
  { repo: "radareorg/radare2", number: "#26958", href: "https://github.com/radareorg/radare2/pull/26958" },
  { repo: "AlexsJones/llmfit", number: "#1142", href: "https://github.com/AlexsJones/llmfit/pull/1142" },
  { repo: "caddyserver/caddy", number: "#8207", href: "https://github.com/caddyserver/caddy/pull/8207" },
  { repo: "caddyserver/caddy", number: "#8209", href: "https://github.com/caddyserver/caddy/pull/8209" },
  { repo: "mvanhorn/last30days-skill", number: "#1274", href: "https://github.com/mvanhorn/last30days-skill/pull/1274" },
  { repo: "mvanhorn/last30days-skill", number: "#1273", href: "https://github.com/mvanhorn/last30days-skill/pull/1273" },
  { repo: "eugenioenko/ttt", number: "#891", href: "https://github.com/eugenioenko/ttt/pull/891" },
  { repo: "eugenioenko/ttt", number: "#892", href: "https://github.com/eugenioenko/ttt/pull/892" },
  { repo: "skylot/jadx", number: "#3003", href: "https://github.com/skylot/jadx/pull/3003" },
  { repo: "radareorg/radare2", number: "#26969", href: "https://github.com/radareorg/radare2/pull/26969" },
  { repo: "Effect-TS/effect", number: "#9117", href: "https://github.com/Effect-TS/effect/pull/9117" },
  { repo: "Effect-TS/effect", number: "#9118", href: "https://github.com/Effect-TS/effect/pull/9118" },
  { repo: "Tencent/teamai-cli", number: "#1109", href: "https://github.com/Tencent/teamai-cli/pull/1109" },
  { repo: "radareorg/radare2", number: "#26968", href: "https://github.com/radareorg/radare2/pull/26968" },
  { repo: "0xJacky/nginx-ui", number: "#2014", href: "https://github.com/0xJacky/nginx-ui/pull/2014" },
  { repo: "0xJacky/nginx-ui", number: "#2015", href: "https://github.com/0xJacky/nginx-ui/pull/2015" },
  { repo: "apify/crawlee", number: "#4250", href: "https://github.com/apify/crawlee/pull/4250" },
  { repo: "Effect-TS/effect", number: "#9145", href: "https://github.com/Effect-TS/effect/pull/9145" },
  { repo: "lightpanda-io/browser", number: "#3951", href: "https://github.com/lightpanda-io/browser/pull/3951" },
  { repo: "lightpanda-io/browser", number: "#3952", href: "https://github.com/lightpanda-io/browser/pull/3952" },
  { repo: "MHSanaei/3x-ui", number: "#6808", href: "https://github.com/MHSanaei/3x-ui/pull/6808" },
  { repo: "MHSanaei/3x-ui", number: "#6809", href: "https://github.com/MHSanaei/3x-ui/pull/6809" },
  { repo: "Tencent/teamai-cli", number: "#1110", href: "https://github.com/Tencent/teamai-cli/pull/1110" },
  { repo: "gtsteffaniak/filebrowser", number: "#3130", href: "https://github.com/gtsteffaniak/filebrowser/pull/3130" },
  { repo: "radareorg/radare2", number: "#26977", href: "https://github.com/radareorg/radare2/pull/26977" },
  { repo: "Effect-TS/effect", number: "#9198", href: "https://github.com/Effect-TS/effect/pull/9198" },
  { repo: "Effect-TS/effect", number: "#9199", href: "https://github.com/Effect-TS/effect/pull/9199" },
  { repo: "AlexsJones/llmfit", number: "#1141", href: "https://github.com/AlexsJones/llmfit/pull/1141" },
  { repo: "AlexsJones/llmfit", number: "#1145", href: "https://github.com/AlexsJones/llmfit/pull/1145" },
  { repo: "AlexsJones/llmfit", number: "#1146", href: "https://github.com/AlexsJones/llmfit/pull/1146" },
  { repo: "github/github-mcp-server", number: "#3419", href: "https://github.com/github/github-mcp-server/pull/3419" },
  { repo: "lightpanda-io/browser", number: "#3979", href: "https://github.com/lightpanda-io/browser/pull/3979" },
  { repo: "lightpanda-io/browser", number: "#3980", href: "https://github.com/lightpanda-io/browser/pull/3980" },
  { repo: "radareorg/radare2", number: "#26989", href: "https://github.com/radareorg/radare2/pull/26989" },
  { repo: "radareorg/radare2", number: "#26990", href: "https://github.com/radareorg/radare2/pull/26990" },
  { repo: "seaweedfs/seaweedfs", number: "#11733", href: "https://github.com/seaweedfs/seaweedfs/pull/11733" },
  { repo: "Tencent/teamai-cli", number: "#1146", href: "https://github.com/Tencent/teamai-cli/pull/1146" },
  { repo: "zigimg/zigimg", number: "#346", href: "https://github.com/zigimg/zigimg/pull/346" },
  { repo: "zigimg/zigimg", number: "#347", href: "https://github.com/zigimg/zigimg/pull/347" },
  { repo: "0xJacky/nginx-ui", number: "#2021", href: "https://github.com/0xJacky/nginx-ui/pull/2021" },
  { repo: "0xJacky/nginx-ui", number: "#2022", href: "https://github.com/0xJacky/nginx-ui/pull/2022" },
  { repo: "Effect-TS/effect", number: "#9255", href: "https://github.com/Effect-TS/effect/pull/9255" },
  { repo: "eugenioenko/ttt", number: "#909", href: "https://github.com/eugenioenko/ttt/pull/909" },
  { repo: "eugenioenko/ttt", number: "#910", href: "https://github.com/eugenioenko/ttt/pull/910" },
  { repo: "mvanhorn/last30days-skill", number: "#1286", href: "https://github.com/mvanhorn/last30days-skill/pull/1286" },
  { repo: "seaweedfs/seaweedfs", number: "#11734", href: "https://github.com/seaweedfs/seaweedfs/pull/11734" },
  { repo: "nestjs/nest", number: "#18158", href: "https://github.com/nestjs/nest/pull/18158" },
  { repo: "Tencent/teamai-cli", number: "#1145", href: "https://github.com/Tencent/teamai-cli/pull/1145" },
  { repo: "YouROK/TorrServer", number: "#913", href: "https://github.com/YouROK/TorrServer/pull/913" },
  { repo: "YouROK/TorrServer", number: "#914", href: "https://github.com/YouROK/TorrServer/pull/914" },
  { repo: "caddyserver/caddy", number: "#8217", href: "https://github.com/caddyserver/caddy/pull/8217" },
  { repo: "caddyserver/caddy", number: "#8225", href: "https://github.com/caddyserver/caddy/pull/8225" },
  { repo: "caddyserver/caddy", number: "#8227", href: "https://github.com/caddyserver/caddy/pull/8227" },
  { repo: "tester-army/e2e", number: "#1113", href: "https://github.com/tester-army/e2e/pull/1113" },
  { repo: "neurosnap/zmx", number: "#274", href: "https://github.com/neurosnap/zmx/pull/274" },
  { repo: "neurosnap/zmx", number: "#275", href: "https://github.com/neurosnap/zmx/pull/275" },
  { repo: "radareorg/radare2", number: "#27016", href: "https://github.com/radareorg/radare2/pull/27016" },
  { repo: "jaegertracing/jaeger", number: "#9836", href: "https://github.com/jaegertracing/jaeger/pull/9836" },
  { repo: "AlexsJones/llmfit", number: "#1150", href: "https://github.com/AlexsJones/llmfit/pull/1150" },
  { repo: "Effect-TS/effect", number: "#9446", href: "https://github.com/Effect-TS/effect/pull/9446" },
  { repo: "xerj-org/xerj", number: "#1595", href: "https://github.com/xerj-org/xerj/pull/1595" },
  { repo: "xerj-org/xerj", number: "#1596", href: "https://github.com/xerj-org/xerj/pull/1596" },
  { repo: "nestjs/nest", number: "#18170", href: "https://github.com/nestjs/nest/pull/18170" },
  { repo: "gtsteffaniak/filebrowser", number: "#3166", href: "https://github.com/gtsteffaniak/filebrowser/pull/3166" },
  { repo: "radareorg/radare2", number: "#27033", href: "https://github.com/radareorg/radare2/pull/27033" },
  { repo: "radareorg/radare2", number: "#27034", href: "https://github.com/radareorg/radare2/pull/27034" },
  { repo: "AlexsJones/llmfit", number: "#1152", href: "https://github.com/AlexsJones/llmfit/pull/1152" },
  { repo: "Tencent/teamai-cli", number: "#1203", href: "https://github.com/Tencent/teamai-cli/pull/1203" },
  { repo: "lightpanda-io/browser", number: "#4038", href: "https://github.com/lightpanda-io/browser/pull/4038" },
  { repo: "radareorg/radare2", number: "#27039", href: "https://github.com/radareorg/radare2/pull/27039" },
  { repo: "radareorg/radare2", number: "#27040", href: "https://github.com/radareorg/radare2/pull/27040" },
  { repo: "eugenioenko/ttt", number: "#964", href: "https://github.com/eugenioenko/ttt/pull/964" },
  { repo: "seaweedfs/seaweedfs", number: "#11810", href: "https://github.com/seaweedfs/seaweedfs/pull/11810" },
  { repo: "Effect-TS/effect", number: "#9487", href: "https://github.com/Effect-TS/effect/pull/9487" },
  { repo: "lightpanda-io/browser", number: "#4039", href: "https://github.com/lightpanda-io/browser/pull/4039" },
  { repo: "seaweedfs/seaweedfs", number: "#11811", href: "https://github.com/seaweedfs/seaweedfs/pull/11811" },
  { repo: "Tencent/teamai-cli", number: "#1202", href: "https://github.com/Tencent/teamai-cli/pull/1202" },
  { repo: "home-assistant/core", number: "#185795", href: "https://github.com/home-assistant/core/pull/185795" },
  { repo: "radareorg/radare2", number: "#27055", href: "https://github.com/radareorg/radare2/pull/27055" },
  { repo: "AlexsJones/llmfit", number: "#1160", href: "https://github.com/AlexsJones/llmfit/pull/1160" },
  { repo: "caddyserver/caddy", number: "#8241", href: "https://github.com/caddyserver/caddy/pull/8241" },
  { repo: "caddyserver/caddy", number: "#8255", href: "https://github.com/caddyserver/caddy/pull/8255" },
  { repo: "lightpanda-io/browser", number: "#4051", href: "https://github.com/lightpanda-io/browser/pull/4051" },
  { repo: "radareorg/radare2", number: "#27054", href: "https://github.com/radareorg/radare2/pull/27054" },
  { repo: "radareorg/radare2", number: "#27057", href: "https://github.com/radareorg/radare2/pull/27057" },
  { repo: "radareorg/radare2", number: "#27065", href: "https://github.com/radareorg/radare2/pull/27065" },
  { repo: "seaweedfs/seaweedfs", number: "#11830", href: "https://github.com/seaweedfs/seaweedfs/pull/11830" },
  { repo: "p-e-w/heretic", number: "#484", href: "https://github.com/p-e-w/heretic/pull/484" },
  { repo: "radareorg/radare2", number: "#27064", href: "https://github.com/radareorg/radare2/pull/27064" },
  { repo: "radareorg/radare2", number: "#27066", href: "https://github.com/radareorg/radare2/pull/27066" },
  { repo: "radareorg/radare2", number: "#27072", href: "https://github.com/radareorg/radare2/pull/27072" },
  { repo: "Effect-TS/effect", number: "#9531", href: "https://github.com/Effect-TS/effect/pull/9531" },
  { repo: "Effect-TS/effect", number: "#9532", href: "https://github.com/Effect-TS/effect/pull/9532" },
  { repo: "Effect-TS/effect", number: "#9537", href: "https://github.com/Effect-TS/effect/pull/9537" },
  { repo: "Effect-TS/effect", number: "#9538", href: "https://github.com/Effect-TS/effect/pull/9538" },
  { repo: "eugenioenko/ttt", number: "#1008", href: "https://github.com/eugenioenko/ttt/pull/1008" },
  { repo: "lightpanda-io/browser", number: "#4058", href: "https://github.com/lightpanda-io/browser/pull/4058" },
  { repo: "pocket-id/pocket-id", number: "#1847", href: "https://github.com/pocket-id/pocket-id/pull/1847" },
  { repo: "redis/go-redis", number: "#4099", href: "https://github.com/redis/go-redis/pull/4099" },
  { repo: "AlexsJones/llmfit", number: "#1162", href: "https://github.com/AlexsJones/llmfit/pull/1162" },
  { repo: "AlexsJones/llmfit", number: "#1167", href: "https://github.com/AlexsJones/llmfit/pull/1167" },
  { repo: "eugenioenko/ttt", number: "#1016", href: "https://github.com/eugenioenko/ttt/pull/1016" },
  { repo: "lightpanda-io/browser", number: "#4059", href: "https://github.com/lightpanda-io/browser/pull/4059" },
  { repo: "lightpanda-io/browser", number: "#4066", href: "https://github.com/lightpanda-io/browser/pull/4066" },
  { repo: "radareorg/radare2", number: "#27079", href: "https://github.com/radareorg/radare2/pull/27079" },
  { repo: "radareorg/radare2", number: "#27080", href: "https://github.com/radareorg/radare2/pull/27080" },
  { repo: "radareorg/radare2", number: "#27081", href: "https://github.com/radareorg/radare2/pull/27081" },
  { repo: "radareorg/radare2", number: "#27083", href: "https://github.com/radareorg/radare2/pull/27083" },
  { repo: "seaweedfs/seaweedfs", number: "#11833", href: "https://github.com/seaweedfs/seaweedfs/pull/11833" },
  { repo: "caddyserver/caddy", number: "#8259", href: "https://github.com/caddyserver/caddy/pull/8259" },
  { repo: "Tencent/teamai-cli", number: "#1217", href: "https://github.com/Tencent/teamai-cli/pull/1217" },
  { repo: "Tencent/teamai-cli", number: "#1230", href: "https://github.com/Tencent/teamai-cli/pull/1230" },
  { repo: "Effect-TS/effect", number: "#9581", href: "https://github.com/Effect-TS/effect/pull/9581" },
  { repo: "mvschwarz/openrig", number: "#1058", href: "https://github.com/mvschwarz/openrig/pull/1058" },
  { repo: "mvschwarz/openrig", number: "#1101", href: "https://github.com/mvschwarz/openrig/pull/1101" },
  { repo: "lightpanda-io/browser", number: "#4076", href: "https://github.com/lightpanda-io/browser/pull/4076" },
  { repo: "radareorg/radare2", number: "#27082", href: "https://github.com/radareorg/radare2/pull/27082" },
  { repo: "xerj-org/xerj", number: "#1744", href: "https://github.com/xerj-org/xerj/pull/1744" },
  { repo: "Effect-TS/effect", number: "#9608", href: "https://github.com/Effect-TS/effect/pull/9608" },
  { repo: "casdoor/casdoor", number: "#5918", href: "https://github.com/casdoor/casdoor/pull/5918" },
  { repo: "casdoor/casdoor", number: "#5928", href: "https://github.com/casdoor/casdoor/pull/5928" },
  { repo: "home-assistant/core", number: "#185796", href: "https://github.com/home-assistant/core/pull/185796" },
  { repo: "lightpanda-io/browser", number: "#4040", href: "https://github.com/lightpanda-io/browser/pull/4040" },
  { repo: "mvanhorn/last30days-skill", number: "#1304", href: "https://github.com/mvanhorn/last30days-skill/pull/1304" },
  { repo: "radareorg/radare2", number: "#27069", href: "https://github.com/radareorg/radare2/pull/27069" },
  { repo: "radareorg/radare2", number: "#27071", href: "https://github.com/radareorg/radare2/pull/27071" },
  { repo: "lightpanda-io/browser", number: "#4077", href: "https://github.com/lightpanda-io/browser/pull/4077" },
  { repo: "radareorg/radare2", number: "#27097", href: "https://github.com/radareorg/radare2/pull/27097" },
  { repo: "raysan5/raylib", number: "#6312", href: "https://github.com/raysan5/raylib/pull/6312" },
  { repo: "seaweedfs/seaweedfs", number: "#11882", href: "https://github.com/seaweedfs/seaweedfs/pull/11882" },
  { repo: "Tencent/teamai-cli", number: "#1254", href: "https://github.com/Tencent/teamai-cli/pull/1254" },
  { repo: "radareorg/radare2", number: "#27070", href: "https://github.com/radareorg/radare2/pull/27070" },
  { repo: "radareorg/radare2", number: "#27102", href: "https://github.com/radareorg/radare2/pull/27102" },
  { repo: "uutils/tar", number: "#409", href: "https://github.com/uutils/tar/pull/409" },
  { repo: "uutils/util-linux", number: "#671", href: "https://github.com/uutils/util-linux/pull/671" },
  { repo: "radareorg/radare2", number: "#27098", href: "https://github.com/radareorg/radare2/pull/27098" },
  { repo: "uutils/util-linux", number: "#670", href: "https://github.com/uutils/util-linux/pull/670" },
  { repo: "Tencent/teamai-cli", number: "#1260", href: "https://github.com/Tencent/teamai-cli/pull/1260" },
  { repo: "uutils/awk", number: "#138", href: "https://github.com/uutils/awk/pull/138" },
  { repo: "seaweedfs/seaweedfs", number: "#11856", href: "https://github.com/seaweedfs/seaweedfs/pull/11856" },
  { repo: "YouROK/TorrServer", number: "#923", href: "https://github.com/YouROK/TorrServer/pull/923" },
  { repo: "YouROK/TorrServer", number: "#928", href: "https://github.com/YouROK/TorrServer/pull/928" },
  { repo: "lightpanda-io/browser", number: "#4112", href: "https://github.com/lightpanda-io/browser/pull/4112" },
  { repo: "lightpanda-io/browser", number: "#4113", href: "https://github.com/lightpanda-io/browser/pull/4113" },
  {
    repo: "modular/modular",
    number: "#7273",
    href: "https://github.com/modular/modular/pull/7273",
    landed: "https://github.com/modular/modular/commit/8ad5954acde7c96caf8a12e8b96abb75e211730f",
  },
  { repo: "radareorg/radare2", number: "#27123", href: "https://github.com/radareorg/radare2/pull/27123" },
  { repo: "radareorg/radare2", number: "#27124", href: "https://github.com/radareorg/radare2/pull/27124" },
  { repo: "raysan5/raylib", number: "#6317", href: "https://github.com/raysan5/raylib/pull/6317" },
  { repo: "uutils/diffutils", number: "#311", href: "https://github.com/uutils/diffutils/pull/311" },
  { repo: "uutils/shadow", number: "#339", href: "https://github.com/uutils/shadow/pull/339" },
  { repo: "uutils/shadow", number: "#341", href: "https://github.com/uutils/shadow/pull/341" },
  { repo: "uutils/tar", number: "#411", href: "https://github.com/uutils/tar/pull/411" },
  {
    repo: "Graphify-Labs/graphify",
    number: "#4596",
    href: "https://github.com/Graphify-Labs/graphify/pull/4596",
    landed: "https://github.com/Graphify-Labs/graphify/commit/cc488b90764234c2ee8846bff80db7ce1be2db28",
  },
  { repo: "bjarneo/cliamp", number: "#643", href: "https://github.com/bjarneo/cliamp/pull/643" },
  { repo: "bjarneo/cliamp", number: "#644", href: "https://github.com/bjarneo/cliamp/pull/644" },
  { repo: "gtsteffaniak/filebrowser", number: "#3234", href: "https://github.com/gtsteffaniak/filebrowser/pull/3234" },
  { repo: "uutils/findutils", number: "#914", href: "https://github.com/uutils/findutils/pull/914" },
  { repo: "lightpanda-io/browser", number: "#4134", href: "https://github.com/lightpanda-io/browser/pull/4134" },
  { repo: "YouROK/TorrServer", number: "#934", href: "https://github.com/YouROK/TorrServer/pull/934" },
  { repo: "uutils/awk", number: "#139", href: "https://github.com/uutils/awk/pull/139" },
  { repo: "uutils/findutils", number: "#915", href: "https://github.com/uutils/findutils/pull/915" },
  { repo: "lalinsky/zio", number: "#851", href: "https://github.com/lalinsky/zio/pull/851" },
  { repo: "lightpanda-io/browser", number: "#4157", href: "https://github.com/lightpanda-io/browser/pull/4157" },
  { repo: "MHSanaei/3x-ui", number: "#6834", href: "https://github.com/MHSanaei/3x-ui/pull/6834" },
  { repo: "AlexsJones/llmfit", number: "#1153", href: "https://github.com/AlexsJones/llmfit/pull/1153" },
  { repo: "MHSanaei/3x-ui", number: "#6833", href: "https://github.com/MHSanaei/3x-ui/pull/6833" },
  { repo: "radareorg/radare2", number: "#27162", href: "https://github.com/radareorg/radare2/pull/27162" },
  { repo: "seaweedfs/seaweedfs", number: "#11944", href: "https://github.com/seaweedfs/seaweedfs/pull/11944" },
  { repo: "uutils/findutils", number: "#916", href: "https://github.com/uutils/findutils/pull/916" },
  { repo: "uutils/findutils", number: "#917", href: "https://github.com/uutils/findutils/pull/917" },
  { repo: "uutils/findutils", number: "#910", href: "https://github.com/uutils/findutils/pull/910" },
  { repo: "raysan5/raylib", number: "#6323", href: "https://github.com/raysan5/raylib/pull/6323" },
  { repo: "tashfeenahmed/freellmapi", number: "#1623", href: "https://github.com/tashfeenahmed/freellmapi/pull/1623" },
  { repo: "tashfeenahmed/freellmapi", number: "#1624", href: "https://github.com/tashfeenahmed/freellmapi/pull/1624" },
  { repo: "Tencent/teamai-cli", number: "#1359", href: "https://github.com/Tencent/teamai-cli/pull/1359" },
  { repo: "uutils/diffutils", number: "#309", href: "https://github.com/uutils/diffutils/pull/309" },
  { repo: "uutils/grep", number: "#146", href: "https://github.com/uutils/grep/pull/146" },
  { repo: "uutils/parse_datetime", number: "#343", href: "https://github.com/uutils/parse_datetime/pull/343" },
  { repo: "MHSanaei/3x-ui", number: "#6918", href: "https://github.com/MHSanaei/3x-ui/pull/6918" },
  { repo: "lightpanda-io/browser", number: "#4183", href: "https://github.com/lightpanda-io/browser/pull/4183" },
  { repo: "seaweedfs/seaweedfs", number: "#12026", href: "https://github.com/seaweedfs/seaweedfs/pull/12026" },
  { repo: "seaweedfs/seaweedfs", number: "#12027", href: "https://github.com/seaweedfs/seaweedfs/pull/12027" },
  { repo: "uutils/sed", number: "#612", href: "https://github.com/uutils/sed/pull/612" },
  { repo: "uutils/util-linux", number: "#673", href: "https://github.com/uutils/util-linux/pull/673" },
  { repo: "YouROK/TorrServer", number: "#933", href: "https://github.com/YouROK/TorrServer/pull/933" },
  { repo: "YouROK/TorrServer", number: "#935", href: "https://github.com/YouROK/TorrServer/pull/935" },
  { repo: "YouROK/TorrServer", number: "#937", href: "https://github.com/YouROK/TorrServer/pull/937" },
  { repo: "uutils/coreutils", number: "#15671", href: "https://github.com/uutils/coreutils/pull/15671" },
  { repo: "uutils/findutils", number: "#919", href: "https://github.com/uutils/findutils/pull/919" },
  { repo: "YouROK/TorrServer", number: "#938", href: "https://github.com/YouROK/TorrServer/pull/938" },
  { repo: "heygen-com/hyperframes", number: "#5336", href: "https://github.com/heygen-com/hyperframes/pull/5336" },
  { repo: "jqlang/jq", number: "#3679", href: "https://github.com/jqlang/jq/pull/3679" },
  { repo: "lightpanda-io/browser", number: "#4184", href: "https://github.com/lightpanda-io/browser/pull/4184" },
  { repo: "akitaonrails/ai-memory", number: "#1693", href: "https://github.com/akitaonrails/ai-memory/pull/1693" },
  { repo: "radareorg/radare2", number: "#27184", href: "https://github.com/radareorg/radare2/pull/27184" },
  { repo: "uutils/awk", number: "#143", href: "https://github.com/uutils/awk/pull/143" },
  { repo: "AlexsJones/llmfit", number: "#1185", href: "https://github.com/AlexsJones/llmfit/pull/1185" },
  { repo: "uutils/findutils", number: "#920", href: "https://github.com/uutils/findutils/pull/920" },
  { repo: "uutils/shadow", number: "#345", href: "https://github.com/uutils/shadow/pull/345" },
  { repo: "seaweedfs/seaweedfs", number: "#12052", href: "https://github.com/seaweedfs/seaweedfs/pull/12052" },
  { repo: "uutils/awk", number: "#140", href: "https://github.com/uutils/awk/pull/140" },
  { repo: "uutils/shadow", number: "#349", href: "https://github.com/uutils/shadow/pull/349" },
  { repo: "uutils/tar", number: "#415", href: "https://github.com/uutils/tar/pull/415" },
  { repo: "eugenioenko/ttt", number: "#1124", href: "https://github.com/eugenioenko/ttt/pull/1124" },
  { repo: "seaweedfs/seaweedfs", number: "#12051", href: "https://github.com/seaweedfs/seaweedfs/pull/12051" },
  { repo: "uutils/awk", number: "#144", href: "https://github.com/uutils/awk/pull/144" },
  { repo: "uutils/findutils", number: "#921", href: "https://github.com/uutils/findutils/pull/921" },
  { repo: "lightpanda-io/browser", number: "#4185", href: "https://github.com/lightpanda-io/browser/pull/4185" },
  { repo: "lightpanda-io/browser", number: "#4192", href: "https://github.com/lightpanda-io/browser/pull/4192" },
  { repo: "casdoor/casdoor", number: "#5982", href: "https://github.com/casdoor/casdoor/pull/5982" },
  { repo: "lightpanda-io/browser", number: "#4197", href: "https://github.com/lightpanda-io/browser/pull/4197" },
  { repo: "radareorg/radare2", number: "#27189", href: "https://github.com/radareorg/radare2/pull/27189" },
  { repo: "AlexsJones/llmfit", number: "#1190", href: "https://github.com/AlexsJones/llmfit/pull/1190" },
  { repo: "OpenListTeam/OpenList", number: "#3288", href: "https://github.com/OpenListTeam/OpenList/pull/3288" },
  { repo: "radareorg/radare2", number: "#27149", href: "https://github.com/radareorg/radare2/pull/27149" },
  { repo: "uutils/shadow", number: "#344", href: "https://github.com/uutils/shadow/pull/344" },
  { repo: "uutils/shadow", number: "#355", href: "https://github.com/uutils/shadow/pull/355" },
  { repo: "uutils/shadow", number: "#356", href: "https://github.com/uutils/shadow/pull/356" },
  { repo: "uutils/shadow", number: "#357", href: "https://github.com/uutils/shadow/pull/357" },
  { repo: "casdoor/casdoor", number: "#5983", href: "https://github.com/casdoor/casdoor/pull/5983" },
  { repo: "seaweedfs/seaweedfs", number: "#12068", href: "https://github.com/seaweedfs/seaweedfs/pull/12068" },
  { repo: "seaweedfs/seaweedfs", number: "#12069", href: "https://github.com/seaweedfs/seaweedfs/pull/12069" },
  { repo: "uutils/awk", number: "#146", href: "https://github.com/uutils/awk/pull/146" },
  { repo: "radareorg/radare2", number: "#27151", href: "https://github.com/radareorg/radare2/pull/27151" },
  { repo: "radareorg/radare2", number: "#27199", href: "https://github.com/radareorg/radare2/pull/27199" },
  { repo: "uutils/awk", number: "#147", href: "https://github.com/uutils/awk/pull/147" },
  { repo: "Effect-TS/effect", number: "#9886", href: "https://github.com/Effect-TS/effect/pull/9886" },
  { repo: "Effect-TS/effect", number: "#9887", href: "https://github.com/Effect-TS/effect/pull/9887" },
  { repo: "Effect-TS/effect", number: "#9891", href: "https://github.com/Effect-TS/effect/pull/9891" },
  { repo: "Effect-TS/effect", number: "#9903", href: "https://github.com/Effect-TS/effect/pull/9903" },
  { repo: "seaweedfs/seaweedfs", number: "#12077", href: "https://github.com/seaweedfs/seaweedfs/pull/12077" },
  { repo: "uutils/findutils", number: "#922", href: "https://github.com/uutils/findutils/pull/922" },
  { repo: "uutils/parse_datetime", number: "#345", href: "https://github.com/uutils/parse_datetime/pull/345" },
  { repo: "lightpanda-io/browser", number: "#4207", href: "https://github.com/lightpanda-io/browser/pull/4207" },
  { repo: "radareorg/radare2", number: "#27150", href: "https://github.com/radareorg/radare2/pull/27150" },
  { repo: "radareorg/radare2", number: "#27210", href: "https://github.com/radareorg/radare2/pull/27210" },
  { repo: "AlexsJones/llmfit", number: "#1191", href: "https://github.com/AlexsJones/llmfit/pull/1191" },
  { repo: "AlexsJones/llmfit", number: "#1192", href: "https://github.com/AlexsJones/llmfit/pull/1192" },
  { repo: "AlexsJones/llmfit", number: "#1193", href: "https://github.com/AlexsJones/llmfit/pull/1193" },
  { repo: "AlexsJones/llmfit", number: "#1195", href: "https://github.com/AlexsJones/llmfit/pull/1195" },
  { repo: "lalinsky/zio", number: "#860", href: "https://github.com/lalinsky/zio/pull/860" },
  { repo: "lalinsky/zio", number: "#861", href: "https://github.com/lalinsky/zio/pull/861" },
  { repo: "lightpanda-io/browser", number: "#4225", href: "https://github.com/lightpanda-io/browser/pull/4225" },
  { repo: "lightpanda-io/browser", number: "#4226", href: "https://github.com/lightpanda-io/browser/pull/4226" },
  { repo: "seaweedfs/seaweedfs", number: "#12121", href: "https://github.com/seaweedfs/seaweedfs/pull/12121" },
  { repo: "seaweedfs/seaweedfs", number: "#12122", href: "https://github.com/seaweedfs/seaweedfs/pull/12122" },
  { repo: "uutils/awk", number: "#148", href: "https://github.com/uutils/awk/pull/148" },
  { repo: "uutils/awk", number: "#149", href: "https://github.com/uutils/awk/pull/149" },
  { repo: "Tencent/teamai-cli", number: "#1506", href: "https://github.com/Tencent/teamai-cli/pull/1506" },
  { repo: "eugenioenko/ttt", number: "#1238", href: "https://github.com/eugenioenko/ttt/pull/1238" },
  { repo: "eugenioenko/ttt", number: "#1239", href: "https://github.com/eugenioenko/ttt/pull/1239" },
  { repo: "lightpanda-io/browser", number: "#4248", href: "https://github.com/lightpanda-io/browser/pull/4248" },
  { repo: "lightpanda-io/browser", number: "#4249", href: "https://github.com/lightpanda-io/browser/pull/4249" },
  { repo: "radareorg/radare2", number: "#27231", href: "https://github.com/radareorg/radare2/pull/27231" },
  { repo: "radareorg/radare2", number: "#27232", href: "https://github.com/radareorg/radare2/pull/27232" },
  { repo: "seaweedfs/seaweedfs", number: "#12156", href: "https://github.com/seaweedfs/seaweedfs/pull/12156" },
  { repo: "lightpanda-io/browser", number: "#4228", href: "https://github.com/lightpanda-io/browser/pull/4228" },
  { repo: "radareorg/radare2", number: "#27230", href: "https://github.com/radareorg/radare2/pull/27230" },
  { repo: "lightpanda-io/browser", number: "#4247", href: "https://github.com/lightpanda-io/browser/pull/4247" },
  { repo: "seaweedfs/seaweedfs", number: "#12155", href: "https://github.com/seaweedfs/seaweedfs/pull/12155" },
  { repo: "seaweedfs/seaweedfs", number: "#12168", href: "https://github.com/seaweedfs/seaweedfs/pull/12168" },
  { repo: "xevrion/hatchzip", number: "#27", href: "https://github.com/xevrion/hatchzip/pull/27" },
  { repo: "xevrion/hatchzip", number: "#28", href: "https://github.com/xevrion/hatchzip/pull/28" },
  { repo: "seaweedfs/seaweedfs", number: "#12180", href: "https://github.com/seaweedfs/seaweedfs/pull/12180" },
  { repo: "seaweedfs/seaweedfs", number: "#12181", href: "https://github.com/seaweedfs/seaweedfs/pull/12181" },
  { repo: "skylot/jadx", number: "#3038", href: "https://github.com/skylot/jadx/pull/3038" },
  { repo: "skylot/jadx", number: "#3039", href: "https://github.com/skylot/jadx/pull/3039" },
  { repo: "0xJacky/nginx-ui", number: "#2035", href: "https://github.com/0xJacky/nginx-ui/pull/2035" },
  { repo: "0xJacky/nginx-ui", number: "#2044", href: "https://github.com/0xJacky/nginx-ui/pull/2044" },
  { repo: "0xJacky/nginx-ui", number: "#2045", href: "https://github.com/0xJacky/nginx-ui/pull/2045" },
  { repo: "0xJacky/nginx-ui", number: "#2048", href: "https://github.com/0xJacky/nginx-ui/pull/2048" },
  { repo: "YouROK/TorrServer", number: "#941", href: "https://github.com/YouROK/TorrServer/pull/941" },
  { repo: "YouROK/TorrServer", number: "#942", href: "https://github.com/YouROK/TorrServer/pull/942" },
  { repo: "YouROK/TorrServer", number: "#943", href: "https://github.com/YouROK/TorrServer/pull/943" },
  { repo: "YouROK/TorrServer", number: "#944", href: "https://github.com/YouROK/TorrServer/pull/944" },
  { repo: "eugenioenko/ttt", number: "#1258", href: "https://github.com/eugenioenko/ttt/pull/1258" },
  { repo: "lightpanda-io/browser", number: "#4265", href: "https://github.com/lightpanda-io/browser/pull/4265" },
  { repo: "lightpanda-io/browser", number: "#4266", href: "https://github.com/lightpanda-io/browser/pull/4266" },
  { repo: "lightpanda-io/browser", number: "#4267", href: "https://github.com/lightpanda-io/browser/pull/4267" },
  { repo: "LemmyNet/lemmy-ui", number: "#4361", href: "https://github.com/LemmyNet/lemmy-ui/pull/4361" },
  { repo: "casdoor/casdoor", number: "#5968", href: "https://github.com/casdoor/casdoor/pull/5968" },
  { repo: "uutils/findutils", number: "#918", href: "https://github.com/uutils/findutils/pull/918" },
  { repo: "uutils/procps", number: "#819", href: "https://github.com/uutils/procps/pull/819" },
  { repo: "uutils/procps", number: "#820", href: "https://github.com/uutils/procps/pull/820" },
  { repo: "uutils/tar", number: "#414", href: "https://github.com/uutils/tar/pull/414" },
  { repo: "Tencent/teamai-cli", number: "#1574", href: "https://github.com/Tencent/teamai-cli/pull/1574" },
  { repo: "seaweedfs/seaweedfs", number: "#12232", href: "https://github.com/seaweedfs/seaweedfs/pull/12232" },
  { repo: "AlexsJones/llmfit", number: "#1166", href: "https://github.com/AlexsJones/llmfit/pull/1166" },
  { repo: "lightpanda-io/browser", number: "#4297", href: "https://github.com/lightpanda-io/browser/pull/4297" },
  { repo: "radareorg/radare2", number: "#27247", href: "https://github.com/radareorg/radare2/pull/27247" },
  { repo: "radareorg/radare2", number: "#27248", href: "https://github.com/radareorg/radare2/pull/27248" },
  { repo: "radareorg/radare2", number: "#27249", href: "https://github.com/radareorg/radare2/pull/27249" },
  { repo: "radareorg/radare2", number: "#27273", href: "https://github.com/radareorg/radare2/pull/27273" },
  { repo: "radareorg/radare2", number: "#27275", href: "https://github.com/radareorg/radare2/pull/27275" },
  { repo: "seaweedfs/seaweedfs", number: "#12233", href: "https://github.com/seaweedfs/seaweedfs/pull/12233" },
  { repo: "uutils/shadow", number: "#350", href: "https://github.com/uutils/shadow/pull/350" },
  { repo: "uutils/shadow", number: "#366", href: "https://github.com/uutils/shadow/pull/366" },
  { repo: "uutils/shadow", number: "#369", href: "https://github.com/uutils/shadow/pull/369" },
  { repo: "uutils/shadow", number: "#370", href: "https://github.com/uutils/shadow/pull/370" },
  { repo: "uutils/shadow", number: "#372", href: "https://github.com/uutils/shadow/pull/372" },
  { repo: "xevrion/hatchzip", number: "#42", href: "https://github.com/xevrion/hatchzip/pull/42" },
  { repo: "lightpanda-io/browser", number: "#4041", href: "https://github.com/lightpanda-io/browser/pull/4041" },
  { repo: "radareorg/radare2", number: "#27283", href: "https://github.com/radareorg/radare2/pull/27283" },
  { repo: "tashfeenahmed/freellmapi", number: "#1713", href: "https://github.com/tashfeenahmed/freellmapi/pull/1713" },
  { repo: "tashfeenahmed/freellmapi", number: "#1714", href: "https://github.com/tashfeenahmed/freellmapi/pull/1714" },
  { repo: "tashfeenahmed/freellmapi", number: "#1720", href: "https://github.com/tashfeenahmed/freellmapi/pull/1720" },
  { repo: "tashfeenahmed/freellmapi", number: "#1721", href: "https://github.com/tashfeenahmed/freellmapi/pull/1721" },
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
      title: "The archive",
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
      label: "pull requests merged into other people's repos",
      title: "Merged upstream",
      lines: [
        ...MERGED_PRS.flatMap((pr) => [
          { text: pr.repo, meta: pr.number, href: pr.href },
          ...(pr.landed ? [{ text: `${pr.number} closed, landed as this commit`, meta: "commit", href: pr.landed }] : []),
        ]),
        {
          text: `GitHub search for the merged ones: finds ${MERGED_PRS_SEARCH_LABEL}, the rest landed as commits`,
          meta: MERGED_PRS_SEARCH_LABEL,
          href: MERGED_PRS_SEARCH,
        },
      ],
    },
    {
      n: String(RESUME.publications.length),
      label: `peer-reviewed IEEE papers, ${RESUME.publications[0]?.year}`,
      title: `IEEE AIMV ${RESUME.publications[0]?.year}`,
      lines: RESUME.publications.flatMap((pub) =>
        pub.link ? [{ text: pub.title, meta: `ieeexplore ${pub.link.split("/").pop()}`, href: pub.link }] : [],
      ),
    },
    {
      n: "22",
      label: "frames per second, soccer detection and tracking",
      title: "FIFA Soccer DS",
      lines: [
        { text: "Project write-up and demo", meta: "/projects/fifa-soccer-ds", href: "/projects/fifa-soccer-ds" },
        {
          text: "Project landing page",
          meta: "github.io",
          href: "https://jayhemnani9910.github.io/fifa-soccer-ds/",
        },
      ],
    },
    {
      n: FRAUD_PRECISION,
      label: "precision, credit-fraud ensemble on live transaction data",
      title: "Amnex, 2022",
      lines: [{ text: "AI/ML Intern · Amnex · Gujarat", meta: "Jan-May 2022", href: `/resume#${companyAnchor("Amnex")}` }],
    },
    {
      n: String(c.toolCount),
      label: "MCP tools an agent can call on this page right now",
      title: "document.modelContext",
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
  "Amnex": `Credit-fraud ensemble with SMOTE, ${FRAUD_PRECISION} precision; anomaly dashboards.`,
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
    { n: FRAUD_PRECISION, label: "fraud-model precision on transaction data" },
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
  `A credit-fraud model of mine hit ${FRAUD_PRECISION} precision. It still doesn't trust me.`,
  "I once wrote 23 Airflow DAGs and named exactly zero of them well.",
  "Favourite bug: the one that only appeared on Tuesdays.",
];
