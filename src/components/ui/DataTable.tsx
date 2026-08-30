"use client";

import { useMemo, useState, type ReactNode } from "react";

type Column<T> = {
  key: string;
  header: string;
  render?: (row: T) => ReactNode;
};

type Props<T> = {
  columns: Column<T>[];
  rows: T[];
  searchKeys?: (keyof T)[];
  /** Stack rows as cards below 768px (default true) */
  stackOnMobile?: boolean;
};

export function DataTable<T extends object>({ columns, rows, searchKeys, stackOnMobile = true }: Props<T>) {
  const [q, setQ] = useState("");
  const [pageSize, setPageSize] = useState(10);
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    if (!q.trim()) return rows;
    const term = q.toLowerCase();
    return rows.filter((row) => {
      const keys = searchKeys ?? (Object.keys(row) as (keyof T)[]);
      return keys.some((k) => String((row as Record<string, unknown>)[k as string] ?? "").toLowerCase().includes(term));
    });
  }, [q, rows, searchKeys]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const current = Math.min(page, totalPages);
  const start = (current - 1) * pageSize;
  const slice = filtered.slice(start, start + pageSize);

  const pageButtons = useMemo(() => {
    if (totalPages <= 5) return Array.from({ length: totalPages }, (_, i) => i + 1);
    const pages = new Set<number>([1, totalPages, current, current - 1, current + 1]);
    return [...pages].filter((n) => n >= 1 && n <= totalPages).sort((a, b) => a - b);
  }, [current, totalPages]);

  return (
    <div className="box overflow-hidden">
      <div className="box-body">
        <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
          <label className="erp-dt-meta">
            Show{" "}
            <select
              className="form-control inline-block h-[30px] w-auto"
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setPage(1);
              }}
            >
              {[10, 25, 50].map((n) => (
                <option key={n}>{n}</option>
              ))}
            </select>{" "}
            entries
          </label>
          <label className="erp-dt-meta block w-full sm:w-auto">
            Search:{" "}
            <input
              className="form-control mt-1 block h-[30px] w-full sm:mt-0 sm:inline-block sm:w-[180px]"
              value={q}
              onChange={(e) => {
                setQ(e.target.value);
                setPage(1);
              }}
            />
          </label>
        </div>
        <div className="table-scroll">
          <table
            className={`erp-dt w-full border-collapse text-[13px] sm:text-[14px] ${stackOnMobile ? "erp-dt-stack-mobile" : "min-w-[480px] sm:min-w-[640px]"}`}
          >
            <thead>
              <tr>
                {columns.map((c) => (
                  <th key={c.key}>{c.header}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {slice.length === 0 ? (
                <tr>
                  <td colSpan={columns.length} className="erp-dt-empty">
                    No records found
                  </td>
                </tr>
              ) : (
                slice.map((row, i) => (
                  <tr key={i}>
                    {columns.map((c) => (
                      <td key={c.key} data-label={c.header}>
                        {c.render ? c.render(row) : String((row as Record<string, unknown>)[c.key] ?? "")}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="erp-dt-foot mt-3 flex flex-col gap-3 text-sm sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
          <span className="text-xs sm:text-sm">
            Showing {filtered.length === 0 ? 0 : start + 1} to {Math.min(start + pageSize, filtered.length)} of {filtered.length} entries
          </span>
          <div className="erp-pager">
            <button type="button" disabled={current === 1} onClick={() => setPage(current - 1)}>
              Previous
            </button>
            {pageButtons.map((n, idx) => (
              <span key={n} className="flex shrink-0">
                {idx > 0 && pageButtons[idx - 1] !== n - 1 ? <span className="erp-pager-gap">…</span> : null}
                <button type="button" className={n === current ? "is-current" : ""} onClick={() => setPage(n)}>
                  {n}
                </button>
              </span>
            ))}
            <button type="button" disabled={current === totalPages} onClick={() => setPage(current + 1)}>
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
