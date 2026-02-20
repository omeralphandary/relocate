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
      description: "If staying longer than 90 days, apply for a long-term residency permit at the Ministry of Interior (MOI). EU/EEA employees have free movement — register your right of residence at the MOI within 30 days of settling. Non-EU employed workers need an Employee Card (Zaměstnanecká karta), a combined work + residence permit applied for at the Czech embassy before entering the Czech Republic. If you are a highly qualified worker earning above 1.5× the average salary, a Blue Card may apply instead.",
      category: "legal", order: 2,
      officialUrl: "https://www.mvcr.cz/clanek/employee-card.aspx",
      documents: ["Valid passport", "Signed employment contract", "Proof of accommodation", "Health insurance certificate", "Clean criminal record from home country — apostilled (non-EU)", "2× passport photos (non-EU)"],
      tips: "Non-EU: Apply at the Czech embassy before departure — you cannot apply from inside Czechia on a tourist visa. Processing takes up to 60 days. EU: Bring your employment contract to the MOI registration appointment.",
      countries: ["Czech Republic"], employmentStatuses: ["employed"], dependsOn: [],
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
    // UNITED STATES
    // ═══════════════════════════════════════════════════════════

    {
      title: "Arrange temporary accommodation",
      description: "Book short-term accommodation for your first 2–4 weeks — hotel, Airbnb, or extended-stay apartment. You'll need a US address to open a bank account and receive mail.",
      category: "housing", order: 1, documents: [],
      tips: "Extended-stay hotels (like Residence Inn or Home2 Suites) are cheaper long-term and include a kitchen. Book a location close to where you'll be working or looking for apartments.",
      countries: ["United States"], dependsOn: [],
    },
    {
      title: "Find a permanent apartment",
      description: "Search for long-term rental via Zillow, Apartments.com, or a local broker. US landlords typically require a credit check, proof of income (3x monthly rent), and references.",
      category: "housing", order: 2,
      documents: ["Passport", "Visa", "Employment offer letter or contract", "Bank statements (3 months)", "Previous landlord reference"],
      tips: "As a new arrival without US credit history, offer 2–3 months upfront deposit or get a US co-signer. Some landlords accept ITIN letters or foreign bank statements instead.",
      countries: ["United States"], dependsOn: [],
    },
    {
      title: "Set up utilities and internet",
      description: "Set up electricity, gas, and internet in your name once you have a permanent address.",
      category: "housing", order: 3,
      documents: ["Lease agreement", "Passport or state ID"],
      tips: "Many US apartments include some utilities in rent — confirm before signing. For internet, compare Xfinity, AT&T, and local providers. Setup typically takes 3–5 days.",
      countries: ["United States"], dependsOn: [],
    },
    {
      title: "Get a US SIM card",
      description: "Pick up a SIM on arrival. A US number is essential for banking, employment, and everyday life.",
      category: "telecom", order: 1,
      documents: ["Passport"],
      tips: "T-Mobile and Google Fi are the best options for new arrivals — both offer prepaid plans without SSN and have good international coverage. Avoid airport kiosks; buy online or at a store for better rates.",
      countries: ["United States"], dependsOn: [],
    },
    {
      title: "Apply for a Social Security Number (SSN)",
      description: "Your SSN is required to work legally, file taxes, open a US bank account, and build credit. Apply at your local Social Security Administration office.",
      category: "legal", order: 1,
      officialUrl: "https://www.ssa.gov/number-card/request-number-first-time",
      documents: ["Passport", "Visa", "I-94 arrival record", "Employment authorisation (if applicable)"],
      tips: "Wait at least 10 days after entry before applying — the SSA needs your entry to appear in DHS records. Processing takes 2–4 weeks. Use SSA.gov to find your nearest office and book an appointment.",
      countries: ["United States"], dependsOn: [],
    },
    {
      title: "Open a US bank account",
      description: "A US bank account is essential for receiving salary, paying rent, and everyday spending. Most traditional banks require an SSN, but some accept passport + visa.",
      category: "banking", order: 1,
      documents: ["Passport", "Visa", "Proof of US address", "SSN or ITIN (some banks)"],
      tips: "Chase and Bank of America open accounts with passport + visa before you have an SSN. Wise and Revolut work as a bridge immediately. Apply for an ITIN from the IRS if you need a tax ID before your SSN arrives.",
      countries: ["United States"], dependsOn: [],
    },
    {
      title: "Get health insurance",
      description: "Health insurance is critical in the US — medical costs without coverage are extremely high. Enrol via your employer, the ACA marketplace, or a private provider.",
      category: "insurance", order: 1,
      officialUrl: "https://www.healthcare.gov/",
      documents: ["Passport", "Visa", "SSN or ITIN", "Proof of address"],
      tips: "If employed, enrol in your employer's plan during your onboarding window — missing it means waiting until open enrolment. If self-employed or between jobs, compare ACA marketplace plans at healthcare.gov. Coverage starts the month after enrolment.",
      countries: ["United States"], dependsOn: [],
    },
    {
      title: "Get a US driver's licence",
      description: "Exchange or convert your foreign driving licence at your state's DMV. Requirements vary by state — some have bilateral agreements that waive the road test.",
      category: "transport", order: 1,
      officialUrl: "https://www.usa.gov/drivers-license-id",
      documents: ["Foreign driving licence", "Passport", "Visa", "Proof of US address (two documents)", "SSN or SSN denial letter"],
      tips: "Most states require a written knowledge test and road test for non-US licences. Book your DMV appointment online well in advance — wait times are often 2–4 weeks. Some states (e.g. California) require you to pass both tests regardless of prior experience.",
      countries: ["United States"], dependsOn: [],
    },
    {
      title: "Build US credit history",
      description: "A US credit score is essential for renting, car insurance, loans, and many subscriptions. Start building it immediately — it takes 6–12 months to establish a solid score.",
      category: "banking", order: 2, documents: [],
      tips: "Get a secured credit card (Discover it Secured or Capital One Secured) as soon as you have an SSN. Use it for small purchases and pay it off in full monthly. Never miss a payment — payment history is 35% of your score.",
      countries: ["United States"], dependsOn: [],
    },
    {
      title: "Set up US transportation",
      description: "Decide whether to buy or lease a car, or rely on public transit depending on your city. Public transport is limited outside major metro areas.",
      category: "transport", order: 2,
      documents: ["US driver's licence", "SSN", "Bank account", "Proof of insurance"],
      tips: "In NYC, Chicago, or DC — use a metro card and skip the car. In LA, Houston, or most suburbs — you'll need a car. Leasing is easier than buying as a new arrival without credit history. Get renter's insurance first, as auto insurance requires proof of US address.",
      countries: ["United States"], dependsOn: [],
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

  // ═══════════════════════════════════════════════════════════
  // STUDENT-SPECIFIC TASKS (employmentStatuses: ["student"])
  // ═══════════════════════════════════════════════════════════

  const studentTasks = [

    // ─── CZECH REPUBLIC ───────────────────────────────────────
    {
      title: "Register with the international student office",
      description: "Complete your enrolment (zápis) at your Czech university and register with the international student centre. They handle residence-permit support, orientation, and student services.",
      category: "legal", order: 5,
      documents: ["Acceptance letter", "Passport", "Proof of accommodation"],
      tips: "Charles University and CTU both have dedicated Welcome Centres for international students — use them early. They often pre-fill parts of your residence permit application.",
      countries: ["Czech Republic"], employmentStatuses: ["student"], dependsOn: [],
    },
    {
      title: "Open a student bank account",
      description: "Several Czech banks offer free student accounts. A local account is essential for tuition payments, student grants, and everyday spending.",
      category: "banking", order: 3,
      documents: ["Passport", "Student ISIC card or university enrolment confirmation", "Proof of address"],
      tips: "Fio Banka and mBank offer free student accounts with no monthly fees. Bring your university enrolment letter — many branches fast-track the process for students.",
      countries: ["Czech Republic"], employmentStatuses: ["student"], dependsOn: [],
    },
    {
      title: "Arrange student health insurance",
      description: "Health insurance is mandatory. EU students can use their EHIC from home. Non-EU students must take out private health insurance covering the full stay before applying for a residence permit.",
      category: "insurance", order: 3,
      documents: ["Passport", "University enrolment confirmation"],
      officialUrl: "https://www.pvzp.cz/en/",
      tips: "PVZP (Pojišťovna VZP) is the most accepted insurer for non-EU student visa applications. Get at least the minimum required coverage — upgrade later if you need wider cover.",
      countries: ["Czech Republic"], employmentStatuses: ["student"], dependsOn: [],
    },
    {
      title: "Get a student transit pass",
      description: "Students under 26 qualify for a heavily discounted Lítačka monthly pass for Prague public transport. Apply with your ISIC card at a Lítačka service point.",
      category: "transport", order: 5,
      documents: ["ISIC card or student ID", "Passport"],
      officialUrl: "https://www.pidlitacka.cz/",
      tips: "The student monthly pass for all Prague zones is significantly cheaper than the adult rate. Activate it before your first day of term.",
      countries: ["Czech Republic"], employmentStatuses: ["student"], dependsOn: [],
    },

    // ─── UNITED STATES ────────────────────────────────────────
    {
      title: "Register with the international student office (DSO)",
      description: "Check in with your university's Designated School Official (DSO) immediately on arrival. They validate your SEVIS record, brief you on F-1/J-1 compliance, and advise on OPT/CPT eligibility.",
      category: "legal", order: 2,
      documents: ["Passport", "Visa", "I-20 or DS-2019", "I-94 arrival record"],
      officialUrl: "https://studyinthestates.dhs.gov/",
      tips: "Report to the DSO within 30 days of the programme start date on your I-20 — missing this can jeopardise your F-1 status. Keep all your immigration documents in one folder and always carry a copy.",
      countries: ["United States"], employmentStatuses: ["student"], dependsOn: [],
    },
    {
      title: "Open a student or basic checking account",
      description: "Many US banks open accounts for international students without an SSN using your passport, I-20, and university letter. A US account is needed for stipends, TA pay, and direct debit.",
      category: "banking", order: 3,
      documents: ["Passport", "Visa", "I-20", "University enrolment confirmation", "Proof of US address"],
      tips: "Chase and Bank of America both have international student account programmes. Alternatively, Wise gives you a US account number instantly with no SSN needed — useful as a bridge while you set up a traditional account.",
      countries: ["United States"], employmentStatuses: ["student"], dependsOn: [],
    },
    {
      title: "Get student health insurance",
      description: "Most US universities require students to have health insurance and offer their own student health plan (SHIP). Enrol during your university orientation window.",
      category: "insurance", order: 2,
      documents: ["University enrolment confirmation", "Passport"],
      tips: "The university SHIP is often the easiest option and is accepted at the campus health centre. If your home country provides coverage (e.g. a home insurance plan), you may be able to waive the SHIP — check the waiver requirements carefully.",
      countries: ["United States"], employmentStatuses: ["student"], dependsOn: [],
    },

    // ─── GERMANY ──────────────────────────────────────────────
    {
      title: "Complete Immatrikulation (university enrolment)",
      description: "Formally enrol at your German university, pay the semester fee (Semesterbeitrag), and receive your student ID. This is required before you can access campus services or get your Semesterticket.",
      category: "legal", order: 2,
      documents: ["Admission letter", "Passport", "Proof of health insurance", "Anmeldung confirmation (Meldebescheinigung)", "Bank transfer receipt for semester fee"],
      tips: "The semester fee (typically €200–350) usually includes a Semesterticket for unlimited local transit. Pay it as soon as you receive the bank details — late payment delays your ID card.",
      countries: ["Germany"], employmentStatuses: ["student"], dependsOn: [],
    },
    {
      title: "Get student health insurance (Krankenkasse — student tariff)",
      description: "Students under 30 in Germany must have public health insurance at the subsidised student rate (~€120/month). Register with a Krankenkasse before or immediately after enrolment.",
      category: "insurance", order: 2,
      documents: ["Admission letter", "Passport", "Meldebescheinigung"],
      officialUrl: "https://www.tk.de/en/students",
      tips: "TK (Techniker Krankenkasse) and AOK are popular with international students and have English-speaking support. Register before your enrolment deadline — the university requires proof of insurance to complete Immatrikulation.",
      countries: ["Germany"], employmentStatuses: ["student"], dependsOn: [],
    },
    {
      title: "Activate your Semesterticket",
      description: "Your semester fee includes a Semesterticket for unlimited use of local public transport (bus, tram, U-Bahn, S-Bahn) — and in many cities, even regional trains. Activate it via your student portal.",
      category: "transport", order: 3,
      documents: ["Student ID", "Semester fee payment confirmation"],
      tips: "Many German universities now include the Deutschlandticket in the semester fee — check with your Studentenwerk. If not, the €58/month Deutschlandticket is the best value transit pass in the country.",
      countries: ["Germany"], employmentStatuses: ["student"], dependsOn: [],
    },
  ];

  // ═══════════════════════════════════════════════════════════
  // EDUCATION / FAMILY TASKS (familyStatuses: ["family_with_kids"])
  // ═══════════════════════════════════════════════════════════

  const educationTasks = [

    // ─── CZECH REPUBLIC ───────────────────────────────────────
    {
      title: "Research local schools (ZŠ) in your district",
      description: "Czech public primary schools (základní školy) are free and assigned by residence district. Research schools in your area and, if possible, visit a few before enrolling.",
      category: "education", order: 1,
      documents: [],
      officialUrl: "https://www.msmt.cz/",
      tips: "School quality varies by district. Ask expat groups and local Facebook groups for recommendations. Private schools are an option but cost CZK 5,000–20,000/month.",
      countries: ["Czech Republic"], familyStatuses: ["family_with_kids"], dependsOn: [],
    },
    {
      title: "Enrol children in school",
      description: "Register your children at the local základní škola (primary school) or střední škola (secondary school). Bring proof of residence and vaccination records. EU children have the same rights as Czech citizens.",
      category: "education", order: 2,
      documents: ["Passport or birth certificate", "Proof of address (rental contract)", "Vaccination records", "Previous school records (translated if non-Czech)"],
      tips: "Schools are required to accept children regardless of Czech language ability — language support (asistenent pedagoga) is often available. Enrol as early as possible, especially for September intake.",
      countries: ["Czech Republic"], familyStatuses: ["family_with_kids"], dependsOn: [],
    },
    {
      title: "Find a kindergarten (mateřská škola) or childcare",
      description: "Public kindergartens are free from age 3 and mandatory from age 5. Waiting lists can be long — apply immediately after arriving or even before.",
      category: "education", order: 3,
      documents: ["Birth certificate", "Proof of address", "Vaccination records"],
      tips: "Priority is given to children with registered local addresses. If public kindergarten waitlists are full, consider private bilingual kindergartens (more expensive but available). Submit applications in January–March for September intake.",
      countries: ["Czech Republic"], familyStatuses: ["family_with_kids"], dependsOn: [],
    },

    // ─── UNITED STATES ────────────────────────────────────────
    {
      title: "Find and enrol children in a local public school",
      description: "US public schools are free and assigned by school district based on your home address. Contact your local school district office to enrol — bring proof of address and immunisation records.",
      category: "education", order: 1,
      documents: ["Proof of address (lease or utility bill)", "Birth certificate", "Immunisation records", "Previous school records (translated if not English)"],
      officialUrl: "https://www.ed.gov/",
      tips: "School quality varies significantly by district and is tied to property values. Research school ratings on GreatSchools.org before choosing your neighbourhood. Children cannot be denied enrolment even without an SSN.",
      countries: ["United States"], familyStatuses: ["family_with_kids"], dependsOn: [],
    },
    {
      title: "Get children's immunisations up to US standards",
      description: "US schools require specific vaccinations (CDC schedule) before enrolment. Review your children's records and get any missing vaccines — your paediatrician or local health department can administer them.",
      category: "education", order: 2,
      documents: ["Existing vaccination records", "Passport", "Insurance card (if available)"],
      officialUrl: "https://www.cdc.gov/vaccines/schedules/",
      tips: "Many countries use different vaccine brands or schedules — bring your full vaccination history. County health departments often provide vaccines free or at low cost if you don't have insurance yet.",
      countries: ["United States"], familyStatuses: ["family_with_kids"], dependsOn: [],
    },
    {
      title: "Find childcare or daycare",
      description: "US childcare is largely private and expensive — $1,500–$3,500/month depending on city. Research options early: daycare centres, in-home daycares (family childcare), and au pairs.",
      category: "education", order: 3,
      documents: ["Birth certificate", "Immunisation records", "Proof of address"],
      tips: "The Child and Dependent Care Tax Credit lets you claim up to $3,000 per child in childcare costs on your federal tax return. Some employers offer a Dependent Care FSA — enrol immediately if available. Waitlists for good daycares in cities are 6–18 months.",
      countries: ["United States"], familyStatuses: ["family_with_kids"], dependsOn: [],
    },

    // ─── GERMANY ──────────────────────────────────────────────
    {
      title: "Find and apply to a local Grundschule (primary school)",
      description: "School attendance is compulsory in Germany from age 6. Children are assigned to a Grundschule based on their registered address (Schulsprengel). Contact your local Schulamt (school authority) after Anmeldung.",
      category: "education", order: 1,
      documents: ["Meldebescheinigung", "Birth certificate", "Vaccination records (Impfpass)", "Previous school reports (translated if not German)"],
      officialUrl: "https://www.bildungsserver.de/",
      tips: "Enrolment is handled by the Schulamt of your district, not directly with the school. Some states offer preparatory German language classes (Vorbereitungsklassen) for children with limited German — ask the Schulamt.",
      countries: ["Germany"], familyStatuses: ["family_with_kids"], dependsOn: [],
    },
    {
      title: "Apply for a Kita (Kindertagesstätte / daycare) place",
      description: "Children in Germany have a legal right to a Kita place from age 1. However, demand far exceeds supply in cities — apply as early as possible, ideally 12–18 months before you need the place.",
      category: "education", order: 2,
      documents: ["Birth certificate", "Meldebescheinigung", "Proof of employment or study (for priority)"],
      tips: "Use the Kita-Navigator or your city's online portal to apply to multiple Kitas simultaneously. Municipal Kitas are cheaper but have longer waits. Private and church-run Kitas (Träger) often have more availability.",
      countries: ["Germany"], familyStatuses: ["family_with_kids"], dependsOn: [],
    },
    {
      title: "Apply for Kindergeld (child benefit)",
      description: "Germany pays Kindergeld (child benefit) of €250/month per child to residents. Apply through the Familienkasse (Family Benefits Office) at the Federal Employment Agency.",
      category: "legal", order: 5,
      documents: ["Passport", "Child's birth certificate", "Meldebescheinigung for you and your child", "Bank account details (IBAN)", "Proof of employment or residence status"],
      officialUrl: "https://www.arbeitsagentur.de/familie-und-kinder/kindergeld",
      tips: "Kindergeld can be backdated up to 6 months — apply as soon as you are registered. Submit the application (Antrag auf Kindergeld) to your local Familienkasse. Processing takes 6–12 weeks.",
      countries: ["Germany"], familyStatuses: ["family_with_kids"], dependsOn: [],
    },
  ];

  // ═══════════════════════════════════════════════════════════
  // ORIGIN-SPECIFIC TASKS
  // These appear in addition to destination tasks, filtered by
  // where the user is moving FROM (originCountries).
  // ═══════════════════════════════════════════════════════════

  const originTasks = [

    // ─── US CITIZENS (moving anywhere abroad) ─────────────────
    {
      title: "File annual US tax return from abroad",
      description: "US citizens are taxed on worldwide income regardless of where they live. You must continue filing Form 1040 each year. The Foreign Earned Income Exclusion (FEIE) and Foreign Tax Credit can offset most or all tax owed.",
      category: "legal", order: 10,
      documents: ["Passport", "Foreign tax return (if applicable)", "Foreign bank account statements", "Employer income statements"],
      officialUrl: "https://www.irs.gov/individuals/international-taxpayers/us-citizens-and-resident-aliens-abroad",
      tips: "File Form 2555 to claim the FEIE — you may owe nothing to the IRS. Hire a US expat tax specialist (e.g. Greenback Tax, Bright!Tax) for your first year abroad.",
      countries: [], originCountries: ["United States"], dependsOn: [],
    },
    {
      title: "Report foreign bank accounts (FBAR / FinCEN 114)",
      description: "If you hold more than $10,000 total across foreign bank accounts at any point in the year, you must file an FBAR online with FinCEN. Failure to file carries severe penalties.",
      category: "legal", order: 11,
      documents: ["Foreign bank account numbers and balances", "Bank name and address"],
      officialUrl: "https://bsaefiling.fincen.treas.gov/NoRegFBARFiler.html",
      tips: "The FBAR deadline is April 15 with automatic extension to October 15. File via the BSA E-Filing system — it's free. Set a calendar reminder for every April.",
      countries: [], originCountries: ["United States"], dependsOn: [],
    },
    {
      title: "Notify the IRS of your foreign address",
      description: "Inform the IRS of your new foreign address by filing Form 8822 or including the new address on your next tax return. This ensures you receive correspondence and avoids missed notices.",
      category: "legal", order: 12,
      documents: ["Passport", "New foreign address"],
      officialUrl: "https://www.irs.gov/forms-pubs/about-form-8822",
      tips: "Also notify the Social Security Administration of your foreign address if you receive benefits, and update your US bank and brokerage accounts before you leave.",
      countries: [], originCountries: ["United States"], dependsOn: [],
    },

    // ─── ISRAELI CITIZENS → GERMANY ───────────────────────────
    {
      title: "Apostille your Israeli documents",
      description: "Israeli government-issued documents (birth certificate, marriage certificate, university degrees) must be apostilled by the Israeli Ministry of Foreign Affairs before they will be accepted in Germany.",
      category: "legal", order: 13,
      documents: ["Original Israeli document", "Completed apostille application form"],
      officialUrl: "https://www.gov.il/en/service/apostille_service",
      tips: "The Israeli apostille service is available online via gov.il. Allow 5–10 business days. Each document costs approximately ₪45. Do this before you leave Israel.",
      countries: ["Germany"], originCountries: ["Israel"], dependsOn: [],
    },
    {
      title: "Get certified Hebrew-to-German translations",
      description: "Apostilled Israeli documents still need to be translated into German by a sworn translator (vereidigter Übersetzer) before German authorities will accept them for residency, employment, or banking purposes.",
      category: "legal", order: 14,
      documents: ["Apostilled Israeli original documents"],
      tips: "Only translations by certified sworn translators are accepted. Find one via the German court directory (Justizportal). Allow 5–7 business days per document. Cost: €60–120 per page.",
      countries: ["Germany"], originCountries: ["Israel"], dependsOn: [],
    },
    {
      title: "Check your Israeli pension and social security rights",
      description: "Israel and Germany have a bilateral social security agreement. Understand how your Israeli social insurance (Bituach Leumi) contributions affect your German social security rights and whether you can transfer or maintain coverage.",
      category: "insurance", order: 10,
      documents: ["Israeli Bituach Leumi statement", "Passport"],
      officialUrl: "https://www.btl.gov.il/English%20Homepage/Pages/default.aspx",
      tips: "Contact the National Insurance Institute (Bituach Leumi) before you leave to get a statement of contributions. Periods of Israeli social insurance may count toward German pension entitlement.",
      countries: ["Germany"], originCountries: ["Israel"], dependsOn: [],
    },

    // ─── UK CITIZENS → anywhere ───────────────────────────────
    {
      title: "Inform HMRC you are leaving the UK",
      description: "Notify HMRC of your departure from the UK to ensure you are taxed correctly for the year of departure. Complete the P85 form online. This also determines whether you remain a UK tax resident.",
      category: "legal", order: 10,
      documents: ["National Insurance number", "P45 (if employed)", "Details of foreign address and employment"],
      officialUrl: "https://www.gov.uk/tax-right-retire-abroad-return-to-uk",
      tips: "The Statutory Residence Test (SRT) determines your UK tax residency status. If you spend fewer than 16 days in the UK in a year you are typically non-resident. A tax adviser can confirm your status.",
      countries: [], originCountries: ["United Kingdom"], dependsOn: [],
    },
  ];

  // ═══════════════════════════════════════════════════════════
  // VISA / RESIDENCY TASKS — per employment status × destination
  // Employed: verification of status
  // Self-employed / freelancer / unemployed / student: full guidance
  // ═══════════════════════════════════════════════════════════

  const visaResidencyTasks = [

    // ─── CZECH REPUBLIC ───────────────────────────────────────
    {
      title: "Apply for self-employment residency permit",
      description: "To live and work as self-employed or freelancer in the Czech Republic for more than 90 days you need two things: (1) a Trade License (živnostenský list) from the Trade Licensing Office and (2) a Long-term Residence Permit for business from the Ministry of Interior. EU/EEA nationals only need to register their right of residence — no separate permit required, but register within 30 days of settling. Non-EU nationals must apply for the permit at the Czech embassy before entering.",
      category: "legal", order: 2,
      officialUrl: "https://www.mvcr.cz/clanek/long-term-residence-for-the-purpose-of-business.aspx",
      documents: ["Valid passport", "Trade license (živnostenský list)", "Proof of accommodation", "Proof of sufficient funds (6+ months of living costs)", "Health insurance certificate", "Clean criminal record from home country — apostilled (non-EU)", "2× passport photos (non-EU)"],
      tips: "Your trade license and residency permit applications can run in parallel. Allow 60–90 days for the permit. Some regulated trades require proof of professional qualifications.",
      countries: ["Czech Republic"], employmentStatuses: ["self_employed", "freelancer"], dependsOn: [],
    },
    {
      title: "Understand your residency options as a non-working resident",
      description: "If you are not employed or studying but plan to stay longer than 90 days: EU/EEA nationals can register their right of residence at the Ministry of Interior — you must show proof of sufficient funds (at least CZK 117,800/year) and valid health insurance. Non-EU nationals must apply for a long-term visa (over 90 days) or a long-term residence permit at the Czech embassy in their home country — you cannot apply from inside the Czech Republic on a tourist visa.",
      category: "legal", order: 2,
      officialUrl: "https://www.mvcr.cz/clanek/long-term-visa.aspx",
      documents: ["Valid passport", "Proof of accommodation", "Proof of sufficient funds (bank statements)", "Health insurance covering the full stay", "Clean criminal record — apostilled (non-EU)", "2× passport photos (non-EU)"],
      tips: "EU: Bring all documents to your local MOI office. Non-EU: Start the embassy application at least 3 months before planned arrival — processing takes 60–90 days.",
      countries: ["Czech Republic"], employmentStatuses: ["unemployed"], dependsOn: [],
    },
    {
      title: "Apply for a student long-term residence permit",
      description: "International students from outside the EU/EEA need a Long-term Residence Permit for the purpose of study — apply at the Czech embassy in your home country before departure. EU/EEA students have free movement and only need to register their right of residence at the MOI. Your permit is tied to your university enrolment and must be renewed annually. The university's International Office will guide you through the application.",
      category: "legal", order: 2,
      officialUrl: "https://www.mvcr.cz/clanek/long-term-residence-for-the-purpose-of-study.aspx",
      documents: ["Valid passport", "University acceptance letter", "Proof of accommodation", "Proof of sufficient funds (at least CZK 4,000/month)", "Health insurance certificate", "Clean criminal record — apostilled (non-EU)", "2× passport photos (non-EU)"],
      tips: "Non-EU: Apply at the Czech embassy at least 3 months before your programme starts — processing takes up to 60 days. Once in Czechia, report to the MOI within 3 days of arrival.",
      countries: ["Czech Republic"], employmentStatuses: ["student"], dependsOn: [],
    },

    // ─── GERMANY ──────────────────────────────────────────────
    {
      title: "Confirm your work permit and Aufenthaltstitel",
      description: "EU/EEA nationals have free movement — Anmeldung is sufficient and no separate work or residence permit is needed. Non-EU nationals who entered on a work visa must convert it to an Aufenthaltserlaubnis (residence permit for employment) at the local Ausländerbehörde within 90 days of arrival. Highly qualified workers earning ≥ €48,000/yr (or €43,759 in shortage occupations) may qualify for an EU Blue Card (Blaue Karte EU), which provides a faster path to permanent residency.",
      category: "legal", order: 2,
      officialUrl: "https://www.make-it-in-germany.com/en/visa-residence/types/work-qualified-professionals",
      documents: ["Valid passport", "Employment contract", "Recognised university degree (for Blue Card)", "German health insurance certificate", "Meldebescheinigung", "Passport photos", "Completed application form"],
      tips: "Book your Ausländerbehörde appointment as soon as you arrive — waits are 4–8 weeks. If your visa expires before the appointment, request a Fiktionsbescheinigung (bridging certificate) — it legalises your stay while your application is processed.",
      countries: ["Germany"], employmentStatuses: ["employed"], dependsOn: [],
    },
    {
      title: "Apply for a freelancer or self-employment residence permit",
      description: "EU/EEA nationals can freelance and self-employ freely — confirm whether your profession is Freiberufler (liberal profession: IT, creative, academic, medical) registered with the Finanzamt, or Gewerbetreibender (trader) requiring a Gewerbeanmeldung. Non-EU nationals need an Aufenthaltserlaubnis zur Ausübung einer freiberuflichen Tätigkeit (freelancers) or zur selbständigen Erwerbstätigkeit (self-employed traders) from the Ausländerbehörde. You must demonstrate market demand via client contracts and financial sustainability.",
      category: "legal", order: 2,
      officialUrl: "https://www.make-it-in-germany.com/en/visa-residence/types/self-employed-freelancers",
      documents: ["Valid passport", "Business plan or description of services", "Client contracts or letters of intent", "Financial projections or savings proof (typically 12 months of living costs)", "Professional qualifications if profession-specific", "Meldebescheinigung", "Health insurance certificate"],
      tips: "Freiberufler (IT, creative, engineering) have a simpler path than Gewerbetreibende. The Ausländerbehörde may request an opinion from the relevant professional body — allow extra time. EU nationals: register at the Finanzamt within a month of starting activity.",
      countries: ["Germany"], employmentStatuses: ["self_employed", "freelancer"], dependsOn: [],
    },
    {
      title: "Understand your residency rights as a non-working resident",
      description: "EU/EEA nationals without employment can register their right of residence in Germany with proof of sufficient funds (€942/month reference value) and comprehensive health insurance — valid as long as conditions are met. Non-EU nationals have limited options: a job-seeker visa (Arbeitssuche) allows up to 6 months to find employment; family reunification is available if your partner holds a valid German residence permit. Without a qualifying permit category, long-term residency is not possible for non-EU nationals.",
      category: "legal", order: 2,
      officialUrl: "https://www.make-it-in-germany.com/en/visa-residence/types/job-seekers",
      documents: ["Valid passport", "Proof of sufficient funds", "Comprehensive health insurance", "Meldebescheinigung", "University degree and CV (for job-seeker visa)"],
      tips: "Job-seeker visa holders may not work during the search period, but can accept a job offer and switch to a work permit immediately. If you hold a recognised degree, the job-seeker visa is straightforward to obtain.",
      countries: ["Germany"], employmentStatuses: ["unemployed"], dependsOn: [],
    },
    {
      title: "Apply for a student residence permit (Aufenthaltserlaubnis zum Studium)",
      description: "EU/EEA students have free movement — Anmeldung is sufficient. Non-EU students who entered on a student visa must apply at the local Ausländerbehörde to convert it to an Aufenthaltserlaubnis zum Studium within 90 days of arrival. The permit is tied to your university enrolment and must be renewed annually. You are permitted to work up to 120 full days or 240 half days per year alongside your studies.",
      category: "legal", order: 3,
      officialUrl: "https://www.make-it-in-germany.com/en/visa-residence/types/student",
      documents: ["Valid passport", "University admission letter", "Proof of enrolment (Immatrikulationsbescheinigung)", "Proof of financial resources (€934/month via blocked account, scholarship, or parental guarantee)", "German health insurance confirmation", "Meldebescheinigung"],
      tips: "Book your Ausländerbehörde appointment immediately after Anmeldung — waits are 6–10 weeks. If your visa expires before the appointment, request a Fiktionsbescheinigung. Standard proof of funds is a blocked account (Sperrkonto) via Deutsche Bank or Fintiba — set it up before departure.",
      countries: ["Germany"], employmentStatuses: ["student"], dependsOn: [],
    },

    // ─── UNITED STATES ────────────────────────────────────────
    {
      title: "Verify your work visa status and I-94 record",
      description: "Check your I-94 arrival/departure record at i94.cbp.dhs.gov and confirm your authorised stay period, visa category, and employer restrictions. Common work visas: H-1B (employer-sponsored specialty occupation), L-1 (intracompany transfer), O-1 (extraordinary ability), TN (Canadian/Mexican nationals under USMCA), E-3 (Australian nationals). Your employment is tied to your sponsoring employer — changing jobs without a transfer petition in place can put you out of status.",
      category: "legal", order: 2,
      officialUrl: "https://i94.cbp.dhs.gov/",
      documents: ["Passport", "Visa stamp", "I-94 printout", "I-797 approval notice (H-1B or L-1)", "Employment authorisation document (EAD) if applicable"],
      tips: "Check your I-94 online — border errors happen and must be corrected promptly via a CBP Deferred Inspection appointment. Start your visa renewal or green card process with your employer's immigration attorney at least 6 months before status expiry.",
      countries: ["United States"], employmentStatuses: ["employed"], dependsOn: [],
    },
    {
      title: "Understand visa restrictions on self-employment",
      description: "Most US work visas — H-1B, L-1, TN — do NOT permit self-employment or freelancing. You are authorised to work only for your sponsoring employer. Self-employment pathways include: O-1A (extraordinary ability), EB-1A (extraordinary ability immigrant visa), EB-2 NIW (national interest waiver — self-petition without a US employer), or E-2 (investor treaty visa requiring substantial capital). Working outside your authorised scope — even a single freelance invoice — is an immigration violation that can result in removal and permanent visa bars.",
      category: "legal", order: 2,
      officialUrl: "https://www.uscis.gov/working-in-the-united-states",
      documents: ["Passport", "Current visa stamp and I-94 printout", "Evidence of extraordinary ability (for O-1A / EB-1A)", "Business plan and investment evidence (for E-2)"],
      tips: "Consult a US immigration attorney before accepting any freelance work or starting a business. The O-1A and EB-2 NIW are the most accessible self-petition routes for skilled professionals. Do not take any self-employment income without legal confirmation you are authorised.",
      countries: ["United States"], employmentStatuses: ["self_employed", "freelancer"], dependsOn: [],
    },
    {
      title: "Understand visa implications of unemployment",
      description: "If you lose your job while on a US work visa (H-1B, L-1, O-1, etc.), you have a 60-day grace period from the date of termination to: (1) find a new sponsoring employer and have a transfer petition filed, (2) change to another valid status such as B-2 visitor or F-1 student, or (3) depart the United States. Overstaying triggers automatic inadmissibility bars: 180+ days = 3-year bar; 1+ year = 10-year bar.",
      category: "legal", order: 2,
      officialUrl: "https://www.uscis.gov/laws-and-policy/other-resources/unlawful-presence-and-bars-to-admissibility",
      documents: ["Passport", "I-94 record", "I-797 approval notice", "Last pay stubs (as proof of termination date)"],
      tips: "The 60-day grace period runs from job termination, not from when you discover it. Contact your employer's immigration attorney immediately. In B-2 status you cannot work. The grace period does not apply to all visa types — confirm yours with an attorney without delay.",
      countries: ["United States"], employmentStatuses: ["unemployed"], dependsOn: [],
    },
    {
      title: "Verify your F-1 or J-1 visa status and SEVIS record",
      description: "Confirm your SEVIS record is active, your I-20 (F-1) or DS-2019 (J-1) is current, and your I-94 shows 'D/S' (Duration of Status) — meaning you may stay as long as you are a full-time enrolled student in good standing. Key rules: maintain full-time enrolment every semester, do not work off-campus without authorisation (OPT/CPT for F-1, Academic Training for J-1), and report any change of address or programme to your DSO within 10 days.",
      category: "legal", order: 2,
      officialUrl: "https://studyinthestates.dhs.gov/students/maintaining-your-status",
      documents: ["Passport", "F-1 or J-1 visa stamp", "I-20 or DS-2019", "I-94 record showing D/S", "SEVIS I-901 fee receipt"],
      tips: "Your visa stamp can expire while you are in the US — this is normal and does not affect your status. What matters is your I-20/DS-2019 programme end date and maintaining full-time enrolment. You only need a valid visa stamp when re-entering the US after travel abroad.",
      countries: ["United States"], employmentStatuses: ["student"], dependsOn: [],
    },
  ];

  for (const task of tasks) {
    await prisma.taskTemplate.create({ data: task });
  }
  for (const task of studentTasks) {
    await prisma.taskTemplate.create({ data: task });
  }
  for (const task of educationTasks) {
    await prisma.taskTemplate.create({ data: task });
  }
  for (const task of originTasks) {
    await prisma.taskTemplate.create({ data: task });
  }
  for (const task of visaResidencyTasks) {
    await prisma.taskTemplate.create({ data: task });
  }

  // ─── WIRE DEPENDENCIES ────────────────────────────────────────
  // Map title+country[0] → id so we can reference templates by name
  const created = await prisma.taskTemplate.findMany({ select: { id: true, title: true, countries: true } });
  const byKey = new Map(created.map((t) => [`${t.title}|${t.countries[0] ?? ""}`, t.id]));
  const k = (title: string, country: string) => byKey.get(`${title}|${country}`);

  const dependencies: Array<[string, string, string[]]> = [
    // Czech Republic
    ["Register your address",                         "Czech Republic", ["Find a permanent apartment"]],
    ["Apply for long-term residency permit",          "Czech Republic", ["Register your address", "Get health insurance"]],
    ["Exchange or validate your driving licence",     "Czech Republic", ["Apply for long-term residency permit", "Apply for self-employment residency permit", "Understand your residency options as a non-working resident", "Apply for a student long-term residence permit"]],
    ["Lease or purchase a car",                       "Czech Republic", ["Exchange or validate your driving licence"]],
    ["Get a parking permit",                          "Czech Republic", ["Lease or purchase a car"]],
    ["Register as self-employed (živnostenský list)", "Czech Republic", ["Register your address"]],
    ["Register with the tax authority",               "Czech Republic", ["Register as self-employed (živnostenský list)"]],
    // Germany
    ["Anmeldung — register your address",             "Germany",        ["Find a permanent flat (Wohnung)"]],
    ["Open a German bank account",                    "Germany",        ["Anmeldung — register your address"]],
    ["Get your Steueridentifikationsnummer (tax ID)", "Germany",        ["Anmeldung — register your address"]],
    ["Register with health insurance (Krankenkasse)", "Germany",        ["Anmeldung — register your address"]],
    ["Exchange or validate your driving licence",     "Germany",        ["Anmeldung — register your address"]],
    ["Set up electricity and internet",               "Germany",        ["Anmeldung — register your address"]],
    // United States
    ["Open a US bank account",                        "United States",  ["Apply for a Social Security Number (SSN)"]],
    ["Build US credit history",                       "United States",  ["Open a US bank account"]],
    ["Set up utilities and internet",                 "United States",  ["Find a permanent apartment"]],
    ["Get a US driver's licence",                     "United States",  ["Apply for a Social Security Number (SSN)"]],
    ["Set up US transportation",                      "United States",  ["Get a US driver's licence"]],
  ];

  for (const [title, country, blockers] of dependencies) {
    const id = k(title, country);
    if (!id) { console.warn(`  ⚠ Not found: "${title}" (${country})`); continue; }
    const blockerIds = blockers.map((bt) => k(bt, country)).filter((id): id is string => !!id);
    await prisma.taskTemplate.update({ where: { id }, data: { dependsOn: blockerIds } });
  }
  console.log(`✓ Wired ${dependencies.length} dependency rules`);

  const allTasks = [...tasks, ...studentTasks, ...educationTasks, ...originTasks, ...visaResidencyTasks];
  const czCount = tasks.filter((t) => t.countries.includes("Czech Republic")).length;
  const usCount = tasks.filter((t) => t.countries.includes("United States")).length;
  const deCount = tasks.filter((t) => t.countries.includes("Germany")).length;
  const usOriginCount = originTasks.filter((t) => t.originCountries.includes("United States")).length;
  const ilOriginCount = originTasks.filter((t) => t.originCountries.includes("Israel")).length;
  const ukOriginCount = originTasks.filter((t) => t.originCountries.includes("United Kingdom")).length;

  console.log(`✓ Seeded ${allTasks.length} task templates:`);
  console.log(`  Destination — Czech Republic: ${czCount}, US: ${usCount}, Germany: ${deCount}`);
  console.log(`  Student tasks: ${studentTasks.length} | Education/family tasks: ${educationTasks.length}`);
  console.log(`  Origin-specific — US citizens: ${usOriginCount}, Israeli → DE: ${ilOriginCount}, UK citizens: ${ukOriginCount}`);
  console.log(`  Visa/residency tasks: ${visaResidencyTasks.length}`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
