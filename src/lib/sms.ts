import { PASSWORD_OTP_MOBILE, otpSmsMessage } from "@/lib/password-otp";

/** @deprecated Use sendPasswordOtp from otp-delivery (free email first). */
export type SmsResult = { ok: true; provider: string } | { ok: false; error: string };

function normalizeMobile(mobile: string) {
  const digits = mobile.replace(/\D/g, "");
  if (digits.length >= 10) return digits.slice(-10);
  return digits;
}

export async function sendOtpSms(mobile: string, code: string): Promise<SmsResult> {
  const to = normalizeMobile(mobile || PASSWORD_OTP_MOBILE);
  const key = process.env.FAST2SMS_API_KEY?.trim();
  if (!key) {
    return { ok: false, error: "FAST2SMS_API_KEY not set — use free email OTP instead" };
  }
  try {
    const url = new URL("https://www.fast2sms.com/dev/bulkV2");
    url.searchParams.set("authorization", key);
    url.searchParams.set("route", "q");
    url.searchParams.set("message", otpSmsMessage(code));
    url.searchParams.set("language", "english");
    url.searchParams.set("flash", "0");
    url.searchParams.set("numbers", to);
    const res = await fetch(url.toString(), { method: "GET", headers: { Accept: "application/json" } });
    const data = (await res.json().catch(() => ({}))) as { return?: boolean; message?: string | string[] };
    if (res.ok && data.return) return { ok: true, provider: "fast2sms" };
    const msg = Array.isArray(data.message) ? data.message.join(", ") : data.message;
    return { ok: false, error: msg || `Fast2SMS failed (${res.status})` };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "SMS send failed" };
  }
}
