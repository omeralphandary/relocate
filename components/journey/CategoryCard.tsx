"use client";

import { useState } from "react";
import TaskCard from "./TaskCard";
import DonutProgress from "./DonutProgress";
import { JourneyTask, taskOrder, taskTitle } from "./JourneyView";

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
  onEnrichTask: (id: string) => Promise<void>;
  isLocked: (task: JourneyTask) => boolean;
  isAddingTask: boolean;
  onStartAddTask: () => void;
  onCancelAddTask: () => void;
  onAddTask: (category: string, title: string) => Promise<void>;
  onDeleteTask: (id: string) => void;
}

function AddTaskForm({
  category,
  onAdd,
  onCancel,
}: {
  category: string;
  onAdd: (category: string, title: string) => Promise<void>;
  onCancel: () => void;
}) {
  const [value, setValue] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!value.trim()) return;
    setSubmitting(true);
    setError(null);
    try {
      await onAdd(category, value.trim());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add task. Try again.");
      setSubmitting(false);
    }
  };

  return (
    <div className="rounded-xl border border-violet-200 bg-violet-50/60 p-3 space-y-2">
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => { if (e.key === "Enter") handleSubmit(); if (e.key === "Escape") onCancel(); }}
        placeholder="Describe your task…"
        className="w-full text-sm bg-white border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-violet-300 focus:border-transparent"
        autoFocus
        disabled={submitting}
      />
      {error && <p className="text-xs text-red-400">{error}</p>}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={handleSubmit}
          disabled={submitting || !value.trim()}
          className="inline-flex items-center gap-1.5 text-xs font-medium bg-violet-500 text-white px-3 py-1.5 rounded-lg hover:bg-violet-600 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {submitting ? (
            <>
              <svg className="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
              Adding…
            </>
          ) : (
            <>✦ Add with AI</>
          )}
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={submitting}
          className="text-xs text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-40"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

export default function CategoryCard({
  category,
  meta,
  tasks,
  defaultOpen = false,
  onToggleTask,
  onEnrichTask,
  isLocked,
  isAddingTask,
  onStartAddTask,
  onCancelAddTask,
  onAddTask,
  onDeleteTask,
}: CategoryCardProps) {
  const [open, setOpen] = useState(defaultOpen);

  const completed = tasks.filter((t) => t.status === "COMPLETED").length;
  const total = tasks.length;
  const pct = total > 0 ? (completed / total) * 100 : 0;
  const allDone = completed === total;

  const sortedTasks = [...tasks].sort((a, b) => taskOrder(a) - taskOrder(b));

  return (
    <div
      className={`rounded-2xl border transition-all duration-200 overflow-hidden
        ${allDone ? "border-emerald-200 bg-emerald-50/40" : "border-gray-200 bg-white"}
        ${open ? "shadow-sm" : ""}
      `}
    >
      {/* Header */}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center gap-4 px-5 py-4 text-left"
      >
        <span className="text-2xl flex-shrink-0">{meta.emoji}</span>

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

      {/* Task list */}
      {open && (
        <div className="px-5 pb-4 space-y-2 border-t border-gray-100 pt-3">
          {sortedTasks.map((task) => (
            <TaskCard
              key={task.id}
              id={task.id}
              title={taskTitle(task)}
              description={task.isCustom ? (task.customDescription ?? "") : (task.template?.description ?? "")}
              documents={task.isCustom ? [] : (task.template?.documents ?? [])}
              officialUrl={task.isCustom ? null : (task.template?.officialUrl ?? null)}
              tips={task.isCustom ? null : (task.template?.tips ?? null)}
              completed={task.status === "COMPLETED"}
              locked={isLocked(task)}
              isCustom={task.isCustom}
              aiInstructions={task.aiInstructions}
              aiDocuments={task.aiDocuments}
              aiTips={task.aiTips}
              onToggle={onToggleTask}
              onEnrich={onEnrichTask}
              onDelete={onDeleteTask}
            />
          ))}

          {isAddingTask ? (
            <AddTaskForm
              category={category}
              onAdd={onAddTask}
              onCancel={onCancelAddTask}
            />
          ) : (
            <button
              type="button"
              onClick={onStartAddTask}
              className="w-full text-left text-xs text-gray-400 hover:text-violet-500 transition-colors py-1.5 flex items-center gap-1.5"
            >
              <span className="text-base leading-none">+</span>
              Add a task
            </button>
          )}
        </div>
      )}
    </div>
  );
}
