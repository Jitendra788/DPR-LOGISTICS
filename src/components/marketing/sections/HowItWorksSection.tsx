"use client";

import { ClipboardList, MapPinned, PackageCheck, Truck } from "lucide-react";
import { howItWorksSteps } from "@/data/marketing/homepage";
import { SectionHeading } from "@/components/marketing/SectionHeading";
import { useInView } from "@/hooks/useInView";

const stepIcons = [ClipboardList, Truck, MapPinned, PackageCheck];

export function HowItWorksSection() {
  const { ref, inView } = useInView<HTMLDivElement>();

  return (
    <section className="mkt-section mkt-section-alt mkt-process-section">
      <div className="mkt-container">
        <SectionHeading
          eyebrow="How It Works"
          title="From booking to delivery — simplified"
          subtitle="Four clear steps to move your cargo with confidence."
          align="center"
        />
        <div ref={ref} className={`mkt-process-track ${inView ? "mkt-process-animate" : ""}`}>
          <div className="mkt-process-line" aria-hidden />
          <div className="mkt-process-grid">
            {howItWorksSteps.map((step, idx) => {
              const Icon = stepIcons[idx] ?? ClipboardList;
              return (
                <article key={step.num} className="mkt-process-step mkt-process-step-premium">
                  <span className="mkt-process-num">{step.num}</span>
                  <span className="mkt-process-icon">
                    <Icon aria-hidden />
                  </span>
                  <h3>{step.title}</h3>
                  <p>{step.description}</p>
                </article>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
