export function LoadingState({ label = "Loading…" }: { label?: string }) {
  return (
    <div className="mkt-state mkt-state-loading" role="status" aria-live="polite">
      <span className="mkt-spinner" aria-hidden />
      <p>{label}</p>
    </div>
  );
}

export function EmptyState({ title, description }: { title: string; description: string }) {
  return (
    <div className="mkt-state mkt-state-empty">
      <h3>{title}</h3>
      <p>{description}</p>
    </div>
  );
}

export function ErrorState({ title, description }: { title: string; description: string }) {
  return (
    <div className="mkt-state mkt-state-error" role="alert">
      <h3>{title}</h3>
      <p>{description}</p>
    </div>
  );
}
