"use client";

import {
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type InputHTMLAttributes,
  type KeyboardEvent,
  type ReactNode,
  type SelectHTMLAttributes,
  type TextareaHTMLAttributes,
} from "react";
import { createPortal } from "react-dom";
import { displayToIso, isoToDisplay } from "@/lib/dates";

type FieldWrapProps = {
  label: string;
  children: ReactNode;
  className?: string;
};

export function FieldWrap({ label, children, className = "" }: FieldWrapProps) {
  return (
    <label className={`form-group block ${className}`}>
      <span className="form-label">{label}</span>
      {children}
    </label>
  );
}

type InputFieldProps = InputHTMLAttributes<HTMLInputElement> & { label: string };

export function InputField({ label, className = "", ...props }: InputFieldProps) {
  return (
    <FieldWrap label={label} className={className}>
      <input className="form-control" {...props} />
    </FieldWrap>
  );
}

type DatalistFieldProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  options: string[];
  listId?: string;
};

/** Manual text input with optional suggestions (all party / station names). */
export function DatalistField({ label, className = "", options, listId, ...props }: DatalistFieldProps) {
  const id = listId ?? `datalist-${label.replace(/\s+/g, "-").toLowerCase()}`;
  return (
    <FieldWrap label={label} className={className}>
      <input className="form-control" list={id} {...props} />
      <datalist id={id}>
        {options.map((option) => (
          <option key={option} value={option} />
        ))}
      </datalist>
    </FieldWrap>
  );
}

type DropdownFieldProps = SelectHTMLAttributes<HTMLSelectElement> & {
  label: string;
  options: string[];
  placeholder?: string;
};

/** Fixed-option dropdown only (no manual typing). */
export function DropdownField({
  label,
  options,
  placeholder,
  className = "",
  value,
  name,
  onChange,
  required,
  disabled,
}: DropdownFieldProps) {
  const current = String(value ?? "");
  return (
    <FieldWrap label={label} className={className}>
      <select
        className="form-control"
        name={name}
        value={current}
        required={required}
        disabled={disabled}
        onChange={onChange}
      >
        {placeholder && !current ? (
          <option value="" disabled>
            {placeholder}
          </option>
        ) : null}
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </FieldWrap>
  );
}

type ComboboxFieldProps = {
  label: string;
  options: string[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  name?: string;
  required?: boolean;
  disabled?: boolean;
};

/** Type to search + click to select. Menu portals above all cards (no clipping). */
export function ComboboxField({
  label,
  options,
  value,
  onChange,
  placeholder = "Search or select",
  className = "",
  name,
  required,
  disabled,
}: ComboboxFieldProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const btnRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const listId = useId().replace(/:/g, "");
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const [pos, setPos] = useState({
    top: 0 as number | undefined,
    bottom: undefined as number | undefined,
    left: 0,
    width: 280,
    maxHeight: 320,
    place: "bottom" as "bottom" | "top",
  });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return options;
    return options.filter((option) => option.toLowerCase().includes(q));
  }, [options, query]);

  function placeMenu() {
    const el = btnRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const gap = 6;
    const preferred = Math.min(360, Math.max(220, window.innerHeight * 0.45));
    const spaceBelow = window.innerHeight - rect.bottom - gap - 12;
    const spaceAbove = rect.top - gap - 12;
    const place: "bottom" | "top" = spaceBelow < 180 && spaceAbove > spaceBelow ? "top" : "bottom";
    const maxHeight = Math.max(160, Math.min(preferred, place === "bottom" ? spaceBelow : spaceAbove));
    const width = Math.max(rect.width, 240);
    let left = rect.left;
    if (left + width > window.innerWidth - 12) left = Math.max(12, window.innerWidth - width - 12);
    if (left < 12) left = 12;
    setPos({
      top: place === "bottom" ? rect.bottom + gap : undefined,
      bottom: place === "top" ? window.innerHeight - rect.top + gap : undefined,
      left,
      width,
      maxHeight,
      place,
    });
  }

  useEffect(() => {
    if (!open) return;
    placeMenu();
    setQuery("");
    setActive(0);
    const t = window.setTimeout(() => searchRef.current?.focus(), 0);
    function onDoc(e: MouseEvent) {
      const target = e.target as Node;
      if (rootRef.current?.contains(target) || menuRef.current?.contains(target)) return;
      setOpen(false);
    }
    function onReposition() {
      placeMenu();
    }
    document.addEventListener("mousedown", onDoc);
    window.addEventListener("resize", onReposition);
    window.addEventListener("scroll", onReposition, true);
    return () => {
      window.clearTimeout(t);
      document.removeEventListener("mousedown", onDoc);
      window.removeEventListener("resize", onReposition);
      window.removeEventListener("scroll", onReposition, true);
    };
  }, [open]);

  function pick(option: string) {
    onChange(option);
    setOpen(false);
  }

  function onKeyDown(e: KeyboardEvent) {
    if (!open) {
      if (e.key === "ArrowDown" || e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        setOpen(true);
      }
      return;
    }
    if (e.key === "Escape") {
      e.preventDefault();
      setOpen(false);
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((i) => Math.min(i + 1, Math.max(filtered.length - 1, 0)));
      return;
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i) => Math.max(i - 1, 0));
      return;
    }
    if (e.key === "Enter") {
      e.preventDefault();
      const hit = filtered[active];
      if (hit) pick(hit);
    }
  }

  const menu =
    open && mounted
      ? createPortal(
          <div
            ref={menuRef}
            className={`s2-menu s2-menu-portal${pos.place === "top" ? " is-top" : ""}`}
            role="presentation"
            style={{
              top: pos.top,
              bottom: pos.bottom,
              left: pos.left,
              width: pos.width,
              maxHeight: pos.maxHeight,
            }}
          >
            <div className="s2-menu-head">
              <input
                ref={searchRef}
                className="s2-search"
                value={query}
                placeholder={`Search ${label.toLowerCase()}…`}
                aria-label={`Search ${label}`}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setActive(0);
                }}
                onKeyDown={onKeyDown}
              />
              <span className="s2-count">{filtered.length}/{options.length}</span>
            </div>
            <div className="s2-list" id={listId} role="listbox" style={{ maxHeight: Math.max(120, pos.maxHeight - 58) }}>
              {filtered.length ? (
                filtered.map((option, index) => (
                  <button
                    key={option}
                    type="button"
                    role="option"
                    aria-selected={option === value}
                    className={`s2-opt${option === value ? " is-selected" : ""}${index === active ? " is-active" : ""}`}
                    onMouseEnter={() => setActive(index)}
                    onClick={() => pick(option)}
                  >
                    {option}
                  </button>
                ))
              ) : (
                <div className="s2-empty">No match found</div>
              )}
            </div>
          </div>,
          document.body,
        )
      : null;

  return (
    <div className={`form-group block ${className}`.trim()} ref={rootRef}>
      <span className="form-label">{label}</span>
      {name ? <input type="hidden" name={name} value={value} required={required} /> : null}
      <div className={`s2${open ? " is-open" : ""}${disabled ? " is-disabled" : ""}`}>
        <button
          ref={btnRef}
          type="button"
          className="s2-control"
          disabled={disabled}
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-controls={listId}
          onClick={() => !disabled && setOpen((v) => !v)}
          onKeyDown={onKeyDown}
        >
          <span className={value ? "s2-value" : "s2-placeholder"}>{value || placeholder}</span>
          <span className="s2-caret" aria-hidden />
        </button>
        {menu}
      </div>
    </div>
  );
}

type SelectFieldProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  options: string[];
  placeholder?: string;
};

export function SelectField({
  label,
  options,
  placeholder = "Type or select",
  className = "",
  value,
  name,
  onChange,
  required,
  disabled,
}: SelectFieldProps) {
  const listId = useId().replace(/:/g, "");
  return (
    <FieldWrap label={label} className={className}>
      <input
        className="form-control"
        list={listId}
        name={name}
        value={String(value ?? "")}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        onChange={onChange}
      />
      <datalist id={listId}>
        {options.map((option) => (
          <option key={option} value={option} />
        ))}
      </datalist>
    </FieldWrap>
  );
}

type TextAreaFieldProps = TextareaHTMLAttributes<HTMLTextAreaElement> & { label: string };

export function TextAreaField({ label, className = "", ...props }: TextAreaFieldProps) {
  return (
    <FieldWrap label={label} className={className}>
      <textarea className="form-control" {...props} />
    </FieldWrap>
  );
}

export function FileField({ label, accept, name }: { label: string; accept?: string; name?: string }) {
  const [fileName, setFileName] = useState("");

  return (
    <FieldWrap label={label} className="erp-file-field">
      <label className={`erp-choose-file${fileName ? " has-file" : ""}`}>
        <input
          type="file"
          name={name}
          accept={accept}
          className="erp-file-input"
          onChange={(e) => setFileName(e.target.files?.[0]?.name ?? "")}
        />
        <span className="erp-choose-file-btn">Choose file</span>
        <span className="erp-choose-file-name">{fileName || "No file chosen"}</span>
      </label>
      <p className="erp-choose-file-hint">PDF, image or document — max 12 MB</p>
    </FieldWrap>
  );
}

export function DateField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (iso: string) => void;
}) {
  const [text, setText] = useState(isoToDisplay(value));

  useEffect(() => {
    setText(isoToDisplay(value));
  }, [value]);

  return (
    <FieldWrap label={label}>
      <div className="relative">
        <input
          className="form-control pr-9"
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            const iso = displayToIso(e.target.value);
            if (/^\d{4}-\d{2}-\d{2}$/.test(iso)) onChange(iso);
          }}
          onBlur={() => {
            const iso = displayToIso(text);
            if (/^\d{4}-\d{2}-\d{2}$/.test(iso)) {
              onChange(iso);
              setText(isoToDisplay(iso));
            } else {
              setText(isoToDisplay(value));
            }
          }}
        />
        <span className="absolute top-0 right-0 flex h-[34px] w-[34px] cursor-pointer items-center justify-center text-[#888]">
          <input type="date" className="absolute inset-0 cursor-pointer opacity-0" value={value} onChange={(e) => onChange(e.target.value)} />
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="4" width="18" height="18" rx="2" />
            <path d="M16 2v4M8 2v4M3 10h18" />
          </svg>
        </span>
      </div>
    </FieldWrap>
  );
}

function formatMoneyDisplay(value: number) {
  const num = Number(value) || 0;
  if (num === 0) return "0";
  if (Number.isInteger(num)) return String(num);
  return num.toFixed(2).replace(/\.?0+$/, "");
}

function parseMoney(text: string) {
  const cleaned = text.replace(/,/g, "").trim();
  if (!cleaned || cleaned === ".") return 0;
  const num = Number(cleaned);
  return Number.isFinite(num) ? num : 0;
}

function formatManualNumber(value: number) {
  const num = Number(value) || 0;
  if (num === 0) return "";
  return String(num);
}

function parseManualNumber(text: string) {
  const cleaned = text.replace(/,/g, "").trim();
  if (!cleaned || cleaned === ".") return 0;
  const num = Number(cleaned);
  return Number.isFinite(num) ? num : 0;
}

export function ManualNumberField({
  label,
  value,
  onChange,
  readOnly,
}: {
  label: string;
  value: number;
  onChange?: (n: number) => void;
  readOnly?: boolean;
}) {
  const [text, setText] = useState(() => formatManualNumber(value));
  const [focused, setFocused] = useState(false);

  useEffect(() => {
    if (!focused) {
      setText(formatManualNumber(value));
    }
  }, [value, focused]);

  return (
    <FieldWrap label={label}>
      <input
        type="text"
        className="form-control"
        value={text}
        readOnly={readOnly}
        inputMode="decimal"
        onFocus={() => {
          if (!readOnly) setFocused(true);
        }}
        onChange={(e) => {
          if (readOnly) return;
          const raw = e.target.value;
          setText(raw);
          onChange?.(parseManualNumber(raw));
        }}
        onBlur={() => {
          if (readOnly) return;
          setFocused(false);
          const num = parseManualNumber(text);
          setText(formatManualNumber(num));
          onChange?.(num);
        }}
      />
    </FieldWrap>
  );
}

export function MoneyField({
  label,
  value,
  onChange,
  readOnly,
}: {
  label: string;
  value: number;
  onChange?: (n: number) => void;
  readOnly?: boolean;
}) {
  const [text, setText] = useState(() => formatMoneyDisplay(value));
  const [focused, setFocused] = useState(false);

  useEffect(() => {
    if (!focused) {
      setText(formatMoneyDisplay(value));
    }
  }, [value, focused]);

  return (
    <FieldWrap label={label}>
      <input
        className="form-control"
        value={text}
        readOnly={readOnly}
        inputMode="decimal"
        onFocus={() => {
          if (!readOnly) setFocused(true);
        }}
        onChange={(e) => {
          if (readOnly) return;
          const raw = e.target.value;
          if (raw !== "" && !/^\d*\.?\d*$/.test(raw)) return;
          setText(raw);
          onChange?.(parseMoney(raw));
        }}
        onBlur={() => {
          if (readOnly) return;
          setFocused(false);
          const num = parseMoney(text);
          setText(formatMoneyDisplay(num));
          onChange?.(num);
        }}
      />
    </FieldWrap>
  );
}
