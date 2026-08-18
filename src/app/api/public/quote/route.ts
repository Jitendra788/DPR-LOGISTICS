import { NextRequest, NextResponse } from "next/server";
import { submitQuote, type QuoteRequest } from "@/services/quoteService";

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as QuoteRequest;
    const result = await submitQuote(body);
    if (!result.ok) {
      return NextResponse.json(result, { status: 400 });
    }
    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ ok: false, error: "Quote service unavailable." }, { status: 500 });
  }
}
