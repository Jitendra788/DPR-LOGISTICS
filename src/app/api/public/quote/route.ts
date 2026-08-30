import { NextRequest, NextResponse } from "next/server";
import { validateQuote, type QuoteRequest, type QuoteResult } from "@/services/quoteService";
import { formatQuoteEmail, sendMail } from "@/lib/mail";

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as QuoteRequest;
    const invalid = validateQuote(body);
    if (invalid) {
      return NextResponse.json(invalid, { status: 400 });
    }

    const referenceId = `QT-${Date.now().toString(36).toUpperCase()}`;
    const mail = formatQuoteEmail({
      ...body,
      mobile: body.mobile.replace(/\D/g, "").slice(-10),
      referenceId,
    });

    try {
      await sendMail(mail);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to send email.";
      console.error("[quote-mail]", message);
      return NextResponse.json(
        {
          ok: false,
          error:
            "Request could not be emailed right now. Please call +91 93562 59949 or email dprlogistics2142@gmail.com.",
        } satisfies QuoteResult,
        { status: 502 },
      );
    }

    return NextResponse.json({
      ok: true,
      referenceId,
      message: "Pickup request emailed to DPR Logistics. We will share an estimate within 2 business hours.",
    } satisfies QuoteResult);
  } catch {
    return NextResponse.json({ ok: false, error: "Quote service unavailable." }, { status: 500 });
  }
}
