"use client";

import { useRouter } from "next/navigation";

interface Vendor {
  name: string;
  tagline: string;
  rating: number;
  reviews: number;
  priceRange: string;
  location: string;
  responseTime: string;
  languages: string[];
  verified: boolean;
}

const VENDOR_CATEGORIES: {
  emoji: string;
  title: string;
  desc: string;
  vendors: Vendor[];
}[] = [
  {
    emoji: "📦",
    title: "International Movers",
    desc: "Door-to-door international moving companies, freight forwarders.",
    vendors: [
      {
        name: "MoveEU",
        tagline: "Door-to-door international moves across 40 countries — fixed-price quotes in 24 hrs.",
        rating: 4.7,
        reviews: 891,
        priceRange: "€800–3,500",
        location: "Pan-European",
        responseTime: "< 6 hrs",
        languages: ["EN", "DE", "PL", "CZ"],
        verified: true,
      },
      {
        name: "Seven Seas Worldwide",
        tagline: "Shared container and full-container loads — cost-effective for solo movers.",
        rating: 4.6,
        reviews: 1240,
        priceRange: "€400–2,500",
        location: "Worldwide",
        responseTime: "< 8 hrs",
        languages: ["EN", "DE", "FR", "ES"],
        verified: true,
      },
      {
        name: "AGS Worldwide Movers",
        tagline: "White-glove packing, customs clearance and door-to-door delivery worldwide.",
        rating: 4.8,
        reviews: 573,
        priceRange: "€1,200–5,000",
        location: "Worldwide",
        responseTime: "< 4 hrs",
        languages: ["EN", "FR", "DE", "AR"],
        verified: true,
      },
    ],
  },
  {
    emoji: "📄",
    title: "Document & Apostille Services",
    desc: "Apostille, legalisation, notarisation and police clearance.",
    vendors: [
      {
        name: "DocuGlobal",
        tagline: "Apostille and legalisation for 40+ countries — tracked and guaranteed.",
        rating: 4.9,
        reviews: 463,
        priceRange: "€50–200",
        location: "Remote",
        responseTime: "< 2 hrs",
        languages: ["EN", "DE", "FR", "ES"],
        verified: true,
      },
      {
        name: "ApostilleNow",
        tagline: "Same-day apostille submissions for UK, US, EU and Israeli documents.",
        rating: 4.8,
        reviews: 317,
        priceRange: "€45–150",
        location: "Remote",
        responseTime: "Same day",
        languages: ["EN", "HE", "RU"],
        verified: true,
      },
      {
        name: "ClearanceKing",
        tagline: "Police clearance certificates, FBI checks and Interpol records — handled end-to-end.",
        rating: 4.6,
        reviews: 189,
        priceRange: "€80–250",
        location: "Remote",
        responseTime: "< 4 hrs",
        languages: ["EN", "DE", "PL"],
        verified: false,
      },
    ],
  },
  {
    emoji: "🌐",
    title: "Certified Translation",
    desc: "Sworn translators, certified translations for government authorities.",
    vendors: [
      {
        name: "CertifiedTranslate",
        tagline: "Sworn translations accepted by EU authorities — 48-hour turnaround guaranteed.",
        rating: 4.9,
        reviews: 682,
        priceRange: "€40–180",
        location: "Remote",
        responseTime: "< 2 hrs",
        languages: ["EN", "CZ", "DE", "FR", "ES", "PL"],
        verified: true,
      },
      {
        name: "TransGov",
        tagline: "Government-certified translations for visas, degrees and birth certificates.",
        rating: 4.7,
        reviews: 298,
        priceRange: "€50–200",
        location: "Remote",
        responseTime: "< 3 hrs",
        languages: ["EN", "DE", "AR", "RU", "HE"],
        verified: true,
      },
    ],
  },
  {
    emoji: "🗄️",
    title: "Storage",
    desc: "Short and long-term self-storage, climate-controlled units.",
    vendors: [
      {
        name: "BoxDrop Storage",
        tagline: "From 1 week storage while you're in transit — insured and accessible.",
        rating: 4.5,
        reviews: 213,
        priceRange: "€60–150/mo",
        location: "Prague / Berlin",
        responseTime: "< 4 hrs",
        languages: ["EN", "CZ", "DE"],
        verified: true,
      },
      {
        name: "SafeBox EU",
        tagline: "Climate-controlled storage for furniture, art and sensitive items.",
        rating: 4.7,
        reviews: 142,
        priceRange: "€80–200/mo",
        location: "Pan-European",
        responseTime: "< 6 hrs",
        languages: ["EN", "DE", "FR"],
        verified: true,
      },
    ],
  },
  {
    emoji: "🚢",
    title: "Car & Vehicle Shipping",
    desc: "Vehicle export, import, customs clearance and delivery.",
    vendors: [
      {
        name: "AutoExport EU",
        tagline: "Roll-on roll-off vehicle shipping between EU countries — door-to-port.",
        rating: 4.6,
        reviews: 327,
        priceRange: "€400–1,800",
        location: "EU-wide",
        responseTime: "< 8 hrs",
        languages: ["EN", "DE", "PL", "CZ"],
        verified: true,
      },
      {
        name: "CarShip Global",
        tagline: "International vehicle shipping with full customs clearance and insurance.",
        rating: 4.7,
        reviews: 218,
        priceRange: "€800–3,500",
        location: "Worldwide",
        responseTime: "< 6 hrs",
        languages: ["EN", "DE", "AR"],
        verified: false,
      },
    ],
  },
  {
    emoji: "🐾",
    title: "Pet Relocation",
    desc: "Pet transport specialists, health certificates, airline coordination.",
    vendors: [
      {
        name: "PetJet Europe",
        tagline: "End-to-end pet relocation — vet paperwork, airline booking, door-to-door.",
        rating: 4.9,
        reviews: 284,
        priceRange: "€300–1,200",
        location: "EU-wide",
        responseTime: "< 3 hrs",
        languages: ["EN", "DE", "FR"],
        verified: true,
      },
      {
        name: "PawsAboard",
        tagline: "International pet travel with IATA-approved carriers and health cert coordination.",
        rating: 4.8,
        reviews: 176,
        priceRange: "€200–800",
        location: "Remote",
        responseTime: "< 4 hrs",
        languages: ["EN", "HE", "RU"],
        verified: true,
      },
    ],
  },
  {
    emoji: "💸",
    title: "Money Transfer",
    desc: "International wire transfers, currency exchange, multi-currency accounts.",
    vendors: [
      {
        name: "Wise (formerly TransferWise)",
        tagline: "Mid-market exchange rates, no hidden fees — the go-to for expat transfers.",
        rating: 4.9,
        reviews: 4820,
        priceRange: "0.3–1.5% fee",
        location: "Remote / Global",
        responseTime: "Instant",
        languages: ["EN", "DE", "FR", "ES", "PL", "CZ"],
        verified: true,
      },
      {
        name: "CurrencyFair",
        tagline: "Peer-to-peer currency exchange — often beats bank rates by 3–5x.",
        rating: 4.7,
        reviews: 1260,
        priceRange: "€3 flat + 0.45%",
        location: "Remote / Global",
        responseTime: "< 1 hr",
        languages: ["EN", "DE", "FR"],
        verified: true,
      },
    ],
  },
  {
    emoji: "🏥",
    title: "Pre-departure Health",
    desc: "Medical record exports, travel vaccinations, prescription consultations.",
    vendors: [
      {
        name: "MedExport Records",
        tagline: "Request and digitise your full medical history — GP, dental, specialist, all in one file.",
        rating: 4.8,
        reviews: 193,
        priceRange: "€50–150",
        location: "Remote",
        responseTime: "< 4 hrs",
        languages: ["EN", "DE", "FR", "HE"],
        verified: true,
      },
      {
        name: "TravelVax Clinics",
        tagline: "Travel vaccination advice and certificates for any destination — walk-in or booked.",
        rating: 4.7,
        reviews: 341,
        priceRange: "€30–150/vaccine",
        location: "Prague / Berlin / Vienna",
        responseTime: "Same day",
        languages: ["EN", "DE", "CZ"],
        verified: true,
      },
    ],
  },
];

function StarRating({ rating }: { rating: number }) {
  return (
    <span className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <svg
          key={i}
          className={`w-3 h-3 ${i <= Math.round(rating) ? "text-amber-400" : "text-slate-600"}`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.967a1 1 0 00.95.69h4.175c.969 0 1.371 1.24.588 1.81l-3.38 2.455a1 1 0 00-.364 1.118l1.287 3.966c.3.922-.755 1.688-1.538 1.118l-3.38-2.454a1 1 0 00-1.175 0l-3.38 2.454c-.783.57-1.838-.196-1.538-1.118l1.287-3.966a1 1 0 00-.364-1.118L2.05 9.394c-.783-.57-.38-1.81.588-1.81h4.175a1 1 0 00.95-.69L9.049 2.927z" />
        </svg>
      ))}
    </span>
  );
}

function VendorCard({ vendor }: { vendor: Vendor }) {
  return (
    <div className="bg-slate-800 border border-slate-700 rounded-xl p-3">
      <div className="flex items-center gap-2 mb-1">
        <span className="font-semibold text-sm text-white flex-shrink-0">{vendor.name}</span>
        {vendor.verified && (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-400/10 border border-emerald-400/20 px-1.5 py-0.5 rounded-full flex-shrink-0">
            <svg className="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            Verified
          </span>
        )}
        <span className="text-xs text-slate-500 flex-1 text-right flex-shrink-0">{vendor.priceRange}</span>
        <button className="flex-shrink-0 text-[11px] font-semibold bg-sky-500 hover:bg-sky-600 text-white px-3 py-1 rounded-lg transition-colors">
          Contact
        </button>
      </div>
      <p className="text-xs text-slate-400 truncate mb-1.5">{vendor.tagline}</p>
      <div className="flex items-center gap-2 text-xs text-slate-500">
        <div className="flex items-center gap-1">
          <StarRating rating={vendor.rating} />
          <span className="text-amber-400 font-semibold">{vendor.rating}</span>
          <span className="text-slate-600">({vendor.reviews})</span>
        </div>
        <span className="text-slate-700">·</span>
        <span className="truncate">{vendor.location}</span>
        <span className="text-slate-700">·</span>
        <span className="flex-shrink-0">Replies {vendor.responseTime}</span>
      </div>
    </div>
  );
}

function categorySlug(title: string): string {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, "-");
}

export default function MoversPage() {
  const router = useRouter();

  const scrollTo = (slug: string) => {
    const el = document.getElementById(slug);
    if (!el) return;
    const y = el.getBoundingClientRect().top + window.scrollY - 116;
    window.scrollTo({ top: y, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sticky header */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-20">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
          <span className="font-bold text-base tracking-tight text-slate-900">
            Realocate<span className="text-emerald-500">.ai</span>
          </span>
          <button
            onClick={() => router.back()}
            className="text-xs text-gray-400 hover:text-sky-500 transition-colors"
          >
            ← Back to my journey
          </button>
        </div>
        {/* Pill nav */}
        <div className="flex gap-2 overflow-x-auto px-4 pb-3" style={{ scrollbarWidth: "none" }}>
          {VENDOR_CATEGORIES.map((cat) => (
            <button
              key={cat.title}
              onClick={() => scrollTo(categorySlug(cat.title))}
              className="flex-shrink-0 flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full border border-gray-200 bg-gray-50 hover:border-sky-300 hover:bg-sky-50 hover:text-sky-700 text-gray-600 transition-colors"
            >
              <span>{cat.emoji}</span>
              <span>{cat.title}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6">
        {/* Hero */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Help Before You Go</h1>
          <p className="text-gray-500 text-sm leading-relaxed">
            Specialists for the move itself. Contact direct, no middlemen.
          </p>
        </div>

        {/* Category sections */}
        <div className="space-y-8">
          {VENDOR_CATEGORIES.map((cat) => (
            <div key={cat.title} id={categorySlug(cat.title)}>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xl">{cat.emoji}</span>
                <h2 className="font-semibold text-base text-gray-900">{cat.title}</h2>
                <span className="text-xs text-gray-400">·</span>
                <span className="text-xs text-gray-400">{cat.vendors.length} available</span>
              </div>
              <div className="space-y-2">
                {cat.vendors.map((v) => (
                  <VendorCard key={v.name} vendor={v} />
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-10 bg-slate-800 border border-slate-700 rounded-2xl p-6 text-center">
          <p className="text-white font-bold text-base mb-1">Are you a relocation service provider?</p>
          <p className="text-slate-400 text-xs mb-4 leading-relaxed">
            Get matched with relocators actively planning their move.
          </p>
          <button
            disabled
            className="bg-sky-500 text-white text-sm font-semibold px-6 py-2.5 rounded-xl opacity-60 cursor-not-allowed"
          >
            Register as a vendor — coming soon
          </button>
        </div>
      </div>
    </div>
  );
}
