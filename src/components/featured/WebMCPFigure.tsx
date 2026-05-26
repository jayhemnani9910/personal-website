// WebMCP tool registry: a browser agent calls the MCP hub which fans out
// to five structured tools (search, resume, skills, contact, theme).

export function WebMCPFigure({ className }: { className?: string }) {
  // Layout constants — all plain integer literals, no runtime math.
  // Header chip: centered at top
  const chipX = 90;
  const chipY = 24;
  const chipW = 300;
  const chipH = 28;

  // Browser agent node (upper-left)
  const agentX = 28;
  const agentY = 100;
  const agentW = 108;
  const agentH = 52;

  // MCP hub node (center)
  const mcpX = 186;
  const mcpY = 100;
  const mcpW = 108;
  const mcpH = 52;

  // Tool cards: right column, evenly spaced
  // Each card: x=356, w=100, h=44
  const toolX = 356;
  const toolW = 100;
  const toolH = 44;
  const tools = [
    { name: "search",  y: 72  },
    { name: "resume",  y: 132 },
    { name: "skills",  y: 192 },
    { name: "contact", y: 252 },
    { name: "theme",   y: 312 },
  ];

  // MCP hub center (for connector lines from hub to tools)
  const mcpCX = mcpX + mcpW; // right edge of MCP hub = 294
  const mcpCY = mcpY + mcpH / 2; // vertical center of MCP hub = 126

  // Agent right edge -> MCP left edge
  const agentRX = agentX + agentW; // 136
  const agentCY = agentY + agentH / 2; // 126

  return (
    <svg
      className={className}
      viewBox="0 0 480 600"
      preserveAspectRatio="xMidYMid meet"
      fill="none"
      role="img"
      aria-label="An AI browser agent calling the site's WebMCP tool registry: search, resume, skills, contact, and theme, each with JSON Schema inputs and typed results."
      style={{ fontFamily: "var(--ff-mono)" }}
    >
      <defs>
        <marker id="wm-arrow" markerWidth="7" markerHeight="7" refX="5.5" refY="3" orient="auto">
          <path d="M0,0 L6,3 L0,6 Z" fill="var(--ink-mute)" />
        </marker>
        <marker id="wm-arrow-accent" markerWidth="7" markerHeight="7" refX="5.5" refY="3" orient="auto">
          <path d="M0,0 L6,3 L0,6 Z" fill="var(--accent)" />
        </marker>
      </defs>

      {/* Header chip */}
      <rect
        x={chipX}
        y={chipY}
        width={chipW}
        height={chipH}
        rx={14}
        fill="var(--rule-soft)"
        stroke="var(--rule)"
        strokeWidth={1}
      />
      <text
        x={chipX + chipW / 2}
        y={chipY + 18}
        textAnchor="middle"
        fontSize={10}
        fill="var(--ink)"
        letterSpacing="0.08em"
      >
        WEBMCP · TOOL REGISTRY
      </text>

      {/* Agent → MCP connector line */}
      <line
        x1={agentRX}
        y1={agentCY}
        x2={mcpX}
        y2={mcpCY}
        stroke="var(--accent)"
        strokeWidth={1.5}
        markerEnd="url(#wm-arrow-accent)"
      />

      {/* Browser agent node */}
      <rect
        x={agentX}
        y={agentY}
        width={agentW}
        height={agentH}
        rx={5}
        fill="var(--paper)"
        stroke="var(--ink)"
        strokeWidth={1.5}
      />
      {/* accent prompt glyph */}
      <text
        x={agentX + 14}
        y={agentY + 22}
        fontSize={13}
        fill="var(--accent)"
        fontWeight={700}
      >
        ❯
      </text>
      <text
        x={agentX + agentW / 2 + 4}
        y={agentY + 22}
        textAnchor="middle"
        fontSize={11}
        fill="var(--ink)"
        fontWeight={600}
      >
        browser
      </text>
      <text
        x={agentX + agentW / 2 + 4}
        y={agentY + 37}
        textAnchor="middle"
        fontSize={9}
        fill="var(--ink-mute)"
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
        fill="var(--paper)"
        stroke="var(--accent)"
        strokeWidth={2}
      />
      <text
        x={mcpX + mcpW / 2}
        y={mcpY + 24}
        textAnchor="middle"
        fontSize={14}
        fill="var(--accent)"
        fontWeight={700}
        letterSpacing="0.06em"
      >
        MCP
      </text>
      <text
        x={mcpX + mcpW / 2}
        y={mcpY + 39}
        textAnchor="middle"
        fontSize={9}
        fill="var(--ink-mute)"
      >
        hub
      </text>

      {/* Connector lines: MCP hub right edge → each tool card left edge */}
      {tools.map((tool, i) => {
        const toolCY = tool.y + toolH / 2;
        const isFirst = i === 0;
        return (
          <line
            key={tool.name}
            x1={mcpCX}
            y1={mcpCY}
            x2={toolX}
            y2={toolCY}
            stroke={isFirst ? "var(--accent)" : "var(--ink-mute)"}
            strokeWidth={isFirst ? 1.5 : 1}
            strokeDasharray={isFirst ? undefined : "3 2"}
            markerEnd="url(#wm-arrow)"
          />
        );
      })}

      {/* Tool cards */}
      {tools.map((tool, i) => {
        const isFirst = i === 0;
        return (
          <g key={tool.name}>
            <rect
              x={toolX}
              y={tool.y}
              width={toolW}
              height={toolH}
              rx={4}
              fill="var(--paper)"
              stroke={isFirst ? "var(--accent)" : "var(--ink)"}
              strokeWidth={isFirst ? 2 : 1.25}
            />
            <text
              x={toolX + 10}
              y={tool.y + 17}
              fontSize={11}
              fill={isFirst ? "var(--accent)" : "var(--ink)"}
              fontWeight={600}
            >
              {tool.name}
            </text>
            <text
              x={toolX + 10}
              y={tool.y + 31}
              fontSize={9}
              fill="var(--ink-mute)"
            >
              {"{ }"}
            </text>
            <text
              x={toolX + 30}
              y={tool.y + 31}
              fontSize={8}
              fill="var(--ink-faint)"
            >
              JSON
            </text>
          </g>
        );
      })}

      {/* Caption */}
      <text
        x={240}
        y={392}
        textAnchor="middle"
        fontSize={9}
        fill="var(--ink-mute)"
        letterSpacing="0.04em"
      >
        8 tools · JSON Schema in, typed results out
      </text>
    </svg>
  );
}
