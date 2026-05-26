type DimTable = { x: number; y: number; label: string; cols: string[] };

const FACT = { x: 348, y: 118, w: 144, h: 132 };
const FACT_CX = FACT.x + FACT.w / 2;
const FACT_CY = FACT.y + FACT.h / 2;

const DIMS: DimTable[] = [
  { x: 56, y: 40, label: "DIM_SYMBOL", cols: ["ticker", "name", "sector"] },
  { x: 656, y: 40, label: "DIM_DATE", cols: ["date_id", "year", "quarter"] },
  { x: 56, y: 232, label: "DIM_SOURCE", cols: ["src_id", "feed", "latency"] },
  { x: 656, y: 232, label: "DIM_EXCHANGE", cols: ["mic", "tz", "region"] },
];
const DIM_W = 128;
const ROW_H = 18;

const FACT_COLS = ["ts", "open", "high", "low", "close", "volume"];

// 25-year candlestick band along the base. Coordinates are rounded because
// Math.sin is not bit-identical between the Node server and the browser, and
// the raw floats would otherwise serialize differently and break hydration.
const r2 = (n: number) => Math.round(n * 100) / 100;
const CANDLES = Array.from({ length: 46 }, (_, i) => {
  const seed = Math.sin(i * 12.9898) * 43758.5453;
  const rand = seed - Math.floor(seed);
  const rand2 = (Math.sin(i * 4.137) * 9123.17) % 1;
  const mid = 330 + (rand - 0.5) * 14;
  const half = 4 + Math.abs(rand2) * 7;
  const top = r2(mid - half);
  const bot = r2(mid + half);
  const cy = r2((top + bot) / 2);
  const wick = r2(half + 4);
  return {
    x: r2(70 + i * 15.6),
    top,
    bot,
    rectH: r2(Math.max(bot - top, 2)),
    wickTop: r2(cy - wick),
    wickBot: r2(cy + wick),
    up: i % 3 === 0,
  };
});

function dimHeight(cols: string[]) {
  return ROW_H + cols.length * ROW_H + 10;
}

export function StarSchemaFigure({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 840 360"
      preserveAspectRatio="xMidYMid meet"
      fill="none"
      role="img"
      aria-label="Star schema: a central ticks fact table joined to symbol, date, source, and exchange dimensions, over a 25-year candlestick band."
      style={{ fontFamily: "var(--ff-mono)" }}
    >
      {/* connectors fact -> dims */}
      <g stroke="var(--ink-mute)" strokeWidth={1.25}>
        {DIMS.map((d) => {
          const dcx = d.x + DIM_W / 2;
          const dcy = d.y + dimHeight(d.cols) / 2;
          return <line key={d.label} x1={FACT_CX} y1={FACT_CY} x2={dcx} y2={dcy} />;
        })}
      </g>
      <g fill="var(--accent)">
        {DIMS.map((d) => {
          const dcx = d.x + DIM_W / 2;
          const dcy = d.y + dimHeight(d.cols) / 2;
          return <circle key={d.label} cx={dcx} cy={dcy} r={2.5} />;
        })}
        <circle cx={FACT_CX} cy={FACT_CY} r={3} />
      </g>

      {/* dimension tables */}
      {DIMS.map((d) => {
        const h = dimHeight(d.cols);
        return (
          <g key={d.label}>
            <rect x={d.x} y={d.y} width={DIM_W} height={h} rx={3} fill="var(--paper)" stroke="var(--ink)" strokeWidth={1.25} />
            <rect x={d.x} y={d.y} width={DIM_W} height={ROW_H} fill="var(--rule-soft)" />
            <line x1={d.x} y1={d.y + ROW_H} x2={d.x + DIM_W} y2={d.y + ROW_H} stroke="var(--ink)" strokeWidth={1.25} />
            <text x={d.x + 8} y={d.y + 13} fontSize={10} fill="var(--ink)" fontWeight={600} letterSpacing="0.04em">{d.label}</text>
            {d.cols.map((c, i) => (
              <text key={c} x={d.x + 8} y={d.y + ROW_H + 14 + i * ROW_H} fontSize={9} fill="var(--ink-mute)">{c}</text>
            ))}
          </g>
        );
      })}

      {/* fact table */}
      <g>
        <rect x={FACT.x} y={FACT.y} width={FACT.w} height={FACT.h} rx={3} fill="var(--paper)" stroke="var(--accent)" strokeWidth={1.75} />
        <rect x={FACT.x} y={FACT.y} width={FACT.w} height={ROW_H + 2} fill="var(--accent)" />
        <text x={FACT.x + 10} y={FACT.y + 14} fontSize={11} fill="var(--accent-ink)" fontWeight={600} letterSpacing="0.04em">FCT_TICKS</text>
        {FACT_COLS.map((c, i) => (
          <text key={c} x={FACT.x + 10} y={FACT.y + ROW_H + 18 + i * ROW_H} fontSize={9.5} fill="var(--ink)">{c}</text>
        ))}
      </g>

      {/* candlestick band */}
      <g>
        {CANDLES.map((c, i) => (
          <g key={i} stroke={c.up ? "var(--accent)" : "var(--ink-mute)"} strokeWidth={1}>
            <line x1={c.x} y1={c.wickTop} x2={c.x} y2={c.wickBot} />
            <rect x={r2(c.x - 3)} y={c.top} width={6} height={c.rectH} fill={c.up ? "var(--accent)" : "var(--paper)"} />
          </g>
        ))}
      </g>
    </svg>
  );
}
