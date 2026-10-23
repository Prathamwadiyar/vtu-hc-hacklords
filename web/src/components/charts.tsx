import { useState } from 'react';

/**
 * Small hand-rolled SVG chart set. Categorical hues are assigned in a fixed
 * order (blue, aqua, violet, magenta, yellow) and never cycled; this is the
 * validated dark-surface categorical palette.
 */
export const SERIES = ['#0D9488', '#7C3AED', '#0284C7', '#D97706', '#DC2626'];
export const INK = '#14213D';
export const INK_FAINT = '#64748B';
export const GRID = 'rgba(0, 0, 0, 0.06)';

export interface Series {
  name: string;
  points: { x: number; y: number }[];
  colour?: string;
}

function Tooltip({ x, y, lines, width }: {
  x: number; y: number; lines: string[]; width: number;
}) {
  const w = 168;
  const flip = x > width - w - 12;
  return (
    <g transform={`translate(${flip ? x - w - 10 : x + 10}, ${y - 8})`} pointerEvents="none">
      <rect width={w} height={16 + lines.length * 15} rx={8}
            fill="#FFFFFF" stroke="#E2E8F0"
            filter="drop-shadow(0 4px 6px rgba(0,0,0,0.07))" />
      {lines.map((l, i) => (
        <text key={i} x={10} y={16 + i * 15} fill={i === 0 ? '#14213D' : INK_FAINT}
              fontWeight={i === 0 ? 600 : 400}
              fontSize={10.5} fontFamily="var(--mono)">{l}</text>
      ))}
    </g>
  );
}

/** Multi-series line chart with a shared-x crosshair. */
export function LineChart({
  series, height = 260, xLabel, yLabel, domain, diagonal = false,
  xFormat = (v: number) => v.toFixed(2), yFormat = (v: number) => v.toFixed(2),
}: {
  series: Series[];
  height?: number;
  xLabel?: string;
  yLabel?: string;
  domain?: { x: [number, number]; y: [number, number] };
  diagonal?: boolean;
  xFormat?: (v: number) => string;
  yFormat?: (v: number) => string;
}) {
  const [hover, setHover] = useState<{ px: number; py: number; lines: string[] } | null>(null);
  const W = 640, H = height;
  const M = { t: 14, r: 78, b: 40, l: 48 };

  const all = series.flatMap((s) => s.points);
  if (!all.length) return null;
  const dx = domain?.x ?? [Math.min(...all.map((p) => p.x)), Math.max(...all.map((p) => p.x))];
  const dy = domain?.y ?? [Math.min(...all.map((p) => p.y)), Math.max(...all.map((p) => p.y))];

  const sx = (v: number) => M.l + ((v - dx[0]) / (dx[1] - dx[0] || 1)) * (W - M.l - M.r);
  const sy = (v: number) => H - M.b - ((v - dy[0]) / (dy[1] - dy[0] || 1)) * (H - M.t - M.b);
  const ticks = (d: [number, number]) =>
    Array.from({ length: 5 }, (_, i) => d[0] + ((d[1] - d[0]) * i) / 4);

  // Space the end-of-line labels so they never overlap: sort by height, then
  // push each one down until it clears the previous by MIN_GAP.
  const MIN_GAP = 12.5;
  const labelRows = series
    .map((s, i) => {
      const last = s.points[s.points.length - 1];
      return {
        name: s.name,
        colour: s.colour ?? SERIES[i % SERIES.length],
        yRaw: sy(last.y),
        y: sy(last.y),
      };
    })
    .sort((a, b) => a.y - b.y);
  for (let i = 1; i < labelRows.length; i++) {
    const gap = labelRows[i].y - labelRows[i - 1].y;
    if (gap < MIN_GAP) labelRows[i].y = labelRows[i - 1].y + MIN_GAP;
  }
  const overflow = labelRows.length
    ? labelRows[labelRows.length - 1].y - (H - M.b)
    : 0;
  if (overflow > 0) labelRows.forEach((r) => { r.y -= overflow; });

  const move = (e: React.MouseEvent<SVGSVGElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const px = ((e.clientX - rect.left) / rect.width) * W;
    if (px < M.l || px > W - M.r) { setHover(null); return; }
    const xv = dx[0] + ((px - M.l) / (W - M.l - M.r)) * (dx[1] - dx[0]);
    const lines = [`${(xLabel ?? 'x')} ${xFormat(xv)}`];
    let py = M.t + 20;
    series.forEach((s) => {
      let best = s.points[0];
      s.points.forEach((p) => {
        if (Math.abs(p.x - xv) < Math.abs(best.x - xv)) best = p;
      });
      if (best) { lines.push(`${s.name}  ${yFormat(best.y)}`); py = sy(best.y); }
    });
    setHover({ px, py, lines });
  };

  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" height={H} role="img"
         onMouseMove={move} onMouseLeave={() => setHover(null)}
         style={{ display: 'block', overflow: 'visible' }}>
      {ticks(dy).map((t, i) => (
        <g key={i}>
          <line x1={M.l} x2={W - M.r} y1={sy(t)} y2={sy(t)} stroke={GRID} />
          <text x={M.l - 8} y={sy(t) + 3.5} textAnchor="end" fill={INK_FAINT}
                fontSize={9.5} fontFamily="var(--mono)">{yFormat(t)}</text>
        </g>
      ))}
      {ticks(dx).map((t, i) => (
        <text key={i} x={sx(t)} y={H - M.b + 16} textAnchor="middle" fill={INK_FAINT}
              fontSize={9.5} fontFamily="var(--mono)">{xFormat(t)}</text>
      ))}

      {diagonal && (
        <line x1={sx(dx[0])} y1={sy(dy[0])} x2={sx(dx[1])} y2={sy(dy[1])}
              stroke="rgba(255,255,255,0.16)" strokeDasharray="4 5" />
      )}

      {series.map((s, i) => {
        const colour = s.colour ?? SERIES[i % SERIES.length];
        const d = s.points.map((p, j) =>
          `${j ? 'L' : 'M'}${sx(p.x).toFixed(1)},${sy(p.y).toFixed(1)}`).join(' ');
        return (
          <path key={s.name} d={d} fill="none" stroke={colour} strokeWidth={2}
                strokeLinejoin="round" strokeLinecap="round" />
        );
      })}

      {/* Direct labels, nudged apart: on an ROC plot several series finish at
          almost the same height and the names would otherwise sit on top of
          one another. */}
      {labelRows.map((r) => (
        <g key={r.name}>
          {Math.abs(r.y - r.yRaw) > 2 && (
            <line x1={W - M.r + 2} y1={r.yRaw} x2={W - M.r + 6} y2={r.y}
                  stroke={r.colour} strokeWidth={1} opacity={0.5} />
          )}
          <text x={W - M.r + 8} y={r.y + 3.5} fill={r.colour} fontSize={10}
                fontFamily="var(--mono)">{r.name}</text>
        </g>
      ))}

      {hover && (
        <>
          <line x1={hover.px} x2={hover.px} y1={M.t} y2={H - M.b}
                stroke="rgba(255,255,255,0.28)" />
          <Tooltip x={hover.px} y={Math.max(M.t + 12, hover.py)} lines={hover.lines} width={W} />
        </>
      )}

      {xLabel && (
        <text x={(M.l + W - M.r) / 2} y={H - 4} textAnchor="middle" fill={INK_FAINT}
              fontSize={9} fontFamily="var(--mono)" letterSpacing="0.12em">
          {xLabel.toUpperCase()}
        </text>
      )}
      {yLabel && (
        <text x={11} y={H / 2} textAnchor="middle" fill={INK_FAINT} fontSize={9}
              fontFamily="var(--mono)" letterSpacing="0.12em"
              transform={`rotate(-90 11 ${H / 2})`}>{yLabel.toUpperCase()}</text>
      )}
    </svg>
  );
}

/** Grouped bars: one group per metric, one bar per model. */
export function GroupedBars({ groups, models, height = 250 }: {
  groups: { label: string; values: number[] }[];
  models: string[];
  height?: number;
}) {
  const [hover, setHover] = useState<{ x: number; y: number; lines: string[] } | null>(null);
  const W = 640, H = height;
  const M = { t: 12, r: 12, b: 42, l: 48 };
  const gw = (W - M.l - M.r) / Math.max(1, groups.length);
  const bw = Math.min(20, (gw - 18) / Math.max(1, models.length));
  const sy = (v: number) => H - M.b - v * (H - M.t - M.b);

  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" height={H} role="img"
         onMouseLeave={() => setHover(null)} style={{ display: 'block', overflow: 'visible' }}>
      {[0, 0.25, 0.5, 0.75, 1].map((t) => (
        <g key={t}>
          <line x1={M.l} x2={W - M.r} y1={sy(t)} y2={sy(t)} stroke={GRID} />
          <text x={M.l - 8} y={sy(t) + 3.5} textAnchor="end" fill={INK_FAINT}
                fontSize={9.5} fontFamily="var(--mono)">{t.toFixed(2)}</text>
        </g>
      ))}
      {groups.map((g, gi) => (
        <g key={g.label}>
          {g.values.map((v, mi) => {
            const x = M.l + gi * gw
              + (gw - (bw + 2) * models.length) / 2 + mi * (bw + 2);
            const h = Math.max(2, (H - M.b) - sy(v));
            return (
              <rect key={mi} x={x} y={sy(v)} width={bw} height={h} rx={4}
                    fill={SERIES[mi % SERIES.length]}
                    onMouseEnter={() => setHover({
                      x: x + bw / 2, y: sy(v),
                      lines: [g.label, `${models[mi]}  ${v.toFixed(4)}`],
                    })} />
            );
          })}
          <text x={M.l + gi * gw + gw / 2} y={H - M.b + 18} textAnchor="middle"
                fill={INK} fontSize={10.5}>{g.label}</text>
        </g>
      ))}
      {hover && <Tooltip x={hover.x} y={hover.y} lines={hover.lines} width={W} />}
    </svg>
  );
}

/** Horizontal bars in a single sequential hue, darkest at the top. */
export function HBars({ rows, height = 320, format = (v: number) => v.toFixed(3) }: {
  rows: { label: string; value: number }[];
  height?: number;
  format?: (v: number) => string;
}) {
  const max = Math.max(...rows.map((r) => r.value), 1e-9);
  return (
    <div style={{ display: 'grid', gap: 6, maxHeight: height, overflowY: 'auto',
                  paddingRight: 4 }}>
      {rows.map((r) => (
        <div key={r.label} style={{ display: 'grid', gridTemplateColumns: '1fr 56px',
                                    gap: 10, alignItems: 'center' }}>
          <div style={{ position: 'relative', height: 21 }}>
            <div style={{
              position: 'absolute', inset: '3px auto 3px 0',
              width: `${Math.max(2, (r.value / max) * 100)}%`, borderRadius: 4,
              background: `color-mix(in oklab, ${SERIES[0]} ${28 + (r.value / max) * 72}%, #16233a)`,
            }} />
            <span style={{ position: 'relative', fontSize: 11.5, color: 'var(--ink)',
                           lineHeight: '21px', paddingLeft: 9 }}>{r.label}</span>
          </div>
          <span className="mono" style={{ fontSize: 10.5, textAlign: 'right',
                                          color: INK_FAINT }}>{format(r.value)}</span>
        </div>
      ))}
    </div>
  );
}

export function Legend({ items }: { items: { name: string; colour: string }[] }) {
  return (
    <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginTop: 12 }}>
      {items.map((i) => (
        <span key={i.name} style={{ display: 'inline-flex', alignItems: 'center', gap: 7,
                                    fontSize: 11.5, color: INK }}>
          <span style={{ width: 10, height: 10, borderRadius: 3, background: i.colour }} />
          {i.name}
        </span>
      ))}
    </div>
  );
}

/** 2x2 confusion matrix as a small heat grid. */
export function Confusion({ c }: { c: { tn: number; fp: number; fn: number; tp: number } }) {
  const cells = [
    { l: 'True benign', v: c.tn }, { l: 'False pathogenic', v: c.fp },
    { l: 'False benign', v: c.fn }, { l: 'True pathogenic', v: c.tp },
  ];
  const max = Math.max(...cells.map((x) => x.v), 1);
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
      {cells.map((x) => (
        <div key={x.l} style={{
          padding: '14px 12px', borderRadius: 8,
          background: `color-mix(in oklab, ${SERIES[0]} ${8 + (x.v / max) * 40}%, #FFFFFF)`,
          border: '1px solid var(--line)',
        }}>
          <div className="mono" style={{ fontSize: 19, fontWeight: 700, color: 'var(--ink)' }}>{x.v.toLocaleString()}</div>
          <div style={{ fontSize: 11, color: INK_FAINT, marginTop: 3 }}>{x.l}</div>
        </div>
      ))}
    </div>
  );
}

/** Reusable SVG Donut Chart with center summary and hover tooltip */
export function DonutChart({
  data,
  size = 200,
  strokeWidth = 26,
  centerTitle = 'Total',
  centerValue,
}: {
  data: { label: string; count: number; color: string }[];
  size?: number;
  strokeWidth?: number;
  centerTitle?: string;
  centerValue?: string | number;
}) {
  const [hovered, setHovered] = useState<number | null>(null);
  const total = data.reduce((sum, d) => sum + d.count, 0) || 1;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  let currentAngle = 0;
  const arcs = data.map((item, idx) => {
    const fraction = item.count / total;
    const strokeDasharray = `${fraction * circumference} ${circumference}`;
    const strokeDashoffset = -currentAngle * circumference;
    currentAngle += fraction;
    return {
      ...item,
      strokeDasharray,
      strokeDashoffset,
      idx,
    };
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>
      <div style={{ position: 'relative', width: size, height: size }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ transform: 'rotate(-90deg)' }}>
          {/* Background Track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="transparent"
            stroke="var(--line-soft)"
            strokeWidth={strokeWidth}
          />
          {arcs.map((arc) => (
            <circle
              key={arc.label}
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="transparent"
              stroke={arc.color}
              strokeWidth={hovered === arc.idx ? strokeWidth + 4 : strokeWidth}
              strokeDasharray={arc.strokeDasharray}
              strokeDashoffset={arc.strokeDashoffset}
              style={{
                cursor: 'pointer',
                transition: 'stroke-width 0.2s ease, opacity 0.2s ease',
                opacity: hovered !== null && hovered !== arc.idx ? 0.45 : 1,
              }}
              onMouseEnter={() => setHovered(arc.idx)}
              onMouseLeave={() => setHovered(null)}
            />
          ))}
        </svg>
        {/* Center label */}
        <div style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          pointerEvents: 'none',
        }}>
          <span style={{ fontSize: 11, fontFamily: 'var(--mono)', color: 'var(--ink-faint)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            {hovered !== null ? data[hovered].label : centerTitle}
          </span>
          <span style={{ fontSize: 22, fontWeight: 700, fontFamily: 'var(--mono)', color: 'var(--ink)' }}>
            {hovered !== null ? data[hovered].count : (centerValue ?? total)}
          </span>
        </div>
      </div>

      {/* Legend */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px 14px', justifyContent: 'center' }}>
        {data.map((d, i) => (
          <div
            key={d.label}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              cursor: 'pointer',
              opacity: hovered !== null && hovered !== i ? 0.4 : 1,
              transition: 'opacity 0.2s',
            }}
            onMouseEnter={() => setHovered(i)}
            onMouseLeave={() => setHovered(null)}
          >
            <span style={{ width: 9, height: 9, borderRadius: '50%', background: d.color }} />
            <span style={{ fontSize: 11.5, color: 'var(--ink-dim)' }}>
              {d.label} <strong style={{ color: 'var(--ink)' }}>({d.count})</strong>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
