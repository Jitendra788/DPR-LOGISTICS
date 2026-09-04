"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { PageHeader } from "@/components/ui/PageHeader";
import { FormCard } from "@/components/ui/FormCard";
import { Flash } from "@/components/ui/Flash";
import { Button } from "@/components/ui/Button";

type PodDoc = {
  id: number;
  lrNo: string;
  fileName: string;
};

function PodDocumentsInner() {
  const router = useRouter();
  const params = useSearchParams();
  const lrNo = params.get("lrNo") ?? "";
  const [rows, setRows] = useState<PodDoc[]>([]);
  const [message, setMessage] = useState<{ type: "ok" | "err"; text: string } | null>(null);
  const [loading, setLoading] = useState(true);

  async function load() {
    if (!lrNo) {
      setRows([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/pod-docs?lrNo=${encodeURIComponent(lrNo)}`);
      const data = (await res.json().catch(() => [])) as PodDoc[] | { error?: string };
      if (!res.ok || !Array.isArray(data)) {
        setMessage({ type: "err", text: (!Array.isArray(data) && data.error) || "Failed to load documents" });
        setRows([]);
        return;
      }
      setRows(data);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load().catch((err) => setMessage({ type: "err", text: err instanceof Error ? err.message : "Failed" }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lrNo]);

  async function remove(id: number) {
    if (!confirm("Delete this document?")) return;
    try {
      const res = await fetch(`/api/pod-docs/${id}`, { method: "DELETE" });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) throw new Error(data.error || "Delete failed");
      setMessage({ type: "ok", text: "Document deleted" });
      await load();
    } catch (err) {
      setMessage({ type: "err", text: err instanceof Error ? err.message : "Delete failed" });
    }
  }

  return (
    <>
      <PageHeader
        title="POD Documents"
        subtitle={`View POD Documents of LR No. ${lrNo || "-"}`}
        crumbs={[
          { label: "Home", href: "/dashboard" },
          { label: "POD Status", href: "/lhc/pod-status" },
          { label: "POD Documents" },
        ]}
      />
      <Flash message={message} />
      <div className="box overflow-hidden">
        <div className="box-body">
          <div className="table-scroll">
            <table className="erp-dt w-full min-w-[520px] border-collapse text-[13px]">
              <thead>
                <tr>
                  <th>Sr No.</th>
                  <th>View Document</th>
                  <th>Delete Document</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={3} className="erp-dt-empty">
                      Loading…
                    </td>
                  </tr>
                ) : rows.length ? (
                  rows.map((row, i) => (
                    <tr key={row.id}>
                      <td>{i + 1}</td>
                      <td>
                        <a
                          href={`/api/pod-docs/${row.id}`}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[#3c8dbc] underline"
                        >
                          {row.fileName || "View"}
                        </a>
                      </td>
                      <td>
                        <button
                          type="button"
                          className="text-[#c0392b] underline"
                          onClick={() => remove(row.id)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={3} className="erp-dt-empty">
                      {lrNo ? "No documents uploaded" : "LR No is missing"}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <FormCard className="mt-3">
        <Button type="button" variant="teal" onClick={() => router.push("/lhc/pod-status")}>
          Back to POD Status
        </Button>
      </FormCard>
    </>
  );
}

export default function PodDocumentsPage() {
  return (
    <Suspense fallback={<p className="p-6">Loading documents...</p>}>
      <PodDocumentsInner />
    </Suspense>
  );
}
