// Tri-modal protein figure: VDOS vibrational spectrum (left), residue contact
// graph (center), small-molecule skeleton (right). Landscape 840x504 (5/3).
//
// All computed coordinates are rounded to 2 decimals before use so the server
// and client serialize identically — same fix as StarSchemaFigure.tsx.

const r2 = (n: number) => Math.round(n * 100) / 100;

// ── VDOS spectrum (left panel, x 40..270) ───────────────────────────────────
const PEAKS = [
  { c: 90,  h: 0.35, w: 16 },
  { c: 130, h: 0.55, w: 14 },
  { c: 173, h: 1.0,  w: 13 },
  { c: 215, h: 0.4,  w: 18 },
  { c: 248, h: 0.6,  w: 15 },
];
const SX0 = 50, SX1 = 270, SBASE = 390, SAMP = 240;

function vdos(x: number): number {
  return PEAKS.reduce((s, p) => s + p.h * Math.exp(-((x - p.c) ** 2) / (2 * p.w * p.w)), 0);
}
function sy(x: number): number {
  return r2(SBASE - Math.min(vdos(x - SX0), 1.05) * SAMP);
}

// Dominant peak x in local coords -> global x
const PEAK_LOCAL_C = 173;
const PEAK_GX = SX0 + PEAK_LOCAL_C; // 223

const CURVE = (() => {
  const pts: string[] = [];
  for (let x = SX0; x <= SX1; x += 4) {
    pts.push(`${x === SX0 ? "M" : "L"} ${x} ${sy(x)}`);
  }
  return pts.join(" ");
})();

const PEAK_FILL = (() => {
  const lo = SX0 + 160, hi = SX0 + 186; // 210..236
  const pts: string[] = [`M ${lo} ${SBASE}`];
  for (let x = lo; x <= hi; x += 3) {
    pts.push(`L ${x} ${sy(x)}`);
  }
  pts.push(`L ${hi} ${SBASE} Z`);
  return pts.join(" ");
})();

// ── Contact graph (center panel, x ~310..570) ───────────────────────────────
const GRAPH_NODES: [number, number][] = [
  [330, 160], [400, 140], [470, 165], [355, 220], [425, 230],
  [495, 215], [340, 280], [415, 295], [485, 278],
];
const GRAPH_EDGES: [number, number][] = [
  [0, 1], [1, 2], [0, 3], [1, 4], [2, 5],
  [3, 4], [4, 5], [3, 6], [4, 7], [5, 8], [6, 7], [7, 8],
];

// ── Small-molecule skeleton (right panel, x ~600..800) ──────────────────────
// Pentagon ring + chain
const RING: [number, number][] = [
  [630, 310], [666, 292], [700, 314], [686, 352], [646, 352],
];
const CHAIN: [number, number][] = [
  [700, 314], [740, 298], [778, 318], [778, 318],
];
// Side bonds off chain node 1 and 2
const BOND1: [number, number, number, number] = [740, 298, 756, 278];
const BOND2: [number, number, number, number] = [778, 318, 798, 300];

export function VDOSSpectrumFigure({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 840 504"
      preserveAspectRatio="xMidYMid meet"
      fill="none"
      role="img"
      aria-label="A VDOS vibrational spectrum with one dominant peak, a residue contact graph, and a small-molecule skeleton arranged left to right."
      style={{ fontFamily: "var(--ff-mono)" }}
    >
      {/* ── Left panel: VDOS spectrum ────────────────────────────── */}
      <text x={SX0} y={80} fontSize={10} fill="var(--ink-mute)" letterSpacing="0.08em">
        VDOS SPECTRUM
      </text>

      {/* axes */}
      <g stroke="var(--rule)" strokeWidth={1}>
        <line x1={SX0} y1={SBASE} x2={SX1 + 8} y2={SBASE} />
        <line x1={SX0} y1={100} x2={SX0} y2={SBASE} />
      </g>

      {/* dominant peak fill */}
      <path d={PEAK_FILL} fill="var(--accent)" opacity={0.16} />

      {/* spectrum curve */}
      <path d={CURVE} stroke="var(--ink)" strokeWidth={2} strokeLinejoin="round" />

      {/* peak highlight: dashed vertical + dot */}
      <line
        x1={PEAK_GX}
        y1={sy(PEAK_GX)}
        x2={PEAK_GX}
        y2={SBASE}
        stroke="var(--accent)"
        strokeWidth={1.25}
        strokeDasharray="3 3"
      />
      <circle cx={PEAK_GX} cy={sy(PEAK_GX)} r={3.5} fill="var(--accent)" />

      {/* axis label */}
      <text x={SX1 - 4} y={SBASE + 18} fontSize={9} fill="var(--ink-faint)" textAnchor="end">
        ω →
      </text>

      {/* ── Center panel: residue contact graph ──────────────────── */}
      <text x={395} y={80} fontSize={10} fill="var(--ink-mute)" letterSpacing="0.08em" textAnchor="middle">
        CONTACT GRAPH
      </text>

      <g stroke="var(--ink-mute)" strokeWidth={1.25}>
        {GRAPH_EDGES.map(([a, b], i) => (
          <line
            key={i}
            x1={GRAPH_NODES[a][0]}
            y1={GRAPH_NODES[a][1]}
            x2={GRAPH_NODES[b][0]}
            y2={GRAPH_NODES[b][1]}
          />
        ))}
      </g>
      <g fill="var(--paper)" stroke="var(--ink)" strokeWidth={1.5}>
        {GRAPH_NODES.map((p, i) => (
          <circle key={i} cx={p[0]} cy={p[1]} r={6} />
        ))}
      </g>

      {/* ── Right panel: small-molecule skeleton ─────────────────── */}
      <text x={715} y={80} fontSize={9} fill="var(--ink-faint)" letterSpacing="0.06em" textAnchor="middle">
        ChemBERTa · ligand
      </text>

      <g stroke="var(--ink)" strokeWidth={1.5} strokeLinejoin="round">
        {/* ring */}
        <path d={RING.map((p, i) => `${i === 0 ? "M" : "L"} ${p[0]} ${p[1]}`).join(" ") + " Z"} />
        {/* chain */}
        <path d={CHAIN.map((p, i) => `${i === 0 ? "M" : "L"} ${p[0]} ${p[1]}`).join(" ")} />
        {/* side bonds */}
        <line x1={BOND1[0]} y1={BOND1[1]} x2={BOND1[2]} y2={BOND1[3]} />
        <line x1={BOND2[0]} y1={BOND2[1]} x2={BOND2[2]} y2={BOND2[3]} />
      </g>
      <g fill="var(--paper)" stroke="var(--ink)" strokeWidth={1.25}>
        {[...RING, ...CHAIN.slice(1)].map((p, i) => (
          <circle key={i} cx={p[0]} cy={p[1]} r={4} />
        ))}
      </g>

      {/* ── Panel dividers ───────────────────────────────────────── */}
      <line x1={295} y1={60} x2={295} y2={430} stroke="var(--rule)" strokeWidth={1} strokeDasharray="4 4" />
      <line x1={575} y1={60} x2={575} y2={430} stroke="var(--rule)" strokeWidth={1} strokeDasharray="4 4" />
    </svg>
  );
}
