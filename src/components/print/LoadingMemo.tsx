import { BRAND_LOGO_HEADER } from "@/lib/brand";
import { roadwaysPrintCompany, type LoadingMemoData } from "@/lib/roadways-print";
import "./loading-memo.css";

function money(value: number | string) {
  if (value === "" || value === null || value === undefined) return "";
  const num = Number(value);
  if (!Number.isFinite(num)) return String(value);
  if (num === 0) return "00";
  if (Number.isInteger(num)) return String(num);
  return num.toFixed(2);
}

export function LoadingMemo({ data }: { data: LoadingMemoData }) {
  const c = roadwaysPrintCompany;
  const party = data.partyName?.trim() || "";
  const partyLabel = party ? (party.toUpperCase().startsWith("M/S") ? party : `M/s. ${party}`) : "M/s. _______________";

  return (
    <section className="lm-sheet">
      <header className="lm-head">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={BRAND_LOGO_HEADER} alt={c.name} className="lm-logo" />
        <div className="lm-head-main">
          <p className="lm-bless">{c.blessings}</p>
          <h1 className="lm-name">{c.name}</h1>
          <p className="lm-tag">{c.tagline}</p>
          <p className="lm-addr">{c.address}</p>
          <p className="lm-addr">
            Email : {c.email} &nbsp; Mob. {c.phones}
          </p>
          <p className="lm-pan">PAN No. {c.pan}</p>
        </div>
      </header>

      <div className="lm-titlebar">
        <div>Loading Memo</div>
        <div>Owner Risk</div>
        <div>Date : {data.date || "____________"}</div>
      </div>

      <div className="lm-body">
        <p className="lm-line">
          <strong>Slip No.</strong> {data.slipNo || "____"}
        </p>
        <p className="lm-line">
          To,
          <br />
          <strong>{partyLabel}</strong>
        </p>
        <p className="lm-line lm-indent">Dear Sir,</p>
        <p className="lm-line lm-indent">With reference to your telephonic message we hereby send</p>
        <p className="lm-line">
          <strong>Lorry No.</strong> {data.lorryNo || "____________"}
        </p>
        <p className="lm-line">As per following Conditions</p>
        <p className="lm-line">
          <strong>From</strong> {data.fromStation || "____________"}
        </p>
        <p className="lm-line">
          <strong>To</strong> {data.toStation || "____________"}
        </p>
      </div>

      <div className="lm-money">
        <div className="lm-money-col">
          <p className="lm-money-row">Guarantee Weight : {data.guaranteeWeight || "____"}</p>
          <p className="lm-money-row">Advance : {money(data.advance)}</p>
        </div>
        <div className="lm-money-col">
          <p className="lm-money-row">Freight : {money(data.freight)}</p>
          <p className="lm-money-row">Balance : {money(data.balance)}</p>
        </div>
      </div>

      <div className="lm-bank-sign">
        <div className="lm-bank">
          <p>
            <strong>Bank Name :</strong> {c.bank.name}
          </p>
          <p>
            <strong>Account No :</strong> {c.bank.accountNo}
          </p>
          <p>
            <strong>IFSC Code :</strong> {c.bank.ifsc}
          </p>
          <p>
            <strong>Branch :</strong> {c.bank.branch}
          </p>
        </div>
        <div className="lm-sign">
          <p className="lm-sign-for">For {c.name}</p>
          <div className="lm-sign-space" aria-hidden>
            Authorized Signatory
          </div>
          <p className="lm-care">Customer Care No : {c.customerCare}</p>
        </div>
      </div>

      <div className="lm-terms">
        <h3>Terms &amp; Conditions :</h3>
        <ol>
          {c.terms.map((t) => (
            <li key={t}>{t}</li>
          ))}
        </ol>
        <p className="lm-remark">Remark : - {data.remark || ""}</p>
      </div>
    </section>
  );
}
