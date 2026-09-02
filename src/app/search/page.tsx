"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { PageHeader } from "@/components/ui/PageHeader";
import { api } from "@/lib/api-client";

type Hit = {
  type: string;
  title: string;
  subtitle: string;
  href: string;
};

export default function SearchPage() {
  const [q, setQ] = useState("");
  const [results, setResults] = useState<Hit[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const term = new URLSearchParams(window.location.search).get("q") ?? "";
    setQ(term);
    if (!term.trim()) {
      setResults([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    api<{ results: Hit[] }>(`/api/search?q=${encodeURIComponent(term)}`)
      .then((data) => setResults(data.results))
      .catch(() => setResults([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <PageHeader
        title="Search"
        subtitle={q ? `Results for “${q}”` : "Type bill no, LR no, vehicle, driver or party"}
        crumbs={[{ label: "Home", href: "/dashboard" }, { label: "Search" }]}
      />
      {loading ? <p className="erp-empty">Searching…</p> : null}
      {!loading && !results.length ? <p className="erp-empty">No records found.</p> : null}
      <div className="erp-search-page">
        {results.map((hit) => (
          <Link key={hit.href + hit.title} href={hit.href} className="erp-search-card">
            <span className="erp-search-type">{hit.type}</span>
            <strong>{hit.title}</strong>
            <span>{hit.subtitle}</span>
          </Link>
        ))}
      </div>
    </>
  );
}
