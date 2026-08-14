import type { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "danger" | "muted" | "success" | "teal";
type Size = "md" | "sm";

const variants: Record<Variant, string> = {
  primary: "bg-[#00a65a] text-white hover:bg-[#008d4c] border-[#008d4c]",
  success: "bg-[#00a65a] text-white hover:bg-[#008d4c] border-[#008d4c]",
  teal: "bg-[#00695c] text-white hover:bg-[#004d40] border-[#004d40]",
  danger: "bg-[#dd4b39] text-white hover:bg-[#d73925] border-[#d73925]",
  muted: "bg-[#d2d6de] text-[#444] cursor-not-allowed border-[#d2d6de]",
};

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: Size;
};

export function Button({ variant = "primary", size = "md", className = "", disabled, ...props }: Props) {
  const style = disabled ? variants.muted : variants[variant];
  const sizing = size === "sm" ? "btn-admin-sm" : "";
  return <button className={`btn-admin ${sizing} ${style} ${className}`} disabled={disabled} {...props} />;
}
