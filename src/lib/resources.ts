import { prisma } from "./prisma";

export const resourceMap = {
  parties: prisma.party,
  users: prisma.user,
  drivers: prisma.driver,
  vehicles: prisma.vehicle,
  vendors: prisma.vendor,
  stations: prisma.station,
  rates: prisma.rate,
  bookings: prisma.lrBooking,
  lhc: prisma.lhcContract,
  bills: prisma.bill,
  "driver-register": prisma.driverRegister,
  "driver-advance": prisma.driverAdvance,
  trips: prisma.tripSheet,
  expenses: prisma.expense,
  fleet: prisma.fleetVehicle,
  maintenance: prisma.maintenance,
  receipts: prisma.moneyReceipt,
  "vendor-vouchers": prisma.vendorVoucher,
  "driver-vouchers": prisma.driverVoucher,
  slips: prisma.bookingSlip,
  tyres: prisma.tyreStatus,
} as const;

export type ResourceKey = keyof typeof resourceMap;

export function isResource(value: string): value is ResourceKey {
  return value in resourceMap;
}

type Delegate = {
  findMany: (args?: object) => Promise<unknown[]>;
  findUnique: (args: object) => Promise<unknown>;
  create: (args: object) => Promise<unknown>;
  update: (args: object) => Promise<unknown>;
  delete: (args: object) => Promise<unknown>;
};

export function getModel(resource: ResourceKey): Delegate {
  return resourceMap[resource] as unknown as Delegate;
}

const FLOAT_FIELDS = new Set([
  "freight",
  "serviceTax",
  "haltage",
  "insurance",
  "stCharges",
  "doorCollection",
  "barrier",
  "other",
  "hamali",
  "total",
  "grandTotal",
  "lorryFreight",
  "transfer",
  "cash",
  "dieselLtr",
  "fuel",
  "totalAdvance",
  "balance",
  "paidAmount",
  "amount",
  "ratePerTon",
  "advance",
  "cgstPct",
  "cgstAmt",
  "sgstPct",
  "sgstAmt",
  "igstPct",
  "igstAmt",
  "paidRs",
  "lhcFreight",
  "tdsPct",
  "tdsAmt",
  "paidAmt",
  "otherDed",
]);

const INT_FIELDS = new Set(["lrCount"]);
const BOOL_FIELDS = new Set(["billed", "paid"]);
const SKIP_FIELDS = new Set(["id", "createdAt", "sr", "srNo"]);
const NUMERIC_GST_RESOURCES = new Set<ResourceKey>(["bookings"]);

function gstin(value: unknown) {
  if (value === null || value === undefined || value === 0) return "";
  const text = String(value).trim();
  return text === "0" ? "" : text;
}

export function sanitize(body: Record<string, unknown>, resource?: ResourceKey) {
  const data: Record<string, unknown> = {};
  const gstIsAmount = resource ? NUMERIC_GST_RESOURCES.has(resource) : false;
  for (const [key, value] of Object.entries(body)) {
    if (SKIP_FIELDS.has(key) || value === undefined) continue;
    if (key === "password" && !value) continue;
    if (BOOL_FIELDS.has(key)) {
      data[key] = value === true || value === "true" || value === "1" || value === "on";
      continue;
    }
    if (key === "gst") {
      data[key] = gstIsAmount ? Number(value) || 0 : gstin(value);
      continue;
    }
    if (FLOAT_FIELDS.has(key)) {
      data[key] = Number(value) || 0;
      continue;
    }
    if (INT_FIELDS.has(key)) {
      data[key] = Number(value) || 0;
      continue;
    }
    data[key] = value === null ? "" : String(value);
  }
  return data;
}
