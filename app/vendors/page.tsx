"use client";

import { useRouter } from "next/navigation";
import { useRef } from "react";

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
    emoji: "⚖️",
    title: "Legal & Immigration",
    desc: "Visa consultants, immigration lawyers, residency specialists.",
    vendors: [
      {
        name: "Expat Legal Group",
        tagline: "Residency permits, work visas & biometric appointments handled end-to-end.",
        rating: 4.9,
        reviews: 312,
        priceRange: "€300–800",
        location: "Prague / Remote",
        responseTime: "< 2 hrs",
        languages: ["EN", "CZ", "DE"],
        verified: true,
      },
      {
        name: "VizaPoint",
        tagline: "Fast-track visa applications for EU & Schengen countries.",
        rating: 4.7,
        reviews: 189,
        priceRange: "€150–400",
        location: "Remote",
        responseTime: "< 4 hrs",
        languages: ["EN", "RU", "UK"],
        verified: true,
      },
      {
        name: "Borders & Beyond",
        tagline: "Specialists in long-stay visas, blue cards and family reunification.",
        rating: 4.8,
        reviews: 97,
        priceRange: "€250–600",
        location: "Berlin / Prague",
        responseTime: "Same day",
        languages: ["EN", "DE", "CZ"],
        verified: false,
      },
    ],
  },
  {
    emoji: "🏠",
    title: "Housing & Real Estate",
    desc: "Local agents, property finders, short-term rentals.",
    vendors: [
      {
        name: "NestFinder Prague",
        tagline: "Apartment search, lease review and virtual tours for incoming expats.",
        rating: 4.8,
        reviews: 423,
        priceRange: "€200–500",
        location: "Prague",
        responseTime: "< 1 hr",
        languages: ["EN", "CZ", "FR"],
        verified: true,
      },
      {
        name: "Expat Homes",
        tagline: "Furnished short-term rentals from 1 week — no Czech required.",
        rating: 4.6,
        reviews: 218,
        priceRange: "€100–300",
        location: "Prague / Brno",
        responseTime: "< 3 hrs",
        languages: ["EN", "DE"],
        verified: true,
      },
      {
        name: "ReloProp",
        tagline: "Property finder service — we shortlist, you choose.",
        rating: 4.7,
        reviews: 141,
        priceRange: "€300–700",
        location: "Remote + on-site",
        responseTime: "< 6 hrs",
        languages: ["EN", "ES", "CZ"],
        verified: false,
      },
    ],
  },
  {
    emoji: "🏦",
    title: "Banking & Finance",
    desc: "Account setup services, financial advisors, tax consultants.",
    vendors: [
      {
        name: "ExpatAccount.eu",
        tagline: "Bank account setup guaranteed within 5 business days — any nationality.",
        rating: 4.9,
        reviews: 537,
        priceRange: "€80–200",
        location: "Remote",
        responseTime: "< 1 hr",
        languages: ["EN", "CZ", "PL"],
        verified: true,
      },
      {
        name: "TaxNomad",
        tagline: "Tax registration, annual returns and social insurance for expat employees.",
        rating: 4.7,
        reviews: 204,
        priceRange: "€150–350",
        location: "Remote",
        responseTime: "< 4 hrs",
        languages: ["EN", "DE", "SK"],
        verified: true,
      },
    ],
  },
  {
    emoji: "🌐",
    title: "Translation & Language",
    desc: "Certified document translators, language tutors, notarisation.",
    vendors: [
      {
        name: "CertifiedTranslate",
        tagline: "Sworn translations accepted by Czech authorities — 48-hour turnaround.",
        rating: 4.9,
        reviews: 682,
        priceRange: "€40–180",
        location: "Remote",
        responseTime: "< 2 hrs",
        languages: ["EN", "CZ", "DE", "FR", "ES"],
        verified: true,
      },
      {
        name: "LingoLocal",
        tagline: "1-on-1 Czech language coaching for expats — beginner to B1.",
        rating: 4.8,
        reviews: 319,
        priceRange: "€30–60/hr",
        location: "Prague / Online",
        responseTime: "< 3 hrs",
        languages: ["EN", "CZ"],
        verified: true,
      },
      {
        name: "DocuNotary",
        tagline: "Apostille, notarisation and legalisation for international documents.",
        rating: 4.6,
        reviews: 127,
        priceRange: "€60–200",
        location: "Prague",
        responseTime: "Same day",
        languages: ["EN", "CZ", "RU"],
        verified: false,
      },
    ],
  },
  {
    emoji: "📦",
    title: "Moving & Storage",
    desc: "International movers, freight forwarders, storage units.",
    vendors: [
      {
        name: "MoveEU",
        tagline: "Door-to-door international moves across 40 countries — fixed price quotes.",
        rating: 4.7,
        reviews: 891,
        priceRange: "€800–3,500",
        location: "Pan-European",
        responseTime: "< 6 hrs",
        languages: ["EN", "DE", "PL", "CZ"],
        verified: true,
      },
      {
        name: "BoxDrop Storage",
        tagline: "Short-term storage from 1 week while you settle in.",
        rating: 4.5,
        reviews: 213,
        priceRange: "€60–150/mo",
        location: "Prague",
        responseTime: "< 4 hrs",
        languages: ["EN", "CZ"],
        verified: true,
      },
    ],
  },
  {
    emoji: "🏥",
    title: "Healthcare",
    desc: "Expat doctors, health insurance brokers, private clinics.",
    vendors: [
      {
        name: "ExpatMed Prague",
        tagline: "English-speaking GPs, specialists and same-day appointments.",
        rating: 4.9,
        reviews: 474,
        priceRange: "€60–200/visit",
        location: "Prague 1 & 2",
        responseTime: "< 2 hrs",
        languages: ["EN", "CZ", "DE", "RU"],
        verified: true,
      },
      {
        name: "GlobalCover Insurance",
        tagline: "Expat health insurance — compare & enrol in 10 minutes.",
        rating: 4.7,
        reviews: 338,
        priceRange: "€50–200/mo",
        location: "Remote",
        responseTime: "< 1 hr",
        languages: ["EN", "DE", "FR"],
        verified: true,
      },
    ],
  },
  {
    emoji: "🎓",
    title: "School & Childcare",
    desc: "International school advisors, childcare placement, tutors.",
    vendors: [
      {
        name: "SchoolMatch",
        tagline: "Curated shortlist of international schools with tours and enrolment support.",
        rating: 4.8,
        reviews: 156,
        priceRange: "€200–500",
        location: "Remote + on-site",
        responseTime: "< 4 hrs",
        languages: ["EN", "CZ", "DE"],
        verified: true,
      },
      {
        name: "KinderConnect",
        tagline: "Nursery and after-school placement for expat families.",
        rating: 4.7,
        reviews: 98,
        priceRange: "€150–350",
        location: "Prague",
        responseTime: "< 6 hrs",
        languages: ["EN", "CZ"],
        verified: false,
      },
    ],
  },
  {
    emoji: "🚗",
    title: "Transport & Driving",
    desc: "Licence conversion specialists, car import agents, leasing.",
    vendors: [
      {
        name: "LicenceSwap",
        tagline: "Foreign driving licence exchange — paperwork, appointments, done.",
        rating: 4.8,
        reviews: 267,
        priceRange: "€120–300",
        location: "Remote",
        responseTime: "< 3 hrs",
        languages: ["EN", "CZ", "UK", "RU"],
        verified: true,
      },
      {
        name: "ExpatWheels",
        tagline: "Short-term car leasing and import advice for new arrivals.",
        rating: 4.6,
        reviews: 143,
        priceRange: "€300–600/mo",
        location: "Prague",
        responseTime: "Same day",
        languages: ["EN", "CZ", "DE"],
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
    <div className="bg-slate-800 border border-slate-700 rounded-xl p-4">
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-semibold text-sm text-white">{vendor.name}</span>
          {vendor.verified && (
            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-400/10 border border-emerald-400/20 px-1.5 py-0.5 rounded-full">
              <svg className="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              Verified
            </span>
          )}
        </div>
        <span className="text-xs text-slate-400 whitespace-nowrap flex-shrink-0">{vendor.priceRange}</span>
      </div>

      <p className="text-xs text-slate-400 leading-relaxed mb-3">{vendor.tagline}</p>

      <div className="flex items-center gap-3 flex-wrap text-xs text-slate-500">
        <div className="flex items-center gap-1">
          <StarRating rating={vendor.rating} />
          <span className="text-amber-400 font-semibold">{vendor.rating}</span>
          <span className="text-slate-600">({vendor.reviews})</span>
        </div>
        <span className="text-slate-700">·</span>
        <span>{vendor.location}</span>
        <span className="text-slate-700">·</span>
        <span>Replies {vendor.responseTime}</span>
        <span className="text-slate-700">·</span>
        <span>{vendor.languages.join(", ")}</span>
      </div>

      <button className="mt-3 w-full text-xs font-semibold bg-emerald-500 hover:bg-emerald-600 text-white py-2 rounded-lg transition-colors">
        Contact vendor
      </button>
    </div>
  );
}

function categorySlug(title: string): string {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, "-");
}

export default function VendorsPage() {
  const router = useRouter();
  const navRef = useRef<HTMLDivElement>(null);

  const scrollTo = (slug: string) => {
    const el = document.getElementById(slug);
    if (!el) return;
    // offset for sticky header (header ~60px + pill nav ~48px)
    const y = el.getBoundingClientRect().top + window.scrollY - 120;
    window.scrollTo({ top: y, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-20">
        <div className="max-w-2xl mx-auto px-4 py-5 flex items-center justify-between">
          <span className="font-bold text-base tracking-tight text-slate-900">
            Realocate<span className="text-emerald-500">.ai</span>
          </span>
          <button
            onClick={() => router.back()}
            className="text-xs text-gray-400 hover:text-emerald-500 transition-colors"
          >
            ← Back to my journey
          </button>
        </div>

        {/* Category pill nav */}
        <div
          ref={navRef}
          className="flex gap-2 overflow-x-auto px-4 pb-3 scrollbar-hide"
          style={{ scrollbarWidth: "none" }}
        >
          {VENDOR_CATEGORIES.map((cat) => (
            <button
              key={cat.title}
              onClick={() => scrollTo(categorySlug(cat.title))}
              className="flex-shrink-0 flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full border border-gray-200 bg-gray-50 hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700 text-gray-600 transition-colors"
            >
              <span>{cat.emoji}</span>
              <span>{cat.title}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Hero */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Help on the Ground</h1>
          <p className="text-gray-500 text-sm leading-relaxed">
            Vetted, rated local experts for every step of your move. No cold calls, no agencies.
            Contact directly, pay transparently.
          </p>
        </div>

        {/* Category sections */}
        <div className="space-y-10">
          {VENDOR_CATEGORIES.map((cat) => (
            <div key={cat.title} id={categorySlug(cat.title)}>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xl">{cat.emoji}</span>
                <h2 className="font-semibold text-base text-gray-900">{cat.title}</h2>
                <span className="text-xs text-gray-400">·</span>
                <span className="text-xs text-gray-400">{cat.vendors.length} available</span>
              </div>
              <div className="space-y-3">
                {cat.vendors.map((v) => (
                  <VendorCard key={v.name} vendor={v} />
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-10 bg-slate-800 border border-slate-700 rounded-2xl p-6 text-center">
          <p className="text-white font-bold text-base mb-1">Are you a local service provider?</p>
          <p className="text-slate-400 text-xs mb-4 leading-relaxed">
            Join the Realocate vendor network. Get matched with relocators who need exactly what you offer.
          </p>
          <button
            disabled
            className="bg-emerald-500 text-white text-sm font-semibold px-6 py-2.5 rounded-xl opacity-60 cursor-not-allowed"
          >
            Register as a vendor — coming soon
          </button>
        </div>
      </div>
    </div>
  );
}
