import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { formatLrEmail, isMailConfigured, sendMail } from "@/lib/mail";
import { lrNoEquals } from "@/lib/lr-no";
import { apiError } from "@/lib/handle-api-error";

function siteOrigin(req: NextRequest) {
  const host = req.headers.get("x-forwarded-host") || req.headers.get("host");
  const proto = req.headers.get("x-forwarded-proto") || "https";
  if (host) return `${proto}://${host}`;
  return process.env.NEXT_PUBLIC_SITE_URL || "https://www.dprlogistics.in";
}

export async function POST(req: NextRequest) {
  try {
    if (!isMailConfigured()) {
      return NextResponse.json(
        { error: "Email not configured. Set SMTP_USER and SMTP_PASS in Vercel env." },
        { status: 503 },
      );
    }

    const { lrNo, to, copies } = (await req.json()) as {
      lrNo?: string;
      to?: string;
      copies?: string;
    };

    const email = String(to ?? "").trim();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Valid receiver email required" }, { status: 400 });
    }
    if (!lrNo?.trim()) {
      return NextResponse.json({ error: "LR number required" }, { status: 400 });
    }

    const all = await prisma.lrBooking.findMany();
    const lr = all.find((row) => lrNoEquals(row.lrNo, lrNo.trim()));
    if (!lr) {
      return NextResponse.json({ error: "LR not found" }, { status: 404 });
    }

    const origin = siteOrigin(req);
    const copyQs = copies ? `&copies=${encodeURIComponent(copies)}` : "";
    const printPath = lr.source === "ROADWAYS" ? "/roadways/lr/print" : "/booking/lr/print";
    const printUrl = `${origin}${printPath}?lrNo=${encodeURIComponent(lr.lrNo)}${copyQs}`;
    const payload = formatLrEmail(lr, printUrl);
    await sendMail({ ...payload, to: email });

    return NextResponse.json({ ok: true, message: `LR sent to ${email}` });
  } catch (err) {
    return apiError(err, "LR email failed");
  }
}
