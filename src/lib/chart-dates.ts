export function parseLooseDate(raw: string): Date | null {
  if (!raw) return null;
  const iso = raw.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (iso) return new Date(Number(iso[1]), Number(iso[2]) - 1, Number(iso[3]));
  const dmy = raw.trim().match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})/);
  if (dmy) return new Date(Number(dmy[3]), Number(dmy[2]) - 1, Number(dmy[1]));
  const dt = new Date(raw);
  return Number.isNaN(dt.getTime()) ? null : dt;
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export function lastSixMonths() {
  const now = new Date();
  return Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
    return { key: `${d.getFullYear()}-${d.getMonth()}`, label: MONTHS[d.getMonth()], year: d.getFullYear(), month: d.getMonth() };
  });
}

export function monthKey(d: Date) {
  return `${d.getFullYear()}-${d.getMonth()}`;
}
