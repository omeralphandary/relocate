"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import CategoryCard from "./CategoryCard";
import BetaWelcomeModal from "./BetaWelcomeModal";

export interface JourneyTask {
  id: string;
  taskId: string | null;
  status: string;
  isCustom: boolean;
  customTitle?: string | null;
  customDescription?: string | null;
  customCategory?: string | null;
  aiInstructions: string | null;
  aiDocuments: string[];
  aiTips: string | null;
  template?: {
    title: string;
    description: string;
    category: string;
    officialUrl: string | null;
    documents: string[];
    tips: string | null;
    order: number;
    dependsOn: string[];
  };
}

export function taskTitle(t: JourneyTask): string {
  return t.isCustom ? (t.customTitle ?? "Custom task") : (t.template?.title ?? "");
}

export function taskDescription(t: JourneyTask): string {
  return t.isCustom ? (t.customDescription ?? "") : (t.template?.description ?? "");
}

export function taskCategory(t: JourneyTask): string {
  return t.isCustom ? (t.customCategory ?? "general") : (t.template?.category ?? "general");
}

export function taskOrder(t: JourneyTask): number {
  return t.isCustom ? 9999 : (t.template?.order ?? 9999);
}

interface JourneyViewProps {
  journeyId: string;
  title: string;
  origin: string;
  destination: string;
  userName: string | null;
  userEmail: string | null;
  tasks: JourneyTask[];
}

const CATEGORY_ORDER = ["telecom", "housing", "banking", "insurance", "legal", "transport", "education"];

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
  education: { label: "Education",  emoji: "🎓", urgency: "Week 1–2",  timeEstimate: "1–4 weeks",  color: "bg-indigo-50 text-indigo-600 border-indigo-200",  donutColor: "#6366f1" },
};

export default function JourneyView({ journeyId, title, destination, userName, userEmail, tasks: initialTasks }: JourneyViewProps) {
  const [tasks, setTasks] = useState(initialTasks);
  const [addingCategory, setAddingCategory] = useState<string | null>(null);
  const [archiving, setArchiving] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    if (searchParams.get("welcome") === "1") {
      setShowWelcome(true);
      // Clean the param from the URL without a page reload
      const url = new URL(window.location.href);
      url.searchParams.delete("welcome");
      router.replace(url.pathname, { scroll: false });
    }
  }, [searchParams, router]);

  const handleNewJourney = async () => {
    setArchiving(true);
    await fetch(`/api/journeys/${journeyId}`, { method: "PATCH" });
    window.location.href = "/onboarding";
  };

  const completedCount = tasks.filter((t) => t.status === "COMPLETED").length;
  const totalCount = tasks.length;
  const progressPct = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  // Map from templateId → journey task, for dependency resolution
  const templateToTask = new Map(
    tasks.filter((t) => t.taskId).map((t) => [t.taskId!, t])
  );

  const blockingNames = (task: JourneyTask): string[] => {
    if (task.isCustom) return [];
    return (task.template?.dependsOn ?? [])
      .map((depTemplateId) => templateToTask.get(depTemplateId))
      .filter((dep): dep is JourneyTask => !!dep && dep.status !== "COMPLETED")
      .map((dep) => dep.template?.title ?? "");
  };

  const isLocked = (task: JourneyTask): boolean => blockingNames(task).length > 0;

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

  const handleEnrich = async (taskId: string) => {
    const res = await fetch(`/api/tasks/${taskId}/enrich`, { method: "POST" });
    if (!res.ok) {
      const { error } = await res.json().catch(() => ({ error: "Unknown error" }));
      throw new Error(error);
    }
    const data = await res.json();
    setTasks((prev) =>
      prev.map((t) =>
        t.id === taskId
          ? { ...t, aiInstructions: data.aiInstructions, aiDocuments: data.aiDocuments, aiTips: data.aiTips }
          : t
      )
    );
  };

  const handleAddCustomTask = async (category: string, title: string) => {
    const res = await fetch(`/api/journeys/${journeyId}/tasks`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, category }),
    });
    if (!res.ok) {
      const { error } = await res.json().catch(() => ({ error: "Unknown error" }));
      throw new Error(error);
    }
    const newTask = await res.json() as JourneyTask;
    setTasks((prev) => [...prev, newTask]);
    setAddingCategory(null);
  };

  const handleDeleteCustomTask = async (taskId: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
    try {
      await fetch(`/api/tasks/${taskId}`, { method: "DELETE" });
    } catch {
      // silently ignore — task already removed from UI
    }
  };

  const grouped = tasks.reduce<Record<string, JourneyTask[]>>((acc, task) => {
    const cat = taskCategory(task);
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
      {showWelcome && <BetaWelcomeModal onClose={() => setShowWelcome(false)} />}

      {/* Sticky header */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-5">
          <div className="flex items-center justify-between mb-1">
            <span className="font-bold text-base tracking-tight text-slate-900">Realocate<span className="text-emerald-500">.ai</span></span>
            <div className="flex items-center gap-3">
              <span className="text-xs text-gray-400 hidden sm:block">{userName ?? userEmail}</span>
              <button
                onClick={handleNewJourney}
                disabled={archiving}
                className="text-xs text-gray-400 hover:text-emerald-500 transition-colors disabled:opacity-40"
              >
                + New journey
              </button>
              <span className="text-gray-200">|</span>
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
              >
                Sign out
              </button>
            </div>
          </div>
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
            onEnrichTask={handleEnrich}
            isLocked={isLocked}
            blockingNames={blockingNames}
            isAddingTask={addingCategory === category}
            onStartAddTask={() => setAddingCategory(category)}
            onCancelAddTask={() => setAddingCategory(null)}
            onAddTask={handleAddCustomTask}
            onDeleteTask={handleDeleteCustomTask}
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
