/* FDE Simulation data: ported from the prototype (presets.jsx + sim.jsx + app.jsx).
   Verbatim copy of the content; no em-dashes introduced. */

import { WEBMCP_TOOL_COUNT } from '@/lib/webmcp';

// ─── Types ───────────────────────────────────────────────────────────────────

export interface ScopeQuestion {
  q: string;
  why: string;
}

export interface DecompItem {
  id: string;
  title: string;
  why: string;
}

export interface ArchComponent {
  id: string;
  name: string;
  kind: 'ui' | 'service' | 'agent' | 'data' | 'external';
  x: number;
  y: number;
  sub?: string;
}

export interface ArchEdge {
  from: string;
  to: string;
  label?: string;
  dashed?: boolean;
}

export interface Architecture {
  components: ArchComponent[];
  edges: ArchEdge[];
}

export interface SprintRow {
  day: string;
  title: string;
  deliv: string;
}

export interface RiskRow {
  risk: string;
  mitigation: string;
}

export interface Preset {
  id: string;
  chip: string;
  brief: string;
  scope: ScopeQuestion[];
  decomposition: DecompItem[];
  architecture: Architecture;
  sprint: SprintRow[];
  risks: RiskRow[];
}

export interface Receipt {
  phase: string;
  title: string;
  project: string;
  desc: string;
  note?: string;
  link?: { label: string; href: string };
}

export interface Phase {
  key: string;
  num: string;
  title: string;
  status: string;
}

export interface NarrationLine {
  who: 'jay' | 'sys';
  text: string;
}

// ─── Phase definitions ───────────────────────────────────────────────────────

export const PHASES: Phase[] = [
  { key: 'scope',    num: '01', title: 'Scope',     status: 'asking sharp questions' },
  { key: 'decomp',   num: '02', title: 'Decompose', status: 'breaking it down' },
  { key: 'arch',     num: '03', title: 'Architect', status: 'drawing the system' },
  { key: 'plan',     num: '04', title: 'Plan',      status: '14-day sprint' },
  { key: 'risks',    num: '05', title: 'Risks',     status: 'what could fail' },
  { key: 'receipts', num: '06', title: 'Receipts',  status: 'mapping to evidence' },
];

// ─── Narration ───────────────────────────────────────────────────────────────

export const NARRATION: Record<string, NarrationLine[]> = {
  scope: [
    { who: 'jay', text: "Three things I have to know before I commit. If we don't answer these, we'll build the wrong thing." },
    { who: 'sys', text: "scope mode • not asking what your budget is. asking what kills this project if you don't decide." },
  ],
  decomp: [
    { who: 'jay', text: "Five subproblems. Each one has a clean boundary, clean enough that you could give it to a different engineer and they'd know what done means." },
    { who: 'sys', text: "decomposition mode • this is the exact muscle the FDE \"decomposition\" interview tests." },
  ],
  arch: [
    { who: 'jay', text: "Architecture. Where the data flows. Where the failure boundaries are. Where a human is in the loop." },
    { who: 'sys', text: "rendering • boxes are services and stores. dashed lines are retrieval / feedback. solid is request / response." },
  ],
  plan: [
    { who: 'jay', text: "14 days. Real deliverables. Day 1-2 has to be something a human can observe was done." },
    { who: 'sys', text: "sprint mode • every row has a measurable deliverable. \"plan a meeting\" doesn't count." },
  ],
  risks: [
    { who: 'jay', text: "What I'm not telling your boss in the SOW. What I'm telling YOU now because if it bites us I want you to remember I said it." },
    { who: 'sys', text: "risk register • specific to YOUR problem, not generic AI risks." },
  ],
  receipts: [
    { who: 'jay', text: "Each phase you just saw: I've done that work somewhere already. Here's the mapping. Click through if you want proof." },
    { who: 'sys', text: "wrapping • brief to evidence. this is what a real engagement walkthrough looks like." },
  ],
};

// ─── Receipts ────────────────────────────────────────────────────────────────

export const RECEIPTS: Receipt[] = [
  {
    phase: 'PHASE 01 · SCOPE',
    title: 'Asking the right hard questions of stakeholders.',
    project: 'ELITE HOTEL GROUP · DATA ANALYST',
    desc: "Defined metrics and SLAs in working sessions with finance and operations. The clarifying-questions muscle this phase uses is the same muscle that turned vague \"we need better reporting\" into a structured forecasting + ETL system.",
    note: "Internal stakeholders, not external customers. Relevant practice, not full FDE-grade.",
    link: { label: 'jayhemnani.me/resume', href: 'https://www.jayhemnani.me/resume' },
  },
  {
    phase: 'PHASE 02 · DECOMPOSE',
    title: 'Turning a vague spec into a working multi-agent system.',
    project: 'CAG DEEP RESEARCH',
    desc: "Built a 5-agent LangGraph research system in 10 days from a rough problem statement. Hexagonal architecture, verification loops, local + cloud LLM fallback. This is the decomposition this simulation just did, but on a real ambiguous brief.",
    link: { label: 'github.com/jayhemnani9910', href: 'https://github.com/jayhemnani9910' },
  },
  {
    phase: 'PHASE 03 · ARCHITECT',
    title: 'Services · data flows · contracts · failure boundaries.',
    project: 'KAYAK + AIRBNB CLONES',
    desc: "Kayak metasearch: 3-tier distributed architecture. Node/Express services behind an API gateway, polyglot persistence (MySQL/Mongo/Redis), Kafka event streaming, Python FastAPI AI layer. Airbnb on Kubernetes microservices. The substrate FDE deployments run on.",
    link: { label: 'kayak + airbnb on github', href: 'https://github.com/jayhemnani9910' },
  },
  {
    phase: 'PHASE 04 · PLAN',
    title: 'Shipping zero-to-something-working fast.',
    project: 'WEBMCP PORTFOLIO + ANTHROPIC SDK PR',
    desc: `Made jayhemnani.me agent-queryable via the W3C WebMCP standard: ${WEBMCP_TOOL_COUNT} tools, in production, on the surface FDE postings now call table-stakes. Separately: a merged PR into the Anthropic MCP Python SDK. Both are about shipping precise work fast in unfamiliar code.`,
    link: { label: 'try jayhemnani.me with any MCP client', href: 'https://www.jayhemnani.me' },
  },
  {
    phase: 'PHASE 05 · RISKS + EVALS',
    title: 'Honest about what could go wrong, before it does.',
    project: "WHAT I'M ACTIVELY BUILDING",
    desc: "An eval harness on CAG Deep Research: 100 automated tests scoring hallucination, context adherence, token cost. Also a short technical post on MCP failure modes in production. The Day-2 ops thinking this phase used, made explicit and external.",
    note: "In progress, not yet shipped. Calling it out because pretending it's done would defeat the point of this whole simulation.",
    link: { label: 'follow on github', href: 'https://github.com/jayhemnani9910' },
  },
];

// ─── Presets ─────────────────────────────────────────────────────────────────

export const PRESETS: Preset[] = [
  {
    id: 'support',
    chip: 'Customer support deluge',
    brief: "Our customer support team handles ~2,000 tickets a day across 4 SaaS products. The team is drowning. We want AI to triage, route, and draft first responses, without hallucinating into our customer's face.",
    scope: [
      {
        q: "Of those ~2,000 tickets, what fraction are repeat questions answerable from your existing docs vs. genuinely novel?",
        why: "Determines whether this is a retrieval problem, a routing problem, or both, and what the realistic auto-deflection ceiling looks like.",
      },
      {
        q: "Who owns the SLA when AI drafts a response that's wrong: the agent, the team lead, or the AI system?",
        why: "Decides whether AI replies go out auto or are always human-approved. Drives the entire UX and our liability boundary.",
      },
      {
        q: "What's the floor: how many tickets/day must a human still see, and what's the worst case if AI misroutes a P1 ticket?",
        why: "Sets the eval bar and the rollout strategy. We need a measurable failure mode before we ship.",
      },
    ],
    decomposition: [
      { id: 'D1', title: 'Ingest + normalize', why: 'Pull from Zendesk + email + chat into one schema. Strip PII before it touches the model.' },
      { id: 'D2', title: 'Classify + route', why: 'Product · category · severity · "needs human now?" classifier. Confidence-thresholded.' },
      { id: 'D3', title: 'Draft response', why: 'RAG over docs + past resolved tickets. Cite sources inline. Never invent product behavior.' },
      { id: 'D4', title: 'Human-in-the-loop UI', why: "Drafts land in the agent's queue with one-click approve / edit / reject. Reject feeds the eval set." },
      { id: 'D5', title: 'Eval + drift detection', why: 'Sample 5% of drafts daily for grading. Alert on hallucination spikes, citation breakage, or category drift.' },
    ],
    architecture: {
      components: [
        { id: 'src', name: 'Ticket sources', kind: 'external', x: 60, y: 60, sub: 'Zendesk · email · chat' },
        { id: 'ing', name: 'Ingest service', kind: 'service', x: 280, y: 60, sub: 'normalize · PII strip' },
        { id: 'cls', name: 'Classifier', kind: 'agent', x: 500, y: 60, sub: 'route + severity' },
        { id: 'que', name: 'Routing queue', kind: 'data', x: 720, y: 60, sub: 'by team + priority' },
        { id: 'rag', name: 'RAG draft agent', kind: 'agent', x: 280, y: 220, sub: 'docs + past tickets' },
        { id: 'kb', name: 'Knowledge index', kind: 'data', x: 60, y: 220, sub: 'docs · resolved · embeddings' },
        { id: 'ui', name: 'Agent console', kind: 'ui', x: 500, y: 220, sub: 'approve · edit · reject' },
        { id: 'evl', name: 'Eval harness', kind: 'service', x: 720, y: 220, sub: 'sample · score · alert' },
      ],
      edges: [
        { from: 'src', to: 'ing', label: 'ticket events' },
        { from: 'ing', to: 'cls', label: 'normalized' },
        { from: 'cls', to: 'que', label: 'routed' },
        { from: 'cls', to: 'rag', label: 'if draftable' },
        { from: 'kb', to: 'rag', label: 'retrieve', dashed: true },
        { from: 'rag', to: 'ui', label: 'draft + cites' },
        { from: 'que', to: 'ui', label: 'queue' },
        { from: 'ui', to: 'evl', label: 'feedback' },
        { from: 'evl', to: 'rag', label: 'eval signal', dashed: true },
      ],
    },
    sprint: [
      { day: 'Day 1-2', title: 'Wire ingest + 100-ticket eval set', deliv: 'normalized ticket schema, 100 hand-labeled tickets with ground-truth routing + ideal response.' },
      { day: 'Day 3-4', title: 'Classifier v1 + routing', deliv: 'category + severity + needs-human classifier. >85% routing accuracy on eval set or we stop.' },
      { day: 'Day 5-7', title: 'RAG draft pipeline', deliv: 'embed docs + past tickets, retrieval + grounded generation with inline citations.' },
      { day: 'Day 8-9', title: 'Agent console UI', deliv: 'queue view, draft view, one-click approve/edit/reject. Reject reason captured to eval set.' },
      { day: 'Day 10-11', title: 'Eval harness + monitoring', deliv: 'daily 5% sample with auto-grading on hallucination + citation accuracy + tone.' },
      { day: 'Day 12-14', title: 'Pilot with one team', deliv: 'shadow mode (drafts visible but not sent) for 3 days, then assisted send. Daily ops review.' },
    ],
    risks: [
      { risk: "Auto-sending a hallucinated response that promises something the product doesn't do.", mitigation: 'Every shipped response cites a source. No citation = no auto-send. Manual review queue catches the rest.' },
      { risk: "Misrouting a P1 (paying-enterprise-on-fire) ticket as a P3.", mitigation: 'P1 detection is a separate hard classifier with higher recall priority. Human escalation path on confidence < 0.85.' },
      { risk: "Knowledge index goes stale, and we keep citing deprecated docs.", mitigation: 'Doc index re-embeds nightly with diff tracking. Drafts citing >30-day-old paragraphs get flagged for review.' },
      { risk: "Team trusts AI drafts too much, stops reading carefully.", mitigation: 'UI shows confidence + sources prominently. Periodic blind-review days where AI is silently off, to measure trust calibration.' },
    ],
  },
  {
    id: 'sales',
    chip: 'Sales co-pilot',
    brief: "Our sales engineers spend ~60% of their time researching prospects before calls, pulling from LinkedIn, our CRM, news, internal Slack. We want an AI co-pilot that lives in their inbox and Slack, doing this prep for them.",
    scope: [
      {
        q: "Of the 60% research time: which sources are gold (high-signal, must-have) vs. nice-to-have? If we could only integrate two, which two?",
        why: "Constrains the scope. Building four integrations badly is worse than building two well. We can always add more.",
      },
      {
        q: "Is the goal speed (faster prep) or quality (better insights they wouldn't otherwise find)? Both?",
        why: "These suggest different system shapes. Speed means caching and summaries. Quality means a multi-step research agent. We need to know which to prioritize.",
      },
      {
        q: "Do they actually want this in Slack/email, or would a dashboard work? Inbox surfaces are sticky but limited in UI.",
        why: "Inbox integration is significant scope. If a fast dashboard would do, we ship in half the time.",
      },
    ],
    decomposition: [
      { id: 'D1', title: 'Prospect identity resolver', why: 'Given an email or LinkedIn URL, resolve to a canonical prospect ID across our CRM + LinkedIn + email history.' },
      { id: 'D2', title: 'Research orchestrator', why: 'Multi-step agent: read CRM history, pull LinkedIn, fetch recent news, query internal Slack archive, synthesize.' },
      { id: 'D3', title: 'Insight extraction', why: "Not just summarization: extract pain signals, recent triggers (funding rounds, exec hires), and competitor mentions." },
      { id: 'D4', title: 'Slack + Gmail surface', why: "A /prep slash command in Slack. A Gmail add-on that side-panel'd previews the prospect when reading their email." },
      { id: 'D5', title: 'Feedback loop + sales rep ratings', why: "Every brief gets a \"useful / not useful / what was missing\" widget. That data tunes future briefs." },
    ],
    architecture: {
      components: [
        { id: 'slk', name: 'Slack /prep', kind: 'ui', x: 60, y: 60, sub: 'command + side panel' },
        { id: 'gm', name: 'Gmail add-on', kind: 'ui', x: 60, y: 220, sub: 'side-panel preview' },
        { id: 'res', name: 'Identity resolver', kind: 'service', x: 280, y: 140, sub: 'CRM + LI + email' },
        { id: 'orc', name: 'Research orchestrator', kind: 'agent', x: 500, y: 140, sub: 'multi-step plan' },
        { id: 'crm', name: 'CRM', kind: 'external', x: 720, y: 40, sub: 'Salesforce' },
        { id: 'li', name: 'LinkedIn', kind: 'external', x: 720, y: 120, sub: 'public profile' },
        { id: 'nws', name: 'News', kind: 'external', x: 720, y: 200, sub: 'Google + custom feeds' },
        { id: 'sla', name: 'Slack archive', kind: 'external', x: 720, y: 280, sub: 'internal mentions' },
        { id: 'ext', name: 'Insight extractor', kind: 'agent', x: 500, y: 320, sub: 'signals · triggers' },
        { id: 'fb', name: 'Feedback store', kind: 'data', x: 280, y: 320, sub: 'useful y/n + missing' },
      ],
      edges: [
        { from: 'slk', to: 'res', label: 'who is X' },
        { from: 'gm', to: 'res', label: 'who is X' },
        { from: 'res', to: 'orc', label: 'prospect id' },
        { from: 'orc', to: 'crm', label: 'history', dashed: true },
        { from: 'orc', to: 'li', label: 'profile', dashed: true },
        { from: 'orc', to: 'nws', label: 'recent', dashed: true },
        { from: 'orc', to: 'sla', label: 'mentions', dashed: true },
        { from: 'orc', to: 'ext', label: 'raw context' },
        { from: 'ext', to: 'slk', label: 'brief' },
        { from: 'ext', to: 'gm', label: 'brief' },
        { from: 'slk', to: 'fb', label: 'rating' },
        { from: 'fb', to: 'ext', label: 'tune', dashed: true },
      ],
    },
    sprint: [
      { day: 'Day 1-2', title: 'Identity resolver + happy-path eval', deliv: 'given email -> prospect_id with >95% precision on 50-prospect eval set across 4 source types.' },
      { day: 'Day 3-5', title: 'Research orchestrator v1', deliv: 'multi-step agent calling CRM + LinkedIn + news. Cached. Returns raw structured context per prospect.' },
      { day: 'Day 6-7', title: 'Insight extractor', deliv: 'turns raw context into a 6-bullet brief: who, what they care about, recent triggers, competitive context.' },
      { day: 'Day 8-9', title: 'Slack /prep slash command', deliv: '/prep email@company.com returns brief in <12s. Cached for 1hr.' },
      { day: 'Day 10-11', title: 'Gmail add-on', deliv: 'side-panel preview on inbound emails. Same brief, surfaced contextually.' },
      { day: 'Day 12-14', title: 'Pilot with 6 reps + feedback loop', deliv: 'live with 6 sales engineers. Daily "useful/not" rating capture. Triage misses + iterate prompt set.' },
    ],
    risks: [
      { risk: "LinkedIn rate-limiting or ToS friction kills the whole demo on day 3.", mitigation: 'Plan for it. Two paths: scraping with rate budgets + manual fallback. Talk to a licensed data vendor as backup.' },
      { risk: "Generic summaries that don't help reps (\"we already knew that\").", mitigation: 'Extract signals, not summaries. Recent funding · exec changes · competitor wins. Useful-y/n widget drives prompt tuning.' },
      { risk: "Briefs are wrong: fact errors in front of customers.", mitigation: 'Every claim has a source link. Optional "show sources" expansion. Eval set includes fact-check tests.' },
      { risk: "Reps love it for two weeks, stop using it in week three.", mitigation: 'Daily usage telemetry. Week-three drop is the real signal. Targeted re-onboarding + new-surface roll-out if we see it.' },
    ],
  },
  {
    id: 'compliance',
    chip: 'Contract review',
    brief: "Our legal team reviews ~80 vendor contracts a month for clauses that violate our playbook (data residency, indemnity caps, IP). They're a bottleneck. We want AI to do a first pass and flag risky clauses.",
    scope: [
      {
        q: "How explicit and codified is the playbook today? Is it a written doc, scattered tribal knowledge, or somewhere between?",
        why: "If the rules aren't written down, this isn't an AI project: it's a rule-extraction project first. We need to know which one we're solving.",
      },
      {
        q: "What's the actual blocker: review speed, or consistency between reviewers? Different problems, different solutions.",
        why: "Speed -> asynchronous batch processing. Consistency -> side-by-side reviewer assist. We optimize for the one that's killing you.",
      },
      {
        q: "Who is the human reviewing AI output: paralegal, attorney, ops? Their reading speed determines the UX.",
        why: "A paralegal reading 80 contracts/month wants different surfaces than an attorney spot-checking 10%.",
      },
    ],
    decomposition: [
      { id: 'D1', title: 'Playbook codification', why: "Convert your written + tribal playbook into structured, testable rules. Without this, AI judgments aren't auditable." },
      { id: 'D2', title: 'Contract ingest + clause extraction', why: 'PDF/DOCX -> structured clauses with type tagging (indemnity, data, IP, term, etc.).' },
      { id: 'D3', title: 'Per-clause risk evaluator', why: 'For each clause, compare against the relevant playbook rule. Flag severity (block, negotiate, accept).' },
      { id: 'D4', title: 'Reviewer console', why: 'Side-by-side: contract on left, AI annotations on right, accept/reject/edit per flag. Audit trail.' },
      { id: 'D5', title: 'Audit + eval', why: 'Every AI judgment is reproducible (cite the rule + the clause). Sample 10% for blind human review monthly.' },
    ],
    architecture: {
      components: [
        { id: 'up', name: 'Upload portal', kind: 'ui', x: 60, y: 60, sub: 'pdf · docx · email' },
        { id: 'pb', name: 'Playbook store', kind: 'data', x: 60, y: 240, sub: 'structured rules' },
        { id: 'ing', name: 'Contract parser', kind: 'service', x: 280, y: 60, sub: 'pdf -> structured' },
        { id: 'cl', name: 'Clause classifier', kind: 'agent', x: 280, y: 220, sub: 'type per clause' },
        { id: 'ev', name: 'Risk evaluator', kind: 'agent', x: 500, y: 140, sub: 'clause vs rule' },
        { id: 'rev', name: 'Reviewer console', kind: 'ui', x: 720, y: 140, sub: 'side-by-side' },
        { id: 'aud', name: 'Audit log', kind: 'data', x: 720, y: 300, sub: 'every judgment' },
        { id: 'evl', name: 'Eval harness', kind: 'service', x: 500, y: 320, sub: '10% blind review' },
      ],
      edges: [
        { from: 'up', to: 'ing', label: 'contract' },
        { from: 'ing', to: 'cl', label: 'text' },
        { from: 'cl', to: 'ev', label: 'tagged clauses' },
        { from: 'pb', to: 'ev', label: 'rules', dashed: true },
        { from: 'ev', to: 'rev', label: 'annotations' },
        { from: 'rev', to: 'aud', label: 'decisions' },
        { from: 'aud', to: 'evl', label: 'samples', dashed: true },
        { from: 'evl', to: 'ev', label: 'eval signal', dashed: true },
      ],
    },
    sprint: [
      { day: 'Day 1-3', title: 'Playbook codification workshop', deliv: "three sessions with legal. Output: structured rules doc with explicit thresholds. This is the keystone: if we skip it, the rest collapses." },
      { day: 'Day 4-5', title: 'Contract parser + clause classifier', deliv: 'PDF/DOCX in -> typed clauses out. >90% F1 on 50-contract eval set.' },
      { day: 'Day 6-8', title: 'Risk evaluator v1', deliv: 'each clause judged against the relevant playbook rule with a severity + citation. Cited rule must be retrievable.' },
      { day: 'Day 9-11', title: 'Reviewer console', deliv: 'side-by-side UI. Accept / reject / edit per flag. Audit log on every action.' },
      { day: 'Day 12-13', title: 'Eval + shadow run', deliv: 'AI runs in shadow on 10 fresh contracts, legal does their normal review, we compare blind.' },
      { day: 'Day 14', title: 'Decision: ship or iterate', deliv: 'eval results + a candid recommendation. We either pilot for real or go back to D1.' },
    ],
    risks: [
      { risk: "AI gives legal advice (it's not allowed to). Liability nightmare.", mitigation: "AI surfaces flags + cites rules. AI never recommends \"sign this.\" Reviewer accepts or rejects. UX language matters." },
      { risk: "Playbook codification reveals the playbook is contradictory.", mitigation: "Treat this as a feature, not a bug. The workshop output is valuable to legal independent of the AI tool." },
      { risk: "Reviewers rubber-stamp AI flags without reading them.", mitigation: "Blind monthly audit. If reviewer agreement is too high, we measure whether they're reading. Hard conversations follow if needed." },
      { risk: "AI misses a clause type we haven't seen before (vendor uses novel language).", mitigation: "Unknown-clause detector with low confidence routes to mandatory human review. Logged for playbook expansion." },
    ],
  },
  {
    id: 'field',
    chip: 'Field diagnostics',
    brief: "Our field technicians spend a lot of time diagnosing industrial pumps from on-site visits. They want a phone app: take a photo + describe symptoms -> AI gives them a probable failure mode and next steps.",
    scope: [
      {
        q: "What's the actual cost of wrong diagnosis: wasted truck-roll, repeat visit, or worse (safety incident)?",
        why: "Different failure modes mean different conservativeness. A safety-relevant misdiagnosis means we need a \"we don't know, escalate\" path with low threshold.",
      },
      {
        q: "How much labeled image data do we already have (historical work orders with photos and ground-truth outcomes)?",
        why: "If yes: fine-tune a vision model on it. If no: we're using a generalist VLM and the demo accuracy will be honest about uncertainty.",
      },
      {
        q: "Field connectivity: do techs have reliable LTE on every site, or do they sometimes lose signal mid-diagnosis?",
        why: "If unreliable, we need offline-capable inference for the core path. That's a bigger build but a different system.",
      },
    ],
    decomposition: [
      { id: 'D1', title: 'Mobile capture UX', why: 'Photo + voice notes + symptom checklist. Cheap to capture, structured enough for the model.' },
      { id: 'D2', title: 'Multi-modal diagnostic model', why: 'Image + structured symptoms -> ranked probable failure modes with confidence. VLM + retrieval from past cases.' },
      { id: 'D3', title: 'Next-steps playbook', why: 'For each failure mode, retrieve the documented next steps + parts list + safety warnings.' },
      { id: 'D4', title: 'Tech feedback loop', why: 'After visit: was the AI right? What was the actual failure? This becomes labeled training data.' },
      { id: 'D5', title: 'Connectivity handling', why: 'Offline queue for inference + sync when reconnected. Critical for remote sites.' },
    ],
    architecture: {
      components: [
        { id: 'app', name: 'Mobile app', kind: 'ui', x: 60, y: 60, sub: 'photo · symptoms · voice' },
        { id: 'sy', name: 'Sync queue', kind: 'data', x: 60, y: 240, sub: 'offline-first' },
        { id: 'api', name: 'Inference API', kind: 'service', x: 280, y: 140, sub: 'multi-modal' },
        { id: 'vlm', name: 'Diagnostic model', kind: 'agent', x: 500, y: 60, sub: 'VLM + retrieval' },
        { id: 'cases', name: 'Case index', kind: 'data', x: 500, y: 240, sub: 'past work orders' },
        { id: 'pb', name: 'Playbook retriever', kind: 'agent', x: 720, y: 140, sub: 'next steps + parts' },
        { id: 'fb', name: 'Outcome feedback', kind: 'service', x: 280, y: 320, sub: 'was it right?' },
      ],
      edges: [
        { from: 'app', to: 'sy', label: 'when offline' },
        { from: 'sy', to: 'api', label: 'when online' },
        { from: 'app', to: 'api', label: 'when online' },
        { from: 'api', to: 'vlm', label: 'predict' },
        { from: 'cases', to: 'vlm', label: 'retrieve', dashed: true },
        { from: 'vlm', to: 'pb', label: 'failure modes' },
        { from: 'pb', to: 'app', label: 'next steps' },
        { from: 'app', to: 'fb', label: 'actual outcome' },
        { from: 'fb', to: 'cases', label: 'label', dashed: true },
      ],
    },
    sprint: [
      { day: 'Day 1-2', title: 'Mobile capture v1 (no AI)', deliv: 'iPhone PWA. Photo + structured symptom form + voice memo. Posts to a stub API. Used by 1 tech that day for real visits.' },
      { day: 'Day 3-5', title: 'Diagnostic VLM v1', deliv: 'GPT-4V-style call with structured prompt + retrieval from 100 hand-curated past cases. Returns ranked failure modes with confidence.' },
      { day: 'Day 6-7', title: 'Playbook retrieval', deliv: 'for each predicted failure mode, retrieve next-steps doc + parts + safety warnings from existing playbook PDFs.' },
      { day: 'Day 8-9', title: 'Tech feedback capture', deliv: 'after-visit form: was the top prediction right? If no, what was the actual cause? Feeds back into case index.' },
      { day: 'Day 10-12', title: 'Offline + sync', deliv: 'local inference for the most-common 10 failure modes. Queue for the rest. Sync on reconnect.' },
      { day: 'Day 13-14', title: 'Pilot with 5 techs over real visits', deliv: '5 techs · 1 week · all data captured. Daily review of predictions vs actual. Honest accuracy number at end.' },
    ],
    risks: [
      { risk: "VLM hallucinates a failure mode that doesn't exist for this pump model. Tech wastes a truck-roll on the wrong parts.", mitigation: 'Constrain output to a closed-set vocabulary of failure modes per equipment family. Unknown = "escalate to senior tech."' },
      { risk: "Photo conditions are awful: bad light, oil, weird angles. Model accuracy tanks in the field.", mitigation: 'Capture a real-world photo dataset in week 1. Test model on those, not idealized photos. Augment training data.' },
      { risk: "Techs stop using the app because it's slower than their judgment.", mitigation: "Measure: time-to-diagnosis with vs without. If we're not faster within 4 weeks, we have the wrong shape and we stop." },
      { risk: "A safety-relevant failure mode (e.g. pressure vessel risk) gets a wrong call.", mitigation: 'Safety-critical failure modes have hardcoded human-confirmation requirement, regardless of confidence. No exceptions.' },
    ],
  },
];

// ─── Proofs data (JSX-free; title stored as { pre, em, post } for partial italic) ──

export interface ProofTitle {
  pre: string;
  em: string;
  post: string;
}

export interface ProofItem {
  id: string;
  cat: string;
  project: string;
  title: ProofTitle;
  body: string;
  stack: string[];
  link: { label: string; href: string };
}

export const PROOFS: ProofItem[] = [
  {
    id: 'I',
    cat: 'Agentic systems',
    project: 'CAG Deep Research',
    title: { pre: 'Vague spec -> working multi-agent in ', em: '10 days', post: '.' },
    body: 'Five-agent LangGraph research system, built from a rough problem statement. Hexagonal architecture, verification loops, local + cloud LLM fallback.',
    stack: ['LangGraph', '5 agents', 'hexagonal arch', 'verification'],
    link: { label: 'github.com/jayhemnani9910', href: 'https://github.com/jayhemnani9910' },
  },
  {
    id: 'II',
    cat: 'Protocols / connective tissue',
    project: 'WebMCP Portfolio',
    title: { pre: 'Made my own site ', em: 'agent-queryable', post: ' via W3C WebMCP.' },
    body: `${WEBMCP_TOOL_COUNT} tools in production. Early implementation on the exact surface OpenAI / Anthropic / Google FDE postings now call table-stakes.`,
    stack: ['W3C WebMCP', `${WEBMCP_TOOL_COUNT} tools`, 'production'],
    link: { label: 'try with any MCP client', href: 'https://www.jayhemnani.me' },
  },
  {
    id: 'III',
    cat: 'Upstream contribution',
    project: 'Anthropic MCP Python SDK',
    title: { pre: 'Walked into unfamiliar code and ', em: 'left it better', post: '.' },
    body: "A merged PR into the Anthropic MCP Python SDK. Also navigated vLLM (200k+ LOC) for a separate investigation. The exact muscle FDEs use in customer code.",
    stack: ['Anthropic SDK', 'vLLM (200k+ LOC)', 'merged'],
    link: { label: 'modelcontextprotocol/python-sdk', href: 'https://github.com/modelcontextprotocol/python-sdk' },
  },
  {
    id: 'IV',
    cat: 'Distributed systems',
    project: 'Kayak + Airbnb clones',
    title: { pre: 'Services, data flows, contracts, ', em: 'failure boundaries', post: '.' },
    body: 'Kayak: 3-tier distributed architecture. Node/Express services behind API gateway, polyglot persistence (MySQL/Mongo/Redis), Kafka, FastAPI AI layer. Airbnb on Kubernetes microservices.',
    stack: ['Node', 'gateway', 'MySQL · Mongo · Redis', 'Kafka', 'FastAPI', 'K8s'],
    link: { label: 'on github', href: 'https://github.com/jayhemnani9910' },
  },
];
