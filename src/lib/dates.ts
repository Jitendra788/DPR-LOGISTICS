export function todayIso() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function firstOfMonthIso() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  return `${y}-${m}-01`;
}

export function isoToDisplay(iso: string) {
  if (!iso || iso.length < 10) return iso ?? "";
  const [y, m, d] = iso.slice(0, 10).split("-");
  if (!d) return iso;
  return `${d}-${m}-${y}`;
}

export function displayToIso(display: string) {
  const match = display.trim().match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/);
  if (!match) return display;
  return `${match[3]}-${match[2].padStart(2, "0")}-${match[1].padStart(2, "0")}`;
}
