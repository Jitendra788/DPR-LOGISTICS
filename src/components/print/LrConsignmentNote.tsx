import { BRAND_LOGO_HEADER } from "@/lib/brand";
import { formatPrintDate, formatPrintMoney, lrPrintCompany } from "@/lib/lr-print";
import { stripLrPrefix } from "@/lib/lr-no";
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
  /** Hide company logo (e.g. email / customer share print). */
  hideLogo?: boolean;
};

function partyLine(party: LrPrintParty | undefined, fallbackName: string) {
  return {
    name: party?.name || fallbackName,
    address: party?.address || "",
    gst: party?.gst || "",
  };
}

function gstPaidMark(gstPaidBy: string | undefined, option: string) {
  const raw = String(gstPaidBy || "").trim().toLowerCase();
  const opt = option.toLowerCase();
  if (!raw) return "";
  if (opt === "dprl" && (raw.includes("dpr") || raw === "self" || raw.includes("transporter"))) {
    return "✓";
  }
  if (raw.includes(opt) || raw === opt) return "✓";
  return "";
}

export function LrConsignmentNote({
  booking,
  copyLabel,
  consignorParty,
  consigneeParty,
  company = lrPrintCompany,
  hideLogo = false,
}: Props) {
  const consignor = partyLine(consignorParty, booking.consignor);
  const consignee = partyLine(consigneeParty, booking.consignee);
  const total =
    booking.total ??
    booking.freight +
      (booking.serviceTax || 0) +
      (booking.haltage || 0) +
      (booking.insurance || 0) +
      (booking.stCharges || 0) +
      (booking.doorCollection || 0) +
      (booking.barrier || 0) +
      (booking.other || 0) +
      (booking.hamali || 0);
  const handlingLabel =
    copyLabel.toLowerCase().includes("lorry") || copyLabel.toLowerCase().includes("lory")
      ? "Handling"
      : "Halting";
  const type = normalizeLrType(booking.lrType);
  const gstHead =
    type === "Paid"
      ? "Freight Paid"
      : type === "ToPay"
        ? "Freight To Pay"
        : "To be bill for GST at";

  return (
    <section className="lr-print-sheet">
      <table className="lr-print-table">
        <colgroup>
          <col style={{ width: "12%" }} />
          <col style={{ width: "28%" }} />
          <col style={{ width: "12%" }} />
          <col style={{ width: "14%" }} />
          <col style={{ width: "12%" }} />
          <col style={{ width: "10%" }} />
          <col style={{ width: "12%" }} />
        </colgroup>
        <tbody>
          {/* Header */}
          <tr>
            <td className="lr-print-logo-cell">
              {hideLogo ? (
                <div className="lr-print-title-red" style={{ fontSize: 14 }}>
                  {company.name}
                </div>
              ) : (
                <img src={BRAND_LOGO_HEADER} alt={company.name} className="lr-print-logo" />
              )}
            </td>
            <td colSpan={4} className="lr-print-center lr-print-header-mid">
              <div className="lr-print-blessings">{company.blessings}</div>
              <div className="lr-print-title-red">{company.name}</div>
              <div className="lr-print-subtitle-red">{company.tagline}</div>
              <div>{company.address}</div>
              <div>
                E-mail : {company.email} Mob. : {company.phones}
              </div>
            </td>
            <td colSpan={2} className="lr-print-copy">
              <div>{company.jurisdiction}</div>
              <div className="lr-print-copy-label">({copyLabel})</div>
              <div>At Owner&apos;s Risk</div>
              <div>Cargo is insured by Customer</div>
              <div className="lr-print-note">CONSIGNMENT NOTE</div>
            </td>
          </tr>

          {/* Consignor + LR meta */}
          <tr>
            <td colSpan={4} className="lr-print-party-cell">
              <div className="lr-print-section">Consignor Details</div>
              <div>
                <span className="lr-print-label">Party Name :</span> {consignor.name}
              </div>
              <div>
                <span className="lr-print-label">Address :</span> {consignor.address}
              </div>
              <div>
                <span className="lr-print-label">GST No. :</span> {consignor.gst}
              </div>
            </td>
            <td colSpan={3} className="lr-print-no-pad">
              <table className="lr-nested">
                <tbody>
                  <tr>
                    <td className="lr-print-label">Lr No</td>
                    <td className="lr-print-bold">{stripLrPrefix(booking.lrNo)}</td>
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
            </td>
          </tr>

          {/* Consignee full width */}
          <tr>
            <td colSpan={7} className="lr-print-party-cell">
              <div className="lr-print-section">Consignee Details</div>
              <div>
                <span className="lr-print-label">Consignee Name :</span> {consignee.name}
              </div>
              <div>
                <span className="lr-print-label">Address :</span> {consignee.address}
              </div>
              <div>
                <span className="lr-print-label">GST No. :</span> {consignee.gst}
              </div>
            </td>
          </tr>

          {/* Articles header */}
          <tr className="lr-print-bold lr-print-center">
            <td>No.Of Articales</td>
            <td>Description Said To Contents</td>
            <td>Inv.No. &amp; Date</td>
            <td>Weight</td>
            <td>Rate Per KG</td>
            <td>Freight</td>
            <td>{gstHead}</td>
          </tr>

          {/* Articles body — nested weight / rate / freight / gst columns */}
          <tr>
            <td className="lr-print-center lr-print-value lr-print-bold">{booking.articles}</td>
            <td className="lr-print-value">{booking.particulars}</td>
            <td className="lr-print-center lr-print-value">{booking.invNoDate}</td>
            <td className="lr-print-no-pad">
              <table className="lr-nested lr-nested-fill">
                <tbody>
                  <tr>
                    <td className="lr-print-label">Act Weight</td>
                    <td>{booking.actWeight}</td>
                  </tr>
                  <tr>
                    <td className="lr-print-label">Chg.Wt.</td>
                    <td>{booking.chargedWeight}</td>
                  </tr>
                  <tr>
                    <td className="lr-print-label">Meter</td>
                    <td>{booking.totalMeter}</td>
                  </tr>
                </tbody>
              </table>
            </td>
            <td className="lr-print-no-pad">
              <table className="lr-nested lr-nested-fill">
                <tbody>
                  <tr>
                    <td className="lr-print-label">Freight Rs</td>
                  </tr>
                  <tr>
                    <td className="lr-print-label">Ser.Tax</td>
                  </tr>
                  <tr>
                    <td className="lr-print-label">{handlingLabel}</td>
                  </tr>
                  <tr>
                    <td className="lr-print-label">Insurance</td>
                  </tr>
                  <tr>
                    <td className="lr-print-label">St.Charges</td>
                  </tr>
                  <tr>
                    <td className="lr-print-label">Total Amt.</td>
                  </tr>
                </tbody>
              </table>
            </td>
            <td className="lr-print-no-pad">
              <table className="lr-nested lr-nested-fill">
                <tbody>
                  <tr>
                    <td className="lr-print-right">&nbsp;</td>
                  </tr>
                  <tr>
                    <td className="lr-print-right">{formatPrintMoney(booking.serviceTax || 0)}</td>
                  </tr>
                  <tr>
                    <td className="lr-print-right">{formatPrintMoney(booking.haltage || 0)}</td>
                  </tr>
                  <tr>
                    <td className="lr-print-right">{formatPrintMoney(booking.insurance || 0)}</td>
                  </tr>
                  <tr>
                    <td className="lr-print-right">{formatPrintMoney(booking.stCharges || 0)}</td>
                  </tr>
                  <tr>
                    <td className="lr-print-right lr-print-bold">{formatPrintMoney(total)}</td>
                  </tr>
                </tbody>
              </table>
            </td>
            <td className="lr-print-no-pad">
              <table className="lr-nested lr-nested-fill">
                <tbody>
                  <tr>
                    <td>Consignor {gstPaidMark(booking.gstPaidBy, "Consignor")}</td>
                  </tr>
                  <tr>
                    <td>Consignee {gstPaidMark(booking.gstPaidBy, "Consignee")}</td>
                  </tr>
                  <tr>
                    <td>DPRL {gstPaidMark(booking.gstPaidBy, "DPRL")}</td>
                  </tr>
                </tbody>
              </table>
            </td>
          </tr>

          {/* GST / PAN — red */}
          <tr>
            <td colSpan={7} className="lr-print-gst-pan">
              GST : {company.companyGst} / PAN No. {company.companyPan}
            </td>
          </tr>

          {/* Value + signature */}
          <tr>
            <td colSpan={4}>
              <span className="lr-print-label">Value Rs.</span> {booking.valueRs}
            </td>
            <td colSpan={3} className="lr-print-bold lr-print-sign">
              For {company.name}
            </td>
          </tr>

          {/* Eway / Valid / Care */}
          <tr>
            <td colSpan={3}>
              <span className="lr-print-label">Eway Bill No.</span> {booking.ewayBill}
            </td>
            <td colSpan={2}>
              <span className="lr-print-label">Valid Date</span> {formatPrintDate(booking.validDate || "")}
            </td>
            <td colSpan={2} className="lr-print-bold lr-print-center">
              Customer Care No : {company.customerCare}
            </td>
          </tr>
        </tbody>
      </table>
    </section>
  );
}
