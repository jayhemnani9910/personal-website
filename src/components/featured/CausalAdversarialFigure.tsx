// The real CAG pipeline: plan a causal graph, attack each edge with a paired
// adversary + supporter, let a dialectical judge rule, then write.
type Node = { x: number; y: number; w: number; h: number; label: string; sub?: string; accent?: "red" | "blue" };

const NODES: Record<string, Node> = {
  planner: { x: 24, y: 148, w: 96, h: 46, label: "causal", sub: "planner" },
  selector: { x: 150, y: 148, w: 96, h: 46, label: "edge", sub: "selector" },
  adversary: { x: 290, y: 70, w: 98, h: 44, label: "adversary", sub: "red team", accent: "red" },
  supporter: { x: 290, y: 222, w: 98, h: 44, label: "supporter", sub: "blue team", accent: "blue" },
  judge: { x: 424, y: 148, w: 86, h: 46, label: "dialectic", sub: "judge" },
  writer: { x: 538, y: 148, w: 60, h: 46, label: "writer" },
};

function color(n: Node) {
  if (n.accent === "red") return "var(--tr-ember)";
  if (n.accent === "blue") return "var(--tr-text)";
  return "var(--tr-text)";
}

export function CausalAdversarialFigure({ className }: { className?: string }) {
  const cy = (n: Node) => n.y + n.h / 2;
  return (
    <svg
      className={className}
      viewBox="0 0 600 360"
      preserveAspectRatio="xMidYMid meet"
      fill="none"
      role="img"
      aria-label="Causal-adversarial research pipeline: a causal planner feeds an edge selector that splits into adversary and supporter agents, whose findings a dialectical judge rules on before a writer composes the report."
      style={{ fontFamily: "var(--font-jetbrains)" }}
    >
      <defs>
        <marker id="cag-arrow" markerWidth="7" markerHeight="7" refX="5.5" refY="3" orient="auto">
          <path d="M0,0 L6,3 L0,6 Z" fill="var(--tr-text-mute)" />
        </marker>
      </defs>

      {/* flow edges */}
      <g stroke="var(--tr-text-mute)" strokeWidth={1.25} markerEnd="url(#cag-arrow)">
        <line x1={NODES.planner.x + NODES.planner.w} y1={cy(NODES.planner)} x2={NODES.selector.x} y2={cy(NODES.selector)} />
        <line x1={NODES.selector.x + NODES.selector.w} y1={cy(NODES.selector)} x2={NODES.adversary.x} y2={cy(NODES.adversary)} />
        <line x1={NODES.selector.x + NODES.selector.w} y1={cy(NODES.selector)} x2={NODES.supporter.x} y2={cy(NODES.supporter)} />
        <line x1={NODES.adversary.x + NODES.adversary.w} y1={cy(NODES.adversary)} x2={NODES.judge.x} y2={cy(NODES.judge)} />
        <line x1={NODES.supporter.x + NODES.supporter.w} y1={cy(NODES.supporter)} x2={NODES.judge.x} y2={cy(NODES.judge)} />
        <line x1={NODES.judge.x + NODES.judge.w} y1={cy(NODES.judge)} x2={NODES.writer.x} y2={cy(NODES.writer)} />
      </g>

      {/* auditor loopback: judge -> selector */}
      <path
        d={`M ${NODES.judge.x + NODES.judge.w / 2} ${NODES.judge.y + NODES.judge.h} V 300 H ${NODES.selector.x + NODES.selector.w / 2} V ${NODES.selector.y + NODES.selector.h}`}
        stroke="var(--tr-text-faint)" strokeWidth={1} strokeDasharray="4 3" markerEnd="url(#cag-arrow)"
      />
      <text x={NODES.selector.x + NODES.selector.w / 2 + 8} y={296} fontSize={9} fill="var(--tr-text-mute)" letterSpacing="0.06em">auditor · depth/loop caps</text>

      {/* nodes */}
      {Object.entries(NODES).map(([key, n]) => (
        <g key={key}>
          <rect x={n.x} y={n.y} width={n.w} height={n.h} rx={4} fill="var(--tr-bg)" stroke={color(n)} strokeWidth={n.accent ? 1.75 : 1.5} />
          <text x={n.x + n.w / 2} y={n.sub ? n.y + 21 : n.y + n.h / 2 + 4} textAnchor="middle" fontSize={11} fill={color(n)} fontWeight={600}>{n.label}</text>
          {n.sub && <text x={n.x + n.w / 2} y={n.y + 35} textAnchor="middle" fontSize={9} fill="var(--tr-text-mute)">{n.sub}</text>}
        </g>
      ))}

      {/* verdict chip */}
      <g>
        <rect x={400} y={18} width={150} height={22} rx={11} fill="var(--tr-hairline)" stroke="var(--tr-hairline)" strokeWidth={1} />
        <text x={475} y={33} textAnchor="middle" fontSize={9.5} fill="var(--tr-text)" letterSpacing="0.04em">VERIFIED · FALSIFIED</text>
      </g>
    </svg>
  );
}
