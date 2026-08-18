import { statistics } from "@/data/marketing/statistics";
import { AnimatedCounter } from "./AnimatedCounter";

export function Statistics() {
  return (
    <section className="mkt-stats mkt-trust-strip" aria-label="Company statistics">
      <div className="mkt-container mkt-stats-grid">
        {statistics.map((stat) => (
          <AnimatedCounter key={stat.id} stat={stat} />
        ))}
      </div>
    </section>
  );
}
