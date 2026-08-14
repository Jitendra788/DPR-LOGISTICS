-- CreateTable
CREATE TABLE "MoneyReceipt" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "receiptNo" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "partyName" TEXT NOT NULL,
    "amount" REAL NOT NULL DEFAULT 0,
    "mode" TEXT NOT NULL DEFAULT 'Cash',
    "remarks" TEXT NOT NULL DEFAULT '',
    "source" TEXT NOT NULL DEFAULT 'DPR'
);

-- CreateTable
CREATE TABLE "VendorVoucher" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "voucherNo" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "vendorName" TEXT NOT NULL,
    "amount" REAL NOT NULL DEFAULT 0,
    "particulars" TEXT NOT NULL DEFAULT ''
);

-- CreateTable
CREATE TABLE "DriverVoucher" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "voucherNo" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "driverName" TEXT NOT NULL,
    "amount" REAL NOT NULL DEFAULT 0,
    "particulars" TEXT NOT NULL DEFAULT ''
);

-- CreateTable
CREATE TABLE "BookingSlip" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "slipNo" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "vehNo" TEXT NOT NULL DEFAULT '',
    "fromStation" TEXT NOT NULL DEFAULT '',
    "toStation" TEXT NOT NULL DEFAULT '',
    "partyName" TEXT NOT NULL DEFAULT '',
    "amount" REAL NOT NULL DEFAULT 0,
    "paid" BOOLEAN NOT NULL DEFAULT false,
    "paidDate" TEXT NOT NULL DEFAULT '',
    "paidAmount" REAL NOT NULL DEFAULT 0
);

-- CreateTable
CREATE TABLE "TyreStatus" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "vehNo" TEXT NOT NULL,
    "tyrePosition" TEXT NOT NULL DEFAULT 'Front Left',
    "brand" TEXT NOT NULL DEFAULT '',
    "serialNo" TEXT NOT NULL DEFAULT '',
    "fitDate" TEXT NOT NULL DEFAULT '',
    "status" TEXT NOT NULL DEFAULT 'OK'
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_LrBooking" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "bookingFrom" TEXT NOT NULL DEFAULT '',
    "lrNo" TEXT NOT NULL,
    "lrDate" TEXT NOT NULL DEFAULT '',
    "fromStation" TEXT NOT NULL DEFAULT '',
    "toStation" TEXT NOT NULL DEFAULT '',
    "vehNo" TEXT NOT NULL DEFAULT '',
    "deliveryAt" TEXT NOT NULL DEFAULT 'DOOR',
    "billingParty" TEXT NOT NULL DEFAULT '',
    "consignor" TEXT NOT NULL DEFAULT '',
    "consignee" TEXT NOT NULL DEFAULT '',
    "articles" TEXT NOT NULL DEFAULT '',
    "particulars" TEXT NOT NULL DEFAULT '',
    "invNoDate" TEXT NOT NULL DEFAULT '',
    "actWeight" TEXT NOT NULL DEFAULT '',
    "chargedWeight" TEXT NOT NULL DEFAULT '',
    "rate" TEXT NOT NULL DEFAULT '',
    "billAs" TEXT NOT NULL DEFAULT 'Weight',
    "totalMeter" TEXT NOT NULL DEFAULT '',
    "freight" REAL NOT NULL DEFAULT 0,
    "serviceTax" REAL NOT NULL DEFAULT 0,
    "haltage" REAL NOT NULL DEFAULT 0,
    "insurance" REAL NOT NULL DEFAULT 0,
    "stCharges" REAL NOT NULL DEFAULT 0,
    "doorCollection" REAL NOT NULL DEFAULT 0,
    "barrier" REAL NOT NULL DEFAULT 0,
    "other" REAL NOT NULL DEFAULT 0,
    "hamali" REAL NOT NULL DEFAULT 0,
    "total" REAL NOT NULL DEFAULT 0,
    "gst" REAL NOT NULL DEFAULT 0,
    "grandTotal" REAL NOT NULL DEFAULT 0,
    "gstPaidBy" TEXT NOT NULL DEFAULT 'Consignor',
    "ewayBill" TEXT NOT NULL DEFAULT '',
    "validDate" TEXT NOT NULL DEFAULT '',
    "lrType" TEXT NOT NULL DEFAULT 'TBB',
    "valueRs" TEXT NOT NULL DEFAULT '',
    "billed" BOOLEAN NOT NULL DEFAULT false,
    "billNo" TEXT NOT NULL DEFAULT '',
    "lhcNo" TEXT NOT NULL DEFAULT '',
    "podStatus" TEXT NOT NULL DEFAULT 'Pending',
    "source" TEXT NOT NULL DEFAULT 'DPR',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_LrBooking" ("actWeight", "articles", "barrier", "billAs", "billNo", "billed", "billingParty", "bookingFrom", "chargedWeight", "consignee", "consignor", "createdAt", "deliveryAt", "doorCollection", "ewayBill", "freight", "fromStation", "grandTotal", "gst", "gstPaidBy", "haltage", "hamali", "id", "insurance", "invNoDate", "lhcNo", "lrDate", "lrNo", "lrType", "other", "particulars", "podStatus", "rate", "serviceTax", "stCharges", "toStation", "total", "totalMeter", "validDate", "valueRs", "vehNo") SELECT "actWeight", "articles", "barrier", "billAs", "billNo", "billed", "billingParty", "bookingFrom", "chargedWeight", "consignee", "consignor", "createdAt", "deliveryAt", "doorCollection", "ewayBill", "freight", "fromStation", "grandTotal", "gst", "gstPaidBy", "haltage", "hamali", "id", "insurance", "invNoDate", "lhcNo", "lrDate", "lrNo", "lrType", "other", "particulars", "podStatus", "rate", "serviceTax", "stCharges", "toStation", "total", "totalMeter", "validDate", "valueRs", "vehNo" FROM "LrBooking";
DROP TABLE "LrBooking";
ALTER TABLE "new_LrBooking" RENAME TO "LrBooking";
CREATE UNIQUE INDEX "LrBooking_lrNo_key" ON "LrBooking"("lrNo");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
