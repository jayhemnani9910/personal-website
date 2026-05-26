/* FDE page: server component wrapper. Replaces the old static page.
   Interactive console is a client island. Static sections (Proofs, Fit, Contact)
   are plain server JSX. layout.tsx is untouched (provides metadata + JSON-LD). */

import { EditorialMasthead } from "@/components/EditorialMasthead";
import { EditorialColophon } from "@/components/EditorialColophon";
import { FdeConsole } from "@/components/fde/FdeConsole";
import { PROOFS } from "@/components/fde/fdeData";

export default function FDEPage() {
  return (
    <main className="editorial fde-page">
      <EditorialMasthead active="fde" />

      {/* ── Hero ──────────────────────────────────────────────────────── */}
      <header className="fde fde-hero">
        <div className="fde-wrap">
          <div className="fde-hero-eyebrow">
            <span className="fde-badge fde-badge-live">
              <span className="fde-badge-dot" aria-hidden="true" />
              FDE.SIM.v1 · interactive
            </span>
            <span className="fde-badge">2026.05.26 · last_built</span>
            <span className="fde-badge">remote · gujarat, in · gmt+5:30</span>
          </div>

          <h1 className="fde-h1">
            Stop reading. <span className="fde-em">Brief me</span>.
          </h1>

          <p className="fde-hero-sub">
            <strong>This page is a working Forward Deployed Engineer simulation.</strong> Give me your real, vague, messy problem. I&apos;ll perform the FDE &quot;decomposition&quot; interview on it live: scope it, draw the architecture, plan the sprint, and call out where it&apos;ll fail. Then map every phase back to projects I&apos;ve actually shipped.
          </p>

          {/* Client island: textarea + presets + live sim */}
          <FdeConsole />
        </div>
      </header>

      {/* ── Proofs ────────────────────────────────────────────────────── */}
      <section className="fde fde-below">
        <div className="fde-wrap">
          <div className="fde-sec-head">
            <div className="fde-kicker">
              <span className="fde-kicker-num">§02</span>receipts
            </div>
            <h2 className="fde-sec-h2">
              The simulation above isn&apos;t <span className="fde-em">vibes</span>. Here&apos;s the engineering substrate it runs on.
            </h2>
            <div className="fde-sec-note">
              four proofs of the engineering breadth FDE work actually needs: agents, protocols, upstream code, distributed substrate.
            </div>
          </div>

          <div className="fde-proofs-grid">
            {PROOFS.map(p => (
              <div key={p.id} className="fde-proof">
                <div className="fde-pf-num">{p.id}</div>
                <div className="fde-pf-cat">{p.cat} · {p.project}</div>
                <h3 className="fde-pf-title">
                  {p.title.pre}
                  <span className="fde-em">{p.title.em}</span>
                  {p.title.post}
                </h3>
                <p className="fde-pf-body">{p.body}</p>
                <div className="fde-pf-stack">
                  {p.stack.map(s => (
                    <span key={s} className="fde-pf-chip">{s}</span>
                  ))}
                </div>
                <a className="fde-pf-link" href={p.link.href} target="_blank" rel="noreferrer">
                  ↗ {p.link.label}
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Fit ───────────────────────────────────────────────────────── */}
      <section className="fde fde-below">
        <div className="fde-wrap">
          <div className="fde-sec-head">
            <div className="fde-kicker">
              <span className="fde-kicker-num">§03</span>candid
            </div>
            <h2 className="fde-sec-h2">
              Notes on <span className="fde-em">fit</span>.
            </h2>
            <div className="fde-sec-note">
              the version where i&apos;m honest about what I can claim, and what I can&apos;t. yet.
            </div>
          </div>

          <div className="fde-fit-grid">
            <div className="fde-fit-col" data-kind="have">
              <h4>What I can credibly claim</h4>
              <p>The engineering substrate: agentic systems, protocols, upstream code, distributed services. The decomposition muscle the simulation above demonstrates.</p>
              <p>Plus real stakeholder-facing delivery experience: requirements alignment, metric and SLA definition with finance and ops at Elite Hotel Group.</p>
            </div>
            <div className="fde-fit-col" data-kind="gap">
              <h4>What I haven&apos;t yet</h4>
              <p>The full FDE customer lifecycle in an <span className="fde-em">external</span> environment. Internal stakeholder delivery isn&apos;t the same as external customer delivery. I won&apos;t pretend otherwise.</p>
              <p>I&apos;m actively closing this by shipping one small real deployment, publishing failure analyses, and converting an existing project into a deployment case study. Specifics on request.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Contact ───────────────────────────────────────────────────── */}
      <FdeContact />

      <EditorialColophon />
    </main>
  );
}

// Contact is extracted as a small function to keep the page component readable.
function FdeContact() {
  const links = [
    { lbl: 'email',    val: 'jayhemnani992000@gmail.com',       href: 'mailto:jayhemnani992000@gmail.com', primary: true },
    { lbl: 'essay',    val: 'what FDE means in 2026',           href: 'https://www.jayhemnani.me/blog/forward-deployed-engineer' },
    { lbl: 'resume',   val: 'the one-pager',                    href: 'https://www.jayhemnani.me/resume' },
    { lbl: 'github',   val: 'jayhemnani9910',                   href: 'https://github.com/jayhemnani9910' },
    { lbl: 'linkedin', val: 'in / jayhemnani',                  href: 'https://linkedin.com/in/jayhemnani' },
    { lbl: 'twitter',  val: '@jeyhemnani9',                     href: 'https://x.com/jeyhemnani9' },
  ];

  return (
    <section className="fde fde-below">
      <div className="fde-wrap">
        <div className="fde-contact-grid">
          <h2 className="fde-contact-h2">
            If the simulation made you think, <span className="fde-em">say so</span>.
          </h2>
          <p className="fde-contact-sub">
            Fastest path: email. I read every one. If you ran the sim on a real problem and it sparked an idea, send me the brief and I&apos;ll show you what the next 30 minutes of work would look like.
          </p>
        </div>
        <div className="fde-contact-list">
          {links.map(l => (
            <a
              key={l.lbl}
              className="fde-contact-row"
              data-primary={l.primary ? '1' : '0'}
              href={l.href}
              target="_blank"
              rel="noreferrer"
            >
              <span className="fde-contact-lbl">{l.lbl}</span>
              <span className="fde-contact-val">{l.val}</span>
              <span className="fde-contact-arr" aria-hidden="true">↗</span>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
