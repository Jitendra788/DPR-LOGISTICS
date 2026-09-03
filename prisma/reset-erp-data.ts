import { resetErpData } from "../src/lib/reset-erp";
import { prisma } from "../src/lib/prisma";

async function main() {
  console.log("Clearing ERP data (LR, bills, parties, fleet, etc.)…");
  const result = await resetErpData();
  console.log("Public data kept:", result.kept);
  console.log("ERP counts:", result.erp);
  console.log("Next numbers:", result.next);
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
