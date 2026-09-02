import { BRAND_LOGO_HEADER } from "@/lib/brand";
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

function lrWeight(row: BillPrintLr) {
  const w = row.chargedWeight || row.actWeight || "";
  const p = row.particulars || "";
  if (w && p && w !== p) return `${w} ${p}`.trim();
  return w || p || "";
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

export function BillTaxInvoice({ data }: { data: BillPrintData }) {
  const freightTotal = data.lrs.reduce((s, r) => s + lrLineFreight(r), 0) || data.freight;

  return (
    <section className="bill-print-sheet">
      <table className="bill-print-table">
        <tbody>
          <tr>
            <td colSpan={18} className="bill-print-center bill-print-bold">
              || Shri Ganesh Prasanna ||
            </td>
          </tr>
          <tr>
            <td colSpan={3} className="bill-print-logo-cell">
              <img src={BRAND_LOGO_HEADER} alt="DPR Logistics" className="bill-print-logo" />
            </td>
            <td colSpan={12} className="bill-print-center">
              <div className="bill-print-title-red">{lrPrintCompany.name}</div>
              <div className="bill-print-subtitle">{lrPrintCompany.tagline}</div>
              <div>{lrPrintCompany.address}</div>
              <div>
                E-mail : {lrPrintCompany.email} Mob. : {lrPrintCompany.phones.replace(" / ", ", ")}
              </div>
              <div>GST : {lrPrintCompany.companyGst}</div>
            </td>
            <td colSpan={3} className="bill-print-center bill-print-spacer" />
          </tr>
          <tr>
            <td colSpan={18} className="bill-print-center bill-print-heading">
              TAX INVOICE
            </td>
          </tr>
          <tr>
            <td colSpan={12} className="bill-print-party">
              <div><span className="bill-print-label">Party Name :</span> {data.partyName}</div>
              {data.partyAddress ? (
                <div><span className="bill-print-label">Address :</span> {data.partyAddress}</div>
              ) : null}
              {data.partyGst ? (
                <div><span className="bill-print-label">GST NO. :</span> {data.partyGst}</div>
              ) : null}
              <div><span className="bill-print-label">PO No.:</span> {data.poNo || ""}</div>
            </td>
            <td colSpan={6} className="bill-print-party bill-print-right">
              <div><span className="bill-print-label">Bill No:-</span> {data.billNo}</div>
              <div><span className="bill-print-label">Date :-</span> {formatPrintDate(data.billDate)}</div>
            </td>
          </tr>
          <tr className="bill-print-bold bill-print-center">
            <td>Sr No</td>
            <td>LR No</td>
            <td>LR Date</td>
            <td colSpan={2}>Weight</td>
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
            <td>Bill</td>
          </tr>
          {data.lrs.map((row, i) => {
            const lineFreight = lrLineFreight(row);
            return (
              <tr key={`${row.lrNo}-${i}`} className="bill-print-center">
                <td>{i + 1}</td>
                <td>{stripLrPrefix(row.lrNo)}</td>
                <td>{formatPrintDate(row.lrDate)}</td>
                <td colSpan={2}>{lrWeight(row)}</td>
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
            <td colSpan={10} className="bill-print-bold">
              Total Freight : {formatPrintMoney(freightTotal)}
            </td>
            <td colSpan={8} className="bill-print-no-pad">
              <table className="bill-print-inner">
                <tbody>
                  <tr>
                    <td className="bill-print-bold">Total Freight</td>
                    <td className="bill-print-right">{formatPrintMoney(freightTotal)}</td>
                  </tr>
                  <tr>
                    <td>CGST@{data.cgstPct || 0}%</td>
                    <td className="bill-print-right">{fmtTax(data.cgstAmt)}</td>
                  </tr>
                  <tr>
                    <td>SGST@{data.sgstPct || 0}%</td>
                    <td className="bill-print-right">{fmtTax(data.sgstAmt)}</td>
                  </tr>
                  <tr>
                    <td>IGST@{data.igstPct || 0}%</td>
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
            <td colSpan={18}>
              <span className="bill-print-label">Amount in Words :</span>
              {amountInWordsIndian(data.grandTotal)}
            </td>
          </tr>
          <tr>
            <td colSpan={10} className="bill-print-bank">
              <div className="bill-print-bold">Bank Details</div>
              <div>Bank Name : ICICI Bank</div>
              <div>(DPR Logistics)</div>
              <div>Account Number:635805500736</div>
              <div>IFSC Code:ICIC0006358 Branch Kolhapur (Current A/C)</div>
            </td>
            <td colSpan={8} />
          </tr>
          <tr>
            <td colSpan={9} className="bill-print-sign-cell">
              Recievr&apos;s Sgnature
            </td>
            <td colSpan={9} className="bill-print-sign-cell bill-print-right bill-print-bold">
              For DPR Logistics
            </td>
          </tr>
        </tbody>
      </table>
    </section>
  );
}
