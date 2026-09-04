import { isMeterBillAs } from "@/lib/lr-totals";

/** True when this bill belongs on Meterwise screens. */
export function isMeterBill(
  bill: { billAt?: string | null; billNo?: string | null },
  linkedLrBillAs: Array<string | null | undefined> = [],
) {
  if (isMeterBillAs(bill.billAt)) return true;
  if (linkedLrBillAs.length > 0) {
    const meter = linkedLrBillAs.filter((v) => isMeterBillAs(v)).length;
    // Prefer meter route when majority (or all) linked LRs are meter-billed
    if (meter > 0 && meter >= linkedLrBillAs.length - meter) return true;
  }
  return false;
}

export function dprBillEditHref(billNo: string, meter: boolean) {
  return `${meter ? "/bills/meterwise" : "/bills/weightwise"}?billNo=${encodeURIComponent(billNo)}`;
}

export function roadwaysBillEditHref(billNo: string, meter: boolean) {
  return `${meter ? "/roadways/bill-meterwise" : "/roadways/bill-weightwise"}?billNo=${encodeURIComponent(billNo)}`;
}
