// WebMCP tool registry: a browser agent calls the MCP hub which fans out to the
// structured tools in WEBMCP_TOOL_NAMES (search, project, resume, skills,
// contact, experiments, theme, mode). The caption reads WEBMCP_TOOL_COUNT so it
// cannot drift from what src/lib/webmcp.ts actually registers.
import { WEBMCP_TOOL_COUNT } from "@/lib/webmcp";
// Landscape 840x504 (5/3) — all coordinates are plain integer/decimal literals,
// no runtime math, so server and client serialize identically.

export function WebMCPFigure({ className }: { className?: string }) {
  // ── Header chip ────────────────────────────────────────────────
  const chipX = 270;
  const chipY = 22;
  const chipW = 300;
  const chipH = 28;

  // ── Browser / agent node (left) ────────────────────────────────
  const agentX = 60;
  const agentY = 200;
  const agentW = 130;
  const agentH = 60;
  const agentCX = agentX + agentW;       // right edge: 190
  const agentCY = agentY + agentH / 2;  // vertical center: 230

  // ── MCP hub node (center) ──────────────────────────────────────
  const mcpX = 330;
  const mcpY = 196;
  const mcpW = 130;
  const mcpH = 68;
  const mcpLX = mcpX;                    // left edge: 330
  const mcpRX = mcpX + mcpW;            // right edge: 460
  const mcpCY = mcpY + mcpH / 2;        // vertical center: 230

  // ── Tool cards (right column): two columns, 5 cards ───────────
  // Column A: x=540, Column B: x=680
  // Rows: three in col A, two in col B, centered vertically
  const toolW = 120;
  const toolH = 46;
  const colA = 540;
  const colB = 700;
  const tools = [
    { name: "search",  x: colA, y: 120, accent: true  },
    { name: "resume",  x: colA, y: 228, accent: false },
    { name: "skills",  x: colA, y: 336, accent: false },
    { name: "contact", x: colB, y: 174, accent: false },
    { name: "theme",   x: colB, y: 282, accent: false },
  ];

  return (
    <svg
      className={className}
      viewBox="0 0 840 504"
      preserveAspectRatio="xMidYMid meet"
      fill="none"
      role="img"
      aria-label="An AI browser agent calling the site's WebMCP tool registry: search, resume, skills, contact, and theme, each with JSON Schema inputs and typed results."
      style={{ fontFamily: "var(--font-jetbrains)" }}
    >
      <defs>
        <marker id="wm-arrow" markerWidth="7" markerHeight="7" refX="5.5" refY="3" orient="auto">
          <path d="M0,0 L6,3 L0,6 Z" fill="var(--tr-text-mute)" />
        </marker>
        <marker id="wm-arrow-accent" markerWidth="7" markerHeight="7" refX="5.5" refY="3" orient="auto">
          <path d="M0,0 L6,3 L0,6 Z" fill="var(--tr-ember)" />
        </marker>
      </defs>

      {/* Header chip */}
      <rect
        x={chipX}
        y={chipY}
        width={chipW}
        height={chipH}
        rx={14}
        fill="var(--tr-hairline)"
        stroke="var(--tr-hairline)"
        strokeWidth={1}
      />
      <text
        x={chipX + chipW / 2}
        y={chipY + 18}
        textAnchor="middle"
        fontSize={10}
        fill="var(--tr-text)"
        letterSpacing="0.08em"
      >
        WEBMCP · TOOL REGISTRY
      </text>

      {/* Agent → MCP connector */}
      <line
        x1={agentCX}
        y1={agentCY}
        x2={mcpLX}
        y2={mcpCY}
        stroke="var(--tr-ember)"
        strokeWidth={1.5}
        markerEnd="url(#wm-arrow-accent)"
      />

      {/* Browser / agent node */}
      <rect
        x={agentX}
        y={agentY}
        width={agentW}
        height={agentH}
        rx={5}
        fill="var(--tr-bg)"
        stroke="var(--tr-text)"
        strokeWidth={1.5}
      />
      <text x={agentX + 14} y={agentY + 26} fontSize={14} fill="var(--tr-ember)" fontWeight={700}>
        ❯
      </text>
      <text
        x={agentX + agentW / 2 + 6}
        y={agentY + 26}
        textAnchor="middle"
        fontSize={12}
        fill="var(--tr-text)"
        fontWeight={600}
      >
        browser
      </text>
      <text
        x={agentX + agentW / 2 + 6}
        y={agentY + 43}
        textAnchor="middle"
        fontSize={10}
        fill="var(--tr-text-mute)"
      >
        agent
      </text>

      {/* MCP hub node */}
      <rect
        x={mcpX}
        y={mcpY}
        width={mcpW}
        height={mcpH}
        rx={5}
        fill="var(--tr-bg)"
        stroke="var(--tr-ember)"
        strokeWidth={2}
      />
      <text
        x={mcpX + mcpW / 2}
        y={mcpY + 30}
        textAnchor="middle"
        fontSize={16}
        fill="var(--tr-ember)"
        fontWeight={700}
        letterSpacing="0.06em"
      >
        MCP
      </text>
      <text
        x={mcpX + mcpW / 2}
        y={mcpY + 48}
        textAnchor="middle"
        fontSize={10}
        fill="var(--tr-text-mute)"
      >
        hub
      </text>

      {/* MCP → tool connector lines */}
      {tools.map((tool) => {
        const toolCY = tool.y + toolH / 2;
        const isAccent = tool.accent;
        return (
          <line
            key={tool.name}
            x1={mcpRX}
            y1={mcpCY}
            x2={tool.x}
            y2={toolCY}
            stroke={isAccent ? "var(--tr-ember)" : "var(--tr-text-mute)"}
            strokeWidth={isAccent ? 1.5 : 1}
            strokeDasharray={isAccent ? undefined : "3 2"}
            markerEnd="url(#wm-arrow)"
          />
        );
      })}

      {/* Tool cards */}
      {tools.map((tool) => {
        const isAccent = tool.accent;
        return (
          <g key={tool.name}>
            <rect
              x={tool.x}
              y={tool.y}
              width={toolW}
              height={toolH}
              rx={4}
              fill="var(--tr-bg)"
              stroke={isAccent ? "var(--tr-ember)" : "var(--tr-text)"}
              strokeWidth={isAccent ? 2 : 1.25}
            />
            <text
              x={tool.x + 12}
              y={tool.y + 20}
              fontSize={12}
              fill={isAccent ? "var(--tr-ember)" : "var(--tr-text)"}
              fontWeight={600}
            >
              {tool.name}
            </text>
            <text x={tool.x + 12} y={tool.y + 36} fontSize={10} fill="var(--tr-text-mute)">
              {"{ }"}
            </text>
            <text x={tool.x + 34} y={tool.y + 36} fontSize={9} fill="var(--tr-text-faint)">
              JSON
            </text>
          </g>
        );
      })}

      {/* Caption */}
      <text
        x={420}
        y={472}
        textAnchor="middle"
        fontSize={9}
        fill="var(--tr-text-mute)"
        letterSpacing="0.04em"
      >
        {WEBMCP_TOOL_COUNT} tools · JSON Schema in, typed results out
      </text>
    </svg>
  );
}
