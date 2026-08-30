export type QuoteRequest = {
  pickupLocation: string;
  deliveryLocation: string;
  shipmentType: string;
  weight: string;
  packages: string;
  pickupDate: string;
  name: string;
  mobile: string;
  email: string;
};

export type QuoteResult =
  | { ok: true; referenceId: string; message: string }
  | { ok: false; error: string; field?: keyof QuoteRequest };

export function validateQuote(data: QuoteRequest): QuoteResult | null {
  if (!data.pickupLocation.trim()) return { ok: false, error: "Pickup location is required.", field: "pickupLocation" };
  if (!data.deliveryLocation.trim()) return { ok: false, error: "Delivery location is required.", field: "deliveryLocation" };
  if (!data.shipmentType.trim()) return { ok: false, error: "Select a shipment type.", field: "shipmentType" };
  if (!data.weight.trim()) return { ok: false, error: "Enter approximate weight.", field: "weight" };
  if (!data.name.trim()) return { ok: false, error: "Name is required.", field: "name" };
  if (!/^\d{10}$/.test(data.mobile.replace(/\D/g, "").slice(-10))) {
    return { ok: false, error: "Enter a valid 10-digit mobile number.", field: "mobile" };
  }
  if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    return { ok: false, error: "Enter a valid email address.", field: "email" };
  }
  return null;
}

/** @deprecated Server APIs send email directly — kept for compatibility */
export async function submitQuote(data: QuoteRequest): Promise<QuoteResult> {
  const invalid = validateQuote(data);
  if (invalid) return invalid;
  return {
    ok: true,
    referenceId: `QT-${Date.now().toString(36).toUpperCase()}`,
    message: "Thank you! Our team will share an estimated quote within 2 business hours.",
  };
}

export async function submitQuoteViaApi(data: QuoteRequest): Promise<QuoteResult> {
  const res = await fetch("/api/public/quote", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return (await res.json()) as QuoteResult;
}
