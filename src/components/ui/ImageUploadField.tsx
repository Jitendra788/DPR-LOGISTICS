"use client";

import { useRef, useState, type RefObject } from "react";
import { FieldWrap } from "./FormField";

type Props = {
  label?: string;
  required?: boolean;
  accept?: string;
  hint?: string;
  urlLabel?: string;
  urlValue?: string;
  urlPlaceholder?: string;
  onUrlChange?: (value: string) => void;
  onFileChange?: (file: File | null) => void;
  inputRef?: RefObject<HTMLInputElement | null>;
  disabled?: boolean;
  showUrl?: boolean;
};

export function ImageUploadField({
  label = "Picture",
  required,
  accept = "image/jpeg,image/png,image/webp,image/gif",
  hint = "Min 250×250 px · Max 8 MB. Or use photo URL below.",
  urlLabel = "Photo URL (alternative)",
  urlValue = "",
  urlPlaceholder = "https://... or /marketing/blog/example.jpg",
  onUrlChange,
  onFileChange,
  inputRef,
  disabled,
  showUrl = true,
}: Props) {
  const localRef = useRef<HTMLInputElement>(null);
  const ref = inputRef ?? localRef;
  const [fileName, setFileName] = useState("");

  return (
    <div className="erp-image-upload">
      <FieldWrap label={required ? `${label} *` : label}>
        <label className={`erp-choose-file${fileName ? " has-file" : ""}${disabled ? " is-disabled" : ""}`}>
          <input
            ref={ref}
            type="file"
            accept={accept}
            className="erp-file-input"
            disabled={disabled}
            onChange={(e) => {
              const file = e.target.files?.[0] ?? null;
              setFileName(file?.name ?? "");
              onFileChange?.(file);
            }}
          />
          <span className="erp-choose-file-btn">Choose file</span>
          <span className="erp-choose-file-name">{fileName || "No file chosen"}</span>
        </label>
        {hint ? <p className="erp-choose-file-hint">{hint}</p> : null}
      </FieldWrap>

      {showUrl && onUrlChange ? (
        <label className="form-group block">
          <span className="form-label">{urlLabel}</span>
          <input
            className="form-control"
            type="text"
            value={urlValue}
            placeholder={urlPlaceholder}
            disabled={disabled}
            onChange={(e) => onUrlChange(e.target.value)}
          />
        </label>
      ) : null}
    </div>
  );
}
