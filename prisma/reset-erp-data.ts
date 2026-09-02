import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/** Wipe ERP / admin operational data; keep public website tables and a single admin user. */
async function main() {
  console.log("Clearing ERP data (LR, bills, parties, fleet, etc.)…");

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
  await prisma.user.create({
    data: {
      username: "admin",
      password: "admin123",
      name: "Admin User",
      mobile: "9999999999",
      role: "Admin",
      branch: "DPR Logistics",
      status: "Active",
    },
  });

  const [blogs, media, inquiries] = await Promise.all([
    prisma.blogPost.count(),
    prisma.marketingMedia.count(),
    prisma.webInquiry.count(),
  ]);

  console.log("Public data kept:");
  console.log(`  Blog posts: ${blogs}`);
  console.log(`  Marketing media: ${media}`);
  console.log(`  Web inquiries: ${inquiries}`);
  console.log("ERP reset complete. Login: admin / admin123");
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
