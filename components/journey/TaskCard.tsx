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
  onToggle: (id: string, completed: boolean) => void;
}

export default function TaskCard({
  id, title, description, documents, officialUrl, tips, completed, onToggle,
}: TaskCardProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className={`rounded-xl border transition-all duration-200 ${completed ? "border-gray-100 bg-gray-50" : "border-gray-200 bg-white"}`}>
      <div className="flex items-start gap-3 p-4">
        {/* Checkbox */}
        <button
          type="button"
          onClick={() => onToggle(id, !completed)}
          className={`
            mt-0.5 flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all
            ${completed
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
        </button>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <span className={`font-medium text-sm ${completed ? "line-through text-gray-400" : "text-gray-900"}`}>
              {title}
            </span>
            <button
              type="button"
              onClick={() => setExpanded((e) => !e)}
              className="text-gray-400 hover:text-gray-600 flex-shrink-0 transition-colors"
            >
              <svg
                className={`w-4 h-4 transition-transform duration-200 ${expanded ? "rotate-180" : ""}`}
                fill="none" viewBox="0 0 24 24" stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>

          {!expanded && (
            <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">{description}</p>
          )}
        </div>
      </div>

      {/* Expanded details */}
      {expanded && (
        <div className="px-4 pb-4 ml-8 space-y-3">
          <p className="text-sm text-gray-600">{description}</p>

          {documents.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Required documents</p>
              <ul className="space-y-1">
                {documents.map((doc) => (
                  <li key={doc} className="flex items-center gap-2 text-sm text-gray-600">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-300 flex-shrink-0" />
                    {doc}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {tips && (
            <div className="bg-amber-50 border border-amber-100 rounded-lg p-3">
              <p className="text-xs font-semibold text-amber-700 mb-1">Tip</p>
              <p className="text-xs text-amber-800">{tips}</p>
            </div>
          )}

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
        </div>
      )}
    </div>
  );
}
