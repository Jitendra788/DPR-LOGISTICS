import { createHash, randomInt, timingSafeEqual } from "node:crypto";

/** Fixed mobile for password-change OTP (admin security phone). */
export const PASSWORD_OTP_MOBILE =
  String(process.env.PASSWORD_OTP_MOBILE || "9371662142").replace(/\D/g, "").slice(-10);

export const OTP_TTL_MS = 5 * 60 * 1000;
export const OTP_MAX_ATTEMPTS = 5;

export function maskMobile(mobile: string) {
  const digits = mobile.replace(/\D/g, "").slice(-10);
  if (digits.length < 4) return "****";
  return `******${digits.slice(-4)}`;
}

export function generateOtpCode(length = 6) {
  const max = 10 ** length;
  const n = randomInt(0, max);
  return String(n).padStart(length, "0");
}

export function hashOtp(code: string, userId: number) {
  return createHash("sha256")
    .update(`${userId}:${code}:${process.env.SESSION_SECRET || "dpr-otp"}`)
    .digest("hex");
}

export function otpMatches(code: string, userId: number, storedHash: string) {
  if (!storedHash) return false;
  const next = hashOtp(code, userId);
  try {
    const a = Buffer.from(next);
    const b = Buffer.from(storedHash);
    if (a.length !== b.length) return false;
    return timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

export function otpSmsMessage(code: string) {
  // Keep short for faster Quick SMS delivery
  return `DPR OTP ${code} valid 5 min. Do not share.`;
}
