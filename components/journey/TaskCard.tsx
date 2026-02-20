"use client";

import { useState } from "react";

interface TaskCardProps {
  id: string;
  title: string;
  description: string;
  documents: string[];
  officialUrl?: string | null;
  tips?: string | null;
  completed: boolean;
  locked?: boolean;
  blockingNames?: string[];
  isCustom?: boolean;
  aiInstructions?: string | null;
  aiDocuments?: string[];
  aiTips?: string | null;
  onToggle: (id: string, completed: boolean) => void;
  onEnrich: (id: string) => Promise<void>;
  onDelete?: (id: string) => void;
}

export default function TaskCard({
  id, title, description, documents, officialUrl, tips, completed, locked = false,
  blockingNames = [],
  isCustom = false,
  aiInstructions, aiDocuments, aiTips,
  onToggle, onEnrich, onDelete,
}: TaskCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [enriching, setEnriching] = useState(false);
  const [enrichError, setEnrichError] = useState<string | null>(null);

  const hasAI = !!aiInstructions;
  const shownDocuments = (hasAI && aiDocuments && aiDocuments.length > 0) ? aiDocuments : documents;
  const shownTips = hasAI ? aiTips : tips;

  const handleEnrich = async () => {
    setEnriching(true);
    setEnrichError(null);
    try {
      await onEnrich(id);
    } catch {
      setEnrichError("Couldn't generate guidance. Try again.");
    } finally {
      setEnriching(false);
    }
  };

  return (
    <div className={`rounded-xl border transition-all duration-200 ${
      locked
        ? "border-amber-100 bg-gray-50 opacity-70"
        : completed
          ? "border-gray-100 bg-gray-50"
          : "border-gray-200 bg-white"
    }`}>
      <div className="flex items-start gap-3 p-4">
        {/* Checkbox */}
        <button
          type="button"
          onClick={() => !locked && onToggle(id, !completed)}
          disabled={locked}
          className={`
            mt-0.5 flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all
            ${locked
              ? "border-gray-200 cursor-not-allowed"
              : completed
                ? "bg-emerald-500 border-emerald-500"
                : "border-gray-300 hover:border-emerald-300"
            }
          `}
        >
          {completed && (
            <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          )}
          {locked && !completed && (
            <svg className="w-3 h-3 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          )}
        </button>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0 flex-wrap">
              <span className={`font-medium text-sm ${completed ? "line-through text-gray-400" : locked ? "text-gray-500" : "text-gray-900"}`}>
                {title}
              </span>
              {hasAI && (
                <span className="flex-shrink-0 text-xs bg-violet-50 text-violet-500 border border-violet-100 px-1.5 py-0.5 rounded-full font-medium">
                  ✦ AI
                </span>
              )}
              {locked && blockingNames.length > 0 && (
                <span className="flex-shrink-0 inline-flex items-center gap-1 text-[10px] font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded-full">
                  🔒 {blockingNames.length === 1
                    ? `After: ${blockingNames[0]}`
                    : `After ${blockingNames.length} tasks`}
                </span>
              )}
            </div>
            <div className="flex items-center gap-1 flex-shrink-0">
              {isCustom && onDelete && (
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); onDelete(id); }}
                  className="text-gray-300 hover:text-red-400 transition-colors text-base leading-none px-1"
                  title="Delete task"
                >
                  ×
                </button>
              )}
              <button
                type="button"
                onClick={() => setExpanded((e) => !e)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg
                  className={`w-4 h-4 transition-transform duration-200 ${expanded ? "rotate-180" : ""}`}
                  fill="none" viewBox="0 0 24 24" stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            </div>
          </div>

          {!expanded && (
            <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">
              {locked ? "Expand to see details" : description}
            </p>
          )}
        </div>
      </div>

      {/* Expanded details */}
      {expanded && (
        <div className="px-4 pb-4 ml-8 space-y-3">

          {/* Locked callout */}
          {locked && (
            <div className="bg-amber-50 border border-amber-100 rounded-lg p-3">
              <p className="text-xs font-semibold text-amber-700 mb-1">Locked</p>
              <p className="text-xs text-amber-800">
                {blockingNames.length > 0
                  ? `Complete these first: ${blockingNames.join(", ")}`
                  : "Complete the required tasks first."}
              </p>
            </div>
          )}

          {/* AI instructions (preferred) or base description */}
          {hasAI ? (
            <div className="space-y-1">
              <p className="text-xs font-semibold text-violet-500 uppercase tracking-wide">✦ AI Guidance</p>
              <p className="text-sm text-gray-700 leading-relaxed">{aiInstructions}</p>
            </div>
          ) : (
            <p className="text-sm text-gray-600">{description}</p>
          )}

          {/* Documents */}
          {shownDocuments.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Required documents</p>
              <ul className="space-y-1">
                {shownDocuments.map((doc) => (
                  <li key={doc} className="flex items-center gap-2 text-sm text-gray-600">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-300 flex-shrink-0" />
                    {doc}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Tips */}
          {shownTips && (
            <div className={`border rounded-lg p-3 ${hasAI ? "bg-violet-50 border-violet-100" : "bg-amber-50 border-amber-100"}`}>
              <p className={`text-xs font-semibold mb-1 ${hasAI ? "text-violet-600" : "text-amber-700"}`}>
                {hasAI ? "✦ Personalised tip" : "Tip"}
              </p>
              <p className={`text-xs ${hasAI ? "text-violet-800" : "text-amber-800"}`}>{shownTips}</p>
            </div>
          )}

          {/* Official link */}
          {officialUrl && (
            <a
              href={officialUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-500 hover:text-emerald-700 transition-colors"
            >
              Official source
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          )}

          {/* AI enrich button */}
          {!locked && (
            <div className="pt-1 border-t border-gray-100">
              {enrichError && <p className="text-xs text-red-400 mb-2">{enrichError}</p>}
              <button
                type="button"
                onClick={handleEnrich}
                disabled={enriching}
                className="inline-flex items-center gap-1.5 text-xs font-medium text-violet-500 hover:text-violet-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {enriching ? (
                  <>
                    <svg className="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                    </svg>
                    Generating guidance...
                  </>
                ) : (
                  <>
                    <span>✦</span>
                    {hasAI || isCustom ? "Refresh AI guidance" : "Get AI guidance"}
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
