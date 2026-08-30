import type { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "danger" | "muted" | "success" | "teal" | "secondary";
type Size = "md" | "sm";

const variants: Record<Variant, string> = {
  primary: "btn-admin-solid bg-gradient-to-br from-[#059669] to-[#10b981] border-[#047857]",
  success: "btn-admin-solid bg-gradient-to-br from-[#059669] to-[#10b981] border-[#047857]",
  teal: "btn-admin-solid bg-gradient-to-br from-[#0f766e] to-[#14b8a6] border-[#0d9488]",
  danger: "btn-admin-solid bg-gradient-to-br from-[#dc2626] to-[#ef4444] border-[#b91c1c]",
  secondary: "btn-admin-soft",
  muted: "btn-admin-soft btn-admin-muted",
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
