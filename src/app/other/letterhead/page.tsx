"use client";

import { useMemo, useState } from "react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/Button";
import {
  BRAND_AUTHORIZED_SIGNATORY_PRINT,
  BRAND_LOGO_HEADER_PRINT,
  BRAND_NAME,
  ROADWAYS_LOGO_PRINT,
  ROADWAYS_SIGNATURE_PRINT,
  ROADWAYS_STAMP_PRINT,
} from "@/lib/brand";
import { lrPrintCompany } from "@/lib/lr-print";
import { roadwaysPrintCompany } from "@/lib/roadways-print";
import { printWhenReady } from "@/lib/print-when-ready";
import "@/components/print/letterhead.css";

type BrandKey = "dpr" | "roadways";

function todayDisplay() {
  const d = new Date();
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
}

export default function LetterheadPage() {
  const [brand, setBrand] = useState<BrandKey>("dpr");
  const [dateText, setDateText] = useState(todayDisplay);

  const profile = useMemo(() => {
    if (brand === "roadways") {
      return {
        name: roadwaysPrintCompany.name,
        tagline: roadwaysPrintCompany.tagline,
        address: roadwaysPrintCompany.address,
        email: roadwaysPrintCompany.email,
        phones: roadwaysPrintCompany.phones,
        logo: ROADWAYS_LOGO_PRINT,
        sheetClass: "lh-sheet lh-sheet-roadways",
        signMode: "roadways" as const,
      };
    }
    return {
      name: BRAND_NAME,
      tagline: lrPrintCompany.tagline,
      address: lrPrintCompany.address,
      email: lrPrintCompany.email,
      phones: lrPrintCompany.phones,
      logo: BRAND_LOGO_HEADER_PRINT,
      sheetClass: "lh-sheet lh-sheet-dpr",
      signMode: "dpr" as const,
    };
  }, [brand]);

  return (
    <div className="lh-page">
      <div className="no-print">
        <PageHeader
          title="Company Letterhead"
          subtitle="Choose DPR or Roadways, type content, print A4 Portrait"
          crumbs={[
            { label: "Home", href: "/dashboard" },
            { label: "Other", href: "/other/letterhead" },
            { label: "Letterhead" },
          ]}
        />
        <div className="lh-toolbar">
          <div className="lh-brand-switch" role="group" aria-label="Letterhead brand">
            <button
              type="button"
              className={`lh-brand-btn${brand === "dpr" ? " is-active" : ""}`}
              onClick={() => setBrand("dpr")}
            >
              DPR Logistics
            </button>
            <button
              type="button"
              className={`lh-brand-btn${brand === "roadways" ? " is-active" : ""}`}
              onClick={() => setBrand("roadways")}
            >
              Delhi Punjab Roadways
            </button>
          </div>
          <Button type="button" variant="teal" onClick={() => printWhenReady(100)}>
            Print A4 Portrait
          </Button>
          <span className="lh-hint">Select company → type below header → Print.</span>
        </div>
      </div>

      <section className={profile.sheetClass}>
        <div className="lh-letterhead">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={profile.logo} alt={profile.name} className="lh-logo" decoding="sync" />
          <div>
            <h1 className="lh-brand">{profile.name}</h1>
            <div className="lh-tagline">{profile.tagline}</div>
            <p className="lh-addr">
              {profile.address}
              <br />
              Email : {profile.email}
            </p>
            <p className="lh-mob">Mob : {profile.phones.replace(/\s*\/\s*/g, " , ")}</p>
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

        <div className="lh-sign" aria-label="Authorized Signatory">
          {profile.signMode === "dpr" ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={BRAND_AUTHORIZED_SIGNATORY_PRINT}
              alt="Authorized Signatory — Rakesh Kumar / Stamp"
              className="lh-sign-block"
              decoding="sync"
            />
          ) : (
            <>
              <div className="lh-sign-title">Authorized Signatory</div>
              <div className="lh-sign-name">Stamp / Signature</div>
              <div className="lh-sign-stack">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={ROADWAYS_STAMP_PRINT}
                  alt="Roadways stamp"
                  className="lh-sign-stamp"
                  decoding="sync"
                />
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={ROADWAYS_SIGNATURE_PRINT}
                  alt="Authorized signature"
                  className="lh-sign-signature"
                  decoding="sync"
                />
              </div>
            </>
          )}
        </div>
      </section>
    </div>
  );
}
