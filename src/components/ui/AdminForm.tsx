"use client";

import { useRef, useState, type FormEvent, type ReactNode } from "react";

type Props = {
  onSubmit: (e: FormEvent<HTMLFormElement>) => void | Promise<unknown>;
  children: ReactNode;
  className?: string;
  noValidate?: boolean;
};

function setSubmitBusy(form: HTMLFormElement, busy: boolean) {
  form.querySelectorAll<HTMLButtonElement>('button[type="submit"]').forEach((btn) => {
    if (busy) {
      if (!btn.dataset.erpLabel) btn.dataset.erpLabel = btn.textContent ?? "";
      btn.textContent = "Saving…";
      btn.disabled = true;
      btn.setAttribute("aria-busy", "true");
    } else {
      if (btn.dataset.erpLabel) {
        btn.textContent = btn.dataset.erpLabel;
        delete btn.dataset.erpLabel;
      }
      btn.disabled = false;
      btn.removeAttribute("aria-busy");
    }
  });
}

/** Prevents double-submit across all admin forms (Save / Update). */
export function AdminForm({ onSubmit, children, className = "", noValidate }: Props) {
  const formRef = useRef<HTMLFormElement>(null);
  const busyRef = useRef(false);
  const [busy, setBusy] = useState(false);

  async function handle(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    e.stopPropagation();
    if (busyRef.current) return;

    const form = formRef.current ?? e.currentTarget;
    busyRef.current = true;
    setBusy(true);
    setSubmitBusy(form, true);

    try {
      await onSubmit(e);
    } finally {
      busyRef.current = false;
      setBusy(false);
      setSubmitBusy(form, false);
    }
  }

  return (
    <form
      ref={formRef}
      className={`erp-admin-form${busy ? " is-saving" : ""}${className ? ` ${className}` : ""}`}
      onSubmit={handle}
      noValidate={noValidate}
      aria-busy={busy}
    >
      <fieldset disabled={busy} className="erp-admin-fieldset">
        {children}
      </fieldset>
    </form>
  );
}
