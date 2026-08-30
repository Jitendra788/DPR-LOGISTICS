"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { TrackingSearchPanel } from "@/components/marketing/TrackingSearchPanel";
import { LoadingState } from "@/components/marketing/States";

function TrackingContent() {
  const searchParams = useSearchParams();
  const initial = searchParams.get("q") ?? "";
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setReady(true);
  }, []);

  if (!ready) return <LoadingState label="Loading tracking…" />;

  return (
    <>
      <section className="mkt-page-hero mkt-page-hero-premium">
        <div className="mkt-container">
          <span className="mkt-eyebrow">Tracking</span>
          <h1>Track your shipment in real time</h1>
          <p>
            Enter your GC / LR / Docket number for limited status. Unlock full details with the last 4 digits of the
            registered mobile, or open your secret WhatsApp / SMS track link.
          </p>
        </div>
      </section>

      <section className="mkt-section">
        <div className="mkt-container mkt-tracking-page">
          <TrackingSearchPanel initialQuery={initial} heroNote showEmpty={!initial} />
        </div>
      </section>
    </>
  );
}

export default function TrackingPage() {
  return (
    <Suspense fallback={<LoadingState label="Loading tracking…" />}>
      <TrackingContent />
    </Suspense>
  );
}
