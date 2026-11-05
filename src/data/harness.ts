import { WEBMCP_TOOL_COUNT } from "@/lib/webmcp-tools";

// The merged-PR count is passed in: its list is large, and this file ships to the browser.
export type HarnessPiece = { term: string; plain: string; proof: string; source: string; href: string };

/** Each trade term sits next to the plain meaning and the project that earns it. */
export function buildHarness(mergedCount: number): HarnessPiece[] {
  return [
    {
      term: "guardrails",
      plain: "Rules in code, not requests in a prompt.",
      proof: "A prompt can be ignored. A check that refuses the write can't.",
      source: "Discharge Summary Agent",
      href: "/projects/discharge-summary-agent",
    },
    {
      term: "evals",
      plain: "Find out when the AI gets worse.",
      proof: "My live FDE demo has ten test briefs, graded against every rule in its prompt. Last baseline: 184 of 190 checks.",
      source: "The FDE simulation",
      href: "/fde",
    },
    {
      term: "adversarial review",
      plain: "Agreement is not evidence.",
      proof: "Red and blue agents fight over each causal claim, then a judge rules.",
      source: "CAG Deep Research",
      href: "/projects/revolu-idea",
    },
    {
      term: "context engineering",
      plain: "Show it the right page, not all of them.",
      proof: "The agent starts from an index of a 71-page record and pulls only the pages it needs.",
      source: "Discharge Summary Agent",
      href: "/projects/discharge-summary-agent",
    },
    {
      term: "MCP",
      plain: "Tools agents can actually call.",
      proof: `${WEBMCP_TOOL_COUNT} typed tools on this site, and merged fixes in the official MCP Python SDK and GitHub's MCP server.`,
      source: "WebMCP, on this site",
      href: "/projects/webmcp-portfolio",
    },
    {
      term: "open source",
      plain: "Fixes in the tools everyone runs.",
      proof: `${mergedCount} pull requests merged upstream, including vLLM, DSPy, Caddy and Redis's Go client.`,
      source: "Read them all",
      href: "/oss",
    },
  ];
}
