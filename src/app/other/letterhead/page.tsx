"use client";

import { useMemo, useState } from "react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/Button";
import { BRAND_LOGO_HEADER_PRINT, BRAND_NAME } from "@/lib/brand";
import { lrPrintCompany } from "@/lib/lr-print";
import { printWhenReady } from "@/lib/print-when-ready";
import "@/components/print/letterhead.css";

function todayDisplay() {
  const d = new Date();
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
}

export default function LetterheadPage() {
  const [dateText, setDateText] = useState(todayDisplay);
  const company = useMemo(() => lrPrintCompany, []);

  return (
    <div className="lh-page">
      <div className="no-print">
        <PageHeader
          title="Company Letterhead"
          subtitle="Type on letterhead and print A4 Portrait"
          crumbs={[
            { label: "Home", href: "/dashboard" },
            { label: "Other", href: "/other/letterhead" },
            { label: "Letterhead" },
          ]}
        />
        <div className="lh-toolbar">
          <Button type="button" variant="teal" onClick={() => printWhenReady(100)}>
            Print A4 Portrait
          </Button>
          <span className="lh-hint">Click below the header and type. Then Print.</span>
        </div>
      </div>

      <section className="lh-sheet">
        <div className="lh-letterhead">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={BRAND_LOGO_HEADER_PRINT} alt={BRAND_NAME} className="lh-logo" decoding="sync" />
          <div>
            <h1 className="lh-brand">{BRAND_NAME}</h1>
            <div className="lh-tagline">{company.tagline}</div>
            <p className="lh-addr">
              {company.address}
              <br />
              Email : {company.email}
            </p>
            <p className="lh-mob">Mob : {company.phones.replace(/\s*\/\s*/g, " , ")}</p>
          </div>
        </div>

        <div className="lh-date">
          Date :{" "}
          <input
            className="lh-date-input"
            value={dateText}
            onChange={(e) => setDateText(e.target.value)}
            aria-label="Date"
          />
        </div>

        <div
          className="lh-body"
          contentEditable
          suppressContentEditableWarning
          data-placeholder="Type your letter / form content here…"
          role="textbox"
          aria-label="Letterhead body"
        />
      </section>
    </div>
  );
}
