"use client";

import { Building2, Package, Truck, Users, Calendar } from "lucide-react";
import { useEffect, useState } from "react";
import { useInView } from "@/hooks/useInView";
import type { StatItem } from "@/data/marketing/statistics";

const statIcons: Record<string, typeof Truck> = {
  experience: Calendar,
  branches: Building2,
  vehicles: Truck,
  shipments: Package,
  customers: Users,
};

function formatValue(current: number, stat: StatItem): string {
  if (stat.display && current >= stat.value) return stat.display;
  if (stat.value >= 1000 && current >= 1000) {
    return `${Math.round(current / 1000)}K${stat.suffix}`;
  }
  return `${Math.round(current)}${stat.suffix}`;
}

export function AnimatedCounter({ stat }: { stat: StatItem }) {
  const { ref, inView } = useInView<HTMLElement>();
  const [current, setCurrent] = useState(0);
  const Icon = statIcons[stat.id] ?? Package;

  useEffect(() => {
    if (!inView) return;

    const duration = 1400;
    const start = performance.now();
    let frame: number;

    const tick = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - (1 - progress) ** 3;
      setCurrent(stat.value * eased);
      if (progress < 1) frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [inView, stat.value]);

  return (
    <article ref={ref} className="mkt-stat-card mkt-stat-card-premium">
      <span className="mkt-stat-icon" aria-hidden>
        <Icon />
      </span>
      <strong aria-label={`${stat.label}: ${formatValue(stat.value, stat)}`}>
        {formatValue(current, stat)}
      </strong>
      <span>{stat.label}</span>
    </article>
  );
}
