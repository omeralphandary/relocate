"use client";

interface Props {
  onClose: () => void;
}

export default function BetaWelcomeModal({ onClose }: Props) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Card */}
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-sm w-full p-8 text-center">

        {/* Badge */}
        <div className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-600 text-xs font-bold px-3 py-1.5 rounded-full border border-emerald-100 mb-6 tracking-wide uppercase">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          Beta access
        </div>

        <h2 className="text-2xl font-bold text-slate-900 mb-3 tracking-tight">
          You&apos;re in — and it&apos;s on us.
        </h2>

        <p className="text-slate-500 text-sm leading-relaxed mb-6">
          Realocate.ai is free during beta. Full AI enrichment, all tasks,
          every corridor — no credit card, no catch. We&apos;ll let you know
          before anything changes.
        </p>

        {/* Features */}
        <ul className="text-left space-y-2.5 mb-8">
          {[
            "Full personalised relocation journey",
            "AI-powered task enrichment",
            "Document checklists for every step",
            "Dependency-ordered task guide",
          ].map((f) => (
            <li key={f} className="flex items-center gap-2.5 text-sm text-slate-600">
              <span className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center flex-shrink-0 text-[10px] font-bold">✓</span>
              {f}
            </li>
          ))}
        </ul>

        <button
          onClick={onClose}
          className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold rounded-xl transition-colors text-sm"
        >
          Let&apos;s get started →
        </button>

        <p className="text-xs text-slate-400 mt-3">
          No credit card required during beta.
        </p>
      </div>
    </div>
  );
}
