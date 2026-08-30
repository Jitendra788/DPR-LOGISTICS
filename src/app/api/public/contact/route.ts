import { NextRequest, NextResponse } from "next/server";
import { validateContact, type ContactRequest, type ContactResult } from "@/services/contactService";
import { formatContactEmail, sendMail } from "@/lib/mail";

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as ContactRequest;
    const invalid = validateContact(body);
    if (invalid) {
      return NextResponse.json(invalid, { status: 400 });
    }

    const referenceId = `CN-${Date.now().toString(36).toUpperCase()}`;
    const mail = formatContactEmail({
      ...body,
      mobile: body.mobile.replace(/\D/g, "").slice(-10),
      referenceId,
    });

    try {
      await sendMail(mail);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to send email.";
      console.error("[contact-mail]", message);
      return NextResponse.json(
        {
          ok: false,
          error:
            "Message could not be emailed right now. Please call +91 93562 59949 or email dprlogistics2142@gmail.com.",
        } satisfies ContactResult,
        { status: 502 },
      );
    }

    return NextResponse.json({
      ok: true,
      referenceId,
      message: "Message sent to DPR Logistics. Our team will reply within one business day.",
    } satisfies ContactResult);
  } catch {
    return NextResponse.json({ ok: false, error: "Contact service unavailable." }, { status: 500 });
  }
}
