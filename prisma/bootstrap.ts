import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.count();
  if (users > 0) {
    console.log("Bootstrap skipped — database already has data.");
    return;
  }

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

  console.log("Bootstrap complete — default admin user created (admin / admin123).");
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
