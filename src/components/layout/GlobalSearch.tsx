"use client";

import { Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useRef, useState } from "react";
import { api } from "@/lib/api-client";

type Hit = {
  type: "lr" | "vehicle" | "driver" | "party" | "lhc" | "bill";
  title: string;
  subtitle: string;
  href: string;
};

const labels: Record<Hit["type"], string> = {
  lr: "LR",
  vehicle: "Vehicle",
  driver: "Driver",
  party: "Party",
  lhc: "LHC",
  bill: "Bill",
};

export function GlobalSearch() {
  const router = useRouter();
  const boxRef = useRef<HTMLFormElement>(null);
  const [q, setQ] = useState("");
  const [hits, setHits] = useState<Hit[]>([]);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  useEffect(() => {
    const term = q.trim();
    if (term.length < 1) {
      setHits([]);
      setOpen(false);
      return;
    }
    const t = window.setTimeout(async () => {
      setLoading(true);
      try {
        const data = await api<{ results: Hit[] }>(`/api/search?q=${encodeURIComponent(term)}`);
        setHits(data.results);
        setActive(0);
        setOpen(true);
      } catch {
        setHits([]);
      } finally {
        setLoading(false);
      }
    }, 220);
    return () => window.clearTimeout(t);
  }, [q]);

  function go(href: string) {
    setOpen(false);
    router.push(href);
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    const term = q.trim();
    if (!term) return;
    if (hits[active]) {
      go(hits[active].href);
      return;
    }
    go(`/search?q=${encodeURIComponent(term)}`);
  }

  return (
    <form ref={boxRef} onSubmit={onSubmit} className="erp-search" role="search">
      <Search className="erp-search-icon" aria-hidden />
      <input
        name="q"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        onFocus={() => hits.length && setOpen(true)}
        placeholder="Bill no, LR no, vehicle, party…"
        aria-label="Search bill number, LR number, vehicle number, driver name or party"
        aria-autocomplete="list"
        aria-expanded={open}
        autoComplete="off"
        onKeyDown={(e) => {
          if (!open || !hits.length) return;
          if (e.key === "ArrowDown") {
            e.preventDefault();
            setActive((i) => (i + 1) % hits.length);
          }
          if (e.key === "ArrowUp") {
            e.preventDefault();
            setActive((i) => (i - 1 + hits.length) % hits.length);
          }
        }}
      />
      <button type="submit" className="erp-search-go">
        Search
      </button>
      {open ? (
        <div className="erp-search-drop" role="listbox">
          {loading && !hits.length ? <p className="erp-dropdown-empty">Searching…</p> : null}
          {!loading && hits.length === 0 ? <p className="erp-dropdown-empty">No matches for “{q.trim()}”</p> : null}
          {hits.map((hit, i) => (
            <button
              key={`${hit.type}-${hit.href}`}
              type="button"
              role="option"
              aria-selected={i === active}
              className={`erp-search-hit ${i === active ? "is-active" : ""}`}
              onMouseEnter={() => setActive(i)}
              onClick={() => go(hit.href)}
            >
              <span className="erp-search-type">{labels[hit.type]}</span>
              <span className="erp-search-copy">
                <strong>{hit.title}</strong>
                <small>{hit.subtitle}</small>
              </span>
            </button>
          ))}
          {q.trim() ? (
            <button type="button" className="erp-search-more" onClick={() => go(`/search?q=${encodeURIComponent(q.trim())}`)}>
              View all results
            </button>
          ) : null}
        </div>
      ) : null}
    </form>
  );
}
