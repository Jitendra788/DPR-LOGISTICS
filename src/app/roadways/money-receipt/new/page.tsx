"use client";

import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function RedirectBody() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const qs = searchParams.toString();
    router.replace(`/roadways/money-receipt${qs ? `?${qs}` : ""}`);
  }, [router, searchParams]);

  return <p className="p-4">Opening Money Reciept…</p>;
}

/** Legacy URL — search is now /roadways/money-receipt */
export default function RoadwaysMoneyReceiptNewRedirect() {
  return (
    <Suspense fallback={<p className="p-4">Loading…</p>}>
      <RedirectBody />
    </Suspense>
  );
}
