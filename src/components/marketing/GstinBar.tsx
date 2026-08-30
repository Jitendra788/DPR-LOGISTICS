import { company } from "@/data/marketing/company";

export function GstinBar() {
  return (
    <div className="mkt-gstin-bar" role="contentinfo" aria-label="Company GST registration">
      <div className="mkt-container">
        <p>
          <strong>GSTIN No. :</strong> {company.gstin}
        </p>
      </div>
    </div>
  );
}
