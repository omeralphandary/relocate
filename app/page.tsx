import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Nav */}
      <nav className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
        <span className="text-emerald-500 font-bold text-lg tracking-tight">Relocate</span>
        <Link
          href="/onboarding"
          className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
        >
          Get started →
        </Link>
      </nav>

      {/* Hero */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 text-center max-w-2xl mx-auto py-20">
        <span className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-600 text-xs font-semibold px-3 py-1.5 rounded-full border border-emerald-100 mb-6">
          ✈️ Your personal relocation guide
        </span>

        <h1 className="text-3xl sm:text-5xl font-bold text-gray-900 leading-tight tracking-tight">
          Moving abroad?<br />
          <span className="text-emerald-500">We've got the checklist.</span>
        </h1>

        <p className="mt-5 text-base sm:text-lg text-gray-500 max-w-md leading-relaxed">
          Stop juggling government websites, bank appointments, and paperwork.
          Relocate gives you a personalised, step-by-step journey — tailored to
          your destination, nationality, and situation.
        </p>

        <Link
          href="/onboarding"
          className="mt-8 inline-flex items-center gap-2 px-8 py-4 bg-emerald-500 text-white rounded-2xl font-semibold text-base hover:bg-emerald-600 transition-colors shadow-sm"
        >
          Build my relocation plan
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
        </Link>

        <p className="mt-4 text-xs text-gray-400">Free to use · No account required</p>

        {/* Feature pills */}
        <div className="mt-14 flex flex-wrap justify-center gap-3">
          {[
            { emoji: "📋", text: "Dependency-ordered tasks" },
            { emoji: "🌍", text: "Country-specific guidance" },
            { emoji: "📊", text: "Track your progress" },
            { emoji: "📎", text: "Required documents list" },
          ].map(({ emoji, text }) => (
            <div
              key={text}
              className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-600 shadow-xs"
            >
              <span>{emoji}</span>
              <span>{text}</span>
            </div>
          ))}
        </div>
      </main>

      <footer className="text-center text-xs text-gray-400 py-6">
        Built for people who move.
      </footer>
    </div>
  );
}
