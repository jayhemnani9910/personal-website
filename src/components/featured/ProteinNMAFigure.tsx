// A folded protein backbone with normal-mode (NMA) vibration vectors and a
// couple of tertiary contacts.
const BACKBONE: [number, number][] = [
  [60, 210], [100, 150], [150, 118], [210, 120], [256, 158],
  [286, 214], [338, 240], [392, 228], [430, 184], [432, 128],
  [474, 96], [524, 116], [552, 168], [548, 224],
];

// indices that get a normal-mode arrow, with direction
const MODES: { i: number; dx: number; dy: number }[] = [
  { i: 2, dx: 0, dy: -26 },
  { i: 5, dx: -22, dy: 14 },
  { i: 8, dx: 24, dy: -8 },
  { i: 11, dx: 8, dy: -24 },
];

// tertiary contacts (dashed) between non-sequential residues
const CONTACTS: [number, number][] = [[2, 11], [5, 8]];

function arrow(x: number, y: number, dx: number, dy: number) {
  const ex = x + dx;
  const ey = y + dy;
  const len = Math.hypot(dx, dy);
  const ux = dx / len;
  const uy = dy / len;
  const px = -uy;
  const py = ux;
  const a = `${ex},${ey}`;
  const b = `${ex - ux * 7 + px * 4},${ey - uy * 7 + py * 4}`;
  const c = `${ex - ux * 7 - px * 4},${ey - uy * 7 - py * 4}`;
  return { line: { x1: x, y1: y, x2: ex, y2: ey }, head: `${a} ${b} ${c}` };
}

export function ProteinNMAFigure({ className }: { className?: string }) {
  const path = BACKBONE.map((p, i) => `${i === 0 ? "M" : "L"} ${p[0]} ${p[1]}`).join(" ");
  return (
    <svg
      className={className}
      viewBox="0 0 600 360"
      preserveAspectRatio="xMidYMid meet"
      fill="none"
      role="img"
      aria-label="A folded protein backbone with normal-mode analysis vibration vectors and tertiary residue contacts."
      style={{ fontFamily: "var(--ff-mono)" }}
    >
      {/* tertiary contacts */}
      <g stroke="var(--ink-faint)" strokeWidth={1} strokeDasharray="3 3">
        {CONTACTS.map(([a, b], i) => (
          <line key={i} x1={BACKBONE[a][0]} y1={BACKBONE[a][1]} x2={BACKBONE[b][0]} y2={BACKBONE[b][1]} />
        ))}
      </g>

      {/* backbone */}
      <path d={path} stroke="var(--ink)" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />

      {/* residue nodes */}
      <g fill="var(--paper)" stroke="var(--ink)" strokeWidth={1.5}>
        {BACKBONE.map((p, i) => <circle key={i} cx={p[0]} cy={p[1]} r={5.5} />)}
      </g>

      {/* normal-mode vectors */}
      <g stroke="var(--accent)" strokeWidth={1.5}>
        {MODES.map((m, idx) => {
          const a = arrow(BACKBONE[m.i][0], BACKBONE[m.i][1], m.dx, m.dy);
          return (
            <g key={idx}>
              <line x1={a.line.x1} y1={a.line.y1} x2={a.line.x2} y2={a.line.y2} />
              <polygon points={a.head} fill="var(--accent)" stroke="none" />
            </g>
          );
        })}
      </g>

      <text x={60} y={300} fontSize={10} fill="var(--ink-mute)" letterSpacing="0.08em">NMA · NORMAL MODES</text>
      <text x={60} y={318} fontSize={9} fill="var(--ink-faint)" letterSpacing="0.06em">backbone + tertiary contacts</text>
    </svg>
  );
}
