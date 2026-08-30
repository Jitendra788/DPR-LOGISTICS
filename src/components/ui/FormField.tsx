"use client";

import { useEffect, useState, type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes, type TextareaHTMLAttributes } from "react";
import { displayToIso, isoToDisplay } from "@/lib/dates";
import { SearchSelect } from "./SearchSelect";

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

type SelectFieldProps = SelectHTMLAttributes<HTMLSelectElement> & {
  label: string;
  options: string[];
  placeholder?: string;
};

export function SelectField({
  label,
  options,
  placeholder = "--Select--",
  className = "",
  value,
  name,
  onChange,
  required,
  disabled,
}: SelectFieldProps) {
  return (
    <div className={`form-group block ${className}`}>
      <span className="form-label">{label}</span>
      <SearchSelect
        name={name}
        value={String(value ?? "")}
        options={options}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        onChange={(next) => {
          onChange?.({ target: { name, value: next } } as Parameters<NonNullable<SelectFieldProps["onChange"]>>[0]);
        }}
      />
    </div>
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
      <label className={`erp-file-drop${fileName ? " has-file" : ""}`}>
        <input
          type="file"
          name={name}
          accept={accept}
          className="erp-file-input"
          onChange={(e) => setFileName(e.target.files?.[0]?.name ?? "")}
        />
        <span className="erp-file-icon" aria-hidden>
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <path d="M14 2v6h6M12 18v-6M9 15l3-3 3 3" />
          </svg>
        </span>
        <span className="erp-file-copy">
          <strong>{fileName ? "File selected" : "Choose file"}</strong>
          <span>{fileName || "PDF, image or document — click to browse"}</span>
        </span>
        <span className="erp-file-btn">{fileName ? "Change" : "Browse"}</span>
      </label>
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
