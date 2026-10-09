/**
 * The WebMCP tools this site registers, in registration order, with whether
 * each one only reads or also changes the page. Single source of truth:
 * webmcp.ts registers exactly these (asserted in webmcp.test.ts), and every
 * place in the UI that quotes a tool count or name reads it from here rather
 * than typing it. Kept apart from webmcp.ts so quoting a count does not pull
 * the tool handlers into a page's bundle.
 */
export const WEBMCP_TOOLS = [
  { name: "search_projects", kind: "read" },
  { name: "get_project", kind: "read" },
  { name: "get_resume", kind: "read" },
  { name: "search_skills", kind: "read" },
  { name: "get_contact", kind: "read" },
  { name: "list_experiments", kind: "read" },
  { name: "switch_mode", kind: "write" },
] as const;

export const WEBMCP_TOOL_COUNT = WEBMCP_TOOLS.length;
