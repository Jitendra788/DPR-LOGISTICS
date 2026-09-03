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

export async function api<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });
  const data = (await res.json().catch(() => ({}))) as T & { error?: string };
  if (!res.ok) {
    const raw = String(data.error ?? "").trim();
    if (raw && !/prisma|invocation|unknown argument/i.test(raw) && raw.length <= 160) {
      throw new Error(raw);
    }
    throw new Error("Something went wrong. Please try again.");
  }
  return data;
}
