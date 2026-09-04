"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { api } from "@/lib/api-client";

export type FlashState = { type: "ok" | "err"; text: string; at: number } | null;

/** Blocks identical create payloads while a request is in flight (and briefly after). */
const recentCreates = new Map<string, number>();

function bodyKey(resource: string, body: unknown) {
  try {
    return `${resource}:${JSON.stringify(body)}`;
  } catch {
    return `${resource}:${String(body)}`;
  }
}

export function useCrud<T extends { id: number }>(resource: string) {
  const [rows, setRows] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessageState] = useState<FlashState>(null);
  const busyRef = useRef(false);

  const setMessage = useCallback((msg: { type: "ok" | "err"; text: string } | null) => {
    setMessageState(msg ? { ...msg, at: Date.now() } : null);
  }, []);

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
  }, [reload, setMessage]);

  async function withLock<R>(fn: () => Promise<R>): Promise<R | null> {
    if (busyRef.current) {
      setMessage({ type: "err", text: "Please wait — previous save still running" });
      return null;
    }
    busyRef.current = true;
    setSaving(true);
    try {
      return await fn();
    } finally {
      busyRef.current = false;
      setSaving(false);
    }
  }

  async function create(body: unknown) {
    const key = bodyKey(resource, body);
    const now = Date.now();
    const last = recentCreates.get(key) ?? 0;
    if (now - last < 2500) {
      setMessage({ type: "err", text: "Already saved — wait a moment before saving again" });
      return null;
    }
    recentCreates.set(key, now);

    return withLock(async () => {
      try {
        const saved = await api<T>(`/api/${resource}`, { method: "POST", body: JSON.stringify(body) });
        setMessage({ type: "ok", text: "Saved successfully" });
        try {
          await reload();
        } catch {
          /* save already succeeded */
        }
        return saved;
      } catch (err) {
        recentCreates.delete(key);
        setMessage({ type: "err", text: err instanceof Error ? err.message : "Could not save. Please try again." });
        return null;
      }
    });
  }

  async function update(id: number, body: unknown) {
    if (!id || id <= 0) {
      setMessage({ type: "err", text: "No record selected for update. Click Update in the table first." });
      return null;
    }
    return withLock(async () => {
      try {
        const saved = await api<T>(`/api/${resource}/${id}`, { method: "PUT", body: JSON.stringify(body) });
        setMessage({ type: "ok", text: "Updated successfully" });
        try {
          await reload();
        } catch {
          /* update already succeeded */
        }
        return saved;
      } catch (err) {
        setMessage({ type: "err", text: err instanceof Error ? err.message : "Could not update. Please try again." });
        return null;
      }
    });
  }

  async function remove(id: number) {
    if (!id || id <= 0) {
      setMessage({ type: "err", text: "Invalid record id" });
      return false;
    }
    if (!confirm("Delete this record?")) return false;
    const result = await withLock(async () => {
      try {
        await api(`/api/${resource}/${id}`, { method: "DELETE" });
        setMessage({ type: "ok", text: "Deleted successfully" });
        try {
          await reload();
        } catch {
          /* delete already succeeded */
        }
        return true;
      } catch (err) {
        setMessage({ type: "err", text: err instanceof Error ? err.message : "Could not delete. Please try again." });
        return false;
      }
    });
    return result ?? false;
  }

  return { rows, loading, saving, message, setMessage, reload, create, update, remove };
}
