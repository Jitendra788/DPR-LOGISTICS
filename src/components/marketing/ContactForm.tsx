"use client";

import { FormEvent, useState } from "react";
import { CheckCircle2, Send } from "lucide-react";
import { submitContactViaApi, type ContactRequest } from "@/services/contactService";
import { ErrorState, LoadingState } from "./States";

const empty: ContactRequest = { name: "", mobile: "", email: "", message: "" };

export function ContactForm() {
  const [form, setForm] = useState<ContactRequest>(empty);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState<{ referenceId: string; message: string } | null>(null);

  function set<K extends keyof ContactRequest>(key: K, value: ContactRequest[K]) {
    setForm((f) => ({ ...f, [key]: value }));
    setError("");
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const result = await submitContactViaApi(form);
    setLoading(false);
    if (result.ok) {
      setSuccess({ referenceId: result.referenceId, message: result.message });
      setForm(empty);
      return;
    }
    setError(result.error);
  }

  if (success) {
    return (
      <div className="mkt-form-success mkt-form-success-card">
        <CheckCircle2 aria-hidden className="mkt-form-success-icon" />
        <h3>Message sent</h3>
        <p>{success.message}</p>
        <p className="mkt-ref">
          Reference: <strong>{success.referenceId}</strong>
        </p>
        <button type="button" className="mkt-btn mkt-btn-outline" onClick={() => setSuccess(null)}>
          Send another message
        </button>
      </div>
    );
  }

  return (
    <form className="mkt-form mkt-form-card" onSubmit={onSubmit} noValidate>
      {loading ? <LoadingState label="Sending message…" /> : null}
      {error ? <ErrorState title="Unable to send" description={error} /> : null}
      <div className="mkt-form-grid mkt-form-grid-contact">
        <label>
          Name *
          <input value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="Your full name" required />
        </label>
        <label>
          Mobile *
          <input
            type="tel"
            inputMode="numeric"
            value={form.mobile}
            onChange={(e) => set("mobile", e.target.value)}
            placeholder="10-digit mobile"
            required
          />
        </label>
        <label className="mkt-form-full">
          Email *
          <input
            type="email"
            value={form.email}
            onChange={(e) => set("email", e.target.value)}
            placeholder="you@company.com"
            required
          />
        </label>
        <label className="mkt-form-full">
          Message *
          <textarea
            rows={5}
            value={form.message}
            onChange={(e) => set("message", e.target.value)}
            placeholder="Tell us about your enquiry…"
            required
          />
        </label>
      </div>
      <button type="submit" className="mkt-btn mkt-btn-primary mkt-btn-lg" disabled={loading}>
        <Send aria-hidden size={16} /> Send Message
      </button>
    </form>
  );
}
