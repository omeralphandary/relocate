/**
 * One-time script: update PRE_DEPARTURE task tips to include "before" timing.
 * Run against prod: DATABASE_URL=<neon-url> npx tsx scripts/update-pre-departure-tips.ts
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const UPDATES: Array<{ title: string; tips: string }> = [
  {
    title: "Renew your passport if needed",
    tips: "Apply online where possible. Allow 6–10 weeks before your move date for standard processing; expedited services may be available for an extra fee.",
  },
  {
    title: "Get international moving quotes",
    tips: "Start at least 8 weeks before your move date. Use comparison platforms like MoveHub or Sirelo to get multiple quotes at once. Ask specifically about door-to-door vs port-to-port delivery and what's included in customs clearance.",
  },
  {
    title: "Book your international mover",
    tips: "Book at least 4–6 weeks before your move date. Get everything in writing — insurance coverage, liability for damage, and what happens if there are customs delays. Photograph valuables before packing.",
  },
  {
    title: "Give notice to terminate your current lease",
    tips: "Most leases require 1–3 months' notice before you leave — check yours now. Send your notice via registered post or email with a read receipt so you have proof of the date.",
  },
  {
    title: "Export your medical records and vaccination history",
    tips: "Request records at least 2–3 weeks before you leave — some GPs take time. Ask for records in English where possible, or arrange certified translation. In countries with digital health systems (UK, Nordics), records are often downloadable from the patient portal.",
  },
  {
    title: "Deregister your children from their current school",
    tips: "Notify the school at least 4 weeks before your departure. Request a school report, transcripts, and any assessments in English if possible. Some schools issue a 'Transfer Certificate' — confirm what format your destination school requires.",
  },
  {
    title: "Get an official international pet health certificate",
    tips: "Book the vet appointment no more than 10 days before your travel date — certificates expire quickly. Requirements differ significantly by destination country (EU vs US vs Australia). Check the specific requirements on your destination's official government site.",
  },
  {
    title: "Set up mail forwarding from your origin address",
    tips: "Set this up at least 2 weeks before you leave. Most postal services offer mail forwarding for 3–12 months. Prioritise updating your bank, tax authority, pension, and investment accounts.",
  },
];

async function main() {
  let updated = 0;
  for (const { title, tips } of UPDATES) {
    const result = await prisma.taskTemplate.updateMany({
      where: { title, phase: "PRE_DEPARTURE" },
      data: { tips },
    });
    console.log(`  ${result.count > 0 ? "✓" : "✗"} ${title}`);
    updated += result.count;
  }
  console.log(`\nUpdated ${updated} task template(s).`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
