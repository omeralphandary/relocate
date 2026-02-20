"use client";

interface Props {
  userName: string | null;
  destination: string;
  totalCount: number;
  categoryCount: number;
  firstCategory: string;
  onDismiss: () => void;
}

const FIRST_CATEGORY_HINT: Record<string, string> = {
  telecom: "get a local SIM — you'll need it on day 1",
  housing: "sort your accommodation before anything else",
  banking: "open a local bank account early",
  legal: "start your residency paperwork now",
  insurance: "register for health cover",
  transport: "handle your driving licence conversion",
  education: "enrol in school or language classes",
};

export default function AIGreetingCard({ userName, destination, totalCount, categoryCount, firstCategory, onDismiss }: Props) {
  const first = userName?.split(" ")[0] ?? "there";
  const hint = FIRST_CATEGORY_HINT[firstCategory] ?? `start with ${firstCategory}`;

  return (
    <div className="rounded-2xl border border-emerald-200 bg-gradient-to-br from-emerald-50 to-white p-4 flex items-start gap-3 relative shadow-sm">
      {/* Avatar */}
      <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center flex-shrink-0 mt-0.5">
        <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.347.347a3.75 3.75 0 01-5.303 0l-.347-.347z" />
        </svg>
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-slate-900 leading-snug">
          Hi {first} — your {destination} journey is ready.
        </p>
        <p className="text-xs text-slate-500 mt-1 leading-relaxed">
          I&apos;ve mapped{" "}
          <span className="font-medium text-slate-700">{totalCount} tasks</span> across{" "}
          <span className="font-medium text-slate-700">{categoryCount} categories</span> based on your profile.
          Start with{" "}
          <span className="font-medium text-emerald-600">{hint}</span>.
        </p>
      </div>

      {/* Dismiss */}
      <button
        onClick={onDismiss}
        className="text-slate-300 hover:text-slate-500 transition-colors flex-shrink-0 mt-0.5"
        aria-label="Dismiss"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}
