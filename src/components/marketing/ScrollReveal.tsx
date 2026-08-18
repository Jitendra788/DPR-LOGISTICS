"use client";

import type { ReactNode } from "react";
import { useInView } from "@/hooks/useInView";

type Props = {
  children: ReactNode;
  className?: string;
  delay?: number;
};

export function ScrollReveal({ children, className = "", delay = 0 }: Props) {
  const { ref, inView } = useInView<HTMLDivElement>();

  return (
    <div
      ref={ref}
      className={`mkt-reveal ${inView ? "mkt-reveal-visible" : ""} ${className}`.trim()}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}
