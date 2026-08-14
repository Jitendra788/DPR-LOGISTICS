"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type Props = {
  name?: string;
  value?: string;
  options: string[];
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  onChange?: (value: string) => void;
};

export function SearchSelect({
  name,
  value = "",
  options,
  placeholder = "--Select--",
  required,
  disabled,
  onChange,
}: Props) {
  const rootRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [active, setActive] = useState(0);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return options;
    return options.filter((o) => o.toLowerCase().includes(term));
  }, [options, q]);

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  useEffect(() => {
    if (open) {
      setQ("");
      setActive(0);
      setTimeout(() => searchRef.current?.focus(), 0);
    }
  }, [open]);

  function pick(opt: string) {
    onChange?.(opt);
    setOpen(false);
  }

  const shown = value || placeholder;

  return (
    <div className={`s2 ${open ? "is-open" : ""} ${disabled ? "is-disabled" : ""}`} ref={rootRef}>
      {name ? <input type="hidden" name={name} value={value} required={required && !value} /> : null}
      <button
        type="button"
        className="s2-control"
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => !disabled && setOpen((v) => !v)}
      >
        <span className={value ? "" : "s2-placeholder"}>{shown}</span>
        <span className="s2-caret" aria-hidden />
      </button>
      {open ? (
        <div className="s2-menu" role="listbox">
          <input
            ref={searchRef}
            className="s2-search"
            value={q}
            placeholder="Search"
            aria-label="Search options"
            onChange={(e) => {
              setQ(e.target.value);
              setActive(0);
            }}
            onKeyDown={(e) => {
              if (e.key === "ArrowDown") {
                e.preventDefault();
                setActive((i) => Math.min(i + 1, Math.max(filtered.length - 1, 0)));
              } else if (e.key === "ArrowUp") {
                e.preventDefault();
                setActive((i) => Math.max(i - 1, 0));
              } else if (e.key === "Enter") {
                e.preventDefault();
                if (filtered[active]) pick(filtered[active]);
              } else if (e.key === "Escape") {
                setOpen(false);
              }
            }}
          />
          <div className="s2-list">
            {filtered.length === 0 ? <div className="s2-empty">No matches</div> : null}
            {filtered.map((opt, i) => (
              <button
                key={opt}
                type="button"
                role="option"
                aria-selected={opt === value}
                className={`s2-opt ${opt === value ? "is-selected" : ""} ${i === active ? "is-active" : ""}`}
                onMouseEnter={() => setActive(i)}
                onClick={() => pick(opt)}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
