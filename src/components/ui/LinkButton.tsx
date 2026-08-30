import Link from "next/link";
import type { ReactNode } from "react";

type Variant = "primary" | "teal" | "outline" | "white";

const variants: Record<Variant, string> = {
  primary: "btn-admin-solid bg-gradient-to-br from-[#059669] to-[#10b981] border border-[#047857]",
  teal: "btn-admin-solid bg-gradient-to-br from-[#0f766e] to-[#14b8a6] border border-[#0d9488]",
  outline: "btn-admin-soft",
  white: "btn-admin-solid bg-white/20 hover:bg-white/30 border border-white/40 shadow-none",
};

type Props = {
  href: string;
  variant?: Variant;
  className?: string;
  children: ReactNode;
};

export function LinkButton({ href, variant = "primary", className = "", children }: Props) {
  return (
    <Link href={href} className={`btn-admin no-underline ${variants[variant]} ${className}`}>
      {children}
    </Link>
  );
}
