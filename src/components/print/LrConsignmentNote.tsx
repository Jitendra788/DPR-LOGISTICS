import { BRAND_LOGO_HEADER, BRAND_STAMP } from "@/lib/brand";
import { formatPrintDate, lrPrintCompany } from "@/lib/lr-print";
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
  /** Override header logo (Roadways uses /roadways-logo.png). */
  logoSrc?: string;
  /** Override stamp image. */
  stampSrc?: string;
  /** Signature block label, e.g. For DELHI PUNJAB ROADWAYS. */
  signFor?: string;
  /** GST paid-by third row label (DPRL / DPR / Roadways). */
  gstPartyLabel?: string;
};

function partyLine(party: LrPrintParty | undefined, fallbackName: string) {
  return {
    name: party?.name || fallbackName,
    address: party?.address || "",
    gst: party?.gst || "",
  };
}

/** Legacy print style: 6TN → 6 TN, 18TN32FEET → 18 TN 32 FEET */
function formatWeightDisplay(value?: string) {
  const v = String(value ?? "").trim();
  if (!v) return "";
  return v
    .replace(/(\d)\s*([A-Za-z])/g, "$1 $2")
    .replace(/([A-Za-z])\s*(\d)/g, "$1 $2")
    .replace(/\s+/g, " ")
    .trim();
}

export function LrConsignmentNote({
  booking,
  copyLabel,
  consignorParty,
  consigneeParty,
  company = lrPrintCompany,
  hideLogo = false,
  logoSrc = BRAND_LOGO_HEADER,
  stampSrc = BRAND_STAMP,
  signFor,
  gstPartyLabel = "DPRL",
}: Props) {
  const consignor = partyLine(consignorParty, booking.consignor);
  const consignee = partyLine(consigneeParty, booking.consignee);
  const type = normalizeLrType(booking.lrType);
  const handlingLabel =
    copyLabel.toLowerCase().includes("lorry") || copyLabel.toLowerCase().includes("lory")
      ? "Handling"
      : "Halting";
  const gstHead =
    type === "Paid"
      ? "Freight Paid"
      : type === "ToPay"
        ? "Freight To Pay"
        : "To be bill for GST at";
  const forLabel =
    signFor ||
    (company.name.toUpperCase().includes("ROADWAYS")
      ? "For DELHI PUNJAB ROADWAYS"
      : "For DPR Logistics");
  const taxBar =
    company.companyGst && company.companyPan
      ? `GST : ${company.companyGst} / PAN No. ${company.companyPan}`
      : company.companyGst
        ? `GST : ${company.companyGst}`
        : company.companyPan
          ? `PAN No. ${company.companyPan}`
          : "";

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
                <img src={logoSrc} alt={company.name} className="lr-print-logo" />
              )}
            </td>
            <td colSpan={4} className="lr-print-center lr-print-header-mid">
              <div className="lr-print-blessings">{company.blessings}</div>
              <div className="lr-print-title-red">{company.name}</div>
              <div className="lr-print-subtitle-red">{company.tagline}</div>
              <div className="lr-print-contact">{company.address}</div>
              <div className="lr-print-contact">
                E-mail : {company.email} Mob. : {company.phones}
              </div>
            </td>
            <td colSpan={2} className="lr-print-copy">
              <div>{company.jurisdiction}</div>
              <div className="lr-print-copy-label">({copyLabel})</div>
              <div>At Owner&apos;s Risk</div>
              <div>Carrgo is insured by Customer</div>
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
                <colgroup>
                  <col style={{ width: "32%" }} />
                  <col style={{ width: "24%" }} />
                  <col style={{ width: "14%" }} />
                  <col style={{ width: "30%" }} />
                </colgroup>
                <tbody>
                  <tr>
                    <td className="lr-print-label">Lr No</td>
                    <td className="lr-print-bold">{stripLrPrefix(booking.lrNo)}</td>
                    <td className="lr-print-label">Date</td>
                    <td>{formatPrintDate(booking.lrDate)}</td>
                  </tr>
                  <tr>
                    <td className="lr-print-label">Vehicle No.</td>
                    <td colSpan={3} className="lr-print-veh">
                      {booking.vehNo}
                    </td>
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
          <tr className="lr-print-bold lr-print-center lr-print-articles-head">
            <td>No.Of Articales</td>
            <td>Description Said To Contents</td>
            <td>Inv.No. &amp; Date</td>
            <td>Weight</td>
            <td>Rate Per KG</td>
            <td>Freight</td>
            <td>{gstHead}</td>
          </tr>

          {/* Articles body — 4 columns, same 6-row lines */}
          <tr className="lr-print-charges-row">
            <td className="lr-print-center lr-print-value lr-print-bold">{booking.articles}</td>
            <td className="lr-print-value">{booking.particulars}</td>
            <td className="lr-print-center lr-print-value">{booking.invNoDate}</td>
            <td className="lr-print-no-pad">
              <table className="lr-charges-col">
                <tbody>
                  <tr>
                    <td className="lr-print-label lr-print-center">Act Weight</td>
                  </tr>
                  <tr>
                    <td className="lr-print-center">{formatWeightDisplay(booking.actWeight)}</td>
                  </tr>
                  <tr>
                    <td className="lr-print-label lr-print-center">Chg.Wt.</td>
                  </tr>
                  <tr>
                    <td className="lr-print-center">{formatWeightDisplay(booking.chargedWeight)}</td>
                  </tr>
                  <tr>
                    <td className="lr-print-label lr-print-center">Meter</td>
                  </tr>
                  <tr>
                    <td className="lr-print-center">{booking.totalMeter || ""}</td>
                  </tr>
                </tbody>
              </table>
            </td>
            <td className="lr-print-no-pad">
              <table className="lr-charges-col">
                <tbody>
                  <tr>
                    <td>Freight Rs</td>
                  </tr>
                  <tr>
                    <td>Ser.Tax</td>
                  </tr>
                  <tr>
                    <td>{handlingLabel}</td>
                  </tr>
                  <tr>
                    <td>Insurance</td>
                  </tr>
                  <tr>
                    <td>St.Charges</td>
                  </tr>
                  <tr>
                    <td className="lr-print-bold">Total Amt.</td>
                  </tr>
                </tbody>
              </table>
            </td>
            <td className="lr-print-no-pad">
              <table className="lr-charges-col">
                <tbody>
                  <tr>
                    <td className="lr-freight-amt">&nbsp;</td>
                  </tr>
                  <tr>
                    <td className="lr-freight-amt">&nbsp;</td>
                  </tr>
                  <tr>
                    <td className="lr-freight-amt">&nbsp;</td>
                  </tr>
                  <tr>
                    <td className="lr-freight-amt">&nbsp;</td>
                  </tr>
                  <tr>
                    <td className="lr-freight-amt">&nbsp;</td>
                  </tr>
                  <tr>
                    <td className="lr-freight-amt">&nbsp;</td>
                  </tr>
                </tbody>
              </table>
            </td>
            <td className="lr-print-no-pad">
              <table className="lr-charges-col">
                <tbody>
                  <tr>
                    <td className="lr-print-center">Consignor</td>
                  </tr>
                  <tr>
                    <td>&nbsp;</td>
                  </tr>
                  <tr>
                    <td className="lr-print-center">Consignee</td>
                  </tr>
                  <tr>
                    <td>&nbsp;</td>
                  </tr>
                  <tr>
                    <td className="lr-print-center">{gstPartyLabel}</td>
                  </tr>
                  <tr>
                    <td>&nbsp;</td>
                  </tr>
                </tbody>
              </table>
            </td>
          </tr>

          {/* GST / PAN — red */}
          <tr>
            <td colSpan={7} className="lr-print-gst-pan">
              {taxBar}
            </td>
          </tr>

          {/* Footer: Value/Eway/Valid left | sign+stamp+care right (old ASP layout) */}
          <tr>
            <td colSpan={4} className="lr-print-footer-left">
              <div>
                <span className="lr-print-label">Value Rs.</span> {booking.valueRs}
              </div>
              <div>
                <span className="lr-print-label">Eway Bill No.</span> {booking.ewayBill}
              </div>
              <div>
                <span className="lr-print-label">Valid Date</span>{" "}
                {formatPrintDate(booking.validDate || "")}
              </div>
            </td>
            <td colSpan={3} className="lr-print-sign">
              <div className="lr-print-bold">{forLabel}</div>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={stampSrc} alt={`${company.name} stamp`} className="lr-print-stamp" />
              <div className="lr-print-care">
                Customer Care No : {company.customerCare}
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </section>
  );
}
