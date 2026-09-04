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

async function resetPostgresSequences() {
  for (const table of ERP_SEQUENCE_TABLES) {
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

  await resetPostgresSequences();

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
