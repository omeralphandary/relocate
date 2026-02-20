"use client";

import { useRouter } from "next/navigation";

const VENDOR_CATEGORIES = [
  {
    emoji: "⚖️",
    title: "Legal & Immigration",
    desc: "Visa consultants, immigration lawyers, residency specialists.",
    tags: ["Visa advice", "Residency permits", "Work permits"],
  },
  {
    emoji: "🏠",
    title: "Housing & Real Estate",
    desc: "Local agents, property finders, short-term rentals.",
    tags: ["Apartment search", "Lease review", "Temporary housing"],
  },
  {
    emoji: "🏦",
    title: "Banking & Finance",
    desc: "Account setup services, financial advisors, tax consultants.",
    tags: ["Bank account", "Tax registration", "Money transfer"],
  },
  {
    emoji: "🌐",
    title: "Translation & Language",
    desc: "Certified document translators, language tutors, notarisation.",
    tags: ["Document translation", "Certified notary", "Language coaching"],
  },
  {
    emoji: "📦",
    title: "Moving & Storage",
    desc: "International movers, freight forwarders, storage units.",
    tags: ["International freight", "Storage", "Packing services"],
  },
  {
    emoji: "🏥",
    title: "Healthcare",
    desc: "Expat doctors, health insurance brokers, private clinics.",
    tags: ["GP registration", "Health insurance", "Expat clinics"],
  },
  {
    emoji: "🎓",
    title: "School & Childcare",
    desc: "International school advisors, childcare placement, tutors.",
    tags: ["School enrollment", "Childcare", "Private tutors"],
  },
  {
    emoji: "🚗",
    title: "Transport & Driving",
    desc: "Licence conversion specialists, car import agents, leasing.",
    tags: ["Licence exchange", "Car import", "Leasing"],
  },
];

export default function VendorsPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-10">
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
      </div>

      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Hero */}
        <div className="mb-8">
          <div className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-600 text-xs font-semibold px-3 py-1 rounded-full border border-emerald-100 mb-4">
            <span>🗺️</span>
            <span>Coming soon</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Help on the Ground</h1>
          <p className="text-gray-500 text-sm leading-relaxed">
            Vetted, rated local experts for every step of your move — legal, housing, banking, and more.
            No cold calls, no agencies. Book directly, pay transparently.
          </p>
        </div>

        {/* Category grid */}
        <div className="space-y-3">
          {VENDOR_CATEGORIES.map((cat) => (
            <div
              key={cat.title}
              className="bg-slate-800 border border-slate-700 rounded-2xl p-4 flex items-start gap-4"
            >
              <div className="text-2xl flex-shrink-0 mt-0.5">{cat.emoji}</div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold text-sm text-white">{cat.title}</span>
                  <span className="text-[10px] font-bold text-amber-400 bg-amber-400/10 border border-amber-400/20 px-2 py-0.5 rounded-full tracking-wide">SOON</span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed mb-2">{cat.desc}</p>
                <div className="flex flex-wrap gap-1.5">
                  {cat.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-[10px] font-medium text-slate-400 bg-slate-700 border border-slate-600 px-2 py-0.5 rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-8 bg-slate-800 border border-slate-700 rounded-2xl p-6 text-center">
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
