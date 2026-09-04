export function formToObject(form: HTMLFormElement) {
  const fd = new FormData(form);
  const obj: Record<string, string> = {};
  fd.forEach((value, key) => {
    const text = String(value);
    obj[key] = obj[key] ? `${obj[key]}, ${text}` : text;
  });
  return obj;
}

export function downloadCsv(filename: string, rows: Record<string, unknown>[]) {
  if (!rows.length) {
    throw new Error("No rows to export");
  }
  const headers = Object.keys(rows[0]).filter((k) => k !== "password");
  const lines = [
    headers.join(","),
    ...rows.map((row) =>
      headers
        .map((h) => {
          const val = row[h] ?? "";
          const text = String(val).replaceAll('"', '""');
          return `"${text}"`;
        })
        .join(","),
    ),
  ];
  const blob = new Blob(["\uFEFF" + lines.join("\n")], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

type ApiInit = RequestInit & { timeoutMs?: number };

export async function api<T>(url: string, init?: ApiInit): Promise<T> {
  const { timeoutMs, ...rest } = init ?? {};
  const controller = timeoutMs ? new AbortController() : null;
  const timer =
    timeoutMs && controller
      ? setTimeout(() => controller.abort(), timeoutMs)
      : null;

  try {
    const res = await fetch(url, {
      ...rest,
      credentials: "include",
      signal: controller?.signal ?? rest.signal,
      headers: {
        "Content-Type": "application/json",
        ...(rest.headers ?? {}),
      },
    });
    const data = (await res.json().catch(() => ({}))) as T & { error?: string };
    if (!res.ok) {
      const raw = String(data.error ?? "").trim();
      if (raw && !/prisma|invocation|unknown argument/i.test(raw) && raw.length <= 220) {
        throw new Error(raw);
      }
      if (res.status === 401) throw new Error("Session expired. Please login again.");
      if (res.status === 404) throw new Error("Record not found. Refresh and try again.");
      throw new Error("Something went wrong. Please try again.");
    }
    return data;
  } catch (err) {
    if (err instanceof DOMException && err.name === "AbortError") {
      throw new Error("Request timed out. Check SMTP settings or try again.");
    }
    if (err instanceof Error && err.name === "AbortError") {
      throw new Error("Request timed out. Check SMTP settings or try again.");
    }
    throw err;
  } finally {
    if (timer) clearTimeout(timer);
  }
}
