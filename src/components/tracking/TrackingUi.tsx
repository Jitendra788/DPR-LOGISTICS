import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

export function TdStatCard({
  label,
  value,
  hint,
  tone = "navy",
  icon: Icon,
}: {
  label: string;
  value: number | string;
  hint?: string;
  tone?: "navy" | "amber" | "teal" | "green" | "red" | "slate";
  icon?: LucideIcon;
}) {
  return (
    <div className={`td-stat td-stat-${tone}`}>
      {Icon ? (
        <span className="td-stat-icon" aria-hidden>
          <Icon size={20} />
        </span>
      ) : null}
      <div>
        <p className="td-stat-label">{label}</p>
        <p className="td-stat-value">{value}</p>
        {hint ? <p className="td-stat-hint">{hint}</p> : null}
      </div>
    </div>
  );
}

export function TdToolbar({ children }: { children: ReactNode }) {
  return <div className="td-toolbar">{children}</div>;
}

export function TdToolBtn({
  children,
  onClick,
  variant = "default",
  disabled,
  title,
}: {
  children: ReactNode;
  onClick?: () => void;
  variant?: "default" | "primary" | "accent" | "ghost";
  disabled?: boolean;
  title?: string;
}) {
  return (
    <button type="button" className={`td-tool-btn td-tool-${variant}`} onClick={onClick} disabled={disabled} title={title}>
      {children}
    </button>
  );
}

export function TdBadge({
  children,
  tone = "slate",
}: {
  children: ReactNode;
  tone?: "slate" | "amber" | "teal" | "green" | "red" | "navy";
}) {
  return <span className={`td-badge td-badge-${tone}`}>{children}</span>;
}

export function TdModePicker({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  const modes = [
    { id: "phone", label: "Phone GPS", desc: "Driver link · best accuracy" },
    { id: "sim", label: "SIM Network", desc: "Bina app · consent required" },
    { id: "device", label: "GPS Device", desc: "Hardware IMEI ingest" },
  ] as const;

  return (
    <div className="td-mode-picker" role="radiogroup" aria-label="Tracking mode">
      {modes.map((m) => (
        <button
          key={m.id}
          type="button"
          role="radio"
          aria-checked={value === m.id}
          className={value === m.id ? "is-active" : ""}
          onClick={() => onChange(m.id)}
        >
          <strong>{m.label}</strong>
          <span>{m.desc}</span>
        </button>
      ))}
    </div>
  );
}

export function TdActionBtn({
  label,
  onClick,
  disabled,
  variant = "default",
  icon: Icon,
}: {
  label: string;
  onClick?: () => void;
  disabled?: boolean;
  variant?: "start" | "complete" | "link" | "view" | "danger" | "default";
  icon?: LucideIcon;
}) {
  return (
    <button type="button" className={`td-action-btn td-action-${variant}`} onClick={onClick} disabled={disabled} title={label}>
      {Icon ? <Icon size={14} aria-hidden /> : null}
      <span>{label}</span>
    </button>
  );
}

export function TdPanel({ title, extra, children, className = "" }: { title: string; extra?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <section className={`td-panel ${className}`}>
      <header className="td-panel-head">
        <h3>{title}</h3>
        {extra ? <div className="td-panel-extra">{extra}</div> : null}
      </header>
      <div className="td-panel-body">{children}</div>
    </section>
  );
}

export function TdLiveDot({ live = true }: { live?: boolean }) {
  return <span className={`td-live-dot ${live ? "is-live" : ""}`} aria-label={live ? "Live" : "Offline"} />;
}
