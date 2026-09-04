import { createHmac } from "node:crypto";
import { formatPrintDate, formatPrintMoney, lrPrintCompany } from "@/lib/lr-print";
import { stripLrPrefix } from "@/lib/lr-no";

export type LrEmailBooking = {
  lrNo: string;
  lrDate: string;
  fromStation: string;
  toStation: string;
  billingParty: string;
  consignor: string;
  consignee: string;
  vehNo: string;
  articles?: string;
  particulars?: string;
  actWeight?: string;
  chargedWeight?: string;
  rate?: string;
  freight: number;
  gst?: number;
  grandTotal: number;
  lrType?: string;
  ewayBill?: string;
  deliveryAt?: string;
};

function shareSecret() {
  return (
    process.env.SESSION_SECRET?.trim() ||
    process.env.DATABASE_URL?.trim() ||
    process.env.POSTGRES_PRISMA_URL?.trim() ||
    "dev-only-session-secret-change-me"
  );
}

function b64url(input: string) {
  return Buffer.from(input, "utf8")
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

function fromB64url(input: string) {
  const pad = input.length % 4 === 0 ? "" : "=".repeat(4 - (input.length % 4));
  return Buffer.from(input.replace(/-/g, "+").replace(/_/g, "/") + pad, "base64").toString("utf8");
}

/** Signed share token so email recipients can open / print without login. */
export function createLrPrintShareToken(lrNo: string, maxAgeSec = 60 * 60 * 24 * 60) {
  const payload = JSON.stringify({
    lrNo: String(lrNo).trim(),
    exp: Math.floor(Date.now() / 1000) + maxAgeSec,
  });
  const payloadB64 = b64url(payload);
  const sig = createHmac("sha256", shareSecret())
    .update(payloadB64)
    .digest("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
  return `${payloadB64}.${sig}`;
}

export function verifyLrPrintShareToken(raw: string | null | undefined, expectedLrNo?: string) {
  if (!raw?.trim()) return false;
  const [payloadB64, sig] = raw.split(".");
  if (!payloadB64 || !sig) return false;
  const expected = createHmac("sha256", shareSecret())
    .update(payloadB64)
    .digest("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
  if (expected !== sig) return false;
  try {
    const payload = JSON.parse(fromB64url(payloadB64)) as { lrNo?: string; exp?: number };
    if (!payload.lrNo || !payload.exp) return false;
    if (payload.exp < Math.floor(Date.now() / 1000)) return false;
    if (expectedLrNo && String(payload.lrNo).trim() !== String(expectedLrNo).trim()) return false;
    return true;
  } catch {
    return false;
  }
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function money(n: number) {
  const v = Number(n) || 0;
  return v.toLocaleString("en-IN", { maximumFractionDigits: 2 });
}

function row(label: string, value: string) {
  if (!value) return "";
  return `<tr>
    <td style="padding:8px 12px;border-bottom:1px solid #e8eef3;color:#64748b;width:38%;font-size:13px;">${escapeHtml(label)}</td>
    <td style="padding:8px 12px;border-bottom:1px solid #e8eef3;color:#0f172a;font-size:13px;font-weight:600;">${escapeHtml(value)}</td>
  </tr>`;
}

/** Full printable HTML document attached to the email. */
export function buildLrPrintHtmlDocument(lr: LrEmailBooking, copyLabel = "Consignor Copy", logoUrl = "") {
  const c = lrPrintCompany;
  const lrDisp = stripLrPrefix(lr.lrNo);
  const date = formatPrintDate(lr.lrDate) || lr.lrDate;
  const logoBlock = logoUrl
    ? `<img src="${escapeHtml(logoUrl)}" alt="${escapeHtml(c.name)}" style="max-height:64px;max-width:160px;display:block;margin-bottom:8px;" />`
    : "";
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8"/>
<title>LR ${escapeHtml(lrDisp)} — ${escapeHtml(c.name)}</title>
<style>
  body{font-family:Arial,Helvetica,sans-serif;color:#111;margin:24px;background:#fff;}
  .sheet{max-width:800px;margin:0 auto;border:2px solid #0f766e;padding:18px 20px;}
  .top{display:flex;justify-content:space-between;gap:12px;border-bottom:2px solid #0f766e;padding-bottom:12px;margin-bottom:14px;}
  .brand{font-size:22px;font-weight:800;color:#0f766e;letter-spacing:.02em;}
  .tag{font-size:12px;color:#475569;margin-top:2px;}
  .meta{text-align:right;font-size:12px;color:#334155;line-height:1.45;}
  .copy{display:inline-block;background:#0f766e;color:#fff;font-size:11px;font-weight:700;padding:4px 8px;border-radius:4px;margin-bottom:8px;}
  h1{margin:0 0 4px;font-size:16px;}
  table{width:100%;border-collapse:collapse;margin-top:8px;}
  th,td{border:1px solid #cbd5e1;padding:8px 10px;font-size:13px;vertical-align:top;}
  th{background:#f0fdfa;text-align:left;width:30%;color:#0f766e;}
  .totals{margin-top:12px;text-align:right;font-size:15px;}
  .totals strong{color:#0f766e;font-size:18px;}
  .foot{margin-top:18px;font-size:11px;color:#64748b;border-top:1px solid #e2e8f0;padding-top:10px;}
  @media print{body{margin:0}.sheet{border:0;padding:0}}
</style>
</head>
<body>
  <div class="sheet">
    <div class="copy">${escapeHtml(copyLabel)}</div>
    <div class="top">
      <div>
        ${logoBlock}
        <div class="brand">${escapeHtml(c.name)}</div>
        <div class="tag">${escapeHtml(c.tagline)}</div>
        <div class="tag">${escapeHtml(c.address)}</div>
      </div>
      <div class="meta">
        <div><strong>GST:</strong> ${escapeHtml(c.companyGst)}</div>
        <div><strong>PAN:</strong> ${escapeHtml(c.companyPan)}</div>
        <div>${escapeHtml(c.phones)}</div>
        <div>${escapeHtml(c.email)}</div>
      </div>
    </div>
    <h1>Lorry Receipt (LR) — ${escapeHtml(lrDisp)}</h1>
    <div class="tag">Date: ${escapeHtml(date)}</div>
    <table>
      <tr><th>From</th><td>${escapeHtml(lr.fromStation || "—")}</td></tr>
      <tr><th>To</th><td>${escapeHtml(lr.toStation || "—")}</td></tr>
      <tr><th>Vehicle</th><td>${escapeHtml(lr.vehNo || "—")}</td></tr>
      <tr><th>Consignor</th><td>${escapeHtml(lr.consignor || "—")}</td></tr>
      <tr><th>Consignee</th><td>${escapeHtml(lr.consignee || "—")}</td></tr>
      <tr><th>Articles</th><td>${escapeHtml(lr.articles || "—")}</td></tr>
      <tr><th>Particulars</th><td>${escapeHtml(lr.particulars || "—")}</td></tr>
      <tr><th>Actual Wt</th><td>${escapeHtml(lr.actWeight || "—")}</td></tr>
      <tr><th>Charged Wt</th><td>${escapeHtml(lr.chargedWeight || "—")}</td></tr>
      <tr><th>Rate</th><td>${escapeHtml(lr.rate || "—")}</td></tr>
      <tr><th>LR Type</th><td>${escapeHtml(lr.lrType || "—")}</td></tr>
      <tr><th>E-Way Bill</th><td>${escapeHtml(lr.ewayBill || "—")}</td></tr>
      <tr><th>GST</th><td>₹ ${escapeHtml(money(lr.gst || 0))}</td></tr>
      <tr><th>Grand Total</th><td><strong>₹ ${escapeHtml(money(lr.grandTotal))}</strong></td></tr>
    </table>
    <div class="totals">Grand Total: <strong>₹ ${escapeHtml(money(lr.grandTotal))}</strong></div>
    <div class="foot">${escapeHtml(c.blessings)} · ${escapeHtml(c.jurisdiction)} · Customer Care ${escapeHtml(c.customerCare)}</div>
  </div>
  <script>window.addEventListener('load',function(){setTimeout(function(){window.print()},200)});</script>
</body>
</html>`;
}

/** Rich HTML body shown inside Gmail / Outlook. */
export function buildLrEmailHtml(lr: LrEmailBooking, printUrl: string, logoUrl = "") {
  const c = lrPrintCompany;
  const lrDisp = stripLrPrefix(lr.lrNo);
  const date = formatPrintDate(lr.lrDate) || lr.lrDate;
  const total = formatPrintMoney(lr.grandTotal) || money(lr.grandTotal);
  const message =
    "Dear Sir/Madam, please find your Lorry Receipt from DPR Logistics. Keep this for your records. For any query, call our customer care. Thank you for choosing DPR Logistics.";
  const logoBlock = logoUrl
    ? `<img src="${escapeHtml(logoUrl)}" alt="${escapeHtml(c.name)}" width="140" style="display:block;max-width:140px;height:auto;margin:0 auto 12px;background:#fff;padding:8px;border-radius:8px;" />`
    : "";

  return `<!DOCTYPE html>
<html>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:Arial,Helvetica,sans-serif;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f1f5f9;padding:24px 12px;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellspacing="0" cellpadding="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #e2e8f0;">
          <tr>
            <td style="background:linear-gradient(135deg,#0f766e,#115e59);padding:22px 24px;color:#fff;text-align:center;">
              ${logoBlock}
              <div style="font-size:11px;letter-spacing:.14em;text-transform:uppercase;opacity:.85;">${escapeHtml(c.name)}</div>
              <div style="font-size:22px;font-weight:800;margin-top:4px;">Lorry Receipt</div>
              <div style="font-size:13px;opacity:.9;margin-top:4px;">LR No ${escapeHtml(lrDisp)} · ${escapeHtml(date)}</div>
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
                ${row("From", lr.fromStation || "—")}
                ${row("To", lr.toStation || "—")}
                ${row("Vehicle", lr.vehNo || "—")}
                ${row("Consignor", lr.consignor || "—")}
                ${row("Consignee", lr.consignee || "—")}
                ${row("Articles", lr.articles || "")}
                ${row("Particulars", lr.particulars || "")}
                ${row("Weight", [lr.actWeight, lr.chargedWeight].filter(Boolean).join(" / ") || "")}
                ${row("GST", lr.gst ? `₹ ${money(lr.gst)}` : "")}
                ${row("Grand Total", `₹ ${total}`)}
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding:8px 24px 24px;" align="center">
              <a href="${escapeHtml(printUrl)}" style="display:inline-block;background:#0f766e;color:#ffffff;text-decoration:none;font-weight:700;font-size:14px;padding:12px 22px;border-radius:8px;">
                Open &amp; Print LR
              </a>
              <div style="font-size:12px;color:#64748b;margin-top:10px;">A printable LR file is also attached to this email.</div>
            </td>
          </tr>
          <tr>
            <td style="background:#f8fafc;padding:14px 24px;font-size:11px;color:#64748b;border-top:1px solid #e2e8f0;">
              ${escapeHtml(c.address)} · ${escapeHtml(c.phones)} · ${escapeHtml(c.email)}
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export function buildLrEmailText(lr: LrEmailBooking, printUrl: string) {
  const c = lrPrintCompany;
  const lrDisp = stripLrPrefix(lr.lrNo);
  return [
    "DPR Logistics — Lorry Receipt (LR)",
    "",
    "Dear Sir/Madam, please find your Lorry Receipt from DPR Logistics. Keep this for your records. For any query, call our customer care. Thank you for choosing DPR Logistics.",
    "",
    `LR No: ${lrDisp}`,
    `Date: ${formatPrintDate(lr.lrDate) || lr.lrDate}`,
    `From: ${lr.fromStation}`,
    `To: ${lr.toStation}`,
    `Vehicle: ${lr.vehNo}`,
    `Consignor: ${lr.consignor}`,
    `Consignee: ${lr.consignee}`,
    `Grand Total: ${lr.grandTotal}`,
    "",
    `Print LR: ${printUrl}`,
    "",
    "A printable LR HTML file is attached.",
    "",
    `${c.name} · ${c.phones} · ${c.email}`,
  ].join("\n");
}
