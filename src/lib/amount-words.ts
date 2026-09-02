const ones = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"];
const tens = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];

function twoDigits(n: number) {
  if (n < 20) return ones[n];
  return `${tens[Math.floor(n / 10)]}${n % 10 ? ` ${ones[n % 10]}` : ""}`.trim();
}

function threeDigits(n: number) {
  if (n < 100) return twoDigits(n);
  return `${ones[Math.floor(n / 100)]} Hundred${n % 100 ? ` ${twoDigits(n % 100)}` : ""}`.trim();
}

function indianGroup(n: number, div: number, label: string, parts: string[]) {
  if (n >= div) {
    parts.push(`${threeDigits(Math.floor(n / div))} ${label}`);
    n %= div;
  }
  return n;
}

export function amountInWordsIndian(value: number) {
  const num = Math.round(Number(value) || 0);
  if (num === 0) return "Zero Rupees Only";

  let n = num;
  const parts: string[] = [];
  n = indianGroup(n, 10000000, "Crore", parts);
  n = indianGroup(n, 100000, "Lakh", parts);
  n = indianGroup(n, 1000, "Thousand", parts);
  if (n > 0) parts.push(threeDigits(n));

  const words = parts.join(" ").replace(/\s+/g, " ").trim();
  return `${words} Rupees Zero Paise Only /-`;
}
