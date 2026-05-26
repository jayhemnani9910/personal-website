/* FDE Architecture Diagram, ported from diagram.jsx, reskinned to editorial theme.
   SVG-only, no deps. kindColors use CSS vars + two semantic named colors. */

import type { Architecture } from "./fdeData";

interface Props {
  architecture: Architecture;
}

const BOX_W = 168;
const BOX_H = 78;
const PAD = 30;

// kind -> { stroke (CSS var or named), fill (color-mix) }
// Fills use inline style color-mix where supported; fallback is a low-opacity solid.
const KIND_COLORS: Record<string, { stroke: string; fill: string }> = {
  ui:       { stroke: 'var(--accent)',        fill: 'color-mix(in srgb, var(--accent) 8%, transparent)' },
  service:  { stroke: 'var(--ink-soft)',      fill: 'color-mix(in srgb, var(--ink-soft) 6%, transparent)' },
  agent:    { stroke: '#3f8f63',              fill: 'color-mix(in srgb, #3f8f63 8%, transparent)' },
  data:     { stroke: '#7c3aed',              fill: 'color-mix(in srgb, #7c3aed 8%, transparent)' },
  external: { stroke: 'var(--ink-mute)',      fill: 'color-mix(in srgb, var(--ink-mute) 6%, transparent)' },
};

function pathFor(
  from: { x: number; y: number },
  to: { x: number; y: number }
): { d: string; labelX: number; labelY: number } {
  const fcx = from.x + BOX_W / 2;
  const fcy = from.y + BOX_H / 2;
  const tcx = to.x + BOX_W / 2;
  const tcy = to.y + BOX_H / 2;
  const dx = tcx - fcx;
  const dy = tcy - fcy;

  let fromX: number, fromY: number, toX: number, toY: number;

  if (Math.abs(dx) > Math.abs(dy)) {
    if (dx > 0) {
      fromX = from.x + BOX_W; fromY = fcy;
      toX = to.x; toY = tcy;
    } else {
      fromX = from.x; fromY = fcy;
      toX = to.x + BOX_W; toY = tcy;
    }
    const mx = (fromX + toX) / 2;
    return {
      d: `M ${fromX} ${fromY} C ${mx} ${fromY}, ${mx} ${toY}, ${toX} ${toY}`,
      labelX: (fromX + toX) / 2,
      labelY: (fromY + toY) / 2,
    };
  } else {
    if (dy > 0) {
      fromX = fcx; fromY = from.y + BOX_H;
      toX = tcx; toY = to.y;
    } else {
      fromX = fcx; fromY = from.y;
      toX = tcx; toY = to.y + BOX_H;
    }
    const my = (fromY + toY) / 2;
    return {
      d: `M ${fromX} ${fromY} C ${fromX} ${my}, ${toX} ${my}, ${toX} ${toY}`,
      labelX: (fromX + toX) / 2,
      labelY: (fromY + toY) / 2,
    };
  }
}

export function FdeArchDiagram({ architecture }: Props) {
  if (!architecture || !architecture.components) return null;

  const comps = architecture.components;
  const edges = architecture.edges || [];

  const maxX = Math.max(...comps.map(c => c.x + BOX_W)) + PAD;
  const maxY = Math.max(...comps.map(c => c.y + BOX_H)) + PAD + 20;

  const byId = Object.fromEntries(comps.map(c => [c.id, c]));

  return (
    <div className="fde-arch-canvas" role="img" aria-label="System architecture diagram">
      <svg
        viewBox={`0 0 ${maxX} ${maxY}`}
        width="100%"
        style={{ maxWidth: maxX, height: 'auto', minWidth: 760 }}
        aria-hidden="true"
      >
        <defs>
          {/* Arrowhead for solid edges */}
          <marker id="fde-arr" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="8" markerHeight="8" orient="auto-start-reverse">
            <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--ink-faint)" />
          </marker>
          {/* Arrowhead for dashed (retrieval/feedback) edges */}
          <marker id="fde-arr-d" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="8" markerHeight="8" orient="auto-start-reverse">
            <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--accent)" />
          </marker>
        </defs>

        {/* Edges */}
        {edges.map((e, i) => {
          const f = byId[e.from];
          const t = byId[e.to];
          if (!f || !t) return null;
          const { d, labelX, labelY } = pathFor(f, t);
          const isDashed = !!e.dashed;
          return (
            <g key={i}>
              <path
                d={d}
                fill="none"
                stroke={isDashed ? 'var(--accent)' : 'var(--ink-faint)'}
                strokeOpacity={isDashed ? 0.7 : 0.5}
                strokeWidth={1.4}
                strokeDasharray={isDashed ? '5 4' : undefined}
                markerEnd={isDashed ? 'url(#fde-arr-d)' : 'url(#fde-arr)'}
                style={{ animation: `fde-dashIn 0.6s ease ${i * 0.06}s both` }}
              />
              {e.label && (
                <g style={{ animation: `fde-fadeIn 0.4s ease ${0.3 + i * 0.06}s both` }}>
                  <rect
                    x={labelX - e.label.length * 3.4 - 6}
                    y={labelY - 8}
                    width={e.label.length * 6.8 + 12}
                    height={16}
                    fill="var(--paper)"
                    rx={2}
                  />
                  <text
                    x={labelX}
                    y={labelY + 3.5}
                    fontFamily="var(--ff-mono)"
                    fontSize="10"
                    fill="var(--ink-mute)"
                    textAnchor="middle"
                  >
                    {e.label}
                  </text>
                </g>
              )}
            </g>
          );
        })}

        {/* Boxes */}
        {comps.map((c, i) => {
          const col = KIND_COLORS[c.kind] || KIND_COLORS.service;
          return (
            <g
              key={c.id}
              style={{ animation: `fde-popIn 0.4s ease ${i * 0.05}s both` }}
            >
              <rect
                x={c.x}
                y={c.y}
                width={BOX_W}
                height={BOX_H}
                fill={col.fill}
                stroke={col.stroke}
                strokeWidth="1.2"
                rx="3"
              />
              {/* Kind tab header bar */}
              <rect
                x={c.x}
                y={c.y}
                width={BOX_W}
                height={16}
                fill={col.stroke}
                opacity="0.18"
                rx="3"
              />
              <rect
                x={c.x}
                y={c.y + 10}
                width={BOX_W}
                height={6}
                fill={col.stroke}
                opacity="0.18"
              />
              <text
                x={c.x + 9}
                y={c.y + 11.5}
                fontFamily="var(--ff-mono)"
                fontSize="9"
                fill={col.stroke}
                letterSpacing="0.14em"
              >
                {(c.kind || 'service').toUpperCase()}
              </text>
              {/* Component name */}
              <text
                x={c.x + BOX_W / 2}
                y={c.y + 38}
                fontFamily="var(--ff-body)"
                fontSize="14"
                fontWeight="500"
                fill="var(--ink)"
                textAnchor="middle"
              >
                {c.name}
              </text>
              {/* Sub-label */}
              {c.sub && (
                <text
                  x={c.x + BOX_W / 2}
                  y={c.y + 56}
                  fontFamily="var(--ff-mono)"
                  fontSize="10"
                  fill="var(--ink-mute)"
                  textAnchor="middle"
                >
                  {c.sub}
                </text>
              )}
            </g>
          );
        })}

        <style>{`
          @keyframes fde-popIn {
            from { opacity: 0; transform: translateY(8px) scale(0.96); }
            to   { opacity: 1; transform: translateY(0) scale(1); }
          }
          @keyframes fde-fadeIn {
            from { opacity: 0; }
            to   { opacity: 1; }
          }
          @keyframes fde-dashIn {
            from { stroke-dashoffset: 200; opacity: 0; }
            to   { stroke-dashoffset: 0; opacity: 1; }
          }
          @media (prefers-reduced-motion: reduce) {
            .fde-arch-canvas g,
            .fde-arch-canvas path { animation: none !important; }
          }
        `}</style>
      </svg>

      <div className="fde-arch-legend" aria-label="Architecture legend">
        <span><span className="fde-swatch" style={{ borderColor: 'var(--accent)' }} />UI surface</span>
        <span><span className="fde-swatch" style={{ borderColor: '#3f8f63' }} />Agent / model</span>
        <span><span className="fde-swatch" style={{ borderColor: 'var(--ink-soft)' }} />Service</span>
        <span><span className="fde-swatch" style={{ borderColor: '#7c3aed' }} />Data store</span>
        <span><span className="fde-swatch" style={{ borderColor: 'var(--ink-mute)' }} />External system</span>
        <span style={{ marginLeft: 'auto' }}>-- dashed = retrieve / feedback</span>
      </div>
    </div>
  );
}
