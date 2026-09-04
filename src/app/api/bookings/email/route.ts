import { NextRequest, NextResponse } from "next/server";
import { formatLrEmail, isMailConfigured, sendMail } from "@/lib/mail";
import { findLrBookingByNo } from "@/lib/find-lr";
import { apiError } from "@/lib/handle-api-error";
import { createLrPrintShareToken } from "@/lib/lr-email";
import { stripLrPrefix } from "@/lib/lr-no";

function siteOrigin(req: NextRequest) {
  const host = req.headers.get("x-forwarded-host") || req.headers.get("host");
  const proto = req.headers.get("x-forwarded-proto") || (host?.includes("localhost") ? "http" : "https");
  if (host) return `${proto}://${host}`;
  return process.env.NEXT_PUBLIC_SITE_URL || "https://www.dprlogistics.in";
}

export async function POST(req: NextRequest) {
  try {
    if (!isMailConfigured()) {
      return NextResponse.json(
        { error: "Email not configured. Set SMTP_USER and SMTP_PASS in .env / Vercel env." },
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

    const lr = await findLrBookingByNo(lrNo.trim());
    if (!lr) {
      return NextResponse.json({ error: "LR not found" }, { status: 404 });
    }

    const origin = siteOrigin(req);
    const copyList = (copies || "Consignor")
      .split(",")
      .map((c) => c.trim())
      .filter(Boolean);
    const copyQs = copyList.length ? `&copies=${encodeURIComponent(copyList.join(","))}` : "";
    const share = createLrPrintShareToken(lr.lrNo);
    const printPath = lr.source === "ROADWAYS" ? "/roadways/lr/print" : "/booking/lr/print";
    const printUrl = `${origin}${printPath}?lrNo=${encodeURIComponent(lr.lrNo)}&share=${encodeURIComponent(share)}${copyQs}`;

    const copyLabel =
      copyList[0] === "Lorry"
        ? "Lorry Copy"
        : copyList[0] === "Consignee"
          ? "Consignee Copy"
          : "Consignor Copy";

    const payload = formatLrEmail(
      {
        ...lr,
        lrNo: stripLrPrefix(lr.lrNo),
      },
      printUrl,
      copyLabel,
    );
    await sendMail({ ...payload, to: email });

    return NextResponse.json({ ok: true, message: `LR sent to ${email}` });
  } catch (err) {
    return apiError(err, "LR email failed");
  }
}
