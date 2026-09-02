import { NextRequest, NextResponse } from "next/server";
import { validateContact, type ContactRequest, type ContactResult } from "@/services/contactService";
import { saveContactInquiry } from "@/services/webInquiryService";

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as ContactRequest;
    const invalid = validateContact(body);
    if (invalid) {
      return NextResponse.json(invalid, { status: 400 });
    }

    const referenceId = `CN-${Date.now().toString(36).toUpperCase()}`;
    const result = await saveContactInquiry(body, referenceId);

    return NextResponse.json({
      ok: true,
      referenceId: result.referenceId,
      message: result.message,
    } satisfies ContactResult);
  } catch (err) {
    console.error("[contact]", err);
    return NextResponse.json({ ok: false, error: "Contact service unavailable." }, { status: 500 });
  }
}
