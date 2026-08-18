import type { TrackingEvent } from "@/data/marketing/tracking";

export function ShipmentTimeline({ events }: { events: TrackingEvent[] }) {
  return (
    <ol className="mkt-timeline">
      {events.map((event, idx) => (
        <li key={event.stage} className={`mkt-timeline-item mkt-timeline-${event.status}`}>
          <span className="mkt-timeline-dot" aria-hidden />
          {idx < events.length - 1 ? <span className="mkt-timeline-line" aria-hidden /> : null}
          <div className="mkt-timeline-body">
            <div className="mkt-timeline-top">
              <strong>{event.label}</strong>
              <span className={`mkt-timeline-badge mkt-timeline-badge-${event.status}`}>
                {event.status === "completed" ? "Completed" : event.status === "current" ? "Current" : "Pending"}
              </span>
            </div>
            <p>{event.location}</p>
            {event.timestamp ? (
              <time dateTime={event.timestamp}>
                {new Date(event.timestamp).toLocaleString("en-IN", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </time>
            ) : null}
          </div>
        </li>
      ))}
    </ol>
  );
}
