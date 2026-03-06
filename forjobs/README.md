# Job Search Automation System

> **IMPORTANT — READ THIS FIRST**: This file is the complete reference for Jay's job search automation. Any new Claude Code session working in this project should read this file before doing anything job-related. Everything you need to know is here — no need to ask Jay to explain the system.

---

## Table of Contents
1. [New Session Checklist](#new-session-checklist)
2. [How the System Works](#how-the-system-works)
3. [Jay's Full Profile](#jays-full-profile)
4. [Skills Reference](#skills-reference)
5. [Agents Reference](#agents-reference)
6. [Data Architecture](#data-architecture)
7. [Tracker Schema](#tracker-schema)
8. [Chrome Integration](#chrome-integration)
9. [Hooks](#hooks)
10. [Autonomy Rules](#autonomy-rules)
11. [Workflow Examples](#workflow-examples)
12. [Job Platforms](#job-platforms)
13. [Current State](#current-state)
14. [Troubleshooting](#troubleshooting)

---

## New Session Checklist

Every new Claude Code session should do these steps:

1. **Read this file** — you're doing it now
2. **Check Chrome** — run `/chrome` to verify browser connection. If not enabled, tell Jay to run `claude --chrome`
3. **Read the tracker** — `forjobs/tracker.md` has all active applications
4. **Check for overdue follow-ups** — the session-start hook (`~/.claude/hooks/job-reminder.sh`) does this automatically, but verify manually if needed
5. **Ask Jay what he wants to do** — don't assume. Options: find jobs, apply to a role, check status, do outreach, optimize profile

---

## How the System Works

This is a **semi-automated** job search pipeline built on top of Claude Code.

**The flow:**
```
Jay says "find jobs" → /find-jobs skill → job-scout agents search platforms in parallel
                                        → leads saved to forjobs/leads/YYYY-MM-DD.md
                                        → top matches presented to Jay

Jay says "apply to X" → /apply skill → Chrome fetches job description
                                     → company-researcher agent gathers company intel
                                     → application-writer agent generates materials
                                     → materials saved to forjobs/applications/<company>-<role>/
                                     → tracker updated (status: "Ready")
                                     → Jay reviews → Jay submits manually → tracker updated to "Applied"

Jay says "follow up" → /outreach skill → Chrome researches the person
                                       → personalized message drafted
                                       → Jay reviews and sends manually
```

**Key principle**: Claude prepares EVERYTHING but Jay approves and submits EVERYTHING. Never submit an application, send a message, or modify Jay's resume without explicit approval.

---

## Jay's Full Profile

### Identity
| Field | Value |
|-------|-------|
| **Name** | Jay Hemnani |
| **Email** | jayhemnani992000@gmail.com |
| **Location** | Available for India-based or global remote |
| **Portfolio** | https://jayhemnani.me (25+ projects, WebMCP-enabled) |
| **GitHub** | https://github.com/jayhemnani9910 (21 repos) |
| **LinkedIn** | https://linkedin.com/in/jayhemnani |
| **Twitter** | https://twitter.com/jayhemnani |

### Education
| Field | Value |
|-------|-------|
| **Degree** | B.Tech in Computer Engineering |
| **University** | Pandit Deendayal Energy University (PDEU), Gandhinagar, India |
| **Years** | 2018–2022 |
| **GPA** | 8.7/10 |
| **Courses** | Software Dev, IoT, OS, Big Data Analytics, Computer Vision, NLP |
| **Achievements** | Rubik's Cube 16.7s WCA, Graphic Design (2 internships, 1 conference, 1 startup, 3 clubs) |

### Experience
| Company | Role | Type | Period | Location | Key Tech |
|---------|------|------|--------|----------|----------|
| **Elite Hotel Group** | Data Analyst | Full-time | Summer 2025 | San Jose, CA | Python, SQL, Tableau, Power BI, Airflow |
| **Freelance** | Creative Lead | Contract | 2022–2024 | Remote | Figma, Adobe, Google Analytics, Mixpanel |
| **Amnex** | AI/ML Intern | Internship | Jan–May 2022 | Gujarat, India | Python, Scikit-learn, TensorFlow, Pandas |
| **Cygnus SoftTech** | iOS Dev Intern | Internship | Jun–Aug 2021 | Gujarat, India | Swift, UIKit, Core Data, Xcode |
| **Cactus Creatives** | SWE Intern | Internship | May–Nov 2019 | Gujarat, India | Azure, CI/CD, Microservices, REST APIs |

### Experience Bullets (for cover letters — use these, don't make up new ones)

**Data/Analytics:**
- Automated reporting pipelines with SQL/Python, reducing manual work and improving data consistency (Elite Hotel)
- Built dashboards for occupancy and revenue tracking across multiple properties (Elite Hotel)
- Developed demand forecasting models to support revenue management decisions (Elite Hotel)
- Created data analytics dashboards with statistical models for operational reporting (Amnex)

**ML/AI:**
- Built credit fraud detection system using ML with SMOTE and ensemble methods (Amnex)
- Published stacking ensemble for diabetes prediction — 82.68% accuracy, IEEE (PDEU)
- Built FAISS vector search with dense embeddings for player similarity retrieval <100ms (BarçaBrain)
- Computer vision systems for sports analytics with PyTorch (Soccer Vision)
- LangChain/LangGraph agentic AI workflows (multiple projects)

**Software Engineering:**
- Built cloud-native communication platform for first responders using microservices on Azure (Cactus)
- Set up CI/CD pipelines for automated testing and deployment (Cactus)
- Developed iOS privacy/security app with encryption and secure local storage (Cygnus)
- 25+ projects spanning full-stack, data, ML, and DevOps

**Creative/Design:**
- Delivered brand identity systems and marketing assets for tech and hospitality clients (Freelance)
- Ran A/B experiments on campaigns and tracked engagement metrics (Freelance)

### Skills
| Category | Skills |
|----------|--------|
| **Languages** | Python, SQL, Java, Go, JavaScript, TypeScript |
| **Data** | PostgreSQL, MySQL, MongoDB, Redis, TimescaleDB, Pandas |
| **ML/AI** | PyTorch, PyTorch Geometric, FAISS, LangChain, LangGraph, Scikit-learn |
| **MLOps** | MLflow, DVC, Weights & Biases, Airflow |
| **Cloud** | AWS, GCP, Docker, Kubernetes, Kafka |
| **Visualization** | Streamlit, Plotly, Tableau, Dash |

### Publications
1. "Diabetes Prediction using Stacking Classifier" — IEEE ICMLDS 2022 (82.68% accuracy, 6-model stack)
2. "CPU Scheduling Algorithms Analysis" — IEEE 2021 (priority queue optimization)

### Certifications
None. But has hands-on experience with AWS, GCP, Docker, K8s.

### Job Search Preferences
| Field | Value |
|-------|-------|
| **Level** | Entry-level / junior / intern (0-2 years) |
| **Target Roles** | SWE, Data Engineer, ML Engineer, AI Engineer, DevOps, Full-Stack, Product |
| **Location** | Global remote; hybrid OK if India-based |
| **Company Type** | Startups preferred (YC-backed is a plus) |
| **Job Type** | Open to FT, contract, freelance |
| **Salary** | Flexible / any |
| **Availability** | Immediately |
| **Resume Strategy** | Tailor per application |
| **Platforms Signed Up** | Work at a Startup (workatastartup.com) |

### Differentiators (use these in cover letters)
- Implemented W3C WebMCP standard on portfolio (one of first AI-agent-queryable websites)
- 2 IEEE publications as undergrad
- 25+ projects shipped, prototype to production in days
- Rubik's Cube 16.7s (WCA) — shows problem-solving speed

### Source of Truth
The canonical resume data lives in `src/data/resume.ts`. If anything in this README conflicts with that file, `resume.ts` is correct.

---

## Skills Reference

Skills are invoked with slash commands. They live in `.claude/skills/<name>/skill.md`.

### `/find-jobs`
**File:** `.claude/skills/find-jobs/skill.md`
**Purpose:** Discover new job openings across multiple platforms.

**What it does:**
1. Searches job platforms (workatastartup.com, YC Jobs, Wellfound, LinkedIn, RemoteOK, startup.jobs, weworkremotely.com)
2. Filters for: entry-level, remote, India/global, SWE/Data/ML/AI
3. Extracts: company, role, salary, location, requirements, apply link
4. Scores each lead: Strong Fit / Worth Exploring / Stretch
5. Saves leads to `forjobs/leads/YYYY-MM-DD.md`
6. Prints summary with top matches

**Uses:** `job-scout` agent (haiku) for parallel platform searching, Chrome for logged-in platforms

**When to invoke:** Jay says "find jobs", "any new openings", "search for jobs", or at the start of a job search session.

---

### `/apply <company> <role>`
**File:** `.claude/skills/apply/skill.md`
**Purpose:** Generate complete application materials for a specific job.

**Arguments:** Company name and role title (e.g., `/apply mixrank fullstack`)

**What it does:**
1. Fetches full job description via Chrome or WebSearch
2. Launches `company-researcher` agent to gather company intel
3. Launches `application-writer` agent to generate materials
4. Creates folder: `forjobs/applications/<company>-<role>/`
5. Generates: `cover-letter.md`, `resume-notes.md`, `interview-prep.md`, `job-description.md`
6. Updates `forjobs/tracker.md` with status "Ready"
7. Presents materials for Jay's review
8. Waits for Jay to confirm before marking "Applied"

**Uses:** `application-writer` agent (opus), `company-researcher` agent (sonnet), Chrome

**When to invoke:** Jay says "apply to X", "prepare application for X", or picks a lead from `/find-jobs`.

---

### `/job-status`
**File:** `.claude/skills/job-status/skill.md`
**Purpose:** Show current application status and pending actions.

**What it does:**
1. Reads `forjobs/tracker.md`
2. Identifies overdue follow-ups (>7 days no response)
3. Identifies "Ready" applications (materials prepared but not submitted)
4. Calculates weekly and all-time stats
5. Suggests next actions

**Output format:**
```
## Job Search Status — {date}

### Needs Attention
- ⚠️ OVERDUE: Company — Role (follow-up was {date})
- 📋 READY: Company — Role (materials prepared, not submitted)

### This Week: X applied, X replied, X interviews
### All Time: X applied, X replied, X interviews, X offers

### Suggested Next Steps
1. Follow up on X
2. Submit application for Y
3. Run /find-jobs
```

**When to invoke:** Jay says "status", "how are my applications", "any follow-ups", or at session start.

---

### `/outreach <company> <person>`
**File:** `.claude/skills/outreach/skill.md`
**Purpose:** Draft personalized cold outreach messages.

**Arguments:** Company name, optionally a person's name or title

**What it does:**
1. Researches the person via Chrome (LinkedIn, company page)
2. Checks if company research exists in `forjobs/applications/<company>-*/research.md`
3. Reads templates from `forjobs/outreach-templates.md`
4. Generates personalized: LinkedIn DM (300 char max), cold email, or follow-up
5. Saves to `forjobs/applications/<company>-<role>/outreach.md`
6. Presents for Jay's review — NEVER sends

**Uses:** `company-researcher` agent (sonnet), Chrome

**When to invoke:** Jay says "reach out to", "message the hiring manager at", "draft outreach for".

---

## Agents Reference

Agents are specialized subagents in `.claude/agents/`. They run inside skills — you don't invoke them directly.

### `job-scout`
**File:** `.claude/agents/job-scout.md`
**Model:** haiku (fast, cheap)
**Tools:** WebSearch, WebFetch, Read, Grep, Glob
**Purpose:** Search ONE platform for matching jobs. Multiple instances run in parallel.
**Returns:** Markdown table of leads with fit scores.
**Invoked by:** `/find-jobs`

### `application-writer`
**File:** `.claude/agents/application-writer.md`
**Model:** opus (high quality writing)
**Tools:** Read, Write, Grep, Glob
**Purpose:** Generate cover letter, resume notes, and interview prep tailored to a specific job.
**Input:** Job description + resume data (`src/data/resume.ts`) + company research
**Rules:** Never exaggerate experience. Only reference real projects and roles. Under 300 words for cover letters.
**Invoked by:** `/apply`

### `company-researcher`
**File:** `.claude/agents/company-researcher.md`
**Model:** sonnet (balanced)
**Tools:** WebSearch, WebFetch, Read, Write
**Purpose:** Deep-dive on a company — product, funding, tech stack, culture, recent news, team size, Glassdoor.
**Output:** Structured research brief saved to `forjobs/applications/<company>-<role>/research.md`
**Invoked by:** `/apply`, `/outreach`

### `profile-optimizer`
**File:** `.claude/agents/profile-optimizer.md`
**Model:** sonnet
**Tools:** Read, Write, Edit, Grep, Glob, WebSearch
**Purpose:** Analyze target roles, identify skill gaps, suggest GitHub README edits, portfolio project ideas, resume tweaks.
**Output:** Suggestions saved to `forjobs/profile-optimization.md`
**Invoked by:** Manual (Jay asks to optimize profile)

---

## Data Architecture

```
forjobs/
├── README.md                     # THIS FILE — system reference
├── questionnaire.md              # Jay's profile, preferences, target roles
├── tracker.md                    # Application tracker (THE status source of truth)
├── outreach-templates.md         # 5 message templates (LinkedIn, email, cover, follow-up, thank-you)
├── leads.md                      # Curated job platforms list with links
├── yc-india-leads.md             # YC India startups hiring remote (MixRank, Cyble, Spenmo, etc.)
│
├── leads/                        # Daily lead files from /find-jobs runs
│   └── YYYY-MM-DD.md            # Each file has leads found that day, scored by fit
│
├── applications/                 # Per-company application folders
│   └── <company>-<role>/        # Folder name is kebab-case
│       ├── cover-letter.md      # Tailored cover letter
│       ├── resume-notes.md      # Which bullets/skills to emphasize
│       ├── interview-prep.md    # Company-specific prep, Q&A, concerns
│       ├── job-description.md   # Raw extracted job posting
│       ├── research.md          # Company research brief
│       └── outreach.md          # Personalized outreach messages
│
├── templates/                    # Reusable templates
│   ├── cover-letter.md          # Base template with {{COMPANY}}, {{ROLE}}, etc. placeholders
│   ├── resume-bullets.md        # All resume bullets categorized by skill area
│   └── interview-questions.md   # Generic Q&A prep + technical topics
│
└── (legacy files — can be cleaned up)
    ├── peakflo-data-analyst-cover.md   # Superseded by applications/peakflo-data-analyst/
    ├── peakflo-ml-intern-cover.md      # Superseded by applications/peakflo-ml-intern/
    ├── peakflo-resume-notes.md         # Superseded by applications/peakflo-*/resume-notes.md
    └── today-feb17.md                  # One-time daily plan, no longer needed
```

### File Naming Convention
- Application folders: `<company>-<role>` in kebab-case (e.g., `mixrank-fullstack`, `cyble-swe-intern`)
- Daily leads: `YYYY-MM-DD.md` (e.g., `2026-02-17.md`)
- All other files: descriptive kebab-case

---

## Tracker Schema

The tracker at `forjobs/tracker.md` is the source of truth for application status.

### Status Values
| Status | Meaning |
|--------|---------|
| **Ready** | Materials generated by Claude, Jay hasn't submitted yet |
| **Pending** | Application submitted, waiting for response (same as "Applied") |
| **Applied** | Same as Pending |
| **Replied** | Got a response (positive or negative) |
| **Interview** | Interview scheduled or completed |
| **Offer** | Received an offer |
| **Rejected** | Got rejected |
| **No Response** | No reply after 7+ days |

### Table Format
```
| # | Date | Company | Role | Platform | Status | Follow-up | Notes |
```

### Rules
- Add entry when `/apply` generates materials (status: "Ready")
- Update to "Pending" when Jay confirms he submitted
- Set follow-up date to +7 days from application date
- Move to "No Response" after follow-up date passes with no reply
- Always follow up once before marking dead
- Update weekly summary table at end of each week

---

## Chrome Integration

### What It Is
Claude in Chrome connects Claude Code CLI to the Chrome browser extension. It controls the real browser, shares login sessions, and can navigate/click/type/extract/screenshot.

### How to Enable
```bash
# Option 1: Launch with Chrome
claude --chrome

# Option 2: Enable in existing session
/chrome
```

### What Chrome Can Do
- **Navigate** to any URL (job sites, company pages, LinkedIn)
- **Share login sessions** — if Jay is logged into workatastartup.com in Chrome, Claude can access it too
- **Fill forms** — can enter data into application forms
- **Extract data** — read page content, job descriptions, company info
- **Take screenshots** — capture what's on screen
- **Record GIFs** — document browser interactions

### Limitations
- Can't screenshot `chrome://` pages
- Pauses for CAPTCHAs and logins — ask Jay to handle manually
- Can't access sites Jay isn't logged into (no credentials stored)
- Works with Google Chrome and Microsoft Edge only

### Verified Working With
- workatastartup.com (logged in as Jay)
- YC jobs pages
- General web browsing

### If Chrome Isn't Connected
Fall back to WebSearch + WebFetch. Less powerful but functional for:
- Searching job boards via web search
- Fetching public job postings
- Company research

---

## Hooks

### Session-Start Job Reminder
**File:** `~/.claude/hooks/job-reminder.sh`
**Trigger:** Every session start (configured in `~/.claude/settings.json`)

**What it does:**
- Reads `forjobs/tracker.md`
- Checks for overdue follow-ups (follow-up date has passed)
- Checks for "Ready" applications (not yet submitted)
- Prints summary: X active, X overdue, X ready to submit

**Output example:**
```
📊 Job Search: 2 active, 1 overdue, 0 ready to submit
  ⚠️  Peakflo (YC W22) — Data Analyst (follow-up was Feb 24)
```

---

## Autonomy Rules

### DO Automatically (no approval needed)
- Research companies (web search, Chrome browsing, API calls)
- Generate application materials (cover letters, prep docs, resume notes)
- Update tracker.md with new entries or status changes
- Browse job sites via Chrome
- Read and analyze job descriptions
- Score job fit against Jay's profile
- Save files to forjobs/ directory
- Run subagents for parallel research

### ASK Jay First
- Actually submitting any application (on a website, via email, anywhere)
- Sending any outreach message (LinkedIn DM, email, etc.)
- Modifying resume data in `src/data/resume.ts`
- Changing Jay's profiles on any platform
- Filling out application forms in Chrome
- Anything that goes to another human

### NEVER Do
- Exaggerate experience or skills in cover letters
- Claim certifications Jay doesn't have
- Submit applications without Jay's explicit approval
- Send messages without Jay's explicit approval
- Make up project names or metrics not in `src/data/resume.ts`
- Lie about experience level (he's entry-level, don't hide it)

---

## Workflow Examples

### Example 1: Daily Job Search
```
Jay: "find me some jobs today"

1. Run /find-jobs
2. Chrome browses workatastartup.com, YC Jobs, Wellfound
3. job-scout agents search RemoteOK, startup.jobs in parallel
4. Leads compiled, scored, saved to forjobs/leads/2026-02-18.md
5. Present top 5 to Jay
6. Jay picks one → run /apply company role
```

### Example 2: Apply to a Specific Role
```
Jay: "apply to mixrank fullstack"

1. Run /apply mixrank fullstack
2. Chrome fetches job description from ycombinator.com/companies/mixrank/jobs
3. company-researcher gathers: MixRank overview, funding, tech stack, culture
4. application-writer generates: cover letter, resume notes, interview prep
5. All saved to forjobs/applications/mixrank-fullstack/
6. Tracker updated: MixRank | Full-Stack | Ready
7. Materials presented to Jay for review
8. Jay says "looks good, I applied" → tracker updated to "Pending", follow-up set +7 days
```

### Example 3: Check Status
```
Jay: "how are my applications?"

1. Run /job-status
2. Read tracker.md
3. Print: 2 active (Peakflo x2), both pending, follow-up Feb 24
4. Suggest: "Follow-up date approaching. Want me to draft follow-up emails?"
```

### Example 4: Outreach
```
Jay: "reach out to the CTO at mixrank"

1. Run /outreach mixrank CTO
2. Chrome looks up MixRank team on LinkedIn/company page
3. Finds CTO name and background
4. Drafts personalized LinkedIn DM + cold email
5. Jay reviews, edits if needed, sends manually
```

### Example 5: Optimize Profile
```
Jay: "help me improve my profile"

1. Launch profile-optimizer agent
2. Reads all leads and tracker entries to find most common required skills
3. Compares to Jay's skills → identifies gaps
4. Suggests: GitHub README edits, new project ideas, resume tweaks
5. Saves to forjobs/profile-optimization.md
```

---

## Job Platforms

### Tier 1 — Startup-Focused (Check First)
| Platform | URL | Notes |
|----------|-----|-------|
| Work at a Startup | workatastartup.com | YC startups, Jay is signed up |
| YC Jobs | ycombinator.com/jobs | Y Combinator job board |
| Wellfound | wellfound.com | Startup jobs, direct to hiring managers |
| We Work Remotely | weworkremotely.com | Largest remote job board |
| Startup.jobs | startup.jobs | 40K+ remote startup jobs |

### Tier 2 — High Volume
| Platform | URL | Notes |
|----------|-----|-------|
| LinkedIn | linkedin.com/jobs | 110K+ remote dev jobs |
| Indeed | indeed.com | 9.4K+ entry-level remote SWE |
| Glassdoor | glassdoor.com | 6.7K junior remote dev |
| Built In | builtin.com | Tech-focused, good filters |

### Tier 3 — Specialized
| Platform | URL | Notes |
|----------|-----|-------|
| Turing | turing.com | US companies hiring global remote |
| RemoteRocketship | remoterocketship.com | Entry-level remote filter |
| Internshala | internshala.com | India freshers |

### Tier 4 — AI/ML
| Platform | URL | Notes |
|----------|-----|-------|
| Wellfound AI | wellfound.com/role/r/ai-engineer | AI Engineer roles |
| 2026 AI Jobs List | github.com/speedyapply/2026-AI-College-Jobs | New-grad AI/ML |

### Search Queries
```
"junior software engineer" OR "entry level developer" remote
"full stack developer" OR "frontend engineer" remote junior
"AI engineer" OR "ML engineer" remote entry level
"data engineer" OR "data analyst" remote entry level
"python developer" remote junior
```

### Daily Target
Apply to 5-10 jobs per day. Focus Tier 1 first. Follow up after 7 days.

---

## Current State

**Last updated:** February 17, 2026

### System Status
| Component | Status |
|-----------|--------|
| Skills (4) | Built and ready |
| Agents (4) | Built and ready |
| Session hook | Active |
| Chrome | Verified working (tested on workatastartup.com) |
| Templates (3) | Created |
| Directory structure | Created |

### Active Applications
| # | Company | Role | Status | Follow-up |
|---|---------|------|--------|-----------|
| 1 | Peakflo (YC W22) | Data Analyst | Pending | Feb 24 |
| 2 | Peakflo (YC W22) | ML Engineer Intern | Pending | Feb 24 |

### Known Leads (Not Yet Applied)
See `forjobs/yc-india-leads.md` for full list. Top matches:
- **MixRank (YC S11)** — Full-Stack Engineer (new grads OK, $12K-36K, fully remote)
- **MixRank (YC S11)** — Junior SWE India ($18K-24K)
- **Cyble (YC W21)** — SWE Intern (no exp required, $25K-50K, Bengaluru/Remote)
- **Cyble (YC W21)** — Software Engineer ($40K-100K, 1+ yr)
- **Spenmo (YC S20)** — Software Engineer (SE Asia & India)

### Legacy Files to Clean Up
These files in `forjobs/` root are superseded by the `applications/` folder structure:
- `peakflo-data-analyst-cover.md` → now at `applications/peakflo-data-analyst/cover-letter.md`
- `peakflo-ml-intern-cover.md` → now at `applications/peakflo-ml-intern/cover-letter.md`
- `peakflo-resume-notes.md` → now at `applications/peakflo-*/resume-notes.md`
- `today-feb17.md` → one-time daily plan, no longer needed

---

## Troubleshooting

### Chrome not connected
1. Run `/chrome` to check status
2. If not installed: Jay needs Chrome extension from Chrome Web Store
3. If installed but not connected: select "Reconnect extension" in `/chrome` menu
4. If still failing: restart Claude Code with `claude --chrome`

### Skills not showing up
Skills should auto-detect from `.claude/skills/`. If not:
1. Verify files exist: `ls .claude/skills/*/skill.md`
2. Check YAML frontmatter has `name` and `description` fields
3. Restart the session

### Agents not found
Agents should auto-detect from `.claude/agents/`. If not:
1. Verify files exist: `ls .claude/agents/*.md`
2. Check YAML frontmatter has `name`, `description`, `model`, `tools`
3. Restart the session

### Session hook not running
1. Check `~/.claude/settings.json` → `hooks.SessionStart` includes `job-reminder.sh`
2. Verify script is executable: `chmod +x ~/.claude/hooks/job-reminder.sh`
3. Test manually: `bash ~/.claude/hooks/job-reminder.sh`

### WebSearch/WebFetch failing
Fall back to Chrome if enabled, or ask Jay to paste the URL content directly.

### Application folder doesn't exist
Create it: `mkdir -p forjobs/applications/<company>-<role>/`

---

*This system was built on February 17, 2026. For the full implementation plan, see `~/.claude/plans/zesty-churning-goose.md`.*
