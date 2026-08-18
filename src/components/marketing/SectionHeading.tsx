import type { ReactNode } from "react";

type Props = {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  align?: "left" | "center";
  children?: ReactNode;
};

export function SectionHeading({ eyebrow, title, subtitle, align = "left", children }: Props) {
  return (
    <div className={`mkt-section-head mkt-section-head-premium ${align === "center" ? "mkt-section-head-center" : ""}`}>
      {eyebrow ? <span className="mkt-eyebrow">{eyebrow}</span> : null}
      <h2>{title}</h2>
      {subtitle ? <p>{subtitle}</p> : null}
      {children}
    </div>
  );
}
