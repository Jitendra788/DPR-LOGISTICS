"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { PageHeader } from "@/components/ui/PageHeader";
import { FormCard } from "@/components/ui/FormCard";
import { DataTable } from "@/components/ui/DataTable";
import { Flash } from "@/components/ui/Flash";
import { Button } from "@/components/ui/Button";

type PodDoc = {
  id: number;
  lrNo: string;
  fileName: string;
};

function PodDocumentsInner() {
  const params = useSearchParams();
  const lrNo = params.get("lrNo") ?? "";
  const [rows, setRows] = useState<PodDoc[]>([]);
  const [message, setMessage] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  async function load() {
    if (!lrNo) return;
    const res = await fetch(`/api/pod-docs?lrNo=${encodeURIComponent(lrNo)}`);
    const data = (await res.json().catch(() => [])) as PodDoc[] | { error?: string };
    if (!res.ok || !Array.isArray(data)) {
      setMessage({ type: "err", text: (!Array.isArray(data) && data.error) || "Failed to load documents" });
      setRows([]);
      return;
    }
    setRows(data);
  }

  useEffect(() => {
    load().catch((err) => setMessage({ type: "err", text: err instanceof Error ? err.message : "Failed" }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lrNo]);

  async function remove(id: number) {
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
        crumbs={[{ label: "Home", href: "/dashboard" }, { label: "POD Documents" }]}
      />
      <Flash message={message} />
      {rows.length ? (
        <DataTable
          rows={rows.map((r, i) => ({ ...r, srNo: i + 1 }))}
          columns={[
            { key: "srNo", header: "Sr No." },
            {
              key: "view",
              header: "View Document",
              render: (row) => (
                <a href={`/api/pod-docs/${row.id}`} target="_blank" rel="noreferrer" className="text-[#3c8dbc] underline">
                  {row.fileName}
                </a>
              ),
            },
            {
              key: "del",
              header: "Delete Document",
              render: (row) => (
                <Button type="button" size="sm" variant="danger" onClick={() => remove(row.id)}>
                  Delete
                </Button>
              ),
            },
          ]}
        />
      ) : (
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
                  <tr>
                    <td colSpan={3} className="erp-dt-empty">
                      {lrNo ? "No documents uploaded" : "LR No is missing"}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
      <FormCard className="mt-3">
        <Button type="button" variant="teal" onClick={() => window.history.back()}>
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
