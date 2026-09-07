import { BRAND_LOGO_HEADER, BRAND_STAMP } from "@/lib/brand";
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

function lrWeight(row: BillPrintLr) {
  const w = formatWeightCell(row.chargedWeight || row.actWeight || "");
  const p = row.particulars || "";
  if (w && p && w !== p) return `${w} ${p}`.trim();
  return w || p || "";
}

function formatWeightCell(value: string) {
  const v = String(value ?? "").trim();
  if (!v) return "";
  return v
    .replace(/(\d)\s*([A-Za-z])/g, "$1 $2")
    .replace(/([A-Za-z])\s*(\d)/g, "$1 $2")
    .replace(/\s+/g, " ")
    .trim();
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
  const forLabel = company.name.toUpperCase().includes("DELHI PUNJAB")
    ? "For Delhi Punjab Roadways"
    : "For DPR Logistics";
  const bankName = company.name.toUpperCase().includes("DELHI PUNJAB")
    ? "Bank of India(Delhi Punjab Roadways)"
    : "ICICI Bank (DPR Logistics)";
  const bankAcct = company.name.toUpperCase().includes("DELHI PUNJAB")
    ? "094920110000555"
    : "635805500736";
  const bankIfsc = company.name.toUpperCase().includes("DELHI PUNJAB") ? "BKID0000949" : "ICIC0006358";
  const leftCols = isMeter ? 10 : 11;
  const rightCols = colCount - leftCols;

  return (
    <section className="bill-print-sheet">
      <table className="bill-print-table">
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
                <img src={BRAND_LOGO_HEADER} alt={company.name} className="bill-print-logo" />
              )}
            </td>
            <td colSpan={colCount - 2} className="bill-print-center">
              <div className="bill-print-title-red">{company.name}</div>
              <div className="bill-print-subtitle-red">{company.tagline}</div>
              <div>
                {company.address} E-mail : {company.email} Mob. :{" "}
                {company.phones.replace(/\s*\/\s*/g, ", ")}
              </div>
              {company.companyGst ? (
                <div className="bill-print-bold">GST : {company.companyGst}</div>
              ) : company.companyPan ? (
                <div className="bill-print-bold">PAN No. {company.companyPan}</div>
              ) : null}
            </td>
          </tr>
          <tr>
            <td colSpan={colCount} className="bill-print-center bill-print-heading">
              {docTitle}
            </td>
          </tr>
          <tr>
            <td colSpan={Math.floor(colCount * 0.7)} className="bill-print-party">
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
            <td colSpan={colCount - Math.floor(colCount * 0.7)} className="bill-print-party bill-print-right">
              <div>
                <span className="bill-print-label">Bill No:-</span> {data.billNo}
              </div>
              <div>
                <span className="bill-print-label">Date :-</span> {formatPrintDate(data.billDate)}
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
                <tr key={`${row.lrNo}-${i}`} className="bill-print-center">
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
              <tr key={`${row.lrNo}-${i}`} className="bill-print-center">
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

          {/* Totals + tax — legacy layout */}
          <tr>
            <td colSpan={leftCols} className="bill-print-bold">
              Total Freight : {formatPrintMoney(data.grandTotal || freightTotal)}
            </td>
            <td colSpan={rightCols} className="bill-print-no-pad" rowSpan={5}>
              <table className="bill-print-inner bill-print-taxbox">
                <tbody>
                  <tr>
                    <td className="bill-print-bold">Total Freight</td>
                    <td className="bill-print-right">{formatPrintMoney(freightTotal)}</td>
                  </tr>
                  <tr>
                    <td>
                      CGST@{data.cgstPct || 0}%
                    </td>
                    <td className="bill-print-right">{fmtTax(data.cgstAmt)}</td>
                  </tr>
                  <tr>
                    <td>
                      SGST@{data.sgstPct || 0}%
                    </td>
                    <td className="bill-print-right">{fmtTax(data.sgstAmt)}</td>
                  </tr>
                  <tr>
                    <td>
                      IGST@{data.igstPct || 0}%
                    </td>
                    <td className="bill-print-right">{fmtTax(data.igstAmt)}</td>
                  </tr>
                  <tr>
                    <td className="bill-print-bold">Grand Total</td>
                    <td className="bill-print-right bill-print-bold">{formatPrintMoney(data.grandTotal)}</td>
                  </tr>
                </tbody>
              </table>
            </td>
          </tr>
          <tr>
            <td colSpan={leftCols}>
              <span className="bill-print-label">Amout in Words :</span> {amountInWordsIndian(data.grandTotal)}
            </td>
          </tr>
          <tr>
            <td colSpan={leftCols} className="bill-print-th bill-print-bold">
              Bank Details
            </td>
          </tr>
          <tr>
            <td colSpan={leftCols} className="bill-print-no-pad">
              <table className="bill-print-inner">
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
            <td colSpan={leftCols}>&nbsp;</td>
          </tr>

          <tr>
            <td colSpan={Math.floor(colCount / 2)} className="bill-print-sign-cell">
              Recievr&apos;s Sgnature
            </td>
            <td colSpan={colCount - Math.floor(colCount / 2)} className="bill-print-sign-cell bill-print-right">
              <div className="bill-print-bold">{forLabel}</div>
              <img src={BRAND_STAMP} alt="stamp" className="bill-print-stamp" />
            </td>
          </tr>
        </tbody>
      </table>
    </section>
  );
}
