import { clearTransactionsKeepMaster } from "../src/lib/reset-erp";
import { prisma } from "../src/lib/prisma";

async function main() {
  console.log("Clearing transactional data (keeping Party/User/Driver/Vehicle/Vendor/Station/Rate)…");
  const result = await clearTransactionsKeepMaster();
  console.log("Deleted:", result.deleted);
  console.log("Kept master:", result.keptMaster);
  console.log("Remaining tx:", result.remainingTx);
  console.log("Next numbers:", result.next);
  console.log("Done.");
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
