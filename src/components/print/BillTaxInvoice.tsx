import {
  BRAND_LOGO_HEADER_PRINT,
  BRAND_STAMP_PRINT,
  ROADWAYS_LOGO_PRINT,
  ROADWAYS_STAMP_PRINT,
} from "@/lib/brand";
import { amountInWordsIndian } from "@/lib/amount-words";
import { formatPrintDate, formatPrintMoney, lrPrintCompany } from "@/lib/lr-print";
import { stripLrPrefix } from "@/lib/lr-no";
import { lrBillableAmount } from "@/lib/lr-totals";
import "./bill-print.css";

export type BillPrintLr = {
  lrNo: string;
  lrDate: string;
  chargedWeight: string;
  actWeight: string;
  totalMeter?: string;
  rate: string;
  fromStation: string;
  toStation: string;
  freight: number;
  serviceTax: number;
  haltage: number;
  insurance: number;
  stCharges: number;
  doorCollection: number;
  barrier: number;
  hamali: number;
  other: number;
  total: number;
  grandTotal: number;
  particulars: string;
  billAs?: string;
};

export type BillPrintData = {
  billNo: string;
  billDate: string;
  poNo: string;
  partyName: string;
  partyAddress: string;
  partyGst: string;
  freight: number;
  cgstPct: number;
  cgstAmt: number;
  sgstPct: number;
  sgstAmt: number;
  igstPct: number;
  igstAmt: number;
  grandTotal: number;
  lrs: BillPrintLr[];
};

export type BillPrintVariant = "weight" | "meter";

/** Old ASP Weight column = charged/act weight only (e.g. 18TN32FEET), not goods desc. */
function lrWeight(row: BillPrintLr) {
  const w = String(row.chargedWeight || row.actWeight || "").trim();
  if (w) return w;
  return String(row.particulars || "").trim();
}

function lrLineFreight(row: BillPrintLr) {
  return lrBillableAmount(row);
}

function fmtCharge(value: number) {
  const num = Number(value) || 0;
  return num === 0 ? "0.00" : formatPrintMoney(num);
}

function fmtTax(value: number) {
  const num = Number(value) || 0;
  return num.toFixed(2);
}

type PrintCompany = {
  name: string;
  tagline: string;
  address: string;
  email: string;
  phones: string;
  companyGst: string;
  companyPan: string;
};

type Props = {
  data: BillPrintData;
  variant?: BillPrintVariant;
  hideLogo?: boolean;
  company?: PrintCompany;
  /** TAX INVOICE (DPR) or Customer Bill (Roadways) */
  docTitle?: string;
};

/** Column % — Sr No / Ser Tax / St.Charges / Door Colle. stay inside borders */
const WEIGHT_COLS = [
  "4%",
  "5.5%",
  "5.5%",
  "5.5%",
  "4%",
  "6.5%",
  "6.5%",
  "5%",
  "6%",
  "5.5%",
  "6.5%",
  "7.5%",
  "7.5%",
  "5%",
  "5.5%",
  "4.5%",
  "9.5%",
] as const;

const METER_COLS = [
  "4%",
  "6%",
  "5.5%",
  "8.5%",
  "8.5%",
  "5%",
  "4.5%",
  "5.5%",
  "5.5%",
  "6.5%",
  "7%",
  "7%",
  "5%",
  "5.5%",
  "4.5%",
  "11.5%",
] as const;

export function BillTaxInvoice({
  data,
  variant = "weight",
  hideLogo = false,
  company = lrPrintCompany,
  docTitle = "TAX INVOICE",
}: Props) {
  const freightTotal = data.lrs.reduce((s, r) => s + lrLineFreight(r), 0) || data.freight;
  const isMeter = variant === "meter";
  const colCount = isMeter ? 16 : 17;
  const isRoadways = company.name.toUpperCase().includes("DELHI PUNJAB");
  const forLabel = isRoadways ? "For Delhi Punjab Roadways" : "For DPR Logistics";
  const bankName = isRoadways
    ? "Bank of India(Delhi Punjab Roadways)"
    : "ICICI Bank (DPR Logistics)";
  const bankAcct = isRoadways ? "094920110000555" : "635805500736";
  const bankIfsc = isRoadways ? "BKID0000949" : "ICIC0006358";
  const logoSrc = isRoadways ? ROADWAYS_LOGO_PRINT : BRAND_LOGO_HEADER_PRINT;
  const stampSrc = isRoadways ? ROADWAYS_STAMP_PRINT : BRAND_STAMP_PRINT;
  const colWidths = isMeter ? METER_COLS : WEIGHT_COLS;
  const wordsLabel = "Amout in Words :";
  /** Tax strip narrow like old ASP — stamp left edge aligns with this */
  const rightCols = 3;
  const leftCols = colCount - rightCols;
  const sheetClass = [
    "bill-print-sheet",
    isMeter ? "bill-print-meter" : "bill-print-weight",
    isRoadways ? "bill-print-roadways" : "bill-print-dpr",
  ].join(" ");

  return (
    <section className={sheetClass}>
      <table className="bill-print-table">
        <colgroup>
          {colWidths.map((w, i) => (
            <col key={`${w}-${i}`} style={{ width: w }} />
          ))}
        </colgroup>
        <tbody>
          <tr>
            <td colSpan={colCount} className="bill-print-center bill-print-bold bill-print-bless">
              || Shri Ganesh Prasanna ||
            </td>
          </tr>
          <tr>
            <td colSpan={2} className="bill-print-logo-cell">
              {hideLogo ? (
                <div className="bill-print-title-red" style={{ fontSize: 14 }}>
                  {company.name}
                </div>
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={logoSrc} alt={company.name} className="bill-print-logo" />
              )}
            </td>
            <td colSpan={colCount - 2} className="bill-print-center">
              <div className="bill-print-title-red">{company.name}</div>
              <div className="bill-print-subtitle-red">{company.tagline}</div>
              <div className="bill-print-addr">
                {company.address} E-mail : {company.email}.
                <br />
                Mob. : {company.phones.replace(/\s*\/\s*/g, ", ")}
              </div>
              {company.companyGst ? (
                <div className="bill-print-bold bill-print-gstline">GST : {company.companyGst}</div>
              ) : company.companyPan ? (
                <div className="bill-print-bold bill-print-gstline">PAN No. {company.companyPan}</div>
              ) : null}
            </td>
          </tr>
          <tr>
            <td colSpan={colCount} className="bill-print-center bill-print-doctitle">
              {docTitle}
            </td>
          </tr>
          <tr>
            <td colSpan={Math.floor(colCount * 0.78)} className="bill-print-party">
              <div>
                <span className="bill-print-label">Party Name :</span> {data.partyName}
              </div>
              {data.partyAddress ? (
                <div>
                  <span className="bill-print-label">Address :</span> {data.partyAddress}
                </div>
              ) : null}
              {data.partyGst ? (
                <div>
                  <span className="bill-print-label">GST NO. :</span> {data.partyGst}
                </div>
              ) : null}
              <div>
                <span className="bill-print-label">PO No.:</span> {data.poNo || ""}
              </div>
            </td>
            <td colSpan={colCount - Math.floor(colCount * 0.78)} className="bill-print-party bill-print-party-meta">
              <div className="bill-print-party-meta-inner">
                <div>
                  <span className="bill-print-label">Bill No:-</span> {data.billNo}
                </div>
                <div>
                  <span className="bill-print-label">Date :-</span> {formatPrintDate(data.billDate)}
                </div>
              </div>
            </td>
          </tr>

          {isMeter ? (
            <tr className="bill-print-bold bill-print-center bill-print-th">
              <td>Sr No</td>
              <td>LR No</td>
              <td>LR Date</td>
              <td>From</td>
              <td>To</td>
              <td>Mtr Qty</td>
              <td>Rate</td>
              <td>Ser Tax</td>
              <td>Handling</td>
              <td>Insurance</td>
              <td>St.Charges</td>
              <td>Door Colle.</td>
              <td>Barrier</td>
              <td>Hamali</td>
              <td>Other</td>
              <td>Total Bill</td>
            </tr>
          ) : (
            <tr className="bill-print-bold bill-print-center bill-print-th">
              <td>Sr No</td>
              <td>LR No</td>
              <td>LR Date</td>
              <td>Weight</td>
              <td>Rate</td>
              <td>From</td>
              <td>To</td>
              <td>Freight</td>
              <td>Ser Tax</td>
              <td>Handling</td>
              <td>Insurance</td>
              <td>St.Charges</td>
              <td>Door Colle.</td>
              <td>Barrier</td>
              <td>Hamali</td>
              <td>Other</td>
              <td>Total Bill</td>
            </tr>
          )}

          {data.lrs.map((row, i) => {
            const lineFreight = lrLineFreight(row);
            if (isMeter) {
              return (
                <tr key={`${row.lrNo}-${i}`} className="bill-print-center bill-print-data">
                  <td>{i + 1}</td>
                  <td>{stripLrPrefix(row.lrNo)}</td>
                  <td>{formatPrintDate(row.lrDate)}</td>
                  <td>{row.fromStation}</td>
                  <td>{row.toStation}</td>
                  <td>{row.totalMeter || ""}</td>
                  <td>{row.rate || ""}</td>
                  <td>{fmtCharge(row.serviceTax)}</td>
                  <td>{fmtCharge(row.haltage)}</td>
                  <td>{fmtCharge(row.insurance)}</td>
                  <td>{fmtCharge(row.stCharges)}</td>
                  <td>{fmtCharge(row.doorCollection)}</td>
                  <td>{fmtCharge(row.barrier)}</td>
                  <td>{fmtCharge(row.hamali)}</td>
                  <td>{fmtCharge(row.other)}</td>
                  <td>{formatPrintMoney(lineFreight)}</td>
                </tr>
              );
            }
            return (
              <tr key={`${row.lrNo}-${i}`} className="bill-print-center bill-print-data">
                <td>{i + 1}</td>
                <td>{stripLrPrefix(row.lrNo)}</td>
                <td>{formatPrintDate(row.lrDate)}</td>
                <td>{lrWeight(row)}</td>
                <td>{row.rate || ""}</td>
                <td>{row.fromStation}</td>
                <td>{row.toStation}</td>
                <td>{formatPrintMoney(row.freight)}</td>
                <td>{fmtCharge(row.serviceTax)}</td>
                <td>{fmtCharge(row.haltage)}</td>
                <td>{fmtCharge(row.insurance)}</td>
                <td>{fmtCharge(row.stCharges)}</td>
                <td>{fmtCharge(row.doorCollection)}</td>
                <td>{fmtCharge(row.barrier)}</td>
                <td>{fmtCharge(row.hamali)}</td>
                <td>{fmtCharge(row.other)}</td>
                <td>{formatPrintMoney(lineFreight)}</td>
              </tr>
            );
          })}

          <tr>
            <td colSpan={leftCols} className="bill-print-bold bill-print-total-row">
              Total Freight : {formatPrintMoney(data.grandTotal || freightTotal)}
            </td>
            <td colSpan={rightCols} className="bill-print-no-pad" rowSpan={4}>
              <table className="bill-print-inner bill-print-taxbox">
                <colgroup>
                  <col style={{ width: "48%" }} />
                  <col style={{ width: "52%" }} />
                </colgroup>
                <tbody>
                  <tr>
                    <td className="bill-print-bold">Total Freight</td>
                    <td className="bill-print-right">{formatPrintMoney(freightTotal)}</td>
                  </tr>
                  <tr>
                    <td className="bill-print-bold">CGST@{data.cgstPct || 0}%</td>
                    <td className="bill-print-right bill-print-bold">{fmtTax(data.cgstAmt)}</td>
                  </tr>
                  <tr>
                    <td className="bill-print-bold">SGST@{data.sgstPct || 0}%</td>
                    <td className="bill-print-right bill-print-bold">{fmtTax(data.sgstAmt)}</td>
                  </tr>
                  <tr>
                    <td className="bill-print-bold">IGST@{data.igstPct || 0}%</td>
                    <td className="bill-print-right bill-print-bold">{fmtTax(data.igstAmt)}</td>
                  </tr>
                  <tr className="bill-print-grand">
                    <td className="bill-print-bold">Grand Total</td>
                    <td className="bill-print-right bill-print-bold">{formatPrintMoney(data.grandTotal)}</td>
                  </tr>
                </tbody>
              </table>
            </td>
          </tr>
          <tr>
            <td colSpan={leftCols} className="bill-print-words">
              <span className="bill-print-label">{wordsLabel}</span>{amountInWordsIndian(data.grandTotal)}
            </td>
          </tr>
          <tr>
            <td colSpan={leftCols} className="bill-print-bankhead bill-print-bold">
              Bank Details
            </td>
          </tr>
          <tr>
            <td colSpan={leftCols} className="bill-print-no-pad">
              <table className="bill-print-inner bill-print-bank">
                <colgroup>
                  <col style={{ width: "50%" }} />
                  <col style={{ width: "50%" }} />
                </colgroup>
                <tbody>
                  <tr>
                    <td>Bank Name : {bankName}</td>
                    <td>Account Number:{bankAcct}</td>
                  </tr>
                  <tr>
                    <td>IFSC Code:{bankIfsc}</td>
                    <td>Branch Kolhapur (Current A/C)</td>
                  </tr>
                </tbody>
              </table>
            </td>
          </tr>

          <tr>
            <td colSpan={leftCols} className="bill-print-sign-cell">
              Recievr&apos;s Sgnature
            </td>
            <td colSpan={rightCols} className="bill-print-sign-cell bill-print-sign-right">
              <div className="bill-print-bold">{forLabel}</div>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={stampSrc} alt={`${company.name} stamp`} className="bill-print-stamp" />
            </td>
          </tr>
        </tbody>
      </table>
    </section>
  );
}
