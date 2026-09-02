import { NextRequest, NextResponse } from "next/server";
import { validateQuote, type QuoteRequest, type QuoteResult } from "@/services/quoteService";
import { saveQuoteInquiry } from "@/services/webInquiryService";

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as QuoteRequest;
    const invalid = validateQuote(body);
    if (invalid) {
      return NextResponse.json(invalid, { status: 400 });
    }

    const referenceId = `QT-${Date.now().toString(36).toUpperCase()}`;
    const result = await saveQuoteInquiry(body, referenceId);

    return NextResponse.json({
      ok: true,
      referenceId: result.referenceId,
      message: result.message,
    } satisfies QuoteResult);
  } catch (err) {
    console.error("[quote]", err);
    return NextResponse.json({ ok: false, error: "Quote service unavailable." }, { status: 500 });
  }
}
