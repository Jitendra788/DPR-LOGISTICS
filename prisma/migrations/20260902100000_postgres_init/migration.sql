-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateTable
CREATE TABLE "Party" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "address" TEXT NOT NULL DEFAULT '',
    "contact" TEXT NOT NULL DEFAULT '',
    "gst" TEXT NOT NULL DEFAULT '',
    "opBalance" TEXT NOT NULL DEFAULT '',
    "opDate" TEXT NOT NULL DEFAULT '',
    "partyType" TEXT NOT NULL DEFAULT 'Consigner/Consignee',
    "partyCode" TEXT NOT NULL DEFAULT '',
    "pan" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Party_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "mobile" TEXT NOT NULL DEFAULT '',
    "email" TEXT NOT NULL DEFAULT '',
    "role" TEXT NOT NULL DEFAULT 'Operator',
    "branch" TEXT NOT NULL DEFAULT 'HO',
    "status" TEXT NOT NULL DEFAULT 'Active',

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Driver" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "mobile" TEXT NOT NULL DEFAULT '',
    "licenceNo" TEXT NOT NULL DEFAULT '',
    "licenceExpiry" TEXT NOT NULL DEFAULT '',
    "address" TEXT NOT NULL DEFAULT '',
    "aadhar" TEXT NOT NULL DEFAULT '',
    "pan" TEXT NOT NULL DEFAULT '',
    "bankName" TEXT NOT NULL DEFAULT '',
    "accountNo" TEXT NOT NULL DEFAULT '',
    "ifsc" TEXT NOT NULL DEFAULT '',
    "alternateNo" TEXT NOT NULL DEFAULT '',
    "homeContact" TEXT NOT NULL DEFAULT '',
    "accountHolder" TEXT NOT NULL DEFAULT '',
    "guarantorName" TEXT NOT NULL DEFAULT '',
    "guarantorMob" TEXT NOT NULL DEFAULT '',
    "category" TEXT NOT NULL DEFAULT 'Driver',

    CONSTRAINT "Driver_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Vehicle" (
    "id" SERIAL NOT NULL,
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
    "licenceExpiry" TEXT NOT NULL DEFAULT '',

    CONSTRAINT "Vehicle_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Vendor" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "address" TEXT NOT NULL DEFAULT '',
    "contact" TEXT NOT NULL DEFAULT '',
    "gst" TEXT NOT NULL DEFAULT '',
    "pan" TEXT NOT NULL DEFAULT '',
    "type" TEXT NOT NULL DEFAULT 'Other',

    CONSTRAINT "Vendor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Station" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL DEFAULT '',

    CONSTRAINT "Station_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Rate" (
    "id" SERIAL NOT NULL,
    "fromStation" TEXT NOT NULL,
    "toStation" TEXT NOT NULL,
    "ratePerTon" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "effectiveDate" TEXT NOT NULL DEFAULT '',

    CONSTRAINT "Rate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LrBooking" (
    "id" SERIAL NOT NULL,
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
    "freight" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "serviceTax" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "haltage" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "insurance" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "stCharges" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "doorCollection" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "barrier" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "other" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "hamali" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "total" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "gst" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "grandTotal" DOUBLE PRECISION NOT NULL DEFAULT 0,
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
    "trackToken" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LrBooking_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LhcContract" (
    "id" SERIAL NOT NULL,
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
    "lorryFreight" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "transfer" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "cash" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "dieselLtr" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "fuel" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "fuelVendor" TEXT NOT NULL DEFAULT '',
    "totalAdvance" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "balance" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "lrNos" TEXT NOT NULL DEFAULT '',
    "paid" BOOLEAN NOT NULL DEFAULT false,
    "paidDate" TEXT NOT NULL DEFAULT '',
    "paidAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,

    CONSTRAINT "LhcContract_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Bill" (
    "id" SERIAL NOT NULL,
    "billNo" TEXT NOT NULL,
    "partyName" TEXT NOT NULL DEFAULT '',
    "fromDate" TEXT NOT NULL DEFAULT '',
    "toDate" TEXT NOT NULL DEFAULT '',
    "fromStation" TEXT NOT NULL DEFAULT '',
    "toStation" TEXT NOT NULL DEFAULT '',
    "amount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "lrCount" INTEGER NOT NULL DEFAULT 0,
    "source" TEXT NOT NULL DEFAULT 'DPR',
    "poNo" TEXT NOT NULL DEFAULT '',
    "billAt" TEXT NOT NULL DEFAULT '',
    "billDate" TEXT NOT NULL DEFAULT '',
    "cgstPct" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "cgstAmt" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "sgstPct" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "sgstAmt" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "igstPct" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "igstAmt" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "paidRs" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "remark" TEXT NOT NULL DEFAULT '',
    "scanDate" TEXT NOT NULL DEFAULT '',
    "submitDate" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Bill_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DriverRegister" (
    "id" SERIAL NOT NULL,
    "date" TEXT NOT NULL,
    "driverName" TEXT NOT NULL,
    "vehNo" TEXT NOT NULL DEFAULT '',
    "startKm" TEXT NOT NULL DEFAULT '',
    "endKm" TEXT NOT NULL DEFAULT '',
    "remarks" TEXT NOT NULL DEFAULT '',

    CONSTRAINT "DriverRegister_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DriverAdvance" (
    "id" SERIAL NOT NULL,
    "date" TEXT NOT NULL,
    "driverName" TEXT NOT NULL,
    "vehNo" TEXT NOT NULL DEFAULT '',
    "amount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "mode" TEXT NOT NULL DEFAULT 'Cash',
    "remarks" TEXT NOT NULL DEFAULT '',

    CONSTRAINT "DriverAdvance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TripSheet" (
    "id" SERIAL NOT NULL,
    "tripDate" TEXT NOT NULL DEFAULT '',
    "vehNo" TEXT NOT NULL DEFAULT '',
    "driverName" TEXT NOT NULL DEFAULT '',
    "fromStation" TEXT NOT NULL DEFAULT '',
    "toStation" TEXT NOT NULL DEFAULT '',
    "freight" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "openingMeter" TEXT NOT NULL DEFAULT '',
    "closingMeter" TEXT NOT NULL DEFAULT '',
    "totalKm" TEXT NOT NULL DEFAULT '',
    "lhcDate" TEXT NOT NULL DEFAULT '',
    "lhcNo" TEXT NOT NULL DEFAULT '',
    "lhcFreight" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "tyreChangeAfterKm" TEXT NOT NULL DEFAULT '',
    "totalRunningKm" TEXT NOT NULL DEFAULT '',
    "servicingKmAfter" TEXT NOT NULL DEFAULT '',

    CONSTRAINT "TripSheet_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Expense" (
    "id" SERIAL NOT NULL,
    "date" TEXT NOT NULL,
    "vehNo" TEXT NOT NULL DEFAULT '',
    "expenseType" TEXT NOT NULL DEFAULT 'Other',
    "amount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "billNo" TEXT NOT NULL DEFAULT '',
    "remarks" TEXT NOT NULL DEFAULT '',

    CONSTRAINT "Expense_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FleetVehicle" (
    "id" SERIAL NOT NULL,
    "vehNo" TEXT NOT NULL,
    "vehicleType" TEXT NOT NULL DEFAULT 'Truck',
    "capacity" TEXT NOT NULL DEFAULT '',
    "purchaseDate" TEXT NOT NULL DEFAULT '',
    "currentKm" TEXT NOT NULL DEFAULT '',
    "status" TEXT NOT NULL DEFAULT 'Available',
    "make" TEXT NOT NULL DEFAULT '',
    "model" TEXT NOT NULL DEFAULT '',
    "engineNo" TEXT NOT NULL DEFAULT '',
    "chassisNo" TEXT NOT NULL DEFAULT '',
    "policyExpDate" TEXT NOT NULL DEFAULT '',
    "allIndiaExpiry" TEXT NOT NULL DEFAULT '',
    "statePermitExp" TEXT NOT NULL DEFAULT '',
    "pollutionExp" TEXT NOT NULL DEFAULT '',
    "fitnessExp" TEXT NOT NULL DEFAULT '',
    "stateTaxExp" TEXT NOT NULL DEFAULT '',
    "tyreChangeKmAfter" TEXT NOT NULL DEFAULT '',
    "opKm" TEXT NOT NULL DEFAULT '',
    "servicingAfter" TEXT NOT NULL DEFAULT '',
    "olKm" TEXT NOT NULL DEFAULT '',

    CONSTRAINT "FleetVehicle_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Maintenance" (
    "id" SERIAL NOT NULL,
    "vehNo" TEXT NOT NULL DEFAULT '',
    "serviceDate" TEXT NOT NULL DEFAULT '',
    "workType" TEXT NOT NULL DEFAULT 'Service',
    "workshopName" TEXT NOT NULL DEFAULT '',
    "amount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "nextServiceKm" TEXT NOT NULL DEFAULT '',
    "expenseName" TEXT NOT NULL DEFAULT '',
    "narration" TEXT NOT NULL DEFAULT '',

    CONSTRAINT "Maintenance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MoneyReceipt" (
    "id" SERIAL NOT NULL,
    "receiptNo" TEXT NOT NULL DEFAULT '',
    "date" TEXT NOT NULL DEFAULT '',
    "partyName" TEXT NOT NULL DEFAULT '',
    "amount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "mode" TEXT NOT NULL DEFAULT 'Cash',
    "remarks" TEXT NOT NULL DEFAULT '',
    "source" TEXT NOT NULL DEFAULT 'DPR',
    "billNo" TEXT NOT NULL DEFAULT '',
    "tdsPct" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "tdsAmt" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "paidAmt" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "otherDed" DOUBLE PRECISION NOT NULL DEFAULT 0,

    CONSTRAINT "MoneyReceipt_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VendorVoucher" (
    "id" SERIAL NOT NULL,
    "voucherNo" TEXT NOT NULL DEFAULT '',
    "date" TEXT NOT NULL DEFAULT '',
    "vendorName" TEXT NOT NULL DEFAULT '',
    "amount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "particulars" TEXT NOT NULL DEFAULT '',
    "paymentType" TEXT NOT NULL DEFAULT 'Cr',

    CONSTRAINT "VendorVoucher_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DriverVoucher" (
    "id" SERIAL NOT NULL,
    "voucherNo" TEXT NOT NULL DEFAULT '',
    "date" TEXT NOT NULL DEFAULT '',
    "driverName" TEXT NOT NULL DEFAULT '',
    "amount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "particulars" TEXT NOT NULL DEFAULT '',
    "paymentType" TEXT NOT NULL DEFAULT 'Cr',

    CONSTRAINT "DriverVoucher_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BookingSlip" (
    "id" SERIAL NOT NULL,
    "slipNo" TEXT NOT NULL DEFAULT '',
    "date" TEXT NOT NULL DEFAULT '',
    "vehNo" TEXT NOT NULL DEFAULT '',
    "fromStation" TEXT NOT NULL DEFAULT '',
    "toStation" TEXT NOT NULL DEFAULT '',
    "partyName" TEXT NOT NULL DEFAULT '',
    "amount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "paid" BOOLEAN NOT NULL DEFAULT false,
    "paidDate" TEXT NOT NULL DEFAULT '',
    "paidAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "lorryNo" TEXT NOT NULL DEFAULT '',
    "receiptDate" TEXT NOT NULL DEFAULT '',
    "guaranteeWeight" TEXT NOT NULL DEFAULT '',
    "freight" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "advance" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "balance" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "receiptNo" TEXT NOT NULL DEFAULT '',
    "remark" TEXT NOT NULL DEFAULT '',
    "mailId" TEXT NOT NULL DEFAULT '',

    CONSTRAINT "BookingSlip_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TyreStatus" (
    "id" SERIAL NOT NULL,
    "vehNo" TEXT NOT NULL DEFAULT '',
    "tyrePosition" TEXT NOT NULL DEFAULT 'Front Left',
    "brand" TEXT NOT NULL DEFAULT '',
    "serialNo" TEXT NOT NULL DEFAULT '',
    "fitDate" TEXT NOT NULL DEFAULT '',
    "status" TEXT NOT NULL DEFAULT 'OK',
    "tyreChangeAfterKm" TEXT NOT NULL DEFAULT '',
    "totalRunningOn" TEXT NOT NULL DEFAULT '',
    "servicingKmAfter" TEXT NOT NULL DEFAULT '',
    "totalRunningKm" TEXT NOT NULL DEFAULT '',
    "tyreChangeStatus" TEXT NOT NULL DEFAULT 'Yes',
    "servicingStatus" TEXT NOT NULL DEFAULT 'Yes',
    "entryDate" TEXT NOT NULL DEFAULT '',

    CONSTRAINT "TyreStatus_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PodDocument" (
    "id" SERIAL NOT NULL,
    "lrNo" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "storedName" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL DEFAULT 'application/octet-stream',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PodDocument_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TripDesk" (
    "id" SERIAL NOT NULL,
    "tripNo" TEXT NOT NULL DEFAULT '',
    "driverPhone" TEXT NOT NULL,
    "driverName" TEXT NOT NULL DEFAULT '',
    "vehNo" TEXT NOT NULL DEFAULT '',
    "fromStation" TEXT NOT NULL DEFAULT '',
    "toStation" TEXT NOT NULL DEFAULT '',
    "lrNos" TEXT NOT NULL DEFAULT '',
    "status" TEXT NOT NULL DEFAULT 'Pending',
    "remarks" TEXT NOT NULL DEFAULT '',
    "startedAt" TEXT NOT NULL DEFAULT '',
    "completedAt" TEXT NOT NULL DEFAULT '',
    "shareToken" TEXT NOT NULL DEFAULT '',
    "customerTrackToken" TEXT NOT NULL DEFAULT '',
    "trackingMode" TEXT NOT NULL DEFAULT 'phone',
    "deviceImei" TEXT NOT NULL DEFAULT '',
    "simMsisdn" TEXT NOT NULL DEFAULT '',
    "simConsentToken" TEXT NOT NULL DEFAULT '',
    "simConsentStatus" TEXT NOT NULL DEFAULT '',
    "simConsentAt" TEXT NOT NULL DEFAULT '',
    "simLastPollAt" TEXT NOT NULL DEFAULT '',
    "simLastPollError" TEXT NOT NULL DEFAULT '',
    "destLat" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "destLng" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "etaMinutes" INTEGER NOT NULL DEFAULT 0,
    "distanceRemainingKm" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "lastLat" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "lastLng" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "lastLocationAt" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TripDesk_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TripLocationLog" (
    "id" SERIAL NOT NULL,
    "tripId" INTEGER NOT NULL,
    "lat" DOUBLE PRECISION NOT NULL,
    "lng" DOUBLE PRECISION NOT NULL,
    "speed" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "heading" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "accuracy" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "source" TEXT NOT NULL DEFAULT 'phone',
    "recordedAt" TEXT NOT NULL DEFAULT '',

    CONSTRAINT "TripLocationLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TrackingAlert" (
    "id" SERIAL NOT NULL,
    "tripId" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "severity" TEXT NOT NULL DEFAULT 'medium',
    "channel" TEXT NOT NULL DEFAULT 'erp',
    "triggeredAt" TEXT NOT NULL DEFAULT '',
    "acknowledgedAt" TEXT NOT NULL DEFAULT '',

    CONSTRAINT "TrackingAlert_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BlogPost" (
    "id" SERIAL NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "excerpt" TEXT NOT NULL DEFAULT '',
    "seoDescription" TEXT NOT NULL DEFAULT '',
    "category" TEXT NOT NULL DEFAULT '',
    "coverPath" TEXT NOT NULL DEFAULT '',
    "publishedAt" TEXT NOT NULL DEFAULT '',
    "readTime" TEXT NOT NULL DEFAULT '5 min',
    "author" TEXT NOT NULL DEFAULT 'DPR Logistics Team',
    "contentJson" TEXT NOT NULL DEFAULT '[]',
    "published" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BlogPost_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MarketingMedia" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL DEFAULT '',
    "alt" TEXT NOT NULL DEFAULT '',
    "category" TEXT NOT NULL DEFAULT 'gallery',
    "storedName" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL DEFAULT 'image/jpeg',
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "published" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MarketingMedia_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WebInquiry" (
    "id" SERIAL NOT NULL,
    "type" TEXT NOT NULL,
    "referenceId" TEXT NOT NULL,
    "name" TEXT NOT NULL DEFAULT '',
    "mobile" TEXT NOT NULL DEFAULT '',
    "email" TEXT NOT NULL DEFAULT '',
    "summary" TEXT NOT NULL DEFAULT '',
    "payloadJson" TEXT NOT NULL DEFAULT '{}',
    "emailed" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WebInquiry_pkey" PRIMARY KEY ("id")
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

-- CreateIndex
CREATE INDEX "TripLocationLog_tripId_recordedAt_idx" ON "TripLocationLog"("tripId", "recordedAt");

-- CreateIndex
CREATE INDEX "TrackingAlert_tripId_acknowledgedAt_idx" ON "TrackingAlert"("tripId", "acknowledgedAt");

-- CreateIndex
CREATE UNIQUE INDEX "BlogPost_slug_key" ON "BlogPost"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "WebInquiry_referenceId_key" ON "WebInquiry"("referenceId");

-- CreateIndex
CREATE INDEX "WebInquiry_type_createdAt_idx" ON "WebInquiry"("type", "createdAt");

-- AddForeignKey
ALTER TABLE "TripLocationLog" ADD CONSTRAINT "TripLocationLog_tripId_fkey" FOREIGN KEY ("tripId") REFERENCES "TripDesk"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrackingAlert" ADD CONSTRAINT "TrackingAlert_tripId_fkey" FOREIGN KEY ("tripId") REFERENCES "TripDesk"("id") ON DELETE CASCADE ON UPDATE CASCADE;

