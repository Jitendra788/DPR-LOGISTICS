"use client";

import { FormEvent, useState } from "react";
import { submitQuoteViaApi, type QuoteRequest } from "@/services/quoteService";
import { ErrorState, LoadingState } from "./States";

const empty: QuoteRequest = {
  pickupLocation: "",
  deliveryLocation: "",
  shipmentType: "",
  weight: "",
  packages: "",
  pickupDate: "",
  name: "",
  mobile: "",
  email: "",
};

export function QuoteForm() {
  const [form, setForm] = useState<QuoteRequest>(empty);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState<{ referenceId: string; message: string } | null>(null);

  function set<K extends keyof QuoteRequest>(key: K, value: QuoteRequest[K]) {
    setForm((f) => ({ ...f, [key]: value }));
    setError("");
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const result = await submitQuoteViaApi(form);
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
      <div className="mkt-form-success">
        <h3>Quote request submitted</h3>
        <p>{success.message}</p>
        <p className="mkt-ref">Reference: <strong>{success.referenceId}</strong></p>
        <button type="button" className="mkt-btn mkt-btn-outline" onClick={() => setSuccess(null)}>
          Submit another request
        </button>
      </div>
    );
  }

  return (
    <form className="mkt-form" onSubmit={onSubmit} noValidate>
      {loading ? <LoadingState label="Calculating your request…" /> : null}
      {error ? <ErrorState title="Unable to submit" description={error} /> : null}
      <div className="mkt-form-grid">
        <label>
          Pickup Location
          <input value={form.pickupLocation} onChange={(e) => set("pickupLocation", e.target.value)} required />
        </label>
        <label>
          Delivery Location
          <input value={form.deliveryLocation} onChange={(e) => set("deliveryLocation", e.target.value)} required />
        </label>
        <label>
          Shipment Type
          <select value={form.shipmentType} onChange={(e) => set("shipmentType", e.target.value)} required>
            <option value="">Select type</option>
            <option>Part Load</option>
            <option>Full Truck Load</option>
            <option>Express Cargo</option>
            <option>Warehousing</option>
          </select>
        </label>
        <label>
          Weight (approx.)
          <input value={form.weight} onChange={(e) => set("weight", e.target.value)} placeholder="e.g. 500 kg" />
        </label>
        <label>
          Number of Packages
          <input value={form.packages} onChange={(e) => set("packages", e.target.value)} placeholder="e.g. 12" />
        </label>
        <label>
          Pickup Date
          <input type="date" value={form.pickupDate} onChange={(e) => set("pickupDate", e.target.value)} />
        </label>
        <label>
          Name
          <input value={form.name} onChange={(e) => set("name", e.target.value)} required />
        </label>
        <label>
          Mobile
          <input type="tel" value={form.mobile} onChange={(e) => set("mobile", e.target.value)} required />
        </label>
        <label className="mkt-form-full">
          Email
          <input type="email" value={form.email} onChange={(e) => set("email", e.target.value)} />
        </label>
      </div>
      <button type="submit" className="mkt-btn mkt-btn-primary" disabled={loading}>
        Get Estimated Quote
      </button>
    </form>
  );
}
