export default function Maintenance() {
  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col overflow-hidden">

      {/* Ambient gradient */}
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_90%_60%_at_50%_-15%,rgba(16,185,129,0.10),transparent)]" />

      <div className="relative z-10 flex-1 flex flex-col items-center justify-center text-center px-6">

        {/* Logo */}
        <span className="font-bold text-xl tracking-tight mb-16">
          Realocate<span className="text-emerald-400">.ai</span>
        </span>

        {/* Icon */}
        <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-8">
          <svg className="w-7 h-7 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11.42 15.17L17.25 21A2.652 2.652 0 0021 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 11-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 004.486-6.336l-3.276 3.277a3.004 3.004 0 01-2.25-2.25l3.276-3.276a4.5 4.5 0 00-6.336 4.486c.091 1.076-.071 2.264-.904 2.95l-.102.085m-1.745 1.437L5.909 7.5H4.5L2.25 3.75l1.5-1.5L7.5 4.5v1.409l4.26 4.26m-1.745 1.437l1.745-1.437m6.615 8.206L15.75 15.75M4.867 19.125h.008v.008h-.008v-.008z" />
          </svg>
        </div>

        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-4">
          We&apos;ll be back shortly.
        </h1>

        <p className="text-slate-400 text-base max-w-md leading-relaxed mb-10">
          Realocate.ai is down for scheduled maintenance. We&apos;re making improvements
          to give you a better experience. Check back in a little while.
        </p>

        {/* Status indicator */}
        <div className="inline-flex items-center gap-2.5 bg-white/[0.04] border border-white/[0.08] rounded-full px-5 py-2.5 text-sm text-slate-400">
          <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
          Maintenance in progress
        </div>

      </div>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/[0.07] text-center text-xs text-slate-700 py-5">
        © 2026 Realocate.ai
      </footer>

    </div>
  );
}
