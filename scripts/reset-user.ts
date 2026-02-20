/**
 * Dev utility — fully deletes a user and all associated data (sessions, profile, journeys, tasks).
 * This clears NextAuth sessions so the user is logged out on next page load.
 *
 * Usage:
 *   npx tsx scripts/reset-user.ts <email>
 *   npx tsx scripts/reset-user.ts alphandaryomer@gmail.com
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const email = process.argv[2];
  if (!email) {
    console.error("Usage: npx tsx scripts/reset-user.ts <email>");
    process.exit(1);
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    console.log(`No user found with email: ${email} — nothing to delete.`);
    return;
  }

  // Deleting the user cascades: Session, Account, Profile, Journey, JourneyTask
  await prisma.user.delete({ where: { id: user.id } });

  console.log(`Reset complete for ${email}: user + all data deleted (sessions cleared).`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
