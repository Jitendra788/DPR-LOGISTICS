"use client";

import { useEffect, useState } from "react";

const DEFAULT_OPTIONS: Intl.DateTimeFormatOptions = {
  day: "2-digit",
  month: "short",
  year: "numeric",
};

type Props = {
  locale?: string;
  options?: Intl.DateTimeFormatOptions;
  placeholder?: string;
  className?: string;
};

/** Renders a locale-formatted date only after mount to avoid SSR/client mismatch. */
export function ClientFormattedDate({
  locale = "en-IN",
  options = DEFAULT_OPTIONS,
  placeholder = "—",
  className,
}: Props) {
  const [value, setValue] = useState("");

  useEffect(() => {
    setValue(new Date().toLocaleDateString(locale, options));
  }, [locale, options]);

  return <span className={className}>{value || placeholder}</span>;
}
