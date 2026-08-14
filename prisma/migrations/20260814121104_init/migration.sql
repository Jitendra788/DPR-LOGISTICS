-- CreateTable
CREATE TABLE "Party" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "address" TEXT NOT NULL DEFAULT '',
    "contact" TEXT NOT NULL DEFAULT '',
    "gst" TEXT NOT NULL DEFAULT '',
    "opBalance" TEXT NOT NULL DEFAULT '',
    "opDate" TEXT NOT NULL DEFAULT '',
    "partyType" TEXT NOT NULL DEFAULT 'Consigner/Consignee',
    "partyCode" TEXT NOT NULL DEFAULT '',
    "pan" TEXT NOT NULL DEFAULT '',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "User" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "mobile" TEXT NOT NULL DEFAULT '',
    "email" TEXT NOT NULL DEFAULT '',
    "role" TEXT NOT NULL DEFAULT 'Operator',
    "branch" TEXT NOT NULL DEFAULT 'HO',
    "status" TEXT NOT NULL DEFAULT 'Active'
);

-- CreateTable
CREATE TABLE "Driver" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "mobile" TEXT NOT NULL DEFAULT '',
    "licenceNo" TEXT NOT NULL DEFAULT '',
    "licenceExpiry" TEXT NOT NULL DEFAULT '',
    "address" TEXT NOT NULL DEFAULT '',
    "aadhar" TEXT NOT NULL DEFAULT '',
    "pan" TEXT NOT NULL DEFAULT '',
    "bankName" TEXT NOT NULL DEFAULT '',
    "accountNo" TEXT NOT NULL DEFAULT '',
    "ifsc" TEXT NOT NULL DEFAULT ''
);

-- CreateTable
CREATE TABLE "Vehicle" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "vehNo" TEXT NOT NULL,
    "ownerName" TEXT NOT NULL DEFAULT '',
    "ownerMob" TEXT NOT NULL DEFAULT '',
    "ownerAadhar" TEXT NOT NULL DEFAULT '',
    "ownerPan" TEXT NOT NULL DEFAULT '',
    "ownerLicence" TEXT NOT NULL DEFAULT '',
    "ownerLicenceExpiry" TEXT NOT NULL DEFAULT '',
    "engineNo" TEXT NOT NULL DEFAULT '',
    "chassisNo" TEXT NOT NULL DEFAULT '',
    "insuranceCompany" TEXT NOT NULL DEFAULT '',
    "policyNo" TEXT NOT NULL DEFAULT '',
    "policyExpDate" TEXT NOT NULL DEFAULT '',
    "allIndiaPermitNo" TEXT NOT NULL DEFAULT '',
    "allIndiaExpiry" TEXT NOT NULL DEFAULT '',
    "statePermitNo" TEXT NOT NULL DEFAULT '',
    "statePermitExp" TEXT NOT NULL DEFAULT '',
    "pollutionExp" TEXT NOT NULL DEFAULT '',
    "fitnessExp" TEXT NOT NULL DEFAULT '',
    "stateTaxExp" TEXT NOT NULL DEFAULT '',
    "guarantorName" TEXT NOT NULL DEFAULT '',
    "guarantorMob" TEXT NOT NULL DEFAULT '',
    "altMob" TEXT NOT NULL DEFAULT '',
    "aadhar" TEXT NOT NULL DEFAULT '',
    "pan" TEXT NOT NULL DEFAULT '',
    "licenceNo" TEXT NOT NULL DEFAULT '',
    "licenceExpiry" TEXT NOT NULL DEFAULT ''
);

-- CreateTable
CREATE TABLE "Vendor" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "address" TEXT NOT NULL DEFAULT '',
    "contact" TEXT NOT NULL DEFAULT '',
    "gst" TEXT NOT NULL DEFAULT '',
    "pan" TEXT NOT NULL DEFAULT '',
    "type" TEXT NOT NULL DEFAULT 'Other'
);

-- CreateTable
CREATE TABLE "Station" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL DEFAULT ''
);

-- CreateTable
CREATE TABLE "Rate" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "fromStation" TEXT NOT NULL,
    "toStation" TEXT NOT NULL,
    "ratePerTon" REAL NOT NULL DEFAULT 0,
    "effectiveDate" TEXT NOT NULL DEFAULT ''
);

-- CreateTable
CREATE TABLE "LrBooking" (
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
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "LhcContract" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "challanNo" TEXT NOT NULL,
    "challanDate" TEXT NOT NULL DEFAULT '',
    "vehNo" TEXT NOT NULL DEFAULT '',
    "fromStation" TEXT NOT NULL DEFAULT '',
    "toStation" TEXT NOT NULL DEFAULT '',
    "ownerName" TEXT NOT NULL DEFAULT '',
    "ownerMob" TEXT NOT NULL DEFAULT '',
    "ownerPan" TEXT NOT NULL DEFAULT '',
    "ownerAadhar" TEXT NOT NULL DEFAULT '',
    "driverName" TEXT NOT NULL DEFAULT '',
    "driverMob" TEXT NOT NULL DEFAULT '',
    "driverPan" TEXT NOT NULL DEFAULT '',
    "driverAadhar" TEXT NOT NULL DEFAULT '',
    "licenceNo" TEXT NOT NULL DEFAULT '',
    "engineNo" TEXT NOT NULL DEFAULT '',
    "chassisNo" TEXT NOT NULL DEFAULT '',
    "insCompany" TEXT NOT NULL DEFAULT '',
    "policyNo" TEXT NOT NULL DEFAULT '',
    "policyExp" TEXT NOT NULL DEFAULT '',
    "allPermitNo" TEXT NOT NULL DEFAULT '',
    "allPermitExp" TEXT NOT NULL DEFAULT '',
    "fitnessExp" TEXT NOT NULL DEFAULT '',
    "brokerName" TEXT NOT NULL DEFAULT '',
    "brokerPan" TEXT NOT NULL DEFAULT '',
    "lorryFreight" REAL NOT NULL DEFAULT 0,
    "transfer" REAL NOT NULL DEFAULT 0,
    "cash" REAL NOT NULL DEFAULT 0,
    "dieselLtr" REAL NOT NULL DEFAULT 0,
    "fuel" REAL NOT NULL DEFAULT 0,
    "fuelVendor" TEXT NOT NULL DEFAULT '',
    "totalAdvance" REAL NOT NULL DEFAULT 0,
    "balance" REAL NOT NULL DEFAULT 0,
    "lrNos" TEXT NOT NULL DEFAULT '',
    "paid" BOOLEAN NOT NULL DEFAULT false,
    "paidDate" TEXT NOT NULL DEFAULT '',
    "paidAmount" REAL NOT NULL DEFAULT 0
);

-- CreateTable
CREATE TABLE "Bill" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "billNo" TEXT NOT NULL,
    "partyName" TEXT NOT NULL,
    "fromDate" TEXT NOT NULL,
    "toDate" TEXT NOT NULL,
    "fromStation" TEXT NOT NULL DEFAULT '',
    "toStation" TEXT NOT NULL DEFAULT '',
    "amount" REAL NOT NULL DEFAULT 0,
    "lrCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "DriverRegister" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "date" TEXT NOT NULL,
    "driverName" TEXT NOT NULL,
    "vehNo" TEXT NOT NULL DEFAULT '',
    "startKm" TEXT NOT NULL DEFAULT '',
    "endKm" TEXT NOT NULL DEFAULT '',
    "remarks" TEXT NOT NULL DEFAULT ''
);

-- CreateTable
CREATE TABLE "DriverAdvance" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "date" TEXT NOT NULL,
    "driverName" TEXT NOT NULL,
    "vehNo" TEXT NOT NULL DEFAULT '',
    "amount" REAL NOT NULL DEFAULT 0,
    "mode" TEXT NOT NULL DEFAULT 'Cash',
    "remarks" TEXT NOT NULL DEFAULT ''
);

-- CreateTable
CREATE TABLE "TripSheet" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "tripDate" TEXT NOT NULL,
    "vehNo" TEXT NOT NULL DEFAULT '',
    "driverName" TEXT NOT NULL DEFAULT '',
    "fromStation" TEXT NOT NULL DEFAULT '',
    "toStation" TEXT NOT NULL DEFAULT '',
    "freight" REAL NOT NULL DEFAULT 0
);

-- CreateTable
CREATE TABLE "Expense" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "date" TEXT NOT NULL,
    "vehNo" TEXT NOT NULL DEFAULT '',
    "expenseType" TEXT NOT NULL DEFAULT 'Other',
    "amount" REAL NOT NULL DEFAULT 0,
    "billNo" TEXT NOT NULL DEFAULT '',
    "remarks" TEXT NOT NULL DEFAULT ''
);

-- CreateTable
CREATE TABLE "FleetVehicle" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "vehNo" TEXT NOT NULL,
    "vehicleType" TEXT NOT NULL DEFAULT 'Truck',
    "capacity" TEXT NOT NULL DEFAULT '',
    "purchaseDate" TEXT NOT NULL DEFAULT '',
    "currentKm" TEXT NOT NULL DEFAULT '',
    "status" TEXT NOT NULL DEFAULT 'Available'
);

-- CreateTable
CREATE TABLE "Maintenance" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "vehNo" TEXT NOT NULL,
    "serviceDate" TEXT NOT NULL,
    "workType" TEXT NOT NULL DEFAULT 'Service',
    "workshopName" TEXT NOT NULL DEFAULT '',
    "amount" REAL NOT NULL DEFAULT 0,
    "nextServiceKm" TEXT NOT NULL DEFAULT ''
);

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "Vehicle_vehNo_key" ON "Vehicle"("vehNo");

-- CreateIndex
CREATE UNIQUE INDEX "Station_name_key" ON "Station"("name");

-- CreateIndex
CREATE UNIQUE INDEX "LrBooking_lrNo_key" ON "LrBooking"("lrNo");

-- CreateIndex
CREATE UNIQUE INDEX "LhcContract_challanNo_key" ON "LhcContract"("challanNo");

-- CreateIndex
CREATE UNIQUE INDEX "Bill_billNo_key" ON "Bill"("billNo");

-- CreateIndex
CREATE UNIQUE INDEX "FleetVehicle_vehNo_key" ON "FleetVehicle"("vehNo");
