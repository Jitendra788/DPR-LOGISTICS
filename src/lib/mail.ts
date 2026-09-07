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
  bill: {
    billNo: string;
    billDate: string;
    partyName: string;
    amount: number;
    cgstAmt?: number;
    sgstAmt?: number;
    igstAmt?: number;
    grandTotal?: number;
  },
  printUrl: string,
  _logoUrl = "",
) {
  const grand = Number(bill.grandTotal ?? bill.amount) || 0;
  const money = (n: number) =>
    (Number(n) || 0).toLocaleString("en-IN", { maximumFractionDigits: 2 });
  const date = bill.billDate || "";
  const message =
    "Dear Sir/Madam, please find your Tax Invoice from DPR Logistics. Keep this for your records. For any query, call our customer care. Thank you for choosing DPR Logistics.";

  const text = [
    "DPR Logistics — Tax Invoice",
    "",
    message,
    "",
    `Bill No: ${bill.billNo}`,
    `Date: ${date}`,
    `Party: ${bill.partyName}`,
    `Grand Total: ${grand}`,
    "",
    `Print Bill: ${printUrl}`,
  ].join("\n");

  const logoAtt = logoInlineAttachment();
  const logoSrc = logoAtt ? `cid:${LOGO_CID}` : PUBLIC_LOGO_URL;

  function row(label: string, value: string) {
    if (!value) return "";
    return `<tr>
      <td style="padding:8px 12px;border-bottom:1px solid #e8eef3;color:#64748b;width:38%;font-size:13px;">${escapeHtml(label)}</td>
      <td style="padding:8px 12px;border-bottom:1px solid #e8eef3;color:#0f172a;font-size:13px;font-weight:600;">${escapeHtml(value)}</td>
    </tr>`;
  }

  const html = `<!DOCTYPE html>
<html>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:Arial,Helvetica,sans-serif;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f1f5f9;padding:24px 12px;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellspacing="0" cellpadding="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #e2e8f0;">
          <tr>
            <td style="background:linear-gradient(135deg,#0f766e,#115e59);padding:22px 24px;color:#fff;text-align:center;">
              <img src="${escapeHtml(logoSrc)}" alt="DPR Logistics" width="140" style="display:block;max-width:140px;height:auto;margin:0 auto 12px;background:#fff;padding:8px;border-radius:8px;" />
              <div style="font-size:11px;letter-spacing:.14em;text-transform:uppercase;opacity:.85;">DPR LOGISTICS</div>
              <div style="font-size:22px;font-weight:800;margin-top:4px;">Tax Invoice</div>
              <div style="font-size:13px;opacity:.9;margin-top:4px;">Bill No ${escapeHtml(bill.billNo)} · ${escapeHtml(date)}</div>
            </td>
          </tr>
          <tr>
            <td style="padding:18px 24px 6px;font-size:14px;line-height:1.55;color:#334155;">
              ${escapeHtml(message)}
            </td>
          </tr>
          <tr>
            <td style="padding:12px 24px 8px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border:1px solid #e8eef3;border-radius:10px;overflow:hidden;">
                ${row("Bill No", bill.billNo)}
                ${row("Date", date)}
                ${row("Party", bill.partyName || "—")}
                ${row("CGST", bill.cgstAmt ? `₹ ${money(bill.cgstAmt)}` : "")}
                ${row("SGST", bill.sgstAmt ? `₹ ${money(bill.sgstAmt)}` : "")}
                ${row("IGST", bill.igstAmt ? `₹ ${money(bill.igstAmt)}` : "")}
                ${row("Grand Total", `₹ ${money(grand)}`)}
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding:8px 24px 24px;" align="center">
              <a href="${escapeHtml(printUrl)}" style="display:inline-block;background:#0f766e;color:#ffffff;text-decoration:none;font-weight:700;font-size:14px;padding:12px 22px;border-radius:8px;">
                Open &amp; Print Bill
              </a>
            </td>
          </tr>
          <tr>
            <td style="background:#f8fafc;padding:14px 24px;font-size:11px;color:#64748b;border-top:1px solid #e2e8f0;">
              DPR Logistics · Customer Care
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  return {
    subject: `Bill ${bill.billNo} — DPR Logistics`,
    text,
    html,
    attachments: logoAtt ? [logoAtt] : [],
  };
}
