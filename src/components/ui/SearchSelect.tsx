"use client";

import { useId } from "react";

type Props = {
  name?: string;
  value?: string;
  options: string[];
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  onChange?: (value: string) => void;
};

/** Manual text input with suggestions — type freely or pick from list. */
export function SearchSelect({
  name,
  value = "",
  options,
  placeholder = "Type or select",
  required,
  disabled,
  onChange,
}: Props) {
  const listId = useId().replace(/:/g, "");

  return (
    <>
      <input
        className="form-control"
        list={listId}
        name={name}
        value={value}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        onChange={(e) => onChange?.(e.target.value)}
      />
      <datalist id={listId}>
        {options.map((opt) => (
          <option key={opt} value={opt} />
        ))}
      </datalist>
    </>
  );
}
