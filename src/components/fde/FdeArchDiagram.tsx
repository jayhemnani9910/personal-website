/* FDE Architecture Diagram, ported from diagram.jsx, reskinned to the Desk design.
   SVG-only, no deps. Every colour is a --tr-* token. */

import type { Architecture } from "./fdeData";

interface Props {
  architecture?: Architecture | undefined;
}

const BOX_W = 168;
const BOX_H = 78;
const PAD = 30;
// What fits inside BOX_W: the name is 13px Bricolage bold, the caption 10px mono.
const NAME_MAX = 22;
const SUB_MAX = 26;
// How far apart opposite edges (A -> B and B -> A) are drawn.
const REVERSE_OFFSET = 10;

function clip(text: string, max: number): string {
  return text.length > max ? `${text.slice(0, max - 1).trimEnd()}…` : text;
}

type Box = { x: number; y: number };

function overlapsBox(x: number, y: number, halfW: number, halfH: number, b: Box): boolean {
  return x + halfW > b.x && x - halfW < b.x + BOX_W && y + halfH > b.y && y - halfH < b.y + BOX_H;
}

// kind -> { stroke, fill, label }. The fill is drawn over an opaque card base so
// edges passing behind a box do not show through. Tomato is the only saturated
// colour, so node TYPES are encoded by ink tier + their mono labels, not by five
// hues. UI (the entry the human acts on) is the one tomato; the rest step down
// through the ink tiers. Service and data share a tier, so the legend lists them
// as one entry and the box header names which. `label` is the header text: on
// the UI box's tomato band even tomato-ink falls under 4.5:1 at 9px, so it is ink.
const KIND_COLORS: Record<string, { stroke: string; fill: string; label: string }> = {
  ui:       { stroke: 'var(--tr-accent)',     fill: 'var(--tr-accent-soft)', label: 'var(--tr-text)' },
  agent:    { stroke: 'var(--tr-text)',       fill: 'var(--tr-surface-1)',   label: 'var(--tr-text)' },
  service:  { stroke: 'var(--tr-text-mute)',  fill: 'var(--tr-surface-1)',   label: 'var(--tr-text-mute)' },
  data:     { stroke: 'var(--tr-text-mute)',  fill: 'var(--tr-surface-1)',   label: 'var(--tr-text-mute)' },
  external: { stroke: 'var(--tr-text-faint)', fill: 'var(--tr-surface-1)',   label: 'var(--tr-text-faint)' },
};

function pathFor(
  from: Box,
  to: Box,
  offset = 0
): { d: string; labelX: number; labelY: number } {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  // Shift both ends sideways to the direction of travel.
  const horizontal = Math.abs(dx) > Math.abs(dy);
  const fcx = from.x + BOX_W / 2 + (horizontal ? 0 : offset);
  const fcy = from.y + BOX_H / 2 + (horizontal ? offset : 0);
  const tcx = to.x + BOX_W / 2 + (horizontal ? 0 : offset);
  const tcy = to.y + BOX_H / 2 + (horizontal ? offset : 0);

  let fromX: number, fromY: number, toX: number, toY: number;

  if (horizontal) {
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
  if (!architecture) return null;

  const comps = architecture.components ?? [];
  const edges = architecture.edges ?? [];

  // Math.max of nothing is -Infinity, which is not a viewBox.
  if (comps.length === 0) {
    return (
      <p className="font-mono text-[12px] text-tr-text-mute">
        {"// no components to draw."}
      </p>
    );
  }

  const maxX = Math.max(...comps.map(c => c.x + BOX_W)) + PAD;
  const maxY = Math.max(...comps.map(c => c.y + BOX_H)) + PAD + 20;

  const byId = Object.fromEntries(comps.map(c => [c.id, c]));
  const pairs = new Set(edges.map(e => `${e.from}>${e.to}`));

  const drawn = edges.flatMap((e, i) => {
    const f = byId[e.from];
    const t = byId[e.to];
    // A self-loop has no curve to draw: it would run under its own box.
    if (!f || !t || f === t) return [];
    // Opposite edges would share one curve, and one label would hide the other.
    const offset = pairs.has(`${e.to}>${e.from}`) ? (e.from < e.to ? REVERSE_OFFSET : -REVERSE_OFFSET) : 0;
    const { d, labelX, labelY } = pathFor(f, t, offset);
    // A label whose midpoint lands on a third box is lifted into the gap above
    // or below it, so it never sits on that box's text.
    let y = labelY;
    if (e.label) {
      const halfW = e.label.length * 3.4 + 6;
      const blocker = comps.find(c => c !== f && c !== t && overlapsBox(labelX, y, halfW, 8, c));
      if (blocker) {
        const above = blocker.y - 12;
        const below = blocker.y + BOX_H + 12;
        y = Math.abs(above - y) <= Math.abs(below - y) ? above : below;
      }
    }
    return [{ e, i, d, labelX, labelY: y, from: f, to: t }];
  });

  return (
    // Scrolls sideways on a phone, so it is a named, focusable region; the svg
    // itself is aria-hidden.
    <div tabIndex={0} role="region" aria-label="Architecture diagram" className="fde-arch-canvas scroll-hint relative overflow-x-auto rounded-[var(--tr-r-lg)] border-[1.5px] border-tr-hairline bg-tr-bg p-5">
      <svg
        viewBox={`0 0 ${maxX} ${maxY}`}
        width="100%"
        style={{ maxWidth: maxX, height: 'auto', minWidth: 760 }}
        aria-hidden="true"
      >
        <defs>
          {/* Arrowhead for solid edges */}
          <marker id="fde-arr" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="8" markerHeight="8" orient="auto-start-reverse">
            <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--tr-text-faint)" />
          </marker>
          {/* Arrowhead for dashed (retrieval/feedback) edges */}
          <marker id="fde-arr-d" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="8" markerHeight="8" orient="auto-start-reverse">
            <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--tr-accent)" />
          </marker>
        </defs>

        {/* Edges, under the boxes */}
        {drawn.map(({ e, i, d }) => {
          const isDashed = !!e.dashed;
          return (
            <path
              key={i}
              d={d}
              fill="none"
              stroke={isDashed ? 'var(--tr-accent)' : 'var(--tr-text-faint)'}
              strokeWidth={1.5}
              strokeDasharray={isDashed ? '5 4' : undefined}
              markerEnd={isDashed ? 'url(#fde-arr-d)' : 'url(#fde-arr)'}
              style={{ animation: `fde-dashIn 0.6s ease ${i * 0.06}s both` }}
            />
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
              <title>{c.sub ? `${c.name}: ${c.sub}` : c.name}</title>
              {/* Opaque base, so an edge routed behind the box stays behind it */}
              <rect x={c.x} y={c.y} width={BOX_W} height={BOX_H} fill="var(--tr-surface-1)" rx="8" />
              <rect
                x={c.x}
                y={c.y}
                width={BOX_W}
                height={BOX_H}
                fill={col.fill}
                stroke={col.stroke}
                strokeWidth="1.5"
                rx="8"
              />
              {/* Kind tab header bar */}
              <rect
                x={c.x}
                y={c.y}
                width={BOX_W}
                height={16}
                fill={col.stroke}
                opacity="0.14"
                rx="8"
              />
              <rect
                x={c.x}
                y={c.y + 8}
                width={BOX_W}
                height={8}
                fill={col.stroke}
                opacity="0.14"
              />
              <text
                x={c.x + 9}
                y={c.y + 11.5}
                fontFamily="var(--ff-mono)"
                fontSize="9"
                fill={col.label}
                letterSpacing="0.1em"
              >
                {(c.kind || 'service').toUpperCase()}
              </text>
              {/* Component name */}
              <text
                x={c.x + BOX_W / 2}
                y={c.y + 38}
                fontFamily="var(--ff-body)"
                fontSize="13"
                fontWeight="700"
                fill="var(--tr-text)"
                textAnchor="middle"
              >
                {clip(c.name, NAME_MAX)}
              </text>
              {/* Sub-label */}
              {c.sub && (
                <text
                  x={c.x + BOX_W / 2}
                  y={c.y + 56}
                  fontFamily="var(--ff-mono)"
                  fontSize="10"
                  fill="var(--tr-text-mute)"
                  textAnchor="middle"
                >
                  {clip(c.sub, SUB_MAX)}
                </text>
              )}
            </g>
          );
        })}

        {/* Edge labels, over everything */}
        {drawn.map(({ e, i, labelX, labelY }) =>
          e.label ? (
            <g key={i} style={{ animation: `fde-fadeIn 0.4s ease ${0.3 + i * 0.06}s both` }}>
              <rect
                x={labelX - e.label.length * 3.4 - 6}
                y={labelY - 8}
                width={e.label.length * 6.8 + 12}
                height={16}
                fill="var(--tr-bg)"
                rx={4}
              />
              <text
                x={labelX}
                y={labelY + 3.5}
                fontFamily="var(--ff-mono)"
                fontSize="10"
                fill="var(--tr-text-mute)"
                textAnchor="middle"
              >
                {e.label}
              </text>
            </g>
          ) : null
        )}

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

      {/* The drawing is hidden from screen readers; this is what it says. */}
      <div className="sr-only">
        <ul aria-label="Components">
          {comps.map(c => (
            <li key={c.id}>{c.name} ({c.kind}){c.sub ? `: ${c.sub}` : ''}</li>
          ))}
        </ul>
        {drawn.length > 0 && (
          <ul aria-label="Flows">
            {drawn.map(({ e, i, from, to }) => (
              <li key={i}>
                {from.name} → {to.name}{e.label ? `: ${e.label}` : ''}{e.dashed ? ' (retrieve / feedback)' : ''}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* A key to the drawing only, so hidden along with it. */}
      <div
        className="mt-3.5 flex flex-wrap gap-3.5 font-mono text-[11px] text-tr-text-mute"
        aria-hidden="true"
      >
        <span><span className="mr-1.5 inline-block size-2.5 rounded-[3px] border-[1.5px] align-middle" style={{ borderColor: 'var(--tr-accent)' }} />UI surface</span>
        <span><span className="mr-1.5 inline-block size-2.5 rounded-[3px] border-[1.5px] align-middle" style={{ borderColor: 'var(--tr-text)' }} />Agent / model</span>
        <span><span className="mr-1.5 inline-block size-2.5 rounded-[3px] border-[1.5px] align-middle" style={{ borderColor: 'var(--tr-text-mute)' }} />Service / data store</span>
        <span><span className="mr-1.5 inline-block size-2.5 rounded-[3px] border-[1.5px] align-middle" style={{ borderColor: 'var(--tr-text-faint)' }} />External system</span>
        <span className="ml-auto">-- dashed = retrieve / feedback</span>
      </div>
    </div>
  );
}
