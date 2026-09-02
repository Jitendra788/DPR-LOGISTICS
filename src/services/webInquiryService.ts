import { prisma } from "@/lib/prisma";
import { formatContactEmail, formatQuoteEmail, isMailConfigured, sendMail } from "@/lib/mail";
import type { ContactRequest } from "@/services/contactService";
import type { QuoteRequest } from "@/services/quoteService";

export async function saveContactInquiry(body: ContactRequest, referenceId: string) {
  const mobile = body.mobile.replace(/\D/g, "").slice(-10);
  const row = await prisma.webInquiry.create({
    data: {
      type: "contact",
      referenceId,
      name: body.name.trim(),
      mobile,
      email: body.email.trim(),
      summary: body.message.trim().slice(0, 200),
      payloadJson: JSON.stringify({ ...body, mobile }),
      emailed: false,
    },
  });

  let emailed = false;
  if (isMailConfigured()) {
    try {
      await sendMail(formatContactEmail({ ...body, mobile, referenceId }));
      emailed = true;
      await prisma.webInquiry.update({ where: { id: row.id }, data: { emailed: true } });
    } catch (err) {
      console.error("[contact-mail]", err instanceof Error ? err.message : err);
    }
  } else {
    console.warn("[contact-mail] SMTP not configured — inquiry saved to database only");
  }

  return {
    referenceId,
    emailed,
    message: emailed
      ? "Message sent to DPR Logistics. Our team will reply within one business day."
      : `Message received (Ref: ${referenceId}). Our team will reply within one business day.`,
  };
}

export async function saveQuoteInquiry(body: QuoteRequest, referenceId: string) {
  const mobile = body.mobile.replace(/\D/g, "").slice(-10);
  const summary = `${body.pickupLocation} → ${body.deliveryLocation}`;
  const row = await prisma.webInquiry.create({
    data: {
      type: "quote",
      referenceId,
      name: body.name.trim(),
      mobile,
      email: (body.email ?? "").trim(),
      summary,
      payloadJson: JSON.stringify({ ...body, mobile }),
      emailed: false,
    },
  });

  let emailed = false;
  if (isMailConfigured()) {
    try {
      await sendMail(formatQuoteEmail({ ...body, mobile, referenceId }));
      emailed = true;
      await prisma.webInquiry.update({ where: { id: row.id }, data: { emailed: true } });
    } catch (err) {
      console.error("[quote-mail]", err instanceof Error ? err.message : err);
    }
  } else {
    console.warn("[quote-mail] SMTP not configured — inquiry saved to database only");
  }

  return {
    referenceId,
    emailed,
    message: emailed
      ? "Pickup request emailed to DPR Logistics. We will share an estimate within 2 business hours."
      : `Pickup request received (Ref: ${referenceId}). We will share an estimate within 2 business hours.`,
  };
}
