import nodemailer from "nodemailer";
import { company } from "@/data/marketing/company";

export type MailPayload = {
  subject: string;
  text: string;
  html?: string;
  replyTo?: string;
  to?: string | string[];
};

function mailConfig() {
  const host = process.env.SMTP_HOST || "smtp.gmail.com";
  const port = Number(process.env.SMTP_PORT || 587);
  const user = process.env.SMTP_USER || process.env.MAIL_USER || "";
  const rawPass = process.env.SMTP_PASS || process.env.MAIL_PASS || "";
  const pass = rawPass.replace(/\s/g, "");
  const to = process.env.MAIL_TO || company.email;
  const from = process.env.MAIL_FROM || `DPR Logistics <${user || company.email}>`;
  return { host, port, user, pass, to, from };
}

export function isMailConfigured() {
  const { user, pass } = mailConfig();
  return Boolean(user && pass);
}

export async function sendMail(payload: MailPayload) {
  const { host, port, user, pass, to: defaultTo, from } = mailConfig();
  const to = payload.to || defaultTo;

  if (!user || !pass) {
    throw new Error(
      "Email is not configured. Set SMTP_USER and SMTP_PASS (Gmail App Password) in .env",
    );
  }

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
    ...(host.includes("gmail")
      ? {
          tls: { minVersion: "TLSv1.2" as const },
        }
      : {}),
  });

  await transporter.sendMail({
    from,
    to,
    replyTo: payload.replyTo,
    subject: payload.subject,
    text: payload.text,
    html: payload.html || `<pre style="font-family:inherit;white-space:pre-wrap">${escapeHtml(payload.text)}</pre>`,
  });

  return { to };
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function formatContactEmail(data: {
  name: string;
  mobile: string;
  email: string;
  message: string;
  referenceId: string;
}) {
  const text = [
    "New contact message from dprlogistics.in",
    "",
    `Reference: ${data.referenceId}`,
    `Name: ${data.name}`,
    `Mobile: ${data.mobile}`,
    `Email: ${data.email}`,
    "",
    "Message:",
    data.message,
  ].join("\n");

  return {
    subject: `[Contact] ${data.name} — ${data.referenceId}`,
    text,
    replyTo: data.email,
  };
}

export function formatQuoteEmail(data: {
  pickupLocation: string;
  deliveryLocation: string;
  shipmentType: string;
  weight: string;
  packages: string;
  pickupDate: string;
  name: string;
  mobile: string;
  email: string;
  referenceId: string;
}) {
  const text = [
    "New pickup / quote request from dprlogistics.in",
    "",
    `Reference: ${data.referenceId}`,
    `Name: ${data.name}`,
    `Mobile: ${data.mobile}`,
    `Email: ${data.email || "—"}`,
    "",
    `From: ${data.pickupLocation}`,
    `To: ${data.deliveryLocation}`,
    `Type: ${data.shipmentType}`,
    `Weight: ${data.weight || "—"}`,
    `Packages: ${data.packages || "—"}`,
    `Pickup date: ${data.pickupDate || "—"}`,
  ].join("\n");

  return {
    subject: `[Quote] ${data.pickupLocation} → ${data.deliveryLocation} — ${data.referenceId}`,
    text,
    replyTo: data.email || undefined,
  };
}

export function formatLrEmail(
  lr: {
    lrNo: string;
    lrDate: string;
    fromStation: string;
    toStation: string;
    billingParty: string;
    consignor: string;
    consignee: string;
    vehNo: string;
    grandTotal: number;
    freight: number;
  },
  printUrl: string,
) {
  const text = [
    "DPR Logistics — Lorry Receipt (LR)",
    "",
    `LR No: ${lr.lrNo}`,
    `Date: ${lr.lrDate}`,
    `From: ${lr.fromStation}`,
    `To: ${lr.toStation}`,
    `Vehicle: ${lr.vehNo}`,
    `Billing Party: ${lr.billingParty}`,
    `Consignor: ${lr.consignor}`,
    `Consignee: ${lr.consignee}`,
    `Freight: ${lr.freight}`,
    `Grand Total: ${lr.grandTotal}`,
    "",
    `View / Print LR: ${printUrl}`,
  ].join("\n");

  return {
    subject: `LR ${lr.lrNo} — DPR Logistics`,
    text,
    html: `<p>Please find LR details below.</p><pre style="font-family:inherit;white-space:pre-wrap">${escapeHtml(text)}</pre><p><a href="${printUrl}">Open LR print</a></p>`,
  };
}

export function formatBillEmail(
  bill: { billNo: string; billDate: string; partyName: string; amount: number },
  printUrl: string,
) {
  const text = [
    "DPR Logistics — Tax Invoice",
    "",
    `Bill No: ${bill.billNo}`,
    `Date: ${bill.billDate}`,
    `Party: ${bill.partyName}`,
    `Amount: ${bill.amount}`,
    "",
    `View / Print Bill: ${printUrl}`,
  ].join("\n");

  return {
    subject: `Bill ${bill.billNo} — DPR Logistics`,
    text,
    html: `<p>Please find bill details below.</p><pre style="font-family:inherit;white-space:pre-wrap">${escapeHtml(text)}</pre><p><a href="${printUrl}">Open bill print</a></p>`,
  };
}
