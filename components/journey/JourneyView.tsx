"use client";

import { useState } from "react";
import CategoryCard from "./CategoryCard";

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

// Ordered by urgency + expected time-to-complete
const CATEGORY_ORDER = ["telecom", "housing", "banking", "insurance", "legal", "transport"];

const CATEGORY_META: Record<string, {
  label: string;
  emoji: string;
  urgency: string;
  timeEstimate: string;
  color: string;
  donutColor: string;
}> = {
  telecom:   { label: "Telecom",   emoji: "📱", urgency: "Day 1",     timeEstimate: "~30 min",    color: "bg-orange-50 text-orange-600 border-orange-200",  donutColor: "#f97316" },
  housing:   { label: "Housing",   emoji: "🏠", urgency: "Week 1",    timeEstimate: "2–4 weeks",  color: "bg-blue-50 text-blue-600 border-blue-200",        donutColor: "#3b82f6" },
  banking:   { label: "Banking",   emoji: "🏦", urgency: "Week 1–2",  timeEstimate: "3–5 days",   color: "bg-green-50 text-green-600 border-green-200",     donutColor: "#10b981" },
  insurance: { label: "Insurance", emoji: "🛡️", urgency: "Week 2",    timeEstimate: "1–2 days",   color: "bg-teal-50 text-teal-600 border-teal-200",        donutColor: "#14b8a6" },
  legal:     { label: "Legal",     emoji: "⚖️", urgency: "Month 1",   timeEstimate: "2–3 months", color: "bg-purple-50 text-purple-600 border-purple-200",   donutColor: "#8b5cf6" },
  transport: { label: "Transport", emoji: "🚗", urgency: "Month 1–2", timeEstimate: "1–4 weeks",  color: "bg-red-50 text-red-600 border-red-200",           donutColor: "#ef4444" },
};

export default function JourneyView({ title, destination, tasks: initialTasks }: JourneyViewProps) {
  const [tasks, setTasks] = useState(initialTasks);

  const completedCount = tasks.filter((t) => t.status === "COMPLETED").length;
  const totalCount = tasks.length;
  const progressPct = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  const handleToggle = async (taskId: string, completed: boolean) => {
    const newStatus = completed ? "COMPLETED" : "PENDING";
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
      setTasks((prev) =>
        prev.map((t) => (t.id === taskId ? { ...t, status: completed ? "PENDING" : "COMPLETED" } : t))
      );
    }
  };

  const grouped = tasks.reduce<Record<string, JourneyTask[]>>((acc, task) => {
    const cat = task.template.category;
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(task);
    return acc;
  }, {});

  const sortedCategories = [
    ...CATEGORY_ORDER.filter((c) => grouped[c]),
    ...Object.keys(grouped).filter((c) => !CATEGORY_ORDER.includes(c)),
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sticky header with main progress bar */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-5">
          <span className="text-emerald-500 font-semibold text-xs tracking-widest uppercase">Realocate.ai</span>
          <h1 className="text-xl font-bold text-gray-900 mt-0.5">{title}</h1>
          <div className="mt-3">
            <div className="flex items-center justify-between text-xs text-gray-500 mb-1.5">
              <span>{completedCount} of {totalCount} tasks completed</span>
              <span className="font-semibold text-gray-700">{Math.round(progressPct)}%</span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-2 bg-emerald-500 rounded-full transition-all duration-500"
                style={{ width: `${progressPct}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Category cards */}
      <div className="max-w-2xl mx-auto px-4 py-5 space-y-3">
        {totalCount === 0 && (
          <div className="text-center py-16 text-gray-400">
            <p className="text-4xl mb-3">📋</p>
            <p className="font-medium">No tasks yet — make sure the database is seeded.</p>
          </div>
        )}

        {sortedCategories.map((category, i) => (
          <CategoryCard
            key={category}
            category={category}
            meta={CATEGORY_META[category] ?? {
              label: category,
              emoji: "📌",
              urgency: "—",
              timeEstimate: "—",
              color: "bg-gray-50 text-gray-600 border-gray-200",
              donutColor: "#9ca3af",
            }}
            tasks={grouped[category]}
            defaultOpen={i === 0}
            onToggleTask={handleToggle}
          />
        ))}

        {completedCount === totalCount && totalCount > 0 && (
          <div className="text-center py-10">
            <p className="text-4xl mb-3">🎉</p>
            <p className="text-lg font-bold text-gray-900">Relocation complete!</p>
            <p className="text-gray-500 text-sm mt-1">Welcome to {destination}.</p>
          </div>
        )}
      </div>
    </div>
  );
}
