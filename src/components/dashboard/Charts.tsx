"use client";

type BarItem = { label: string; value: number };

export function BarChart({ data, color = "#0f766e" }: { data: BarItem[]; color?: string }) {
  const max = Math.max(1, ...data.map((d) => d.value));
  const empty = data.every((d) => d.value === 0);

  return (
    <div className="erp-chart">
      {empty ? <p className="erp-empty">No data for this period</p> : null}
      <div className="erp-bars" role="img" aria-label="Bar chart">
        {data.map((d) => (
          <div key={d.label} className="erp-bar-col">
            <div className="erp-bar-track">
              <div
                className="erp-bar"
                style={{ height: `${(d.value / max) * 100}%`, background: color }}
                title={`${d.label}: ${d.value}`}
              />
            </div>
            <span>{d.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function DonutChart({
  items,
}: {
  items: { label: string; value: number; color: string }[];
}) {
  const total = items.reduce((s, i) => s + i.value, 0);
  if (!total) return <p className="erp-empty">No records yet</p>;

  const r = 42;
  const c = 2 * Math.PI * r;
  let offset = 0;
  const slices = items.map((item) => {
    const len = (item.value / total) * c;
    const slice = { ...item, dash: `${len} ${c - len}`, offset };
    offset += len;
    return slice;
  });

  return (
    <div className="erp-donut-wrap">
      <svg viewBox="0 0 120 120" className="erp-donut" aria-hidden>
        <circle cx="60" cy="60" r={r} fill="none" stroke="#eef2f6" strokeWidth="14" />
        {slices.map((s) => (
          <circle
            key={s.label}
            cx="60"
            cy="60"
            r={r}
            fill="none"
            stroke={s.color}
            strokeWidth="14"
            strokeDasharray={s.dash}
            strokeDashoffset={-s.offset}
            transform="rotate(-90 60 60)"
            strokeLinecap="butt"
          />
        ))}
        <text x="60" y="56" textAnchor="middle" className="erp-donut-num">
          {total}
        </text>
        <text x="60" y="72" textAnchor="middle" className="erp-donut-sub">
          Total
        </text>
      </svg>
      <ul className="erp-legend">
        {slices.map((s) => (
          <li key={s.label}>
            <i style={{ background: s.color }} />
            <span>{s.label}</span>
            <strong>{s.value}</strong>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function SparkLine({ values, color = "#0f766e" }: { values: number[]; color?: string }) {
  const w = 280;
  const h = 72;
  const max = Math.max(1, ...values);
  const min = 0;
  const pts = values.map((v, i) => {
    const x = values.length <= 1 ? 0 : (i / (values.length - 1)) * (w - 8) + 4;
    const y = h - 8 - ((v - min) / (max - min || 1)) * (h - 16);
    return `${x},${y}`;
  });
  const area = `4,${h - 8} ${pts.join(" ")} ${w - 4},${h - 8}`;
  const empty = values.every((v) => v === 0);

  return (
    <div className="erp-chart">
      {empty ? <p className="erp-empty">No monthly trend yet</p> : null}
      <svg viewBox={`0 0 ${w} ${h}`} className="erp-spark" role="img" aria-label="Monthly trend">
        <polyline fill={`${color}22`} stroke="none" points={area} />
        <polyline fill="none" stroke={color} strokeWidth="2.5" points={pts.join(" ")} strokeLinejoin="round" />
      </svg>
    </div>
  );
}
