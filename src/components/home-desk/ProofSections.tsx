"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import type { Route } from "next";
import { buildHarness } from "@/data/harness";
import { SECTION, H2 } from "./classes";

// A client component, so this copy ships once in the HTML rather than again in
// the server payload, and the two demos load after it. The home page's HTML
// budget (tests/perf/budget.spec.ts) has no room for either otherwise.
const SLOT = "min-h-[420px] rounded-[var(--tr-r-xl)] border-[1.5px] border-tr-hairline bg-tr-surface-1";
const GuardrailDemo = dynamic(() => import("./GuardrailDemo").then((m) => m.GuardrailDemo), {
  ssr: false,
  loading: () => <div className={SLOT} />,
});
const AgentConsole = dynamic(() => import("./AgentConsole").then((m) => m.AgentConsole), {
  ssr: false,
  loading: () => <div className={SLOT} />,
});

const INTRO = "mb-7 max-w-[640px] text-[17px] leading-[var(--tr-lh-body)] text-tr-text-faint";

export function ProofSections({ mergedCount }: { mergedCount: number }) {
  return (
    <>
      <section id="harness" aria-labelledby="harness-h2" className={SECTION}>
        <h2 id="harness-h2" className={`${H2} mb-2.5`}>
          The model is the easy part
        </h2>
        <p className={INTRO}>
          People call it harness engineering now: everything you build around a model so it can be trusted with real
          work. Here&apos;s mine.
        </p>
        <ul className="grid grid-cols-[repeat(auto-fill,minmax(min(100%,330px),1fr))] gap-5">
          {buildHarness(mergedCount).map((h) => (
            <li key={h.term} className="flex">
              <Link
                href={h.href as Route}
                className="desk-card desk-panel desk-proof"
              >
                <span className="desk-proof-term">{h.term}</span>
                <b>{h.plain}</b>
                <span>{h.proof}</span>
                <u>{h.source}</u>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="guardrail-h2" className={SECTION}>
        <h2 id="guardrail-h2" className={`${H2} mb-2.5`}>
          Try to get a lie past it
        </h2>
        <p className={INTRO}>
          My discharge summary agent can&apos;t record a fact without quoting the exact words from the cited page. On a
          71-page test record, this check refused 29 writes. Same logic, running in your browser.
        </p>
        <GuardrailDemo />
      </section>

      <section aria-labelledby="console-h2" className={SECTION}>
        <h2 id="console-h2" className={`${H2} mb-2.5`}>
          This site talks to agents too
        </h2>
        <p className={INTRO}>
          Agents shouldn&apos;t have to scrape websites, so this one offers tools through{" "}
          <Link href="/projects/webmcp-portfolio" className="underline">
            WebMCP
          </Link>
          , a draft browser standard. Real agents need Chrome with a flag turned on. You can be the agent right here:
          these buttons run the same tool code.
        </p>
        <AgentConsole />
      </section>
    </>
  );
}
