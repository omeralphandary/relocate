import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding task templates...");
  // Delete child rows first to satisfy foreign key constraints
  await prisma.journeyTask.deleteMany();
  await prisma.journey.deleteMany();
  await prisma.taskTemplate.deleteMany();

  const tasks = [
    // ═══════════════════════════════════════════════════════════
    // CZECH REPUBLIC
    // ═══════════════════════════════════════════════════════════

    // ─── HOUSING ──────────────────────────────────────────────
    {
      title: "Arrange temporary accommodation",
      description: "Book short-term accommodation (Airbnb, hotel, or serviced apartment) for your first few weeks. You will need a local address for many of the steps below.",
      category: "housing", order: 1, documents: [],
      tips: "Book at least 4 weeks to give yourself time to find a permanent place without pressure.",
      countries: ["Czech Republic"], dependsOn: [],
    },
    {
      title: "Find a permanent apartment",
      description: "Search for a long-term rental. Engage a local real estate agent — they know the market, speak the language, and can help negotiate lease terms.",
      category: "housing", order: 2,
      documents: ["Passport or ID", "Employment contract or proof of income", "Reference letter from previous landlord"],
      tips: "Most Czech landlords expect 2–3 months deposit upfront. Prices are listed in CZK. Use Bezrealitky.cz for listings.",
      countries: ["Czech Republic"], dependsOn: [],
    },
    {
      title: "Register your address",
      description: "Once you have a permanent address, register it with the local municipality (Ohlašovna). This is required before applying for a residency permit.",
      category: "housing", order: 3,
      documents: ["Passport", "Rental contract", "Landlord's consent form"],
      officialUrl: "https://www.mvcr.cz/clanek/obcane-eu-eea-a-svycarsko.aspx",
      tips: "Your landlord must sign a consent form. Some agents handle this for you.",
      countries: ["Czech Republic"], dependsOn: [],
    },
    {
      title: "Set up electricity and gas",
      description: "Transfer or establish utility accounts in your name. Confirm with your landlord who is responsible before signing the lease.",
      category: "housing", order: 4,
      documents: ["Rental contract", "ID or passport"],
      tips: "Main providers: ČEZ (electricity) and innogy/E.ON (gas). Many landlords include utilities in rent.",
      countries: ["Czech Republic"], dependsOn: [],
    },

    // ─── TELECOM ──────────────────────────────────────────────
    {
      title: "Get a local SIM card",
      description: "Pick up a prepaid or postpaid SIM on arrival. A local number is needed for bank accounts, government services, and everyday life.",
      category: "telecom", order: 1,
      documents: ["Passport or ID"],
      tips: "T-Mobile, O2, and Vodafone all have airport counters in Prague. Postpaid plans are cheaper long-term.",
      countries: ["Czech Republic"], dependsOn: [],
    },

    // ─── BANKING ──────────────────────────────────────────────
    {
      title: "Open a local bank account",
      description: "A local bank account is essential for receiving salary, paying rent, and handling everyday expenses. Most banks require a local address.",
      category: "banking", order: 1,
      documents: ["Passport", "Proof of address (rental contract or utility bill)", "Employment contract (some banks)"],
      tips: "Fio Banka and Moneta Money Bank are expat-friendly. Use Wise or Revolut as a bridge until your local account is open.",
      countries: ["Czech Republic"], dependsOn: [],
    },
    {
      title: "Arrange international money transfer",
      description: "Set up a way to move funds from your home country to your new account efficiently.",
      category: "banking", order: 2, documents: [],
      tips: "Wise (formerly TransferWise) is typically the cheapest option for international transfers.",
      countries: ["Czech Republic"], dependsOn: [],
    },

    // ─── LEGAL ────────────────────────────────────────────────
    {
      title: "Get documents translated and notarized",
      description: "Several official processes require certified translations of foreign documents (birth certificate, diplomas, marriage certificate, etc.).",
      category: "legal", order: 1,
      documents: ["Original documents to be translated"],
      tips: "Use only 'soudní překladatel' (court-certified translators). Allow 3–5 business days per document.",
      countries: ["Czech Republic"], dependsOn: [],
    },
    {
      title: "Apply for long-term residency permit",
      description: "If staying longer than 90 days, apply for a long-term residency permit at the Ministry of Interior (MOI). EU citizens register right of residence; non-EU apply for residence permit.",
      category: "legal", order: 2,
      officialUrl: "https://www.mvcr.cz/clanek/obcane-eu-eea-a-svycarsko.aspx",
      documents: ["Valid passport", "Proof of registered address", "Proof of sufficient funds (bank statement)", "Employment contract or business registration", "Health insurance certificate", "2x passport photos"],
      tips: "Book MOI appointments well in advance — slots fill weeks ahead. Process takes 2–3 months.",
      countries: ["Czech Republic"], dependsOn: [],
    },
    {
      title: "Register as self-employed (živnostenský list)",
      description: "If freelancing or self-employed, obtain a trade license at the Trade Licensing Office before invoicing clients.",
      category: "legal", order: 3,
      officialUrl: "https://www.rzp.cz/",
      documents: ["Passport or ID", "Proof of address in Czech Republic", "Application form"],
      tips: "General trade license (volná živnost) covers most IT/consulting work. Fee is CZK 1,000.",
      countries: ["Czech Republic"], dependsOn: [],
    },
    {
      title: "Register with the tax authority",
      description: "Register as a taxpayer with the Czech Financial Administration within 30 days of starting activity.",
      category: "legal", order: 4,
      officialUrl: "https://www.financnisprava.cz/",
      documents: ["Trade license (živnostenský list)", "Passport", "Bank account details"],
      tips: "Hire a local accountant for your first tax year — Czech tax rules have many expat-specific nuances.",
      countries: ["Czech Republic"], dependsOn: [],
    },

    // ─── INSURANCE ────────────────────────────────────────────
    {
      title: "Get health insurance",
      description: "Health insurance is mandatory before applying for residency. Employees are covered by employer; self-employed must arrange private or public insurance.",
      category: "insurance", order: 1,
      documents: ["Passport", "Proof of address or residency application"],
      tips: "VZP (Všeobecná zdravotní pojišťovna) is the largest public insurer. Private options: Maxima or IMG for expats.",
      countries: ["Czech Republic"], dependsOn: [],
    },
    {
      title: "Set up home and contents insurance",
      description: "Protect your belongings in your new home. Often required or recommended by landlords.",
      category: "insurance", order: 2,
      documents: ["Rental contract", "ID"],
      tips: "Can usually be set up online in 30 minutes via Allianz CZ or ČSOB pojišťovna.",
      countries: ["Czech Republic"], dependsOn: [],
    },

    // ─── TRANSPORT ────────────────────────────────────────────
    {
      title: "Research local transport options",
      description: "Understand how to get around — public transport, cycling, driving. In Czech cities, public transport is excellent and affordable.",
      category: "transport", order: 1, documents: [],
      tips: "Prague's integrated transport (PID) monthly passes are very affordable. Lítačka app for tickets.",
      countries: ["Czech Republic"], dependsOn: [],
    },
    {
      title: "Exchange or validate your driving licence",
      description: "Check whether your foreign driving licence is automatically valid or needs to be exchanged.",
      category: "transport", order: 2,
      officialUrl: "https://www.mdcr.cz/",
      documents: ["Foreign driving licence", "Passport", "Proof of address", "Medical certificate (sometimes required)"],
      tips: "EU licences are valid without exchange. Non-EU licences may need exchange within 90 days of getting residency.",
      countries: ["Czech Republic"], dependsOn: [],
    },
    {
      title: "Lease or purchase a car",
      description: "If you need a car, research leasing vs buying. New residents may find leasing easier initially.",
      category: "transport", order: 3,
      documents: ["Driving licence", "Residency permit or registration", "Bank account details"],
      tips: "Consider a short-term rental first to decide if you actually need a car in your city.",
      countries: ["Czech Republic"], dependsOn: [],
    },
    {
      title: "Get a parking permit",
      description: "If you have a car and live in a city zone with resident parking, apply at your local district office.",
      category: "transport", order: 4,
      documents: ["Vehicle registration", "Proof of address", "Residency permit"],
      tips: "In Prague, blue zones are for residents. Apply at your local Úřad Městské Části.",
      countries: ["Czech Republic"], dependsOn: [],
    },

    // ═══════════════════════════════════════════════════════════
    // UNITED KINGDOM
    // ═══════════════════════════════════════════════════════════

    {
      title: "Arrange temporary accommodation",
      description: "Book short-term accommodation for your first 2–4 weeks. You'll need a UK address to open a bank account and register with a GP.",
      category: "housing", order: 1, documents: [],
      tips: "Serviced apartments in your target area give you time to view flats properly. Avoid committing to a long lease before seeing the area.",
      countries: ["United Kingdom"], dependsOn: [],
    },
    {
      title: "Find a permanent flat or house",
      description: "Search for a long-term rental via Rightmove, Zoopla, or a local letting agent. Most landlords require referencing and a deposit.",
      category: "housing", order: 2,
      documents: ["Passport", "Proof of income or employment contract", "Previous landlord reference", "Bank statements (3 months)"],
      tips: "Agents typically charge the equivalent of 5 weeks rent as a deposit. Use the Deposit Protection Scheme to verify yours is protected.",
      countries: ["United Kingdom"], dependsOn: [],
    },
    {
      title: "Register with your local council",
      description: "Notify your local council of your address for council tax purposes. This is a legal requirement.",
      category: "housing", order: 3,
      documents: ["Tenancy agreement", "ID"],
      officialUrl: "https://www.gov.uk/council-tax",
      tips: "Full-time students are exempt. Single occupancy gets 25% discount. Register within 21 days of moving in.",
      countries: ["United Kingdom"], dependsOn: [],
    },
    {
      title: "Set up utilities",
      description: "Set up electricity, gas, and broadband in your name. Use a comparison site to find the best deal.",
      category: "housing", order: 4,
      documents: ["Tenancy agreement", "ID"],
      tips: "Use uSwitch or MoneySuperMarket to compare energy tariffs. Broadband takes 1–2 weeks to activate.",
      countries: ["United Kingdom"], dependsOn: [],
    },
    {
      title: "Get a UK SIM card",
      description: "Pick up a SIM on arrival. A UK mobile number is needed for banking, NHS registration, and daily life.",
      category: "telecom", order: 1,
      documents: ["Passport or ID"],
      tips: "Giffgaff and SMARTY offer great value SIMs with no contract. EE and O2 have the best coverage outside London.",
      countries: ["United Kingdom"], dependsOn: [],
    },
    {
      title: "Open a UK bank account",
      description: "A UK bank account is essential for salary, rent, and bills. Some banks allow opening without proof of address.",
      category: "banking", order: 1,
      documents: ["Passport", "Proof of UK address", "Employment contract or proof of income"],
      officialUrl: "https://www.monzo.com",
      tips: "Monzo or Starling allow account opening online within 24 hours — ideal before you have a permanent address. High-street banks take 1–2 weeks.",
      countries: ["United Kingdom"], dependsOn: [],
    },
    {
      title: "Apply for a National Insurance number",
      description: "Your NI number is required to work legally, pay taxes, and access benefits in the UK.",
      category: "legal", order: 1,
      officialUrl: "https://www.gov.uk/apply-national-insurance-number",
      documents: ["Passport", "Visa or right to work documentation", "Proof of UK address"],
      tips: "Apply online via HMRC. Takes 2–8 weeks to arrive by post. You can work before receiving it.",
      countries: ["United Kingdom"], dependsOn: [],
    },
    {
      title: "Register with a GP (doctor)",
      description: "Register with a local NHS GP surgery to access free healthcare. You can register before you need treatment.",
      category: "insurance", order: 1,
      officialUrl: "https://www.nhs.uk/nhs-services/gps/how-to-register-with-a-gp-surgery/",
      documents: ["ID", "Proof of address"],
      tips: "Find your nearest accepting GP via the NHS website. Registration is free — the NHS covers you from day one of residency.",
      countries: ["United Kingdom"], dependsOn: [],
    },
    {
      title: "Check or transfer your driving licence",
      description: "If you have an EU/EEA licence, you may need to exchange it for a UK licence post-Brexit. Non-EU licences may have stricter rules.",
      category: "transport", order: 1,
      officialUrl: "https://www.gov.uk/exchange-foreign-driving-licence",
      documents: ["Foreign driving licence", "Passport", "Proof of UK address", "Completed D9 form"],
      tips: "EU licences can be used for up to 3 years. Exchange via DVLA by post — allow 6–8 weeks.",
      countries: ["United Kingdom"], dependsOn: [],
    },
    {
      title: "Get an Oyster card or contactless payment setup",
      description: "If in London, get an Oyster card for public transport. Elsewhere, contactless bank card works on most transport.",
      category: "transport", order: 2,
      documents: [],
      officialUrl: "https://tfl.gov.uk/fares/how-to-pay-and-where-to-buy-tickets-and-oyster/",
      tips: "Contactless bank card is now as cheap as Oyster and more convenient — no need to top up.",
      countries: ["United Kingdom"], dependsOn: [],
    },

    // ═══════════════════════════════════════════════════════════
    // GERMANY
    // ═══════════════════════════════════════════════════════════

    {
      title: "Arrange temporary accommodation",
      description: "Book short-term accommodation for your first 2–4 weeks. You'll need a German address for Anmeldung (registration), which unlocks everything else.",
      category: "housing", order: 1, documents: [],
      tips: "Some Airbnb hosts refuse to provide the Wohnungsgeberbestätigung needed for Anmeldung. Confirm before booking.",
      countries: ["Germany"], dependsOn: [],
    },
    {
      title: "Find a permanent flat (Wohnung)",
      description: "Search for long-term rental via ImmobilienScout24 or Wg-gesucht. German rental market is competitive — apply fast and bring a full application package.",
      category: "housing", order: 2,
      documents: ["Passport", "SCHUFA credit report (if available)", "Proof of income (last 3 payslips)", "Previous landlord reference"],
      tips: "Prepare a 'Bewerbungsmappe' (application folder) with all documents to stand out. Cold deposit is typically 3 months rent.",
      countries: ["Germany"], dependsOn: [],
    },
    {
      title: "Anmeldung — register your address",
      description: "Register your address at the local Bürgeramt (citizens' office) within 14 days of moving in. This is legally required and unlocks your tax ID, bank account, and more.",
      category: "housing", order: 3,
      documents: ["Passport", "Wohnungsgeberbestätigung (landlord confirmation letter)", "Completed Anmeldungsformular"],
      officialUrl: "https://www.berlin.de/willkommenszentrum/en/buergerbuero/",
      tips: "Book your Bürgeramt appointment online weeks in advance — they fill up fast. You'll receive your Meldebescheinigung (proof of registration) immediately.",
      countries: ["Germany"], dependsOn: [],
    },
    {
      title: "Set up electricity and internet",
      description: "Set up utility contracts in your name or confirm what the landlord covers.",
      category: "housing", order: 4,
      documents: ["Meldebescheinigung", "Rental contract"],
      tips: "Verivox.de and Check24.de for energy comparison. Internet takes 2–4 weeks to install — order immediately.",
      countries: ["Germany"], dependsOn: [],
    },
    {
      title: "Get a German SIM card",
      description: "Get a local SIM on arrival. A German number is needed for banking and government services.",
      category: "telecom", order: 1,
      documents: ["Passport or ID"],
      tips: "Telekom has the best coverage. Aldi Talk and Congstar offer cheap prepaid options. Register SIM online with your passport.",
      countries: ["Germany"], dependsOn: [],
    },
    {
      title: "Open a German bank account",
      description: "Open a bank account to receive salary and pay rent. German landlords and employers generally require a German IBAN.",
      category: "banking", order: 1,
      documents: ["Passport", "Meldebescheinigung (proof of registration)"],
      tips: "N26 or DKB open accounts online without Anmeldung. Traditional banks (Deutsche Bank, Sparkasse) need your Meldebescheinigung.",
      countries: ["Germany"], dependsOn: [],
    },
    {
      title: "Get your Steueridentifikationsnummer (tax ID)",
      description: "Your tax ID is sent automatically by post after Anmeldung. It arrives within 2–4 weeks and is required for employment.",
      category: "legal", order: 1,
      officialUrl: "https://www.bzst.de/EN/Individuals/Tax_Identification_Number/tax_identification_number_node.html",
      documents: ["Meldebescheinigung"],
      tips: "Your employer will withhold highest tax rate (Steuerklasse 6) until you provide your Steuer-ID. Chase it if it hasn't arrived in 4 weeks.",
      countries: ["Germany"], dependsOn: [],
    },
    {
      title: "Register with health insurance (Krankenkasse)",
      description: "Health insurance is mandatory in Germany. Employed workers are automatically enrolled via their employer; others must arrange it independently.",
      category: "insurance", order: 1,
      documents: ["Passport", "Meldebescheinigung", "Employment contract"],
      officialUrl: "https://www.tk.de/en",
      tips: "TK (Techniker Krankenkasse) and AOK are popular public insurers. Registration is free — your employer pays half the premium.",
      countries: ["Germany"], dependsOn: [],
    },
    {
      title: "Exchange or validate your driving licence",
      description: "Non-EU driving licences generally need to be exchanged within 6 months. EU licences are valid but may need to be exchanged eventually.",
      category: "transport", order: 1,
      officialUrl: "https://www.adac.de/verkehr/fahrerlaubnis-fahrtauglichkeit/fuehrerschein/auslaendischen-fuehrerschein-umschreiben/",
      documents: ["Foreign driving licence", "Passport", "Meldebescheinigung", "Biometric photo", "Eye test certificate"],
      tips: "Visit your local Straßenverkehrsamt. Israeli licences can be exchanged without re-taking the test. Allow 4–8 weeks.",
      countries: ["Germany"], dependsOn: [],
    },
    {
      title: "Get a BVG/MVV transit pass",
      description: "Set up a monthly public transport subscription for your city. Germany's Deutschlandticket (€58/month) covers all local and regional transport nationwide.",
      category: "transport", order: 2,
      documents: ["Bank account details"],
      officialUrl: "https://www.bahn.de/angebot/regio/deutschland-ticket",
      tips: "The Deutschlandticket at €58/month is the best deal in Germany — use any train, tram, bus, and metro in the entire country.",
      countries: ["Germany"], dependsOn: [],
    },
  ];

  for (const task of tasks) {
    await prisma.taskTemplate.create({ data: task });
  }

  const czCount = tasks.filter((t) => t.countries.includes("Czech Republic")).length;
  const ukCount = tasks.filter((t) => t.countries.includes("United Kingdom")).length;
  const deCount = tasks.filter((t) => t.countries.includes("Germany")).length;

  console.log(`✓ Seeded ${tasks.length} task templates:`);
  console.log(`  Czech Republic: ${czCount} tasks`);
  console.log(`  United Kingdom: ${ukCount} tasks`);
  console.log(`  Germany: ${deCount} tasks`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
