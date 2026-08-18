import type { ReactNode } from "react";

export function FormCard({
  children,
  className = "",
  title,
  subtitle,
}: {
  children?: ReactNode;
  className?: string;
  title?: string;
  subtitle?: string;
}) {
  return (
    <div className={`box erp-form-card ${className}`.trim()}>
      {title ? (
        <div className="erp-form-card-head">
          <div>
            <h2 className="erp-form-card-title">{title}</h2>
            {subtitle ? <p className="erp-form-card-sub">{subtitle}</p> : null}
          </div>
        </div>
      ) : null}
      <div className="box-body erp-form-card-body">{children}</div>
    </div>
  );
}

export function TwoCol({ children }: { children: ReactNode }) {
  return <div className="grid grid-cols-1 gap-x-6 gap-y-0 md:grid-cols-2 md:gap-x-[30px]">{children}</div>;
}
