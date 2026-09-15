import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin, rateLimit } from "@/lib/api-auth";
import { apiError } from "@/lib/handle-api-error";
import {
  PASSWORD_OTP_MOBILE,
  OTP_TTL_MS,
  generateOtpCode,
  hashOtp,
  maskMobile,
} from "@/lib/password-otp";
import { sendPasswordOtp } from "@/lib/otp-delivery";

/** Send password-change OTP to phone only (Fast2SMS Quick SMS). */
export async function POST(req: NextRequest) {
  try {
    const auth = await requireAdmin(req);
    if (auth instanceof NextResponse) return auth;

    const body = (await req.json()) as { userId?: number };
    const userId = Number(body.userId);
    if (!Number.isFinite(userId) || userId <= 0) {
      return NextResponse.json({ error: "User id required" }, { status: 400 });
    }

    const limited = rateLimit(`pwd-otp:${auth.id}:${userId}`, 8, 15 * 60 * 1000);
    if (!limited.ok) {
      return NextResponse.json({ error: "Too many OTP requests. Try again later." }, { status: 429 });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true },
    });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const code = generateOtpCode(6);
    const expires = new Date(Date.now() + OTP_TTL_MS);
    const hash = hashOtp(code, userId);

    // Save hash + send SMS together (faster)
    const [, sent] = await Promise.all([
      prisma.user.update({
        where: { id: userId },
        data: {
          passwordOtpHash: hash,
          passwordOtpExpires: expires,
          passwordOtpAttempts: 0,
        },
      }),
      sendPasswordOtp(code),
    ]);

    if (!sent.ok) {
      await prisma.user.update({
        where: { id: userId },
        data: { passwordOtpHash: "", passwordOtpExpires: null, passwordOtpAttempts: 0 },
      });
      return NextResponse.json({ error: sent.error }, { status: 502 });
    }

    return NextResponse.json({
      ok: true,
      channel: "sms",
      toMasked: sent.toMasked,
      mobileMasked: maskMobile(PASSWORD_OTP_MOBILE),
      expiresInSec: Math.floor(OTP_TTL_MS / 1000),
      message: `OTP sent to ${maskMobile(PASSWORD_OTP_MOBILE)}`,
    });
  } catch (err) {
    return apiError(err, "Could not send OTP");
  }
}
