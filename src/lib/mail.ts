import nodemailer from "nodemailer";
import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { company } from "@/data/marketing/company";
import {
  buildLrEmailHtml,
  buildLrEmailText,
  buildLrPrintHtmlDocument,
} from "@/lib/lr-email";
import { BRAND_LOGO_HEADER } from "@/lib/brand";

const LOGO_CID = "dpr-logo@dprlogistics";
const PUBLIC_LOGO_URL = `https://www.dprlogistics.in${BRAND_LOGO_HEADER}`;

function logoFilePath() {
  const file = BRAND_LOGO_HEADER.replace(/^\//, "");
  return join(process.cwd(), "public", file);
}

function logoInlineAttachment() {
  const path = logoFilePath();
  if (!existsSync(path)) return null;
  return {
    filename: "dpr-logo-header.png",
    content: readFileSync(path),
    contentType: "image/png",
    cid: LOGO_CID,
    contentDisposition: "inline" as const,
  };
}

export type MailPayload = {
  subject: string;
  text: string;
  html?: string;
  replyTo?: string;
  to?: string | string[];
  attachments?: Array<{
    filename: string;
    content?: string | Buffer;
    path?: string;
    contentType?: string;
    cid?: string;
    contentDisposition?: "inline" | "attachment";
  }>;
};

const SMTP_CONNECT_MS = 20_000;
const SMTP_SEND_MS = 45_000;

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

function withTimeout<T>(promise: Promise<T>, ms: number, label: string) {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error(`${label} timed out after ${Math.round(ms / 1000)}s. Check SMTP / network.`));
    }, ms);
    promise.then(
      (value) => {
        clearTimeout(timer);
        resolve(value);
      },
      (err) => {
        clearTimeout(timer);
        reject(err);
      },
    );
  });
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type MailTransport = any;

let sharedTransporter: MailTransport | null = null;
let sharedKey = "";
let warmPromise: Promise<void> | null = null;

function getTransporter(): MailTransport {
  const { host, port, user, pass } = mailConfig();
  const key = `${host}|${port}|${user}|${pass}`;
  if (sharedTransporter && sharedKey === key) return sharedTransporter;

  sharedTransporter?.close();
  sharedKey = key;
  warmPromise = null;
  sharedTransporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
    pool: true,
    maxConnections: 1,
    maxMessages: 50,
    connectionTimeout: SMTP_CONNECT_MS,
    greetingTimeout: SMTP_CONNECT_MS,
    socketTimeout: SMTP_SEND_MS,
    ...(host.includes("gmail")
      ? {
          tls: { minVersion: "TLSv1.2" as const },
        }
      : {}),
  });
  return sharedTransporter;
}

/** Open SMTP early (e.g. when LR page loads) so Email is not stuck on first click. */
export async function warmMailTransport() {
  if (!isMailConfigured()) return;
  const transporter = getTransporter();
  if (!warmPromise) {
    warmPromise = withTimeout(transporter.verify(), SMTP_CONNECT_MS, "SMTP connect").then(
      () => undefined,
      (err) => {
        warmPromise = null;
        throw err;
      },
    );
  }
  await warmPromise;
}

export async function sendMail(payload: MailPayload) {
  const { user, pass, to: defaultTo, from } = mailConfig();
  const to = payload.to || defaultTo;

  if (!user || !pass) {
    throw new Error(
      "Email is not configured. Set SMTP_USER and SMTP_PASS (Gmail App Password) in .env",
    );
  }

  const transporter = getTransporter();
  if (warmPromise) {
    try {
      await warmPromise;
    } catch {
      /* sendMail will surface a clearer SMTP error */
    }
  }

  await withTimeout(
    transporter.sendMail({
      from,
      to,
      replyTo: payload.replyTo,
      subject: payload.subject,
      text: payload.text,
      html: payload.html || `<pre style="font-family:inherit;white-space:pre-wrap">${escapeHtml(payload.text)}</pre>`,
      attachments: payload.attachments,
    }),
    SMTP_SEND_MS,
    "SMTP send",
  );

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
    articles?: string;
    particulars?: string;
    actWeight?: string;
    chargedWeight?: string;
    rate?: string;
    gst?: number;
    lrType?: string;
    ewayBill?: string;
    deliveryAt?: string;
  },
  printUrl: string,
  copyLabel = "Consignor Copy",
  _logoUrl = "",
) {
  // CID image so Gmail shows logo even when mail is sent from localhost
  const logoAtt = logoInlineAttachment();
  const logoSrc = logoAtt ? `cid:${LOGO_CID}` : PUBLIC_LOGO_URL;
  const text = buildLrEmailText(lr, printUrl);
  const html = buildLrEmailHtml(lr, printUrl, logoSrc);
  // Attached HTML opens in browser — use public HTTPS logo URL
  const printDoc = buildLrPrintHtmlDocument(lr, copyLabel, PUBLIC_LOGO_URL);
  const safeName = String(lr.lrNo).replace(/[^\w.-]+/g, "_");

  return {
    subject: `LR ${lr.lrNo} — DPR Logistics`,
    text,
    html,
    attachments: [
      ...(logoAtt ? [logoAtt] : []),
      {
        filename: `LR-${safeName}.html`,
        content: printDoc,
        contentType: "text/html; charset=utf-8",
      },
    ],
  };
}

export function formatBillEmail(
  bill: { billNo: string; billDate: string; partyName: string; amount: number },
  printUrl: string,
  _logoUrl = "",
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

  const logoAtt = logoInlineAttachment();
  const logo = logoAtt
    ? `<img src="cid:${LOGO_CID}" alt="DPR Logistics" width="140" style="display:block;max-width:140px;height:auto;margin:0 auto 12px;background:#fff;padding:8px;border-radius:8px;" />`
    : `<img src="${escapeHtml(PUBLIC_LOGO_URL)}" alt="DPR Logistics" width="140" style="display:block;max-width:140px;height:auto;margin:0 auto 12px;background:#fff;padding:8px;border-radius:8px;" />`;

  return {
    subject: `Bill ${bill.billNo} — DPR Logistics`,
    text,
    html: `<div style="font-family:Arial,Helvetica,sans-serif;max-width:560px;margin:0 auto;padding:16px;">
      ${logo}
      <p>Please find bill details below.</p>
      <pre style="font-family:inherit;white-space:pre-wrap">${escapeHtml(text)}</pre>
      <p><a href="${escapeHtml(printUrl)}" style="display:inline-block;background:#0f766e;color:#fff;text-decoration:none;font-weight:700;padding:10px 16px;border-radius:8px;">Open &amp; Print Bill</a></p>
    </div>`,
    attachments: logoAtt ? [logoAtt] : [],
  };
}
