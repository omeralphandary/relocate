/**
 * One-time script: remove the 11 PRE_DEPARTURE task templates that were
 * trimmed from the seed (too many tasks for the Before You Go tab).
 *
 * Run against prod:
 *   DATABASE_URL=<prod-url> npx tsx scripts/trim-pre-departure.ts
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const TITLES_TO_REMOVE = [
  "Get certified translations of your documents",
  "Obtain a police clearance certificate",
  "Decide what to ship, sell, store, or donate",
  "Arrange storage for items not being shipped",
  "Decide whether to ship or sell your car",
  "Recover your rental deposit",
  "Notify your bank and financial institutions of your move",
  "Stock up on prescription medication for the transition period",
  "Gather and translate school records for your children",
  "Book pet-friendly travel and arrange in-cabin or cargo transport",
  "Notify government authorities of your departure",
];

async function main() {
  const result = await prisma.taskTemplate.deleteMany({
    where: {
      title: { in: TITLES_TO_REMOVE },
      phase: "PRE_DEPARTURE",
    },
  });
  console.log(`Deleted ${result.count} PRE_DEPARTURE task templates.`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
