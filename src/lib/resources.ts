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
  "trip-desk": prisma.tripDesk,
  "blog-posts": prisma.blogPost,
  "marketing-media": prisma.marketingMedia,
  "web-inquiries": prisma.webInquiry,
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

/** Only Prisma columns — extra form/UI keys are dropped. */
const RESOURCE_FIELDS: Record<ResourceKey, ReadonlySet<string>> = {
  parties: new Set(["name", "address", "contact", "gst", "opBalance", "opDate", "partyType", "partyCode", "pan"]),
  users: new Set(["username", "password", "name", "mobile", "email", "role", "branch", "status"]),
  drivers: new Set([
    "name", "mobile", "licenceNo", "licenceExpiry", "address", "aadhar", "pan", "bankName", "accountNo",
    "ifsc", "alternateNo", "homeContact", "accountHolder", "guarantorName", "guarantorMob", "category",
  ]),
  vehicles: new Set([
    "vehNo", "ownerName", "ownerMob", "ownerAadhar", "ownerPan", "ownerLicence", "ownerLicenceExpiry",
    "engineNo", "chassisNo", "insuranceCompany", "policyNo", "policyExpDate", "allIndiaPermitNo",
    "allIndiaExpiry", "statePermitNo", "statePermitExp", "pollutionExp", "fitnessExp", "stateTaxExp",
    "guarantorName", "guarantorMob", "altMob", "aadhar", "pan", "licenceNo", "licenceExpiry",
  ]),
  vendors: new Set(["name", "address", "contact", "gst", "pan", "type"]),
  stations: new Set(["name", "code"]),
  rates: new Set(["fromStation", "toStation", "ratePerTon", "effectiveDate"]),
  bookings: new Set([
    "bookingFrom", "lrNo", "lrDate", "fromStation", "toStation", "vehNo", "deliveryAt", "billingParty",
    "consignor", "consignee", "articles", "particulars", "invNoDate", "actWeight", "chargedWeight", "rate",
    "billAs", "totalMeter", "freight", "serviceTax", "haltage", "insurance", "stCharges", "doorCollection",
    "barrier", "other", "hamali", "total", "gst", "cgstAmt", "sgstAmt", "igstAmt", "grandTotal", "gstPaidBy", "ewayBill", "validDate",
    "lrType", "valueRs", "billed", "billNo", "lhcNo", "podStatus", "source", "trackToken",
  ]),
  lhc: new Set([
    "challanNo", "challanDate", "vehNo", "fromStation", "toStation", "ownerName", "ownerMob", "ownerPan",
    "ownerAadhar", "driverName", "driverMob", "driverPan", "driverAadhar", "licenceNo", "engineNo",
    "chassisNo", "insCompany", "policyNo", "policyExp", "allPermitNo", "allPermitExp", "fitnessExp",
    "brokerName", "brokerPan", "lorryFreight", "transfer", "cash", "dieselLtr", "fuel", "fuelVendor",
    "totalAdvance", "balance", "lrNos", "paid", "paidDate", "paidAmount", "otherDed", "remark",
  ]),
  bills: new Set([
    "billNo", "partyName", "fromDate", "toDate", "fromStation", "toStation", "amount", "lrCount", "source",
    "poNo", "billAt", "billDate", "cgstPct", "cgstAmt", "sgstPct", "sgstAmt", "igstPct", "igstAmt", "paidRs",
    "remark", "scanDate", "submitDate",
  ]),
  "driver-register": new Set(["date", "driverName", "vehNo", "startKm", "endKm", "remarks"]),
  "driver-advance": new Set(["date", "driverName", "vehNo", "amount", "mode", "remarks"]),
  trips: new Set([
    "tripDate", "vehNo", "driverName", "fromStation", "toStation", "freight", "openingMeter", "closingMeter",
    "totalKm", "lhcDate", "lhcNo", "lhcFreight", "tyreChangeAfterKm", "totalRunningKm", "servicingKmAfter",
  ]),
  expenses: new Set(["date", "vehNo", "expenseType", "amount", "billNo", "remarks"]),
  fleet: new Set([
    "vehNo", "vehicleType", "capacity", "purchaseDate", "currentKm", "status", "make", "model", "engineNo",
    "chassisNo", "policyExpDate", "allIndiaExpiry", "statePermitExp", "pollutionExp", "fitnessExp",
    "stateTaxExp", "tyreChangeKmAfter", "opKm", "servicingAfter", "olKm",
  ]),
  maintenance: new Set([
    "vehNo",
    "serviceDate",
    "workType",
    "workshopName",
    "amount",
    "diesel",
    "otherExpenses",
    "fasTag",
    "freight",
    "nextServiceKm",
    "expenseName",
    "narration",
  ]),
  receipts: new Set([
    "receiptNo", "date", "partyName", "amount", "mode", "remarks", "source", "billNo", "tdsPct", "tdsAmt",
    "paidAmt", "otherDed",
  ]),
  "vendor-vouchers": new Set(["voucherNo", "date", "vendorName", "amount", "particulars", "paymentType"]),
  "driver-vouchers": new Set(["voucherNo", "date", "driverName", "amount", "particulars", "paymentType"]),
  slips: new Set([
    "slipNo", "date", "vehNo", "fromStation", "toStation", "partyName", "amount", "paid", "paidDate",
    "paidAmount", "tdsPct", "tdsAmt", "otherDed", "lorryNo", "receiptDate", "guaranteeWeight", "freight",
    "advance", "balance", "receiptNo", "remark", "mailId",
  ]),
  tyres: new Set([
    "vehNo", "tyrePosition", "brand", "serialNo", "fitDate", "status", "tyreChangeAfterKm", "totalRunningOn",
    "servicingKmAfter", "totalRunningKm", "tyreChangeStatus", "servicingStatus", "entryDate",
  ]),
  "trip-desk": new Set([
    "tripNo", "driverPhone", "driverName", "vehNo", "fromStation", "toStation", "lrNos", "status", "remarks",
    "startedAt", "completedAt", "shareToken", "customerTrackToken", "trackingMode", "deviceImei", "simMsisdn",
    "simConsentToken", "simConsentStatus", "simConsentAt", "simLastPollAt", "simLastPollError", "destLat",
    "destLng", "etaMinutes", "distanceRemainingKm", "lastLat", "lastLng", "lastLocationAt",
  ]),
  "blog-posts": new Set([
    "slug", "title", "excerpt", "seoDescription", "category", "coverPath", "publishedAt", "readTime",
    "author", "contentJson", "published",
  ]),
  "marketing-media": new Set(["title", "alt", "category", "storedName", "mimeType", "sortOrder", "published"]),
  "web-inquiries": new Set(["type", "referenceId", "name", "mobile", "email", "summary", "payloadJson", "emailed"]),
};

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
  "lastLat",
  "lastLng",
  "destLat",
  "destLng",
  "distanceRemainingKm",
]);

const INT_FIELDS = new Set(["lrCount", "etaMinutes", "sortOrder"]);
const BOOL_FIELDS = new Set(["billed", "paid", "published"]);
const SKIP_FIELDS = new Set(["id", "createdAt", "sr", "srNo"]);
const NUMERIC_GST_RESOURCES = new Set<ResourceKey>(["bookings"]);

function gstin(value: unknown) {
  if (value === null || value === undefined || value === 0) return "";
  const text = String(value).trim();
  return text === "0" ? "" : text;
}

export function sanitize(body: Record<string, unknown>, resource?: ResourceKey) {
  const data: Record<string, unknown> = {};
  const allowed = resource ? RESOURCE_FIELDS[resource] : undefined;
  const gstIsAmount = resource ? NUMERIC_GST_RESOURCES.has(resource) : false;
  for (const [key, value] of Object.entries(body)) {
    if (SKIP_FIELDS.has(key) || value === undefined) continue;
    if (allowed && !allowed.has(key)) continue;
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
