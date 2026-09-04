import { prisma } from "@/lib/prisma";
import { calcBillTaxes } from "@/lib/bill-totals";
import { sumLrBillableAmount } from "@/lib/lr-totals";

/** Old site: deleting a bill clears LRs + money receipts so outstanding disappears. */
export async function cascadeDeleteBill(billNo: string) {
  const no = billNo.trim();
  if (!no) return;

  await prisma.lrBooking.updateMany({
    where: { billNo: no },
    data: { billed: false, billNo: "" },
  });
  await prisma.moneyReceipt.deleteMany({ where: { billNo: no } });
  await prisma.bill.deleteMany({ where: { billNo: no } });
}

/**
 * After an LR is removed: if it belonged to a bill, either drop that bill
 * (no LRs left → outstanding gone) or refresh bill amount from remaining LRs.
 */
export async function syncBillAfterLrRemoved(billNo: string | null | undefined) {
  const no = String(billNo ?? "").trim();
  if (!no) return;

  const remaining = await prisma.lrBooking.findMany({ where: { billNo: no } });
  if (!remaining.length) {
    await cascadeDeleteBill(no);
    return;
  }

  const bill = await prisma.bill.findFirst({ where: { billNo: no } });
  if (!bill) return;

  const amount = sumLrBillableAmount(remaining);
  const taxes = calcBillTaxes(
    amount,
    Number(bill.cgstPct) || 0,
    Number(bill.sgstPct) || 0,
    Number(bill.igstPct) || 0,
  );

  await prisma.bill.update({
    where: { id: bill.id },
    data: {
      amount,
      lrCount: remaining.length,
      cgstAmt: taxes.cgstAmt,
      sgstAmt: taxes.sgstAmt,
      igstAmt: taxes.igstAmt,
    },
  });
}
