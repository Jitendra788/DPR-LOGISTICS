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

export function FileField({ label }: { label: string }) {
  return (
    <FieldWrap label={label}>
      <input type="file" className="form-control" />
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
  const [text, setText] = useState((Number(value) || 0).toFixed(2));

  useEffect(() => {
    setText((Number(value) || 0).toFixed(2));
  }, [value]);

  return (
    <FieldWrap label={label}>
      <input
        className="form-control"
        value={text}
        readOnly={readOnly}
        onChange={(e) => {
          if (readOnly) return;
          setText(e.target.value);
          onChange?.(Number(e.target.value) || 0);
        }}
        onBlur={() => setText((Number(text) || 0).toFixed(2))}
      />
    </FieldWrap>
  );
}
