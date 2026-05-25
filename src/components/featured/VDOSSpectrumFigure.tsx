// Tri-modal protein figure: a VDOS vibrational spectrum (the novel signal),
// a residue contact graph, and a small-molecule skeleton.
const PEAKS = [
  { c: 90, h: 0.35, w: 16 },
  { c: 150, h: 0.55, w: 14 },
  { c: 215, h: 1.0, w: 13 },
  { c: 285, h: 0.4, w: 18 },
  { c: 355, h: 0.6, w: 15 },
  { c: 405, h: 0.3, w: 12 },
];
const X0 = 40, X1 = 440, BASE = 210, AMP = 140;

function vdos(x: number) {
  return PEAKS.reduce((s, p) => s + p.h * Math.exp(-((x - p.c) ** 2) / (2 * p.w * p.w)), 0);
}
function y(x: number) {
  return BASE - Math.min(vdos(x), 1.05) * AMP;
}

const CURVE = (() => {
  const pts: string[] = [];
  for (let x = X0; x <= X1; x += 4) pts.push(`${x === X0 ? "M" : "L"} ${x} ${y(x).toFixed(1)}`);
  return pts.join(" ");
})();

const PEAK_FILL = (() => {
  const lo = 186, hi = 244;
  const pts: string[] = [`M ${lo} ${BASE}`];
  for (let x = lo; x <= hi; x += 3) pts.push(`L ${x} ${y(x).toFixed(1)}`);
  pts.push(`L ${hi} ${BASE} Z`);
  return pts.join(" ");
})();

const GRAPH_NODES: [number, number][] = [
  [120, 300], [185, 280], [250, 305], [150, 350], [215, 360],
  [285, 350], [110, 390], [180, 410], [250, 405],
];
const GRAPH_EDGES: [number, number][] = [
  [0, 1], [1, 2], [0, 3], [1, 4], [2, 5], [3, 4], [4, 5], [3, 6], [4, 7], [5, 8], [6, 7], [7, 8],
];

const RING: [number, number][] = [
  [150, 500], [186, 484], [220, 506], [206, 544], [166, 544],
];
const CHAIN: [number, number][] = [[220, 506], [262, 492], [300, 512], [338, 498], [376, 518]];

export function VDOSSpectrumFigure({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 480 600"
      preserveAspectRatio="xMidYMid meet"
      fill="none"
      role="img"
      aria-label="A VDOS vibrational spectrum with one dominant peak, a residue contact graph, and a small-molecule skeleton."
      style={{ fontFamily: "var(--ff-mono)" }}
    >
      {/* spectrum axes */}
      <g stroke="var(--rule)" strokeWidth={1}>
        <line x1={X0} y1={BASE} x2={X1 + 8} y2={BASE} />
        <line x1={X0} y1={50} x2={X0} y2={BASE} />
      </g>
      {/* dominant peak fill */}
      <path d={PEAK_FILL} fill="var(--accent)" opacity={0.16} />
      {/* spectrum curve */}
      <path d={CURVE} stroke="var(--ink)" strokeWidth={2} strokeLinejoin="round" />
      <line x1={215} y1={y(215)} x2={215} y2={BASE} stroke="var(--accent)" strokeWidth={1.25} strokeDasharray="3 3" />
      <circle cx={215} cy={y(215)} r={3.5} fill="var(--accent)" />
      <text x={X0} y={40} fontSize={10} fill="var(--ink-mute)" letterSpacing="0.08em">VDOS SPECTRUM</text>
      <text x={X1 - 6} y={BASE + 18} fontSize={9} fill="var(--ink-faint)" textAnchor="end">ω →</text>

      {/* contact graph */}
      <g stroke="var(--ink-mute)" strokeWidth={1.25}>
        {GRAPH_EDGES.map(([a, b], i) => (
          <line key={i} x1={GRAPH_NODES[a][0]} y1={GRAPH_NODES[a][1]} x2={GRAPH_NODES[b][0]} y2={GRAPH_NODES[b][1]} />
        ))}
      </g>
      <g fill="var(--paper)" stroke="var(--ink)" strokeWidth={1.5}>
        {GRAPH_NODES.map((p, i) => <circle key={i} cx={p[0]} cy={p[1]} r={6} />)}
      </g>
      <text x={320} y={300} fontSize={10} fill="var(--ink-mute)" letterSpacing="0.08em">CONTACT</text>
      <text x={320} y={316} fontSize={10} fill="var(--ink-mute)" letterSpacing="0.08em">GRAPH</text>

      {/* small molecule */}
      <g stroke="var(--ink)" strokeWidth={1.5} strokeLinejoin="round">
        <path d={RING.map((p, i) => `${i === 0 ? "M" : "L"} ${p[0]} ${p[1]}`).join(" ") + " Z"} />
        <path d={CHAIN.map((p, i) => `${i === 0 ? "M" : "L"} ${p[0]} ${p[1]}`).join(" ")} />
        <line x1={290} y1={500} x2={310} y2={524} />
        <line x1={368} y1={506} x2={384} y2={530} />
      </g>
      <g fill="var(--paper)" stroke="var(--ink)" strokeWidth={1.25}>
        {[...RING, ...CHAIN.slice(1)].map((p, i) => <circle key={i} cx={p[0]} cy={p[1]} r={4} />)}
      </g>
      <text x={150} y={576} fontSize={9} fill="var(--ink-faint)" letterSpacing="0.06em">ChemBERTa · ligand</text>
    </svg>
  );
}
