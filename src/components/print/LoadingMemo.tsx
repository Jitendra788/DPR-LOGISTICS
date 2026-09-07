import { ROADWAYS_LOGO, ROADWAYS_SIGNATURE } from "@/lib/brand";
import { roadwaysPrintCompany, type LoadingMemoData } from "@/lib/roadways-print";
import "./loading-memo.css";

function money(value: number | string) {
  if (value === "" || value === null || value === undefined) return "";
  const num = Number(value);
  if (!Number.isFinite(num)) return String(value);
  if (Number.isInteger(num)) return num === 0 ? "0.00" : String(num);
  return num.toFixed(2);
}

function formatWeight(value?: string) {
  const v = String(value ?? "").trim();
  if (!v) return "____";
  return v
    .replace(/(\d)\s*([A-Za-z])/g, "$1 $2")
    .replace(/([A-Za-z])\s*(\d)/g, "$1 $2")
    .replace(/\s+/g, " ")
    .trim();
}

export function LoadingMemo({ data }: { data: LoadingMemoData }) {
  const c = roadwaysPrintCompany;
  const party = data.partyName?.trim() || "";
  const partyLabel = party
    ? party.toUpperCase().startsWith("M/S")
      ? party
      : `M/s. ${party}`
    : "M/s. _______________";

  return (
    <section className="lm-sheet">
      <table className="lm-table">
        <colgroup>
          <col style={{ width: "26%" }} />
          <col style={{ width: "24%" }} />
          <col style={{ width: "24%" }} />
          <col style={{ width: "26%" }} />
        </colgroup>
        <tbody>
          <tr>
            <td className="lm-logo-cell">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={ROADWAYS_LOGO} alt={c.name} className="lm-logo" />
            </td>
            <td className="lm-head-main" colSpan={3}>
              <div className="lm-bless">{c.blessings}</div>
              <div className="lm-name">{c.name}</div>
              <div className="lm-tag">{c.tagline}</div>
              <div className="lm-addr">
                {c.address} E-mail : {c.email} Mob. : {c.phones}
              </div>
              <div className="lm-pan">PAN No. {c.pan}</div>
            </td>
          </tr>

          <tr className="lm-titlebar">
            <td className="lm-tb-left">
              <div className="lm-tb-title">Loading Memo</div>
            </td>
            <td className="lm-tb-owner" colSpan={2}>
              Owner Risk
            </td>
            <td className="lm-tb-date">
              Date : <strong>{data.date || "____________"}</strong>
            </td>
          </tr>

          <tr>
            <td colSpan={4} className="lm-body">
              <p>
                Slip No. <strong>{data.slipNo || "____"}</strong>
              </p>
              <p>
                To,<strong>{partyLabel}</strong>
              </p>
              <p>Dear Sir, With reference to your telephonic message we hereby send</p>
              <p>
                Lorry No. <strong>{data.lorryNo || "____________"}</strong>
              </p>
              <p>As per following Conditions</p>
              <p>
                From <strong>{(data.fromStation || "____________").toUpperCase()}</strong>
              </p>
              <p>
                To <strong>{(data.toStation || "____________").toUpperCase()}</strong>
              </p>
            </td>
          </tr>

          <tr>
            <td colSpan={2} className="lm-money-cell">
              Guarantee Weight : <strong>{formatWeight(data.guaranteeWeight)}</strong>
            </td>
            <td colSpan={2} className="lm-money-cell">
              Freight : <strong>{money(data.freight)}</strong>
            </td>
          </tr>
          <tr>
            <td colSpan={2} className="lm-money-cell">
              Advance : <strong>{money(data.advance)}</strong>
            </td>
            <td colSpan={2} className="lm-money-cell">
              Balance : <strong>{money(data.balance)}</strong>
            </td>
          </tr>

          <tr>
            <td colSpan={2} className="lm-bank">
              <div className="lm-bank-title">Account Details</div>
              <div>Bank Name : {c.bank.name}</div>
              <div>Account No : {c.bank.accountNo}</div>
              <div>IFSC Code : {c.bank.ifsc}</div>
              <div>Branch : {c.bank.branch}</div>
            </td>
            <td colSpan={2} className="lm-sign">
              <div className="lm-sign-top">
                <div className="lm-sign-for">For {c.name}</div>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={ROADWAYS_SIGNATURE} alt="Authorised signature" className="lm-signature" />
              </div>
              <div className="lm-care">Customer Care No : {c.customerCare}</div>
            </td>
          </tr>

          <tr>
            <td colSpan={4} className="lm-terms">
              <div className="lm-terms-title">Terms &amp; Conditions :</div>
              <ol>
                {c.terms.map((t) => (
                  <li key={t}>{t}</li>
                ))}
              </ol>
              <div className="lm-remark">Remark : - {data.remark || ""}</div>
            </td>
          </tr>
        </tbody>
      </table>
    </section>
  );
}
