export type ContactRequest = {
  name: string;
  mobile: string;
  email: string;
  message: string;
};

export type ContactResult =
  | { ok: true; referenceId: string; message: string }
  | { ok: false; error: string; field?: keyof ContactRequest };

export function validateContact(data: ContactRequest): ContactResult | null {
  if (!data.name.trim()) return { ok: false, error: "Name is required.", field: "name" };
  if (!/^\d{10}$/.test(data.mobile.replace(/\D/g, "").slice(-10))) {
    return { ok: false, error: "Enter a valid 10-digit mobile number.", field: "mobile" };
  }
  if (!data.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    return { ok: false, error: "Enter a valid email address.", field: "email" };
  }
  if (!data.message.trim()) return { ok: false, error: "Please enter your message.", field: "message" };
  return null;
}

/** @deprecated Server APIs send email directly — kept for compatibility */
export async function submitContact(data: ContactRequest): Promise<ContactResult> {
  const invalid = validateContact(data);
  if (invalid) return invalid;
  return {
    ok: true,
    referenceId: `CN-${Date.now().toString(36).toUpperCase()}`,
    message: "Message received. Our support team will respond within one business day.",
  };
}

export async function submitContactViaApi(data: ContactRequest): Promise<ContactResult> {
  const res = await fetch("/api/public/contact", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return (await res.json()) as ContactResult;
}
