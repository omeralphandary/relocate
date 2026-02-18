"use client";

import { useState } from "react";
import TaskCard from "./TaskCard";

const CATEGORY_META: Record<string, { label: string; emoji: string; color: string }> = {
  housing:   { label: "Housing",   emoji: "🏠", color: "bg-blue-50 text-blue-700 border-blue-100" },
  banking:   { label: "Banking",   emoji: "🏦", color: "bg-green-50 text-green-700 border-green-100" },
  legal:     { label: "Legal",     emoji: "⚖️", color: "bg-purple-50 text-purple-700 border-purple-100" },
  telecom:   { label: "Telecom",   emoji: "📱", color: "bg-orange-50 text-orange-700 border-orange-100" },
  transport: { label: "Transport", emoji: "🚗", color: "bg-red-50 text-red-700 border-red-100" },
  insurance: { label: "Insurance", emoji: "🛡️", color: "bg-teal-50 text-teal-700 border-teal-100" },
};

export interface JourneyTask {
  id: string;
  status: string;
  template: {
    title: string;
    description: string;
    category: string;
    officialUrl: string | null;
    documents: string[];
    tips: string | null;
    order: number;
  };
}

interface JourneyViewProps {
  journeyId: string;
  title: string;
  origin: string;
  destination: string;
  tasks: JourneyTask[];
}

export default function JourneyView({ title, origin, destination, tasks: initialTasks }: JourneyViewProps) {
  const [tasks, setTasks] = useState(initialTasks);

  const completedCount = tasks.filter((t) => t.status === "COMPLETED").length;
  const totalCount = tasks.length;
  const progressPct = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  const handleToggle = async (taskId: string, completed: boolean) => {
    const newStatus = completed ? "COMPLETED" : "PENDING";

    // Optimistic update
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t))
    );

    try {
      await fetch(`/api/tasks/${taskId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
    } catch {
      // Revert on failure
      setTasks((prev) =>
        prev.map((t) => (t.id === taskId ? { ...t, status: completed ? "PENDING" : "COMPLETED" } : t))
      );
    }
  };

  // Group tasks by category
  const grouped = tasks.reduce<Record<string, JourneyTask[]>>((acc, task) => {
    const cat = task.template.category;
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(task);
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-2xl mx-auto px-4 py-6">
          <span className="text-emerald-500 font-semibold text-xs tracking-widest uppercase">Relocate</span>
          <h1 className="text-2xl font-bold text-gray-900 mt-1">{title}</h1>

          <div className="mt-4 flex items-center justify-between text-sm text-gray-500 mb-2">
            <span>{completedCount} of {totalCount} tasks completed</span>
            <span className="font-semibold text-gray-900">{Math.round(progressPct)}%</span>
          </div>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-2 bg-emerald-500 rounded-full transition-all duration-500"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>
      </div>

      {/* Task list */}
      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        {totalCount === 0 && (
          <div className="text-center py-16 text-gray-400">
            <p className="text-4xl mb-3">📋</p>
            <p className="font-medium">No tasks yet.</p>
            <p className="text-sm mt-1">Make sure the database is seeded.</p>
          </div>
        )}

        {Object.entries(grouped).map(([category, catTasks]) => {
          const meta = CATEGORY_META[category] ?? { label: category, emoji: "📌", color: "bg-gray-50 text-gray-700 border-gray-100" };
          const catCompleted = catTasks.filter((t) => t.status === "COMPLETED").length;

          return (
            <div key={category}>
              {/* Category header */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${meta.color}`}>
                    <span>{meta.emoji}</span>
                    {meta.label}
                  </span>
                </div>
                <span className="text-xs text-gray-400">
                  {catCompleted}/{catTasks.length}
                </span>
              </div>

              {/* Tasks */}
              <div className="space-y-2">
                {catTasks
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
                      onToggle={handleToggle}
                    />
                  ))}
              </div>
            </div>
          );
        })}

        {completedCount === totalCount && totalCount > 0 && (
          <div className="text-center py-10">
            <p className="text-4xl mb-3">🎉</p>
            <p className="text-lg font-bold text-gray-900">You've completed your relocation journey!</p>
            <p className="text-gray-500 text-sm mt-1">Welcome to {destination}.</p>
          </div>
        )}
      </div>
    </div>
  );
}
