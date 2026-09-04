import { BRAND_LOGO_HEADER } from "@/lib/brand";
import { formatPrintDate, formatPrintMoney, lrPrintCompany } from "@/lib/lr-print";
import { normalizeLrType } from "@/lib/lr-type";
import "./lr-print.css";

export type LrPrintCompany = {
  name: string;
  tagline: string;
  address: string;
  email: string;
  phones: string;
  jurisdiction: string;
  customerCare: string;
  companyGst: string;
  companyPan: string;
  blessings: string;
};

export type LrPrintParty = {
  name: string;
  address?: string;
  gst?: string;
};

export type LrPrintBooking = {
  lrNo: string;
  lrDate: string;
  fromStation: string;
  toStation: string;
  vehNo: string;
  deliveryAt?: string;
  billingParty?: string;
  consignor: string;
  consignee: string;
  articles: string;
  particulars: string;
  invNoDate?: string;
  actWeight?: string;
  chargedWeight?: string;
  rate?: string;
  totalMeter?: string;
  freight: number;
  serviceTax?: number;
  haltage?: number;
  insurance?: number;
  stCharges?: number;
  doorCollection?: number;
  barrier?: number;
  other?: number;
  hamali?: number;
  total?: number;
  gst: number;
  grandTotal?: number;
  gstPaidBy?: string;
  ewayBill?: string;
  validDate?: string;
  lrType?: string;
  billAs?: string;
  valueRs?: string;
};

type Props = {
  booking: LrPrintBooking;
  copyLabel: string;
  consignorParty?: LrPrintParty;
  consigneeParty?: LrPrintParty;
  /** Defaults to DPR Logistics; Roadways passes DELHI PUNJAB ROADWAYS. */
  company?: LrPrintCompany;
};

function partyLine(party: LrPrintParty | undefined, fallbackName: string) {
  return {
    name: party?.name || fallbackName,
    address: party?.address || "",
    gst: party?.gst || "",
  };
}

export function LrConsignmentNote({ booking, copyLabel, consignorParty, consigneeParty, company = lrPrintCompany }: Props) {
  const consignor = partyLine(consignorParty, booking.consignor);
  const consignee = partyLine(consigneeParty, booking.consignee);
  const total = booking.total ?? booking.freight + (booking.serviceTax || 0) + (booking.haltage || 0) + (booking.insurance || 0) + (booking.stCharges || 0) + (booking.doorCollection || 0) + (booking.barrier || 0) + (booking.other || 0) + (booking.hamali || 0);
  const grandTotal = booking.grandTotal ?? total + (booking.gst || 0);
  const handlingLabel = copyLabel.toLowerCase().includes("lorry") || copyLabel.toLowerCase().includes("lory") ? "Handling" : "Halting";
  const type = normalizeLrType(booking.lrType);
  const freightHead =
    type === "Paid" ? "Freight Paid" : type === "ToPay" ? "Freight To Pay" : `Freight To be bill for GST at ${booking.gstPaidBy || "Consignor"}`;

  return (
    <section className="lr-print-sheet">
      <table className="lr-print-table">
        <tbody>
          <tr>
            <td colSpan={8} className="lr-print-center lr-print-bold">
              {company.blessings}
            </td>
          </tr>
          <tr>
            <td colSpan={2} className="lr-print-logo-cell">
              <img src={BRAND_LOGO_HEADER} alt={company.name} className="lr-print-logo" />
            </td>
            <td colSpan={3} className="lr-print-center">
              <div className="lr-print-title">{company.name}</div>
              <div className="lr-print-subtitle">{company.tagline}</div>
              <div>{company.address}</div>
              <div>
                E-mail : {company.email} Mob. : {company.phones}
              </div>
            </td>
            <td colSpan={3} className="lr-print-copy">
              ({copyLabel})
              <br />
              <br />
              At Owner&apos;s Risk
              <br />
              Cargo is insured by Customer
            </td>
          </tr>
          <tr>
            <td colSpan={8} className="lr-print-center lr-print-bold">
              {company.jurisdiction}
            </td>
          </tr>
          <tr>
            <td colSpan={8} className="lr-print-center lr-print-note">
              CONSIGNMENT NOTE
            </td>
          </tr>

          <tr>
            <td colSpan={4}>
              <div className="lr-print-section">Consignor Details</div>
              <div><span className="lr-print-label">Party Name :</span> {consignor.name}</div>
              <div><span className="lr-print-label">Address :</span> {consignor.address}</div>
              <div><span className="lr-print-label">GST No. :</span> {consignor.gst}</div>
            </td>
            <td colSpan={4}>
              <table className="lr-print-table lr-nested">
                <tbody>
                  <tr>
                    <td className="lr-print-label">Lr No</td>
                    <td>{booking.lrNo}</td>
                    <td className="lr-print-label">Date</td>
                    <td>{formatPrintDate(booking.lrDate)}</td>
                  </tr>
                  <tr>
                    <td className="lr-print-label">Vehicle No.</td>
                    <td colSpan={3}>{booking.vehNo}</td>
                  </tr>
                  <tr>
                    <td className="lr-print-label">From</td>
                    <td>{booking.fromStation}</td>
                    <td className="lr-print-label">To</td>
                    <td>{booking.toStation}</td>
                  </tr>
                </tbody>
              </table>
              <div className="lr-print-section" style={{ marginTop: 4 }}>
                Consignee Details
              </div>
              <div><span className="lr-print-label">Consignee Name :</span> {consignee.name}</div>
              <div><span className="lr-print-label">Address :</span> {consignee.address}</div>
              <div><span className="lr-print-label">GST No. :</span> {consignee.gst}</div>
            </td>
          </tr>

          <tr className="lr-print-bold lr-print-center">
            <td>No.Of Articles</td>
            <td>Description</td>
            <td colSpan={2}>Said To Contents</td>
            <td>Inv.No. &amp; Date</td>
            <td>Weight</td>
            <td>Rate Per KG</td>
            <td>{freightHead}</td>
          </tr>
          <tr>
            <td className="lr-print-value">{booking.articles}</td>
            <td className="lr-print-value">{booking.particulars}</td>
            <td colSpan={2} className="lr-print-value">{booking.particulars}</td>
            <td className="lr-print-value">{booking.invNoDate}</td>
            <td className="lr-print-value">{booking.actWeight || booking.chargedWeight}</td>
            <td className="lr-print-value">{booking.rate}</td>
            <td className="lr-print-value">{formatPrintMoney(booking.freight)}</td>
          </tr>

          <tr className="lr-print-charges lr-print-bold">
            <td>Act Weight<br />{booking.actWeight}</td>
            <td>Freight Rs<br />{formatPrintMoney(booking.freight)}</td>
            <td>Ser.Tax<br />{formatPrintMoney(booking.serviceTax || 0)}</td>
            <td>Chg.Wt.<br />{booking.chargedWeight}</td>
            <td>{handlingLabel}<br />{formatPrintMoney(booking.haltage || 0)}</td>
            <td>Consignee<br />{consignee.name}</td>
            <td>Meter<br />{booking.totalMeter}</td>
            <td>Insurance<br />{formatPrintMoney(booking.insurance || 0)}</td>
          </tr>
          <tr className="lr-print-charges lr-print-bold">
            <td>{booking.billAs || "Weight"}</td>
            <td>St.Charges<br />{formatPrintMoney(booking.stCharges || 0)}</td>
            <td>Door Coll.<br />{formatPrintMoney(booking.doorCollection || 0)}</td>
            <td>Barrier<br />{formatPrintMoney(booking.barrier || 0)}</td>
            <td>Other<br />{formatPrintMoney(booking.other || 0)}</td>
            <td>Hamali<br />{formatPrintMoney(booking.hamali || 0)}</td>
            <td>LR Type<br /><strong>{type}</strong></td>
            <td>Total Amt.<br />{formatPrintMoney(total)}</td>
          </tr>

          <tr>
            <td colSpan={3}>
              <span className="lr-print-label">GST :</span> {company.companyGst} / PAN No. {company.companyPan}
            </td>
            <td colSpan={2}>
              <span className="lr-print-label">Value Rs.</span> {booking.valueRs}
            </td>
            <td colSpan={3}>
              <span className="lr-print-label">Grand Total :</span> {formatPrintMoney(grandTotal)}
            </td>
          </tr>
          <tr>
            <td colSpan={4}>
              <span className="lr-print-label">Eway Bill No.</span> {booking.ewayBill}
            </td>
            <td colSpan={4}>
              <span className="lr-print-label">Valid Date</span> {formatPrintDate(booking.validDate || "")}
            </td>
          </tr>
          <tr className="lr-print-footer">
            <td colSpan={4} className="lr-print-bold">
              For {company.name}
            </td>
            <td colSpan={4} className="lr-print-bold lr-print-center">
              Customer Care No : {company.customerCare}
            </td>
          </tr>
        </tbody>
      </table>
    </section>
  );
}
