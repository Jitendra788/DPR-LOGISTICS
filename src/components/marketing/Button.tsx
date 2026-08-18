import Link from "next/link";
import type { ReactNode, ButtonHTMLAttributes } from "react";

type Variant = "primary" | "secondary" | "ghost" | "outline";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  href?: string;
  children: ReactNode;
  className?: string;
};

const variants: Record<Variant, string> = {
  primary: "mkt-btn mkt-btn-primary",
  secondary: "mkt-btn mkt-btn-secondary",
  ghost: "mkt-btn mkt-btn-ghost",
  outline: "mkt-btn mkt-btn-outline",
};

export function MarketingButton({ variant = "primary", href, children, className = "", ...props }: Props) {
  const cls = `${variants[variant]} ${className}`.trim();
  if (href) {
    return (
      <Link href={href} className={cls}>
        {children}
      </Link>
    );
  }
  return (
    <button type="button" className={cls} {...props}>
      {children}
    </button>
  );
}
