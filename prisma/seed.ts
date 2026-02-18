import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding task templates...");

  await prisma.taskTemplate.deleteMany();

  const tasks = [
    // ─── HOUSING ──────────────────────────────────────────────
    {
      title: "Arrange temporary accommodation",
      description: "Book short-term accommodation (Airbnb, hotel, or serviced apartment) for your first few weeks. You will need a local address for many of the steps below.",
      category: "housing",
      order: 1,
      documents: [],
      tips: "Book at least 4 weeks to give yourself time to find a permanent place without pressure.",
      countries: [],
      dependsOn: [],
    },
    {
      title: "Find a permanent apartment",
      description: "Search for a long-term rental. Engage a local real estate agent — they know the market, speak the language, and can help negotiate lease terms.",
      category: "housing",
      order: 2,
      documents: ["Passport or ID", "Employment contract or proof of income", "Reference letter from previous landlord"],
      tips: "In the Czech Republic, most landlords expect 2–3 months deposit upfront. Prices are listed in CZK.",
      countries: [],
      dependsOn: [],
    },
    {
      title: "Register your address",
      description: "Once you have a permanent address, register it with the local municipality (Ohlašovna). This is required before applying for a residency permit.",
      category: "housing",
      order: 3,
      documents: ["Passport", "Rental contract", "Landlord's consent form"],
      officialUrl: "https://www.mvcr.cz/clanek/obcane-eu-eea-a-svycarsko.aspx",
      tips: "Your landlord must sign a consent form. Some agents handle this for you.",
      countries: [],
      dependsOn: [],
    },
    {
      title: "Set up electricity and gas",
      description: "Transfer or establish utility accounts in your name. Your landlord may handle this, so confirm who is responsible before signing the lease.",
      category: "housing",
      order: 4,
      documents: ["Rental contract", "ID or passport"],
      tips: "In the Czech Republic, the main providers are ČEZ (electricity) and innogy/E.ON (gas).",
      countries: [],
      dependsOn: [],
    },

    // ─── TELECOM ──────────────────────────────────────────────
    {
      title: "Get a local SIM card",
      description: "Pick up a prepaid or postpaid SIM on arrival. A local number is needed for bank accounts, government services, and everyday life.",
      category: "telecom",
      order: 1,
      documents: ["Passport or ID"],
      tips: "In the Czech Republic, T-Mobile, O2, and Vodafone all have airport counters. Postpaid plans are cheaper long-term.",
      countries: [],
      dependsOn: [],
    },

    // ─── BANKING ──────────────────────────────────────────────
    {
      title: "Open a local bank account",
      description: "A local bank account is essential for receiving salary, paying rent, and handling everyday expenses. Most banks require a local address.",
      category: "banking",
      order: 1,
      documents: ["Passport", "Proof of address (rental contract or utility bill)", "Employment contract (some banks)"],
      tips: "In the Czech Republic, Fio Banka and Moneta Money Bank are known for straightforward account opening for expats. Online banks like Wise or Revolut can bridge the gap until you have a local account.",
      countries: [],
      dependsOn: [],
    },
    {
      title: "Arrange international money transfer",
      description: "Set up a way to move funds from your home country to your new account efficiently.",
      category: "banking",
      order: 2,
      documents: [],
      tips: "Wise (formerly TransferWise) is typically the cheapest option for international transfers.",
      countries: [],
      dependsOn: [],
    },

    // ─── LEGAL ────────────────────────────────────────────────
    {
      title: "Get documents translated and notarized",
      description: "Several official processes require certified translations of foreign documents (birth certificate, diplomas, marriage certificate, etc.).",
      category: "legal",
      order: 1,
      documents: ["Original documents to be translated"],
      tips: "Use only certified/sworn translators. In the Czech Republic, look for 'soudní překladatel' (court-certified translator).",
      countries: [],
      dependsOn: [],
    },
    {
      title: "Apply for long-term residency permit",
      description: "If you are staying longer than 90 days, you must apply for a long-term residency permit at the Ministry of the Interior (MOI). EU citizens register their right of residence; non-EU citizens apply for a residence permit.",
      category: "legal",
      order: 2,
      officialUrl: "https://www.mvcr.cz/clanek/obcane-eu-eea-a-svycarsko.aspx",
      documents: [
        "Valid passport",
        "Proof of address (registered)",
        "Proof of sufficient funds (bank statement)",
        "Employment contract or business registration",
        "Health insurance certificate",
        "2x passport photos",
      ],
      tips: "Book your MOI appointment well in advance — slots fill up weeks ahead. The process takes 2–3 months.",
      countries: [],
      dependsOn: [],
    },
    {
      title: "Register as self-employed (živnostenský list)",
      description: "If you work as a freelancer or are self-employed, you must obtain a trade license (živnostenský list) at the Trade Licensing Office before invoicing clients.",
      category: "legal",
      order: 3,
      officialUrl: "https://www.rzp.cz/",
      documents: [
        "Passport or ID",
        "Proof of address in Czech Republic",
        "Application form",
      ],
      tips: "You can get a general trade license (volná živnost) for most IT/consulting work without needing to prove qualifications. Fee is CZK 1,000.",
      countries: [],
      dependsOn: [],
    },
    {
      title: "Register with the tax authority",
      description: "Register as a taxpayer with the Czech Financial Administration within 30 days of starting activity.",
      category: "legal",
      order: 4,
      officialUrl: "https://www.financnisprava.cz/",
      documents: ["Trade license (živnostenský list)", "Passport", "Bank account details"],
      tips: "It is strongly recommended to hire a local accountant for your first tax year.",
      countries: [],
      dependsOn: [],
    },

    // ─── INSURANCE ────────────────────────────────────────────
    {
      title: "Get health insurance",
      description: "Health insurance is mandatory before applying for residency. Employed workers are covered by their employer. Self-employed and freelancers must arrange private health insurance or register with a public insurer.",
      category: "insurance",
      order: 1,
      documents: ["Passport", "Proof of address or residency application"],
      tips: "For the Czech Republic, Všeobecná zdravotní pojišťovna (VZP) is the largest public insurer. Private options include Maxima or IMG for expats.",
      countries: [],
      dependsOn: [],
    },
    {
      title: "Set up home and contents insurance",
      description: "Protect your belongings in your new home. Often required or recommended by landlords.",
      category: "insurance",
      order: 2,
      documents: ["Rental contract", "ID"],
      tips: "Can usually be set up online in 30 minutes.",
      countries: [],
      dependsOn: [],
    },

    // ─── TRANSPORT ────────────────────────────────────────────
    {
      title: "Research local transport options",
      description: "Understand how to get around — public transport, cycling, driving. In most Czech cities, public transport is excellent and cheap.",
      category: "transport",
      order: 1,
      documents: [],
      tips: "Prague has an integrated transport system (PID). Monthly passes are very affordable.",
      countries: [],
      dependsOn: [],
    },
    {
      title: "Exchange or validate your driving license",
      description: "If you have a foreign driving license, check whether it is automatically valid or needs to be exchanged for a local one.",
      category: "transport",
      order: 2,
      officialUrl: "https://www.mdcr.cz/",
      documents: ["Foreign driving license", "Passport", "Proof of address", "Medical certificate (sometimes required)"],
      tips: "EU licenses are valid in Czech Republic without exchange. Non-EU licenses may need to be exchanged within 90 days of getting residency.",
      countries: [],
      dependsOn: [],
    },
    {
      title: "Lease or purchase a car",
      description: "If you need a car, research leasing vs buying. New residents may find it easier to lease initially.",
      category: "transport",
      order: 3,
      documents: ["Driving license", "Residency permit or registration", "Bank account details"],
      tips: "Consider a short-term rental first to decide if you actually need a car.",
      countries: [],
      dependsOn: [],
    },
    {
      title: "Get a parking permit",
      description: "If you have a car and live in a city zone with resident parking, apply for a parking permit at your local city district office.",
      category: "transport",
      order: 4,
      documents: ["Vehicle registration", "Proof of address", "Residency permit"],
      tips: "In Prague, parking zones are color-coded. Blue zones are for residents, orange for short-term visitors.",
      countries: [],
      dependsOn: [],
    },
  ];

  for (const task of tasks) {
    await prisma.taskTemplate.create({ data: task });
  }

  console.log(`✓ Seeded ${tasks.length} task templates`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
