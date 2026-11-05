"use client";

import { useRef, useState } from "react";
import { WEBMCP_TOOL_COUNT } from "@/lib/webmcp-tools";
import type { ModelContextTool, SiteData } from "@/lib/webmcp";
import { CARD, CHIP, LABEL, PILL, PILL_ACTIVE } from "@/components/desk";

const CALLS: { tool: string; args: Record<string, unknown>; note: string }[] = [
  { tool: "search_projects", args: { tag: "agents" }, note: "Find the agent work." },
  { tool: "get_project", args: { id: "discharge-summary-agent" }, note: "Read one project, as data." },
  { tool: "get_contact", args: {}, note: "Work out how to hire me." },
  { tool: "switch_mode", args: { mode: "reader" }, note: "This one changes the page. Motion stops." },
  { tool: "switch_mode", args: { mode: "default" }, note: "And this puts it back." },
];

export function AgentConsole() {
  const tools = useRef<ModelContextTool[] | null>(null);
  const run = useRef(0);
  const [active, setActive] = useState<number | null>(null);
  const [output, setOutput] = useState("");
  const [busy, setBusy] = useState(false);

  const call = async (i: number) => {
    const id = ++run.current;
    setActive(i);
    setBusy(true);
    setOutput("");
    try {
      // The tool code and its data load on the first click, so nobody pays for
      // them just by opening the page.
      if (!tools.current) {
        const [{ buildTools }, res] = await Promise.all([import("@/lib/webmcp"), fetch("/site-data.json")]);
        if (!res.ok) throw new Error(`site-data.json answered ${res.status}`);
        tools.current = buildTools((await res.json()) as SiteData);
      }
      const { tool, args } = CALLS[i];
      const found = tools.current.find((t) => t.name === tool);
      if (!found) throw new Error(`no tool named ${tool}`);
      const result = await found.execute(args);
      if (id === run.current) setOutput(JSON.stringify(result, null, 2));
    } catch (err) {
      if (id === run.current) setOutput(`The call failed: ${err instanceof Error ? err.message : "unknown error"}`);
    } finally {
      if (id === run.current) setBusy(false);
    }
  };

  return (
    <div className={`${CARD} grid gap-6 p-[clamp(18px,3vw,32px)] lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]`}>
      <div>
        <p className={LABEL}>{WEBMCP_TOOL_COUNT} tools on this site. Pick a call.</p>
        <ul className="mt-3 flex flex-col gap-2.5">
          {CALLS.map((c, i) => (
            <li key={`${c.tool}-${i}`}>
              <button
                type="button"
                aria-pressed={active === i}
                className={`${PILL} w-full cursor-pointer flex-wrap justify-between rounded-[12px] text-left ${active === i ? PILL_ACTIVE : ""}`}
                onClick={() => call(i)}
              >
                <span>{c.tool}</span>
                <span className="font-sans text-[13px] text-tr-text-mute">{c.note}</span>
              </button>
            </li>
          ))}
        </ul>
      </div>
      <div className="min-w-0">
        <p className={LABEL}>
          What the agent gets back <span className={`${CHIP} ml-1 normal-case tracking-normal`}>no scraping</span>
        </p>
        {/* Scrollable, so it takes the keyboard too. */}
        <pre
          tabIndex={0}
          aria-label="Tool result"
          aria-live="polite"
          className="mt-3 h-[300px] overflow-auto rounded-[10px] bg-tr-surface-2 p-4 font-mono text-[13px] leading-normal"
        >
          {busy ? "calling…" : output || "// nothing yet. Pick a call."}
        </pre>
      </div>
    </div>
  );
}
