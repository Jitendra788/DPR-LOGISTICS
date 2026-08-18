"use client";

import { useEffect, useState } from "react";
import { networkCities } from "@/data/marketing/branches";
import { searchBranches } from "@/services/branchService";
import type { Branch } from "@/data/marketing/branches";
import { BranchCard } from "@/components/marketing/BranchCard";
import { LoadingState } from "@/components/marketing/States";

export default function NetworkPage() {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    searchBranches("").then((rows) => {
      setBranches(rows);
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    const t = setTimeout(() => {
      searchBranches(query).then(setBranches);
    }, 200);
    return () => clearTimeout(t);
  }, [query]);

  return (
    <>
      <section className="mkt-page-hero mkt-page-hero-premium">
        <div className="mkt-container">
          <span className="mkt-eyebrow">Network</span>
          <h1>India logistics network</h1>
          <p>
            DPR Logistics operates from Kolhapur with regular lanes across Maharashtra, Gujarat and major metros.
            Contact our team for booking, tracking and delivery support on any route below.
          </p>
        </div>
      </section>

      <section className="mkt-section">
        <div className="mkt-container">
          <div className="mkt-city-tags">
            {networkCities.map((city) => (
              <button
                key={city}
                type="button"
                className="mkt-city-tag"
                style={{ border: "none", cursor: "pointer" }}
                onClick={() => setQuery(city)}
              >
                {city}
              </button>
            ))}
          </div>

          <div className="mkt-search-bar">
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by city, state or address…"
              aria-label="Search branches"
            />
          </div>

          {loading ? <LoadingState label="Loading branches…" /> : null}

          <div className="mkt-grid-3">
            {!loading && branches.length === 0 ? (
              <p style={{ color: "var(--mkt-muted)" }}>No branches match your search.</p>
            ) : null}
            {branches.map((branch) => (
              <BranchCard key={branch.id} branch={branch} />
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
