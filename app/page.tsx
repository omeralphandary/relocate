import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Realocate.ai — Your personal relocation guide",
  description: "Stop juggling government websites and paperwork. Realocate.ai gives you a personalised, AI-powered relocation checklist tailored to your destination, nationality, and situation.",
  openGraph: {
    title: "Realocate.ai — Your personal relocation guide",
    description: "AI-powered relocation checklist. Housing, banking, legal, telecom — personalised for your move.",
    url: "https://realocate.ai",
  },
};

const FEATURES = [
  {
    icon: "✦",
    title: "AI-powered guidance",
    desc: "Every task is personalised to your nationality, employment, and family setup — not a generic checklist.",
  },
  {
    icon: "⟶",
    title: "Dependency-ordered",
    desc: "Tasks unlock in the right sequence. You'll never apply for a bank account before you have an address.",
  },
  {
    icon: "◈",
    title: "Document checklists",
    desc: "Know exactly what to bring to every appointment — no surprises at the desk.",
  },
  {
    icon: "◎",
    title: "Country-specific",
    desc: "Deep coverage for Czech Republic, Germany, and the US — with AI fallback for any destination.",
  },
];


export default function Home() {
  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col overflow-hidden">

      {/* Ambient gradient */}
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_90%_60%_at_50%_-15%,rgba(16,185,129,0.13),transparent)]" />

      {/* Nav */}
      <nav className="relative z-10 border-b border-white/[0.07] px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <span className="font-bold text-xl tracking-tight">
            Realocate<span className="text-emerald-400">.ai</span>
          </span>
          <div className="flex items-center gap-6">
            <Link
              href="/auth/signin"
              className="text-sm text-slate-400 hover:text-white transition-colors"
            >
              Sign in
            </Link>
            <Link
              href="/onboarding"
              className="text-sm font-semibold bg-white text-slate-900 px-4 py-2 rounded-xl hover:bg-slate-100 transition-colors"
            >
              Get started →
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <main className="relative z-10 flex-1 flex flex-col items-center text-center px-6 pt-24 pb-20">

        {/* Badge */}
        <div className="inline-flex items-center gap-2 bg-emerald-500/10 text-emerald-400 text-xs font-semibold px-4 py-1.5 rounded-full border border-emerald-500/20 mb-10 tracking-wide uppercase">
          ✈️ AI-powered relocation
        </div>

        {/* Heading */}
        <h1 className="text-5xl sm:text-7xl font-bold leading-[1.06] tracking-tight max-w-3xl">
          Relocating?<br />
          <span className="text-emerald-400">We'll handle the chaos.</span>
        </h1>

        <p className="mt-7 text-base sm:text-lg text-slate-400 max-w-lg leading-relaxed">
          Relocation is overwhelming. We break it down into the exact steps you need —
          ordered, personalised, and tailored to your destination and situation.
        </p>

        {/* CTA */}
        <Link
          href="/onboarding"
          className="mt-10 inline-flex items-center gap-2.5 px-8 py-4 bg-emerald-500 text-white rounded-2xl font-semibold text-base hover:bg-emerald-400 transition-colors shadow-xl shadow-emerald-500/20"
        >
          Start my journey
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
        </Link>
        <p className="mt-3 text-xs text-slate-600">3 minutes to a full relocation plan</p>

        {/* Feature cards */}
        <div className="mt-24 max-w-3xl w-full grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
          {FEATURES.map((f) => (
            <div
              key={f.title}
              className="group bg-white/[0.04] border border-white/[0.08] rounded-2xl p-6 hover:bg-white/[0.07] hover:border-white/[0.14] transition-all"
            >
              <div className="text-emerald-400 text-xl mb-4 font-mono">{f.icon}</div>
              <div className="font-semibold text-white mb-2">{f.title}</div>
              <div className="text-sm text-slate-400 leading-relaxed">{f.desc}</div>
            </div>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/[0.07] text-center text-xs text-slate-700 py-6 space-y-2">
        <p>© 2026 Realocate.ai. Your relocation, simplified.</p>
        <div className="flex items-center justify-center gap-4">
          <Link href="/privacy" className="hover:text-slate-400 transition-colors">Privacy Policy</Link>
          <span className="text-slate-800">·</span>
          <Link href="/terms" className="hover:text-slate-400 transition-colors">Terms of Service</Link>
        </div>
      </footer>
    </div>
  );
}
