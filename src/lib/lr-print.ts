export const lrPrintCompany = {
  name: "DPR LOGISTICS",
  tagline: "Fleet Owners & Transport Contractors",
  address: "Shree Mahalaxmi Petrol Pump 5 Star MIDC Road, Kagal Dist.Kolhapur 416216",
  email: "dprlogistics2142@gmail.com",
  phones: "9356259949",
  jurisdiction: "Subject To Kolhapur Jurisdiction",
  customerCare: "9356259949",
  companyGst: "27BNLPK2073C1Z5",
  companyPan: "BNLPK2073C",
  blessings: "|| Shree Ganesh Prasanna || Shri Mahalaxmi Prasanna ||",
} as const;

export function formatPrintDate(value: string) {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString("en-GB");
}

export function formatPrintMoney(value: number) {
  const num = Number(value) || 0;
  if (num === 0) return "";
  if (Number.isInteger(num)) return String(num);
  return num.toFixed(2).replace(/\.?0+$/, "");
}
