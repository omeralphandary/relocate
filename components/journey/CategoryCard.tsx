"use client";

import { useState } from "react";
import TaskCard from "./TaskCard";
import DonutProgress from "./DonutProgress";
import { JourneyTask } from "./JourneyView";

interface CategoryMeta {
  label: string;
  emoji: string;
  urgency: string;
  timeEstimate: string;
  color: string;
  donutColor: string;
}

interface CategoryCardProps {
  category: string;
  meta: CategoryMeta;
  tasks: JourneyTask[];
  defaultOpen?: boolean;
  onToggleTask: (id: string, completed: boolean) => void;
}

export default function CategoryCard({
  meta,
  tasks,
  defaultOpen = false,
  onToggleTask,
}: CategoryCardProps) {
  const [open, setOpen] = useState(defaultOpen);

  const completed = tasks.filter((t) => t.status === "COMPLETED").length;
  const total = tasks.length;
  const pct = total > 0 ? (completed / total) * 100 : 0;
  const allDone = completed === total;

  return (
    <div
      className={`rounded-2xl border transition-all duration-200 overflow-hidden
        ${allDone ? "border-emerald-200 bg-emerald-50/40" : "border-gray-200 bg-white"}
        ${open ? "shadow-sm" : ""}
      `}
    >
      {/* Header — always visible, click to toggle */}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center gap-4 px-5 py-4 text-left"
      >
        {/* Emoji */}
        <span className="text-2xl flex-shrink-0">{meta.emoji}</span>

        {/* Labels */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-gray-900">{meta.label}</span>
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${meta.color}`}>
              {meta.urgency}
            </span>
          </div>
          <div className="flex items-center gap-3 mt-0.5">
            <span className="text-xs text-gray-400">{meta.timeEstimate}</span>
            <span className="text-xs text-gray-300">·</span>
            <span className="text-xs text-gray-400">{completed}/{total} tasks</span>
          </div>
        </div>

        {/* Donut + chevron */}
        <div className="flex items-center gap-3 flex-shrink-0">
          <DonutProgress pct={pct} donutColor={meta.donutColor} />
          <svg
            className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
            fill="none" viewBox="0 0 24 24" stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>

      {/* Expandable task list */}
      {open && (
        <div className="px-5 pb-4 space-y-2 border-t border-gray-100 pt-3">
          {tasks
            .sort((a, b) => a.template.order - b.template.order)
            .map((task) => (
              <TaskCard
                key={task.id}
                id={task.id}
                title={task.template.title}
                description={task.template.description}
                documents={task.template.documents}
                officialUrl={task.template.officialUrl}
                tips={task.template.tips}
                completed={task.status === "COMPLETED"}
                onToggle={onToggleTask}
              />
            ))}
        </div>
      )}
    </div>
  );
}
