import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { formatBillEmail, isMailConfigured, sendMail } from "@/lib/mail";
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

    const { billNo, to } = (await req.json()) as { billNo?: string; to?: string };
    const email = String(to ?? "").trim();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Valid receiver email required" }, { status: 400 });
    }
    if (!billNo?.trim()) {
      return NextResponse.json({ error: "Bill number required" }, { status: 400 });
    }

    const bill = await prisma.bill.findFirst({ where: { billNo: billNo.trim() } });
    if (!bill) {
      return NextResponse.json({ error: "Bill not found" }, { status: 404 });
    }

    const origin = siteOrigin(req);
    const printUrl = `${origin}/bills/print?billNo=${encodeURIComponent(bill.billNo)}`;
    const payload = formatBillEmail(
      {
        billNo: bill.billNo,
        billDate: bill.billDate || bill.fromDate,
        partyName: bill.partyName,
        amount: bill.amount,
      },
      printUrl,
    );
    await sendMail({ ...payload, to: email });

    return NextResponse.json({ ok: true, message: `Bill sent to ${email}` });
  } catch (err) {
    return apiError(err, "Bill email failed");
  }
}
