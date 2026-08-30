import { useId } from 'react';

// ── Line chart (attendance trend) ──
export function LineChart({
  data,
  height = 120,
  color = '#3471f5',
  fill = true,
  yMin,
  yMax,
}: {
  data: number[];
  height?: number;
  color?: string;
  fill?: boolean;
  yMin?: number;
  yMax?: number;
}) {
  const id = useId();
  const w = 320;
  const h = height;
  const pad = 6;
  const min = yMin ?? Math.min(...data) - 1;
  const max = yMax ?? Math.max(...data) + 1;
  const range = max - min || 1;
  const stepX = (w - pad * 2) / (data.length - 1 || 1);
  const pts = data.map((v, i) => {
    const x = pad + i * stepX;
    const y = pad + (1 - (v - min) / range) * (h - pad * 2);
    return [x, y] as const;
  });
  const line = pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(' ');
  const area = `${line} L${pts[pts.length - 1][0].toFixed(1)},${h - pad} L${pts[0][0].toFixed(1)},${h - pad} Z`;

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full" preserveAspectRatio="none" style={{ height }}>
      <defs>
        <linearGradient id={`grad-${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.22" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      {fill && <path d={area} fill={`url(#grad-${id})`} />}
      <path d={line} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      {pts.map((p, i) => (
        <circle key={i} cx={p[0]} cy={p[1]} r="2.5" fill="#fff" stroke={color} strokeWidth="1.5" />
      ))}
    </svg>
  );
}

// ── Grouped bar chart (section comparison) ──
export function GroupedBars({
  data,
  height = 160,
  max = 100,
}: {
  data: { label: string; value: number; color?: string }[];
  height?: number;
  max?: number;
}) {
  return (
    <div className="flex items-end gap-3" style={{ height }}>
      {data.map((d, i) => {
        const pct = (d.value / max) * 100;
        return (
          <div key={i} className="flex flex-1 flex-col items-center gap-1.5">
            <span className="text-xs font-bold text-ink-700">{d.value}</span>
            <div className="flex w-full flex-1 items-end">
              <div
                className="w-full rounded-t-md transition-all duration-700 ease-out"
                style={{
                  height: `${pct}%`,
                  backgroundColor: d.color ?? '#3471f5',
                  minHeight: '4px',
                }}
              />
            </div>
            <span className="text-[10px] font-semibold text-ink-500">{d.label}</span>
          </div>
        );
      })}
    </div>
  );
}

// ── Donut chart (grade distribution / category split) ──
export function Donut({
  data,
  size = 180,
  thickness = 26,
  centerLabel,
  centerSub,
}: {
  data: { label: string; value: number; color: string }[];
  size?: number;
  thickness?: number;
  centerLabel?: string;
  centerSub?: string;
}) {
  const total = data.reduce((s, d) => s + d.value, 0) || 1;
  const r = (size - thickness) / 2;
  const c = size / 2;
  const circ = 2 * Math.PI * r;
  let offset = 0;

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        {data.map((d, i) => {
          const frac = d.value / total;
          const dash = frac * circ;
          const seg = (
            <circle
              key={i}
              cx={c}
              cy={c}
              r={r}
              fill="none"
              stroke={d.color}
              strokeWidth={thickness}
              strokeDasharray={`${dash} ${circ - dash}`}
              strokeDashoffset={-offset}
              strokeLinecap="butt"
            />
          );
          offset += dash;
          return seg;
        })}
      </svg>
      {(centerLabel || centerSub) && (
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          {centerLabel && <span className="text-2xl font-extrabold text-ink-900">{centerLabel}</span>}
          {centerSub && <span className="text-xs font-medium text-ink-500">{centerSub}</span>}
        </div>
      )}
    </div>
  );
}

// ── Stacked area / bar (progress trend over exams) ──
export function StackedTrend({
  data,
  height = 200,
}: {
  data: { exam: string; improving: number; stable: number; declining: number; needsSupport: number }[];
  height?: number;
}) {
  const series = [
    { key: 'improving', color: '#10B981' },
    { key: 'stable', color: '#2563EB' },
    { key: 'declining', color: '#F97316' },
    { key: 'needsSupport', color: '#EF4444' },
  ] as const;
  const w = 360;
  const h = height;
  const padBottom = 22;
  const padTop = 8;
  const padX = 12;
  const bw = (w - padX * 2) / (data.length || 1);

  return (
    <div className="w-full">
      <svg viewBox={`0 0 ${w} ${h}`} className="w-full" style={{ height }} preserveAspectRatio="none">
        {data.map((d, i) => {
          let acc = 0;
          const x = padX + i * bw;
          const totalVal = d.improving + d.stable + d.declining + d.needsSupport || 100;
          const chartH = h - padBottom - padTop;

          return (
            <g key={i}>
              {series.map((s) => {
                const val = (d[s.key] as number) || 0;
                const segH = (val / totalVal) * chartH;
                const y = h - padBottom - acc - segH;
                acc += segH;
                return (
                  <rect
                    key={s.key}
                    x={x + 4}
                    y={y}
                    width={Math.max(8, bw - 8)}
                    height={segH}
                    fill={s.color}
                    rx="1.5"
                  />
                );
              })}
              <text
                x={x + bw / 2}
                y={h - 4}
                textAnchor="middle"
                className="fill-ink-500 font-medium"
                style={{ fontSize: '9px' }}
              >
                {d.exam}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

// ── Scatter / bubble plot (attendance vs performance) ──
export function ScatterPlot({
  data,
  height = 240,
}: {
  data: { x: number; y: number; size: number; label: string; color?: string }[];
  height?: number;
}) {
  const w = 360;
  const h = height;
  const padL = 36;
  const padB = 28;
  const padT = 12;
  const padR = 12;
  const innerW = w - padL - padR;
  const innerH = h - padT - padB;
  const xMax = 100;
  const yMax = 100;
  const maxR = Math.max(...data.map((d) => d.size)) || 1;

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full" style={{ height }} preserveAspectRatio="none">
      {/* grid */}
      {[0, 25, 50, 75, 100].map((g) => {
        const x = padL + (g / xMax) * innerW;
        const y = padT + (1 - g / yMax) * innerH;
        return (
          <g key={g}>
            <line x1={padL} y1={y} x2={w - padR} y2={y} stroke="#eceef2" strokeWidth="1" />
            <line x1={x} y1={padT} x2={x} y2={h - padB} stroke="#eceef2" strokeWidth="1" />
            <text x={padL - 6} y={y + 3} textAnchor="end" className="fill-ink-400" style={{ fontSize: 9 }}>{g}</text>
            <text x={x} y={h - padB + 12} textAnchor="middle" className="fill-ink-400" style={{ fontSize: 9 }}>{g}</text>
          </g>
        );
      })}
      {/* axis labels */}
      <text x={w / 2} y={h - 2} textAnchor="middle" className="fill-ink-500" style={{ fontSize: 9, fontWeight: 600 }}>Attendance %</text>
      <text x={10} y={padT + innerH / 2} textAnchor="middle" className="fill-ink-500" style={{ fontSize: 9, fontWeight: 600 }} transform={`rotate(-90 10 ${padT + innerH / 2})`}>Result %</text>
      {/* bubbles */}
      {data.map((d, i) => {
        const cx = padL + (d.x / xMax) * innerW;
        const cy = padT + (1 - d.y / yMax) * innerH;
        const r = 6 + (d.size / maxR) * 14;
        return (
          <g key={i}>
            <circle cx={cx} cy={cy} r={r} fill={d.color ?? '#3471f5'} fillOpacity="0.18" stroke={d.color ?? '#3471f5'} strokeWidth="1.5" />
          </g>
        );
      })}
    </svg>
  );
}

// ── Sparkline (mini trend in KPI cards) ──
export function Sparkline({ data, color = '#3471f5' }: { data: number[]; color?: string }) {
  const w = 80;
  const h = 28;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1 || 1)) * w;
    const y = h - ((v - min) / range) * h;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full" style={{ height: h }} preserveAspectRatio="none">
      <polyline points={pts.join(' ')} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
