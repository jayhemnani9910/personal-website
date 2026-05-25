// Player + ball nodes with tracked interaction edges over a faint pitch.
const TEAM_A = [
  { x: 70, y: 225, id: "01" },
  { x: 175, y: 120 },
  { x: 175, y: 225 },
  { x: 175, y: 330 },
  { x: 310, y: 165, id: "07" },
  { x: 310, y: 295 },
  { x: 445, y: 235, id: "10" },
];
const TEAM_B = [
  { x: 745, y: 225 },
  { x: 645, y: 140 },
  { x: 645, y: 310 },
  { x: 525, y: 195 },
  { x: 525, y: 305 },
];
const BALL = { x: 485, y: 250 };

// interaction edges (indices into TEAM_A) + ball links
const EDGES_A: [number, number][] = [[0, 1], [0, 2], [0, 3], [1, 4], [2, 5], [4, 5], [4, 6], [5, 6]];

export function TacticalGraphFigure({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 800 450"
      preserveAspectRatio="xMidYMid meet"
      fill="none"
      role="img"
      aria-label="A soccer tactical interaction graph: tracked player nodes joined by passing edges, with the ball highlighted, over a faint pitch."
      style={{ fontFamily: "var(--ff-mono)" }}
    >
      {/* pitch */}
      <g stroke="var(--rule)" strokeWidth={1}>
        <rect x={40} y={40} width={720} height={370} />
        <line x1={400} y1={40} x2={400} y2={410} />
        <circle cx={400} cy={225} r={56} fill="none" />
        <rect x={40} y={140} width={70} height={170} />
        <rect x={690} y={140} width={70} height={170} />
      </g>

      {/* interaction edges (team A) */}
      <g stroke="var(--ink-mute)" strokeWidth={1.25}>
        {EDGES_A.map(([a, b], i) => (
          <line key={i} x1={TEAM_A[a].x} y1={TEAM_A[a].y} x2={TEAM_A[b].x} y2={TEAM_A[b].y} />
        ))}
      </g>
      {/* ball link to forward */}
      <line x1={TEAM_A[6].x} y1={TEAM_A[6].y} x2={BALL.x} y2={BALL.y} stroke="var(--accent)" strokeWidth={1.5} strokeDasharray="4 3" />

      {/* velocity vectors (tracking) */}
      <g stroke="var(--ink)" strokeWidth={1.25}>
        <line x1={310} y1={165} x2={345} y2={150} />
        <polygon points="345,150 337,148 341,156" fill="var(--ink)" stroke="none" />
        <line x1={445} y1={235} x2={478} y2={246} />
        <polygon points="478,246 470,242 471,250" fill="var(--ink)" stroke="none" />
      </g>

      {/* team B nodes (opponent, outline) */}
      <g fill="var(--paper)" stroke="var(--ink-mute)" strokeWidth={1.5}>
        {TEAM_B.map((p, i) => <circle key={i} cx={p.x} cy={p.y} r={9} />)}
      </g>

      {/* team A nodes (tracked, filled) */}
      <g fill="var(--ink)" stroke="var(--paper)" strokeWidth={1.5}>
        {TEAM_A.map((p, i) => <circle key={i} cx={p.x} cy={p.y} r={10} />)}
      </g>

      {/* ball */}
      <circle cx={BALL.x} cy={BALL.y} r={7} fill="var(--accent)" />
      <circle cx={BALL.x} cy={BALL.y} r={13} fill="none" stroke="var(--accent)" strokeWidth={1.25} />

      {/* id labels */}
      <g fontSize={10} fill="var(--ink-mute)" letterSpacing="0.04em">
        {TEAM_A.filter((p) => p.id).map((p) => (
          <text key={p.id} x={p.x + 14} y={p.y - 10}>ID {p.id}</text>
        ))}
        <text x={BALL.x + 16} y={BALL.y + 4} fill="var(--accent)">BALL</text>
      </g>
    </svg>
  );
}
