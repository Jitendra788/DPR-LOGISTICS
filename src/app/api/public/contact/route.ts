import { NextRequest, NextResponse } from "next/server";
import { submitContact, type ContactRequest } from "@/services/contactService";

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as ContactRequest;
    const result = await submitContact(body);
    if (!result.ok) {
      return NextResponse.json(result, { status: 400 });
    }
    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ ok: false, error: "Contact service unavailable." }, { status: 500 });
  }
}
