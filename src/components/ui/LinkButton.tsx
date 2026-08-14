import Link from "next/link";
import type { ReactNode } from "react";

type Variant = "primary" | "teal" | "outline" | "white";

const variants: Record<Variant, string> = {
  primary: "bg-[#00a65a] text-white hover:bg-[#008d4c] border border-[#008d4c]",
  teal: "bg-[#00695c] text-white hover:bg-[#004d40] border border-[#004d40]",
  outline: "bg-white text-[#444] hover:bg-[#f4f4f4] border border-[#d2d6de]",
  white: "bg-white/20 text-white hover:bg-white/30 border border-white/40",
};

type Props = {
  href: string;
  variant?: Variant;
  className?: string;
  children: ReactNode;
};

export function LinkButton({ href, variant = "primary", className = "", children }: Props) {
  return (
    <Link href={href} className={`btn-admin inline-block no-underline ${variants[variant]} ${className}`}>
      {children}
    </Link>
  );
}
