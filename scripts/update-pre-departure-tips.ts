/**
 * One-time script: update PRE_DEPARTURE task descriptions and tips to include
 * "before" departure timing language throughout.
 * Run against prod: DATABASE_URL=<neon-url> npx tsx scripts/update-pre-departure-tips.ts
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const UPDATES: Array<{ title: string; description: string; tips: string }> = [
  {
    title: "Renew your passport if needed",
    description: "Most countries require at least 6 months of passport validity beyond your stay. Check your expiry date now and renew at least 10 weeks before you leave — passport offices get busy.",
    tips: "Apply online where possible. Allow 6–10 weeks before your move date for standard processing; expedited services may be available for an extra fee.",
  },
  {
    title: "Apostille or legalise your key documents",
    description: "Many countries require official documents (birth certificate, marriage certificate, diplomas) to be apostilled or legalised before they are accepted abroad. Do this at least 4 weeks before you leave — it must be done in your home country.",
    tips: "The apostille authority varies by country — in the UK it's the Foreign, Commonwealth & Development Office; in Israel it's the Ministry of Foreign Affairs. Allow 2–4 weeks. Do this before you leave — it's much harder from abroad.",
  },
  {
    title: "Get international moving quotes",
    description: "Contact at least 3 international moving companies for quotes at least 8 weeks before your move. Compare pricing, transit times, insurance coverage, and customs handling experience.",
    tips: "Start at least 8 weeks before your move date. Use comparison platforms like MoveHub or Sirelo to get multiple quotes at once. Ask specifically about door-to-door vs port-to-port delivery and what's included in customs clearance.",
  },
  {
    title: "Book your international mover",
    description: "Confirm your booking with a deposit at least 4–6 weeks before your move date. Provide a detailed inventory list, confirm pickup and delivery dates, and agree on insurance terms in writing.",
    tips: "Book at least 4–6 weeks before your move date. Get everything in writing — insurance coverage, liability for damage, and what happens if there are customs delays. Photograph valuables before packing.",
  },
  {
    title: "Give notice to terminate your current lease",
    description: "Check your lease for the required notice period (usually 1–3 months) and submit written notice well before your departure. Missing the deadline may mean paying rent on two homes at once.",
    tips: "Most leases require 1–3 months' notice before you leave — check yours now. Send your notice via registered post or email with a read receipt so you have proof of the date.",
  },
  {
    title: "Set up an international money transfer account",
    description: "Open a Wise or similar multi-currency account before you leave so you can move savings without paying bank transfer fees and poor exchange rates. Identity verification is easier while you're still in your home country.",
    tips: "Wise consistently offers mid-market exchange rates with transparent fees. Set it up before you leave — identity verification is easier while you're still in your home country.",
  },
  {
    title: "Export your medical records and vaccination history",
    description: "Request copies of your full medical records, vaccination certificates, and any ongoing treatment plans from your GP, specialists, and dentist before you leave.",
    tips: "Request records at least 2–3 weeks before you leave — some GPs take time. Ask for records in English where possible, or arrange certified translation. In countries with digital health systems (UK, Nordics), records are often downloadable from the patient portal.",
  },
  {
    title: "Deregister your children from their current school",
    description: "Notify your children's school of their withdrawal date at least 4 weeks before your departure, and request all documentation needed to transfer to a school in your destination country.",
    tips: "Notify the school at least 4 weeks before your departure. Request a school report, transcripts, and any assessments in English if possible. Some schools issue a 'Transfer Certificate' — confirm what format your destination school requires.",
  },
  {
    title: "Microchip your pet and ensure vaccinations are up to date",
    description: "Most countries require pets to be microchipped and vaccinated against rabies before entry. Start at least 3 months before you leave — the microchip must be implanted before the rabies vaccine to be legally valid.",
    tips: "Use an ISO 11784/11785 standard microchip. Keep all vet records organised in a dedicated folder — you'll need them at every step of the pet travel process. Start at least 3–4 months before departure.",
  },
  {
    title: "Get an official international pet health certificate",
    description: "Most countries require an official health certificate issued by an accredited vet and endorsed by your national veterinary authority within a specific window before travel (often 7–10 days before departure).",
    tips: "Book the vet appointment no more than 10 days before your travel date — certificates expire quickly. Requirements differ significantly by destination country (EU vs US vs Australia). Check the specific requirements on your destination's official government site.",
  },
  {
    title: "Set up mail forwarding from your origin address",
    description: "Arrange for your post to be redirected to your new address (or a trusted contact) and update your address with key institutions before you leave — bank, pension, tax authority, subscriptions.",
    tips: "Set this up at least 2 weeks before you leave. Most postal services offer mail forwarding for 3–12 months. Prioritise updating your bank, tax authority, pension, and investment accounts.",
  },
];

async function main() {
  let updated = 0;
  for (const { title, description, tips } of UPDATES) {
    const result = await prisma.taskTemplate.updateMany({
      where: { title, phase: "PRE_DEPARTURE" },
      data: { description, tips },
    });
    console.log(`  ${result.count > 0 ? "✓" : "✗"} ${title}`);
    updated += result.count;
  }
  console.log(`\nUpdated ${updated} task template(s).`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
