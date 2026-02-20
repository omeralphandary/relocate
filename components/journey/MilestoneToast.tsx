"use client";

import { useEffect, useState } from "react";

type Level = "first-task" | "category";

interface Props {
  level: Level;
  categoryLabel?: string;
  userName: string | null;
  onDismiss: () => void;
}

const CATEGORY_EMOJI: Record<string, string> = {
  telecom: "📱",
  housing: "🏠",
  banking: "🏦",
  insurance: "🛡️",
  legal: "⚖️",
  transport: "🚗",
  education: "🎓",
};

export default function MilestoneToast({ level, categoryLabel, userName, onDismiss }: Props) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Animate in
    const t1 = setTimeout(() => setVisible(true), 30);
    // Auto-dismiss
    const delay = level === "category" ? 4500 : 3000;
    const t2 = setTimeout(() => {
      setVisible(false);
      setTimeout(onDismiss, 300);
    }, delay);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [level, onDismiss]);

  const first = userName?.split(" ")[0] ?? null;

  const isCategory = level === "category";
  const emoji = isCategory ? (CATEGORY_EMOJI[categoryLabel?.toLowerCase() ?? ""] ?? "✅") : "🚀";

  const title = isCategory
    ? `${categoryLabel} complete!`
    : "First task done!";

  const body = isCategory
    ? `${first ? `Well done, ${first}.` : "Well done."} Keep the momentum going.`
    : `${first ? `Nice one, ${first}.` : "Nice one."} Your relocation has started.`;

  return (
    <div
      className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 transition-all duration-300 ${
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
      }`}
    >
      <div className={`flex items-center gap-3 rounded-2xl shadow-lg px-5 py-3.5 border ${
        isCategory
          ? "bg-slate-900 border-slate-700 text-white"
          : "bg-white border-gray-100 text-slate-900"
      }`}>
        <span className="text-xl">{emoji}</span>
        <div>
          <p className={`text-sm font-semibold ${isCategory ? "text-white" : "text-slate-900"}`}>{title}</p>
          <p className={`text-xs mt-0.5 ${isCategory ? "text-slate-400" : "text-slate-500"}`}>{body}</p>
        </div>
        <button
          onClick={() => { setVisible(false); setTimeout(onDismiss, 300); }}
          className={`ml-2 ${isCategory ? "text-slate-500 hover:text-slate-300" : "text-gray-300 hover:text-gray-500"} transition-colors`}
          aria-label="Dismiss"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
}
