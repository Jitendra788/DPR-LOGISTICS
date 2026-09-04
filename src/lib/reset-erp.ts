import { prisma } from "./prisma";
import { hashPassword } from "./auth-session";

const ERP_SEQUENCE_TABLES = [
  "Party",
  "User",
  "Driver",
  "Vehicle",
  "Vendor",
  "Station",
  "Rate",
  "LrBooking",
  "LhcContract",
  "Bill",
  "DriverRegister",
  "DriverAdvance",
  "TripSheet",
  "Expense",
  "FleetVehicle",
  "Maintenance",
  "MoneyReceipt",
  "VendorVoucher",
  "DriverVoucher",
  "BookingSlip",
  "TyreStatus",
  "PodDocument",
  "TripDesk",
  "TripLocationLog",
  "TrackingAlert",
];

const TRANSACTION_SEQUENCE_TABLES = [
  "LrBooking",
  "LhcContract",
  "Bill",
  "DriverRegister",
  "DriverAdvance",
  "TripSheet",
  "Expense",
  "FleetVehicle",
  "Maintenance",
  "MoneyReceipt",
  "VendorVoucher",
  "DriverVoucher",
  "BookingSlip",
  "TyreStatus",
  "PodDocument",
  "TripDesk",
  "TripLocationLog",
  "TrackingAlert",
];

async function resetPostgresSequences(tables: string[]) {
  for (const table of tables) {
    try {
      await prisma.$executeRawUnsafe(
        `SELECT setval(pg_get_serial_sequence('"${table}"', 'id'), 1, false)`,
      );
    } catch {
      // SQLite / missing sequence — ignore
    }
  }
}

/** Wipe ERP data, keep public website tables, recreate admin, restart numbering. */
export async function resetErpData() {
  await prisma.tripDesk.deleteMany();
  await prisma.podDocument.deleteMany();
  await prisma.tyreStatus.deleteMany();
  await prisma.bookingSlip.deleteMany();
  await prisma.driverVoucher.deleteMany();
  await prisma.vendorVoucher.deleteMany();
  await prisma.moneyReceipt.deleteMany();
  await prisma.maintenance.deleteMany();
  await prisma.fleetVehicle.deleteMany();
  await prisma.expense.deleteMany();
  await prisma.tripSheet.deleteMany();
  await prisma.driverAdvance.deleteMany();
  await prisma.driverRegister.deleteMany();
  await prisma.bill.deleteMany();
  await prisma.lhcContract.deleteMany();
  await prisma.lrBooking.deleteMany();
  await prisma.rate.deleteMany();
  await prisma.station.deleteMany();
  await prisma.vendor.deleteMany();
  await prisma.vehicle.deleteMany();
  await prisma.driver.deleteMany();
  await prisma.party.deleteMany();
  await prisma.user.deleteMany();

  await resetPostgresSequences(ERP_SEQUENCE_TABLES);

  await prisma.user.create({
    data: {
      username: "admin",
      password: hashPassword("admin123"),
      name: "Admin User",
      mobile: "9999999999",
      role: "Admin",
      branch: "DPR Logistics",
      status: "Active",
    },
  });

  const [blogs, media, inquiries, lrs, bills] = await Promise.all([
    prisma.blogPost.count(),
    prisma.marketingMedia.count(),
    prisma.webInquiry.count(),
    prisma.lrBooking.count(),
    prisma.bill.count(),
  ]);

  return {
    kept: { blogs, media, inquiries },
    erp: { lrs, bills, users: 1 },
    next: { lr: "001", bill: "01", lhc: "01" },
    login: { username: "admin", password: "(set at reset — default admin123, stored hashed)" },
  };
}

/**
 * Clear bookings / bills / LHC / receipts / fleet ops / trips.
 * Keeps master data: Party, User, Driver, Vehicle, Vendor, Station, Rate
 * and website tables. LR/Bill/LHC numbers restart from the beginning.
 */
export async function clearTransactionsKeepMaster() {
  const before = {
    lrs: await prisma.lrBooking.count(),
    bills: await prisma.bill.count(),
    lhc: await prisma.lhcContract.count(),
    receipts: await prisma.moneyReceipt.count(),
    slips: await prisma.bookingSlip.count(),
    trips: await prisma.tripDesk.count(),
  };

  // Child / dependent rows first
  await prisma.tripLocationLog.deleteMany();
  await prisma.trackingAlert.deleteMany();
  await prisma.tripDesk.deleteMany();
  await prisma.podDocument.deleteMany();
  await prisma.tyreStatus.deleteMany();
  await prisma.bookingSlip.deleteMany();
  await prisma.driverVoucher.deleteMany();
  await prisma.vendorVoucher.deleteMany();
  await prisma.moneyReceipt.deleteMany();
  await prisma.maintenance.deleteMany();
  await prisma.fleetVehicle.deleteMany();
  await prisma.expense.deleteMany();
  await prisma.tripSheet.deleteMany();
  await prisma.driverAdvance.deleteMany();
  await prisma.driverRegister.deleteMany();
  await prisma.bill.deleteMany();
  await prisma.lhcContract.deleteMany();
  await prisma.lrBooking.deleteMany();

  await resetPostgresSequences(TRANSACTION_SEQUENCE_TABLES);

  const [parties, users, drivers, vehicles, vendors, stations, rates, lrs, bills, lhc] =
    await Promise.all([
      prisma.party.count(),
      prisma.user.count(),
      prisma.driver.count(),
      prisma.vehicle.count(),
      prisma.vendor.count(),
      prisma.station.count(),
      prisma.rate.count(),
      prisma.lrBooking.count(),
      prisma.bill.count(),
      prisma.lhcContract.count(),
    ]);

  return {
    deleted: before,
    keptMaster: { parties, users, drivers, vehicles, vendors, stations, rates },
    remainingTx: { lrs, bills, lhc },
    next: { lr: "001", bill: "01", lhc: "01", roadwaysLr: "RW-001" },
  };
}
