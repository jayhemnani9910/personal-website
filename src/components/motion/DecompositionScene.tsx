"use client";

import { useEffect, useRef, useSyncExternalStore } from "react";
import Link from "next/link";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";

// `false` on the server and the first client render (so SSR and hydration agree
// and both show the static fallback), `true` thereafter. useSyncExternalStore
// instead of a useState+useEffect mount flag, which would be a setState-in-effect.
const emptySubscribe = () => () => {};
function useMounted(): boolean {
  return useSyncExternalStore(emptySubscribe, () => true, () => false);
}

// The home's flagship scroll scene. It dramatizes the actual Forward Deployed
// Engineer job: a vague, messy customer brief is decomposed into scope /
// architecture / plan / risks, which resolve into shipped projects. It reuses
// the EXACT framing of the live /fde simulation on purpose, and hands off to it
// at the end (RUN THE SIMULATION), so the homepage carries the site's strongest
// asset instead of burying it on a secondary page.
//
// Mechanism (ported from redesign/concepts/two-readers.html, verified there):
// a 250vh section with a sticky 100vh stage. Scroll progress 0..1 drives two CSS
// custom properties, --dec and --res, in three bands. All visual transitions are
// CSS off those two vars, so the scroll handler only sets two numbers per frame.
// Under reduced motion the sticky stage is replaced by a static stacked layout.

const BRIEF = "we have a customer support team drowning in tickets and no one knows which ones actually matter";

const CARDS = [
  { key: "scope", label: "01 / scope", body: "Triage the backlog. Surface what is actually urgent before touching a model." },
  { key: "architecture", label: "02 / architecture", body: "Ingest tickets, score by urgency, route to a queue. Boring parts first." },
  { key: "plan", label: "03 / plan", body: "Ship a scored queue in the first week. Keep adjusting against real tickets." },
  { key: "risks", label: "04 / risks", body: "Bad labels teach the model the wrong thing. Watch drift from day one." },
] as const;

const SHIPPED = [
  { label: "python / langgraph", title: "CAG Deep Research", href: "/projects/revolu-idea" },
  { label: "streaming / warehouse", title: "Stock Data Platform", href: "/projects/stock-data-platform" },
  { label: "web standards", title: "WebMCP, on this site", href: "/projects/webmcp-portfolio" },
] as const;

export function DecompositionScene() {
  const prefersReducedMotion = usePrefersReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const typedRef = useRef<HTMLSpanElement>(null);
  const tickingRef = useRef(false);
  // Rendered only after mount so the server and first client render agree; the
  // scroll-driven stage needs a client to mean anything.
  const mounted = useMounted();

  useEffect(() => {
    if (prefersReducedMotion || !mounted) return;
    const section = sectionRef.current;
    const stage = stageRef.current;
    if (!section || !stage) return;

    const render = () => {
      const rect = section.getBoundingClientRect();
      const total = rect.height - window.innerHeight;
      const p = total <= 0 ? 1 : Math.min(1, Math.max(0, -rect.top / total));

      const typeP = Math.min(1, p / 0.25);
      if (typedRef.current) {
        typedRef.current.textContent = BRIEF.slice(0, Math.round(BRIEF.length * typeP));
      }
      const dec = Math.min(1, Math.max(0, (p - 0.25) / 0.3));
      const res = Math.min(1, Math.max(0, (p - 0.55) / 0.45));
      stage.style.setProperty("--dec", dec.toFixed(4));
      stage.style.setProperty("--res", res.toFixed(4));
      // The resolved-projects layer sits on top of everything at opacity 0 until
      // the resolve phase. Only make it clickable once it is actually visible, or
      // the invisible layer would intercept clicks meant for the cards behind it.
      stage.style.setProperty("--res-events", res > 0.9 ? "auto" : "none");
    };

    const onScroll = () => {
      if (tickingRef.current) return;
      tickingRef.current = true;
      requestAnimationFrame(() => {
        render();
        tickingRef.current = false;
      });
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    render();
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [prefersReducedMotion, mounted]);

  // Static, fully-readable fallback: the same story as a stacked layout, no scroll
  // dependency, all content visible at once.
  if (prefersReducedMotion || !mounted) {
    return (
      <section className="tr-decomp-static" aria-label="How a vague brief becomes shipped work">
        <style>{STATIC_STYLE}</style>
        <p className="tr-decomp-kicker">§ the job / decomposition</p>
        <p className="tr-decomp-brief-static">
          <span className="tr-decomp-quote">{BRIEF}</span>
        </p>
        <div className="tr-decomp-static-cards">
          {CARDS.map((c) => (
            <div key={c.key} className="tr-decomp-static-card">
              <p className="tr-decomp-card-label">{c.label}</p>
              <p className="tr-decomp-card-body">{c.body}</p>
            </div>
          ))}
        </div>
        <div className="tr-decomp-static-shipped">
          <p className="tr-decomp-kicker">what shipped</p>
          <div className="tr-decomp-shipped-row">
            {SHIPPED.map((s) => (
              <Link key={s.href} href={s.href} className="tr-decomp-shipped">
                <span className="tr-decomp-card-label">{s.label}</span>
                <span className="tr-decomp-shipped-title">{s.title}</span>
              </Link>
            ))}
          </div>
        </div>
        <Link href="/fde" className="tr-decomp-cta">Run the simulation</Link>
      </section>
    );
  }

  return (
    <section ref={sectionRef} className="tr-decomp" aria-label="How a vague brief becomes shipped work">
      <style>{SCENE_STYLE}</style>
      <p className="tr-decomp-intro">§ the job / scroll to decompose a real customer brief</p>
      <div className="tr-decomp-sticky">
        <div ref={stageRef} className="tr-decomp-stage">
          {/* Phase 1: the messy brief types itself out */}
          <div className="tr-decomp-console">
            <p className="tr-decomp-console-head">fde.sim / incoming brief</p>
            <p className="tr-decomp-console-body">
              <span className="tr-decomp-cursor" aria-hidden="true" />
              <span ref={typedRef} />
            </p>
          </div>

          {/* Phase 2: it decomposes into four structured cards + connectors */}
          <svg className="tr-decomp-lines" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
            <line className="tr-decomp-line" x1="50" y1="50" x2="28" y2="26" />
            <line className="tr-decomp-line" x1="50" y1="50" x2="72" y2="26" />
            <line className="tr-decomp-line" x1="50" y1="50" x2="28" y2="74" />
            <line className="tr-decomp-line" x1="50" y1="50" x2="72" y2="74" />
          </svg>
          {CARDS.map((c) => (
            <div key={c.key} className="tr-decomp-card" data-card={c.key}>
              <p className="tr-decomp-card-label">{c.label}</p>
              <p className="tr-decomp-card-body">{c.body}</p>
            </div>
          ))}

          {/* Phase 3: the decomposition resolves into shipped projects */}
          <div className="tr-decomp-projects">
            <p className="tr-decomp-kicker">what shipped</p>
            <div className="tr-decomp-shipped-row">
              {SHIPPED.map((s) => (
                <Link key={s.href} href={s.href} className="tr-decomp-shipped" data-cursor="OPEN">
                  <span className="tr-decomp-card-label">{s.label}</span>
                  <span className="tr-decomp-shipped-title">{s.title}</span>
                </Link>
              ))}
            </div>
            <Link href="/fde" className="tr-decomp-cta" data-cursor="RUN">Run the simulation</Link>
          </div>
        </div>
      </div>
    </section>
  );
}

const SHARED_STYLE = `
  .tr-decomp-kicker, .tr-decomp-intro {
    font-family: var(--font-jetbrains);
    font-size: var(--tr-t-mono-sm);
    letter-spacing: .08em; text-transform: uppercase;
    color: var(--tr-text-mute);
  }
  .tr-decomp-card-label {
    font-family: var(--font-jetbrains);
    font-size: var(--tr-t-mono-sm);
    letter-spacing: .04em;
    color: var(--tr-text-mute);
    margin: 0 0 .5rem;
  }
  .tr-decomp-card-body { color: var(--tr-text); font-size: .8125rem; line-height: 1.5; margin: 0; }
  .tr-decomp-shipped-title { font-family: var(--font-newsreader); color: var(--tr-text); font-size: 1.05rem; }
  .tr-decomp-cta {
    display: inline-block;
    font-family: var(--font-jetbrains); font-size: .75rem;
    letter-spacing: .08em; text-transform: uppercase;
    background: var(--tr-ember); color: var(--tr-on-ember);
    padding: .85em 1.4em; text-decoration: none;
    box-shadow: var(--tr-glow-box);
  }
`;

const SCENE_STYLE = `
  ${SHARED_STYLE}
  .tr-decomp { position: relative; height: 250vh; background: var(--tr-bg); }
  .tr-decomp-intro { padding: 2rem clamp(1.25rem,5vw,2rem) 0; max-width: 1400px; margin: 0 auto; }
  .tr-decomp-sticky {
    position: sticky; top: 0; height: 100vh;
    display: flex; align-items: center; justify-content: center;
    overflow: hidden; padding: 0 clamp(1.25rem,5vw,2rem);
  }
  .tr-decomp-stage { position: relative; width: min(900px,90vw); height: min(560px,70vh); }
  @media (max-width: 640px) { .tr-decomp-stage { height: min(640px,78vh); } }

  .tr-decomp-console {
    position: absolute; inset: 0; margin: auto;
    width: min(560px,100%); height: fit-content;
    background: var(--tr-surface-1); border: 1px solid var(--tr-hairline);
    border-top: 1px solid var(--tr-hairline); padding: 1.5rem;
    opacity: calc(1 - var(--dec,0));
    transform: scale(calc(1 - var(--dec,0) * .08));
  }
  .tr-decomp-console-head {
    font-family: var(--font-jetbrains); color: var(--tr-text-mute);
    font-size: var(--tr-t-mono-sm); margin: 0 0 .75rem;
  }
  .tr-decomp-console-body {
    font-family: var(--font-jetbrains); margin: 0; font-size: .9375rem;
    min-height: 3.2em; color: var(--tr-text); line-height: 1.6;
  }
  .tr-decomp-cursor {
    display: inline-block; width: .5em; height: 1.05em;
    background: var(--tr-ember); vertical-align: -.15em; margin-right: 2px;
  }
  @media (prefers-reduced-motion: no-preference) {
    .tr-decomp-cursor { animation: tr-decomp-blink .9s steps(1) infinite; }
  }
  @keyframes tr-decomp-blink { 50%, 100% { opacity: 0; } }

  .tr-decomp-lines { position: absolute; inset: 0; width: 100%; height: 100%; overflow: visible; }
  .tr-decomp-line {
    stroke: var(--tr-ember); stroke-width: 1; fill: none;
    stroke-dasharray: 1; stroke-dashoffset: calc(1 - var(--dec,0));
    opacity: var(--dec,0); vector-effect: non-scaling-stroke;
  }
  .tr-decomp-card {
    position: absolute; top: 50%; left: 50%;
    width: min(220px,42vw);
    background: var(--tr-surface-1); border: 1px solid var(--tr-hairline);
    border-top: 1px solid var(--tr-hairline); padding: 1rem 1.1rem;
    opacity: var(--dec,0);
    transform: translate(-50%,-50%) translate(var(--cx,0), var(--cy,0)) scale(calc(.85 + var(--dec,0) * .15));
  }
  .tr-decomp-card[data-card="scope"] { --cx: -190px; --cy: -140px; }
  .tr-decomp-card[data-card="architecture"] { --cx: 190px; --cy: -140px; }
  .tr-decomp-card[data-card="plan"] { --cx: -190px; --cy: 140px; }
  .tr-decomp-card[data-card="risks"] { --cx: 190px; --cy: 140px; }
  @media (max-width: 640px) {
    .tr-decomp-card { width: min(150px,42vw); padding: .75rem; }
    .tr-decomp-card[data-card="scope"] { --cx: -84px; --cy: -180px; }
    .tr-decomp-card[data-card="architecture"] { --cx: 84px; --cy: -180px; }
    .tr-decomp-card[data-card="plan"] { --cx: -84px; --cy: 180px; }
    .tr-decomp-card[data-card="risks"] { --cx: 84px; --cy: 180px; }
  }

  .tr-decomp-projects {
    position: absolute; inset: 0;
    display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 1.25rem;
    opacity: var(--res,0);
    pointer-events: var(--res-events, none);
  }
  .tr-decomp-shipped-row { display: flex; flex-wrap: wrap; gap: .75rem; justify-content: center; }
  .tr-decomp-shipped {
    display: flex; flex-direction: column; gap: .25rem;
    background: var(--tr-surface-1); border: 1px solid var(--tr-hairline);
    border-top: 1px solid var(--tr-hairline);
    padding: .85rem 1rem; text-decoration: none; min-width: 180px;
  }
`;

const STATIC_STYLE = `
  ${SHARED_STYLE}
  .tr-decomp-static { background: var(--tr-bg); padding: clamp(3rem,8vw,6rem) clamp(1.25rem,5vw,2rem); max-width: 1000px; margin: 0 auto; }
  .tr-decomp-brief-static { margin: 1rem 0 2.5rem; }
  .tr-decomp-quote { font-family: var(--font-newsreader); font-style: italic; font-size: clamp(1.25rem,3vw,1.75rem); color: var(--tr-text); }
  .tr-decomp-static-cards { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px,1fr)); gap: 1rem; margin-bottom: 2.5rem; }
  .tr-decomp-static-card { background: var(--tr-surface-1); border: 1px solid var(--tr-hairline); border-top: 1px solid var(--tr-hairline); padding: 1rem 1.1rem; }
  .tr-decomp-static-shipped { margin-bottom: 2rem; }
  .tr-decomp-shipped-row { display: flex; flex-wrap: wrap; gap: .75rem; margin-top: .75rem; }
  .tr-decomp-shipped { display: flex; flex-direction: column; gap: .25rem; background: var(--tr-surface-1); border: 1px solid var(--tr-hairline); border-top: 1px solid var(--tr-hairline); padding: .85rem 1rem; text-decoration: none; min-width: 180px; }
`;
