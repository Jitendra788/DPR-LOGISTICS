import { PASSWORD_OTP_MOBILE, otpSmsMessage } from "@/lib/password-otp";

export type OtpSendResult =
  | { ok: true; provider: string; channel: "sms"; toMasked: string }
  | { ok: false; error: string };

function normalizeMobile(mobile: string) {
  const digits = mobile.replace(/\D/g, "");
  if (digits.length >= 10) return digits.slice(-10);
  return digits;
}

/**
 * Password OTP via Fast2SMS Quick SMS (~₹5/SMS).
 * No DLT / Smart OTP ID required.
 */
export async function sendPasswordOtp(code: string): Promise<OtpSendResult> {
  const to = normalizeMobile(PASSWORD_OTP_MOBILE);
  const key = process.env.FAST2SMS_API_KEY?.trim();

  if (!key) {
    return { ok: false, error: "FAST2SMS_API_KEY missing in .env" };
  }
  if (to.length !== 10) {
    return { ok: false, error: "Invalid PASSWORD_OTP_MOBILE" };
  }

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 12_000);

    const url = new URL("https://www.fast2sms.com/dev/bulkV2");
    url.searchParams.set("authorization", key);
    url.searchParams.set("route", "q");
    url.searchParams.set("message", otpSmsMessage(code));
    url.searchParams.set("language", "english");
    url.searchParams.set("flash", "0");
    url.searchParams.set("numbers", to);

    const res = await fetch(url.toString(), {
      method: "GET",
      headers: { Accept: "application/json" },
      signal: controller.signal,
      cache: "no-store",
    }).finally(() => clearTimeout(timer));

    const data = (await res.json().catch(() => ({}))) as {
      return?: boolean;
      message?: string | string[];
    };

    if (res.ok && data.return) {
      return {
        ok: true,
        provider: "fast2sms-quick",
        channel: "sms",
        toMasked: `******${to.slice(-4)}`,
      };
    }

    const msg = Array.isArray(data.message) ? data.message.join(", ") : data.message;
    return { ok: false, error: msg || `Quick SMS failed (${res.status})` };
  } catch (err) {
    if (err instanceof Error && err.name === "AbortError") {
      return { ok: false, error: "SMS gateway timeout. Try Send OTP again." };
    }
    return { ok: false, error: err instanceof Error ? err.message : "SMS send failed" };
  }
}
