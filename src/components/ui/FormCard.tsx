import type { ReactNode } from "react";

export function FormCard({ children, className = "" }: { children?: ReactNode; className?: string }) {
  return (
    <div className={`box ${className}`}>
      <div className="box-body">{children}</div>
    </div>
  );
}

export function TwoCol({ children }: { children: ReactNode }) {
  return <div className="grid grid-cols-1 gap-x-6 gap-y-0 md:grid-cols-2 md:gap-x-[30px]">{children}</div>;
}
