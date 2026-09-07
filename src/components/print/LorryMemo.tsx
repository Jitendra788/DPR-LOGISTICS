import { BRAND_LOGO_HEADER, BRAND_STAMP } from "@/lib/brand";
import { formatPrintDate, lrPrintCompany } from "@/lib/lr-print";
import { stripLrPrefix } from "@/lib/lr-no";
import "./lorry-memo.css";

export type LorryMemoLhc = {
  challanNo: string;
  challanDate: string;
  vehNo: string;
  ownerName: string;
  ownerMob: string;
  ownerPan: string;
  ownerAadhar: string;
  driverName: string;
  driverMob: string;
  driverPan: string;
  driverAadhar: string;
  licenceNo: string;
  engineNo: string;
  chassisNo: string;
  insCompany: string;
  policyNo: string;
  policyExp: string;
  allPermitNo: string;
  allPermitExp: string;
  fitnessExp: string;
  brokerName: string;
  brokerPan: string;
  lorryFreight: number;
  transfer: number;
  cash: number;
  fuel: number;
  totalAdvance: number;
  balance: number;
};

export type LorryMemoLr = {
  lrNo: string;
  articles: string;
  particulars: string;
  actWeight: string;
  fromStation: string;
  toStation: string;
};

type Props = {
  lhc: LorryMemoLhc;
  rows: LorryMemoLr[];
  company?: typeof lrPrintCompany;
};

function money(value: number) {
  const num = Number(value) || 0;
  if (Number.isInteger(num)) return String(num);
  return num.toFixed(2).replace(/\.?0+$/, "");
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <span className="lhc-memo-label">{label}</span> {value || ""}
    </div>
  );
}

export function LorryMemo({ lhc, rows, company = lrPrintCompany }: Props) {
  const phones = company.phones.replace(/\s*\/\s*/g, ", ");
  const articleCount = rows.length;

  return (
    <section className="lhc-memo-sheet">
      <table className="lhc-memo-table">
        <colgroup>
          <col style={{ width: "8%" }} />
          <col style={{ width: "12%" }} />
          <col style={{ width: "12%" }} />
          <col style={{ width: "22%" }} />
          <col style={{ width: "14%" }} />
          <col style={{ width: "16%" }} />
          <col style={{ width: "16%" }} />
        </colgroup>
        <tbody>
          <tr>
            <td colSpan={1} className="lhc-memo-logo-cell">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={BRAND_LOGO_HEADER} alt={company.name} className="lhc-memo-logo" />
            </td>
            <td colSpan={6} className="lhc-memo-center lhc-memo-header-mid">
              <div className="lhc-memo-title-red">{company.name}</div>
              <div className="lhc-memo-subtitle-red">{company.tagline}</div>
              <div className="lhc-memo-addr">
                {company.address} E-mail : {company.email} Mob. : {phones}
              </div>
            </td>
          </tr>

          <tr>
            <td colSpan={7} className="lhc-memo-titlebar">
              Lorry Memo
            </td>
          </tr>

          <tr>
            <td colSpan={2} className="lhc-memo-meta">
              Lorry No - {lhc.vehNo || ""}
            </td>
            <td colSpan={3} className="lhc-memo-meta lhc-memo-center">
              Memo No :- {lhc.challanNo || ""}
            </td>
            <td colSpan={2} className="lhc-memo-meta lhc-memo-right">
              Date : - {formatPrintDate(lhc.challanDate)}
            </td>
          </tr>

          <tr>
            <td colSpan={4} className="lhc-memo-no-pad">
              <table className="lhc-memo-nested">
                <tbody>
                  <tr>
                    <td>
                      <Field label="Owner Name:" value={lhc.ownerName} />
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <Field label="Owner Mob No:" value={lhc.ownerMob} />
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <Field label="Owner Pan No:" value={lhc.ownerPan} />
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <Field label="Owner Adhar No:" value={lhc.ownerAadhar} />
                    </td>
                  </tr>
                </tbody>
              </table>
            </td>
            <td colSpan={3} className="lhc-memo-no-pad">
              <table className="lhc-memo-nested">
                <tbody>
                  <tr>
                    <td>
                      <Field label="Driver Name:" value={lhc.driverName} />
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <Field label="Driver Mob No:" value={lhc.driverMob} />
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <Field label="Driver Pan No:" value={lhc.driverPan} />
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <Field label="Driver Adhar No:" value={lhc.driverAadhar} />
                    </td>
                  </tr>
                </tbody>
              </table>
            </td>
          </tr>

          <tr>
            <td colSpan={4} className="lhc-memo-no-pad">
              <table className="lhc-memo-nested">
                <tbody>
                  <tr>
                    <td>
                      <Field label="Licence No:" value={lhc.licenceNo} />
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <Field label="Engine No:" value={lhc.engineNo} />
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <Field label="Chessy No:" value={lhc.chassisNo} />
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <Field label="Insu.Company:" value={lhc.insCompany} />
                    </td>
                  </tr>
                </tbody>
              </table>
            </td>
            <td colSpan={3} className="lhc-memo-no-pad">
              <table className="lhc-memo-nested">
                <tbody>
                  <tr>
                    <td>
                      <Field label="Policy No.:" value={lhc.policyNo} />
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <Field label="Exp.Date:" value={formatPrintDate(lhc.policyExp)} />
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <Field label="AIP No.:" value={lhc.allPermitNo} />
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <Field label="Exp Date.:" value={formatPrintDate(lhc.allPermitExp)} />
                    </td>
                  </tr>
                </tbody>
              </table>
            </td>
          </tr>

          <tr>
            <td colSpan={2}>
              <Field label="Fitness :" value={formatPrintDate(lhc.fitnessExp)} />
            </td>
            <td colSpan={3}>
              <Field label="Broker Name:" value={lhc.brokerName} />
            </td>
            <td colSpan={2}>
              <Field label="Broker Pan No.:" value={lhc.brokerPan} />
            </td>
          </tr>

          <tr className="lhc-memo-bold">
            <td className="lhc-memo-th">Sr No</td>
            <td className="lhc-memo-th">LR No</td>
            <td className="lhc-memo-th">No Of Package</td>
            <td className="lhc-memo-th">Content</td>
            <td className="lhc-memo-th">Actual Weight</td>
            <td className="lhc-memo-th">From</td>
            <td className="lhc-memo-th">To</td>
          </tr>

          {(rows.length ? rows : [{ lrNo: "", articles: "", particulars: "", actWeight: "", fromStation: "", toStation: "" }]).map(
            (row, idx) => (
              <tr key={`${row.lrNo || "empty"}-${idx}`}>
                <td className="lhc-memo-td">{rows.length ? idx + 1 : ""}</td>
                <td className="lhc-memo-td lhc-memo-bold">{row.lrNo ? stripLrPrefix(row.lrNo) : ""}</td>
                <td className="lhc-memo-td">{row.articles || ""}</td>
                <td className="lhc-memo-td lhc-memo-content">{row.particulars || ""}</td>
                <td className="lhc-memo-td">{row.actWeight || ""}</td>
                <td className="lhc-memo-td">{row.fromStation || ""}</td>
                <td className="lhc-memo-td">{row.toStation || ""}</td>
              </tr>
            ),
          )}

          <tr>
            <td colSpan={2} className="lhc-memo-finance-label">
              Total Articals
            </td>
            <td className="lhc-memo-finance-label">{articleCount || ""}</td>
            <td colSpan={2} />
            <td className="lhc-memo-finance-label">Total Freight</td>
            <td className="lhc-memo-finance-value">{money(lhc.lorryFreight)}</td>
          </tr>

          <tr>
            <td colSpan={5} rowSpan={5} className="lhc-memo-gst-pan">
              GST No. {company.companyGst} / PAN No.{company.companyPan}
            </td>
            <td className="lhc-memo-finance-label">Advance</td>
            <td className="lhc-memo-finance-value">{money(lhc.totalAdvance)}</td>
          </tr>
          <tr>
            <td className="lhc-memo-finance-label">Cash</td>
            <td className="lhc-memo-finance-value">{money(lhc.cash)}</td>
          </tr>
          <tr>
            <td className="lhc-memo-finance-label">Transfer</td>
            <td className="lhc-memo-finance-value">{money(lhc.transfer)}</td>
          </tr>
          <tr>
            <td className="lhc-memo-finance-label">Fuel</td>
            <td className="lhc-memo-finance-value">{money(lhc.fuel)}</td>
          </tr>
          <tr>
            <td className="lhc-memo-finance-label">Balance</td>
            <td className="lhc-memo-finance-value">{money(lhc.balance)}</td>
          </tr>

          <tr>
            <td colSpan={4} className="lhc-memo-sign-left">
              Driver Signature
            </td>
            <td colSpan={3} className="lhc-memo-sign-right">
              <div>For DPR Logistics</div>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={BRAND_STAMP} alt="DPR Logistics stamp" className="lhc-memo-stamp" />
            </td>
          </tr>
        </tbody>
      </table>
    </section>
  );
}
