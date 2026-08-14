"use client";

import { useCallback, useEffect, useState } from "react";
import { api } from "@/lib/api-client";

export function useCrud<T extends { id: number }>(resource: string) {
  const [rows, setRows] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  const reload = useCallback(async () => {
    const data = await api<T[]>(`/api/${resource}`);
    setRows(Array.isArray(data) ? data : []);
    setLoading(false);
  }, [resource]);

  useEffect(() => {
    reload().catch((err: Error) => {
      setMessage({ type: "err", text: err.message });
      setLoading(false);
    });
  }, [reload]);

  async function create(body: unknown) {
    try {
      const saved = await api<T>(`/api/${resource}`, { method: "POST", body: JSON.stringify(body) });
      setMessage({ type: "ok", text: "Saved successfully" });
      await reload();
      return saved;
    } catch (err) {
      setMessage({ type: "err", text: err instanceof Error ? err.message : "Save failed" });
      return null;
    }
  }

  async function update(id: number, body: unknown) {
    try {
      const saved = await api<T>(`/api/${resource}/${id}`, { method: "PUT", body: JSON.stringify(body) });
      setMessage({ type: "ok", text: "Updated successfully" });
      await reload();
      return saved;
    } catch (err) {
      setMessage({ type: "err", text: err instanceof Error ? err.message : "Update failed" });
      return null;
    }
  }

  async function remove(id: number) {
    if (!confirm("Delete this record?")) return false;
    try {
      await api(`/api/${resource}/${id}`, { method: "DELETE" });
      setMessage({ type: "ok", text: "Deleted successfully" });
      await reload();
      return true;
    } catch (err) {
      setMessage({ type: "err", text: err instanceof Error ? err.message : "Delete failed" });
      return false;
    }
  }

  return { rows, loading, message, setMessage, reload, create, update, remove };
}
