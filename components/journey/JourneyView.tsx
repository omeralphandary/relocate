"use client";

import { useState, useEffect, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import Link from "next/link";
import CategoryCard from "./CategoryCard";
import AIGreetingCard from "./AIGreetingCard";
import BaselineTipsCard from "./BaselineTipsCard";
import MilestoneToast from "./MilestoneToast";

export interface JourneyTask {
  id: string;
  taskId: string | null;
  status: string;
  phase: string;
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

export function taskPhase(t: JourneyTask): string {
  return t.phase ?? "POST_ARRIVAL";
}

interface JourneyViewProps {
  journeyId: string;
  title: string;
  origin: string;
  destination: string;
  baselineTips: string[];
  userName: string | null;
  userEmail: string | null;
  tasks: JourneyTask[];
}

// ─── Category metadata ─────────────────────────────────────────────────────

const PRE_DEPARTURE_CATEGORY_ORDER = ["documents", "moving", "housing", "banking", "insurance", "education", "pets", "legal"];
const POST_ARRIVAL_CATEGORY_ORDER  = ["telecom", "housing", "banking", "insurance", "legal", "transport", "education"];

const CATEGORY_META: Record<string, {
  label: string;
  emoji: string;
  urgency: string;
  preDepartureUrgency?: string;
  timeEstimate: string;
  color: string;
  donutColor: string;
}> = {
  // Post-arrival (some also appear pre-departure)
  telecom:   { label: "Telecom",            emoji: "📱", urgency: "Day 1",          timeEstimate: "~30 min",    color: "bg-orange-50 text-orange-600 border-orange-200",  donutColor: "#f97316" },
  housing:   { label: "Housing",            emoji: "🏠", urgency: "Week 1",         preDepartureUrgency: "1–3 mo before", timeEstimate: "2–4 weeks",  color: "bg-blue-50 text-blue-600 border-blue-200",        donutColor: "#3b82f6" },
  banking:   { label: "Banking",            emoji: "🏦", urgency: "Week 1–2",       preDepartureUrgency: "2–4 wks before", timeEstimate: "3–5 days",   color: "bg-green-50 text-green-600 border-green-200",     donutColor: "#10b981" },
  insurance: { label: "Insurance & Health", emoji: "🛡️", urgency: "Week 2",         preDepartureUrgency: "2–3 wks before", timeEstimate: "1–2 days",   color: "bg-teal-50 text-teal-600 border-teal-200",        donutColor: "#14b8a6" },
  legal:     { label: "Legal",              emoji: "⚖️", urgency: "Month 1",        preDepartureUrgency: "2–4 wks before", timeEstimate: "2–3 months", color: "bg-purple-50 text-purple-600 border-purple-200",   donutColor: "#8b5cf6" },
  transport: { label: "Transport",          emoji: "🚗", urgency: "Month 1–2",      timeEstimate: "1–4 weeks",  color: "bg-red-50 text-red-600 border-red-200",           donutColor: "#ef4444" },
  education: { label: "Education",          emoji: "🎓", urgency: "Week 1–2",       preDepartureUrgency: "4–6 wks before", timeEstimate: "1–4 weeks",  color: "bg-indigo-50 text-indigo-600 border-indigo-200",  donutColor: "#6366f1" },
  // Pre-departure only
  documents: { label: "Documents",          emoji: "📄", urgency: "6–8 wks before", timeEstimate: "2–4 weeks",  color: "bg-amber-50 text-amber-600 border-amber-200",     donutColor: "#f59e0b" },
  moving:    { label: "Moving & Shipping",  emoji: "📦", urgency: "4–8 wks before", timeEstimate: "2–8 weeks",  color: "bg-sky-50 text-sky-600 border-sky-200",           donutColor: "#0ea5e9" },
  pets:      { label: "Pets",               emoji: "🐾", urgency: "8–12 wks before",timeEstimate: "8–12 weeks", color: "bg-rose-50 text-rose-600 border-rose-200",        donutColor: "#f43f5e" },
};

type MilestoneState =
  | { type: "first-task" }
  | { type: "category"; category: string; label: string }
  | null;

// ─── Component ─────────────────────────────────────────────────────────────

export default function JourneyView({ journeyId, title, origin, destination, baselineTips: initialTips, userName, userEmail, tasks: initialTasks }: JourneyViewProps) {
  const [tasks, setTasks] = useState(initialTasks);
  const [addingCategory, setAddingCategory] = useState<string | null>(null);
  const [archiving, setArchiving] = useState(false);
  const [showGreeting, setShowGreeting] = useState(false);
  const [tips, setTips] = useState(initialTips);
  const [milestone, setMilestone] = useState<MilestoneState>(null);
  const [showScrollHint, setShowScrollHint] = useState(false);

  const hasPreDeparture = initialTasks.some((t) => taskPhase(t) === "PRE_DEPARTURE");
  const [activePhase, setActivePhase] = useState<"pre" | "post">(hasPreDeparture ? "pre" : "post");

  // Touch swipe state
  const touchStartX = useRef<number | null>(null);

  // Track whether user has ever completed a task (for first-task toast)
  const hasCompletedAny = useRef(initialTasks.some((t) => t.status === "COMPLETED"));
  // Track which categories have already triggered their milestone toast
  const celebratedCategories = useRef<Set<string>>(new Set());

  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    if (searchParams.get("welcome") === "1") {
      setShowGreeting(true);
      const url = new URL(window.location.href);
      url.searchParams.delete("welcome");
      router.replace(url.pathname, { scroll: false });
    }
  }, [searchParams, router]);

  // Scroll hint arrow — only for first-time users (when greeting is shown)
  useEffect(() => {
    if (!showGreeting) {
      setShowScrollHint(false);
      return;
    }
    const showTimer = setTimeout(() => setShowScrollHint(true), 1800);
    const hideTimer = setTimeout(() => setShowScrollHint(false), 9000);
    const handleScroll = () => setShowScrollHint(false);
    window.addEventListener("scroll", handleScroll, { once: true, passive: true });
    return () => {
      clearTimeout(showTimer);
      clearTimeout(hideTimer);
      window.removeEventListener("scroll", handleScroll);
    };
  }, [showGreeting]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [activePhase]);

  const handleDismissTips = async () => {
    setTips([]);
    await fetch(`/api/journeys/${journeyId}/tips`, { method: "DELETE" });
  };

  const handleNewJourney = async () => {
    setArchiving(true);
    await fetch(`/api/journeys/${journeyId}`, { method: "PATCH" });
    window.location.href = "/onboarding";
  };

  // ─── Progress ───────────────────────────────────────────────
  const preTasks  = tasks.filter((t) => taskPhase(t) === "PRE_DEPARTURE");
  const postTasks = tasks.filter((t) => taskPhase(t) !== "PRE_DEPARTURE");

  const preCompleted  = preTasks.filter((t) => t.status === "COMPLETED").length;
  const postCompleted = postTasks.filter((t) => t.status === "COMPLETED").length;

  const activeTasks     = activePhase === "pre" ? preTasks : postTasks;
  const activeCompleted = activePhase === "pre" ? preCompleted : postCompleted;
  const progressPct     = activeTasks.length > 0 ? (activeCompleted / activeTasks.length) * 100 : 0;

  const progressPhase =
    progressPct === 0   ? "" :
    progressPct < 25    ? "Getting started" :
    progressPct < 50    ? "In progress" :
    progressPct < 75    ? "More than halfway" :
    progressPct < 100   ? "Almost done" :
                          activePhase === "pre" ? "Ready to fly ✈" : "Fully settled";

  const allCompleted = tasks.length > 0 && tasks.every((t) => t.status === "COMPLETED");

  // ─── Dependency resolution ──────────────────────────────────
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

  // ─── Handlers ───────────────────────────────────────────────
  const handleToggle = async (taskId: string, completed: boolean) => {
    const newStatus = completed ? "COMPLETED" : "PENDING";

    setTasks((prev) => {
      const next = prev.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t));

      if (completed) {
        if (!hasCompletedAny.current) {
          hasCompletedAny.current = true;
          setMilestone({ type: "first-task" });
        } else {
          const toggledTask = prev.find((t) => t.id === taskId);
          if (toggledTask) {
            const cat = taskCategory(toggledTask);
            const categoryTasks = next.filter((t) => taskCategory(t) === cat);
            const allDone = categoryTasks.every((t) => t.status === "COMPLETED");
            if (allDone && !celebratedCategories.current.has(cat)) {
              celebratedCategories.current.add(cat);
              const label = CATEGORY_META[cat]?.label ?? cat;
              setMilestone({ type: "category", category: cat, label });
            }
          }
        }
      }

      return next;
    });

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

  const handleAddCustomTask = async (category: string, title: string, skipAI = false) => {
    const res = await fetch(`/api/journeys/${journeyId}/tasks`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, category, skipAI }),
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

  // ─── Touch swipe handlers ────────────────────────────────────
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null || !hasPreDeparture) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(dx) > 60) {
      if (dx < 0 && activePhase === "pre") setActivePhase("post");
      if (dx > 0 && activePhase === "post") setActivePhase("pre");
    }
    touchStartX.current = null;
  };

  // ─── Group tasks by phase then category ─────────────────────
  const groupByCategory = (phaseTasks: JourneyTask[]) =>
    phaseTasks.reduce<Record<string, JourneyTask[]>>((acc, task) => {
      const cat = taskCategory(task);
      if (!acc[cat]) acc[cat] = [];
      acc[cat].push(task);
      return acc;
    }, {});

  const preGrouped  = groupByCategory(preTasks);
  const postGrouped = groupByCategory(postTasks);

  const sortCategories = (grouped: Record<string, JourneyTask[]>, order: string[]) => [
    ...order.filter((c) => grouped[c]),
    ...Object.keys(grouped).filter((c) => !order.includes(c)),
  ];

  const preSorted  = sortCategories(preGrouped, PRE_DEPARTURE_CATEGORY_ORDER);
  const postSorted = sortCategories(postGrouped, POST_ARRIVAL_CATEGORY_ORDER);

  // ─── Render category cards for a given phase ────────────────
  const renderCards = (
    grouped: Record<string, JourneyTask[]>,
    sorted: string[],
    phase: "pre" | "post" = "post",
  ) => (
    <>
      {sorted.length === 0 && (
        <div className="text-center py-16 text-gray-400">
          <p className="text-4xl mb-3">📋</p>
          <p className="font-medium">No tasks yet.</p>
        </div>
      )}
      {sorted.map((category, i) => {
        const baseMeta = CATEGORY_META[category];
        const meta = baseMeta
          ? {
              ...baseMeta,
              urgency: (phase === "pre" && baseMeta.preDepartureUrgency) ? baseMeta.preDepartureUrgency : baseMeta.urgency,
            }
          : { label: category, emoji: "📌", urgency: "—", timeEstimate: "—", color: "bg-gray-50 text-gray-600 border-gray-200", donutColor: "#9ca3af" };
        return (
        <CategoryCard
          key={category}
          category={category}
          meta={meta}
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
        );
      })}
    </>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Milestone toast */}
      {milestone && (
        <MilestoneToast
          level={milestone.type}
          categoryLabel={milestone.type === "category" ? milestone.label : undefined}
          userName={userName}
          onDismiss={() => setMilestone(null)}
        />
      )}

      {/* Sticky header */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 pt-5 pb-0">
          {/* Logo + actions row */}
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

          {/* Journey heading */}
          <div className="mt-2">
            <h1 className="text-xl font-bold text-gray-900 leading-tight">
              {userName ? `${userName.split(" ")[0]}'s` : "Your"} relocation journey
            </h1>
            <div className="inline-flex items-center gap-2 mt-1.5 px-3 py-1 rounded-full bg-gray-100 border border-gray-200">
              <span className="text-sm font-semibold text-gray-700">{origin}</span>
              <span className="text-emerald-500 font-bold text-sm">→</span>
              <span className="text-sm font-semibold text-gray-700">{destination}</span>
            </div>
          </div>

          {/* Phase progress bar */}
          <div className="mt-3">
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="text-gray-500">{activeCompleted} of {activeTasks.length} tasks completed</span>
              <div className="flex items-center gap-2">
                {progressPhase && (
                  <span className="text-emerald-600 font-medium">{progressPhase}</span>
                )}
                <span className="font-semibold text-gray-700">{Math.round(progressPct)}%</span>
              </div>
            </div>
            <div className="relative h-2 my-1">
              <div className="absolute inset-0 bg-gray-100 rounded-full" />
              {progressPct > 0 && (
                <div
                  className="absolute inset-y-0 left-0 rounded-full transition-all duration-700 z-10"
                  style={{
                    width: `${progressPct}%`,
                    background: activePhase === "pre"
                      ? "linear-gradient(90deg, #f59e0b, #0ea5e9)"
                      : "linear-gradient(90deg, #fbbf24, #10b981)",
                  }}
                />
              )}
              {progressPct > 0 && progressPct < 100 && (
                <div
                  className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full animate-pulse z-20"
                  style={{
                    left: `calc(${progressPct}% - 6px)`,
                    backgroundColor: activePhase === "pre" ? "#38bdf8" : "#34d399",
                    opacity: 0.6,
                  }}
                />
              )}
              {[25, 50, 75].map((m) => (
                <div
                  key={m}
                  className={`absolute top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full border-2 transition-all duration-500 z-30 ${
                    progressPct >= m
                      ? "bg-white border-emerald-400 shadow-sm"
                      : "bg-white border-gray-200"
                  }`}
                  style={{ left: `calc(${m}% - 5px)` }}
                />
              ))}
            </div>
          </div>

          {/* Phase tab switcher — only shown when there are pre-departure tasks */}
          {hasPreDeparture && (
            <div className="flex mt-3 -mx-4">
              <button
                onClick={() => setActivePhase("pre")}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-sm font-semibold border-b-2 transition-all duration-200 ${
                  activePhase === "pre"
                    ? "border-sky-500 text-sky-600"
                    : "border-transparent text-gray-400 hover:text-gray-600"
                }`}
              >
                <span>✈</span>
                <span>Before You Go</span>
                <span className={`text-xs font-medium px-1.5 py-0.5 rounded-full ${
                  activePhase === "pre" ? "bg-sky-100 text-sky-600" : "bg-gray-100 text-gray-400"
                }`}>
                  {preCompleted}/{preTasks.length}
                </span>
              </button>
              <button
                onClick={() => setActivePhase("post")}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-sm font-semibold border-b-2 transition-all duration-200 ${
                  activePhase === "post"
                    ? "border-emerald-500 text-emerald-600"
                    : "border-transparent text-gray-400 hover:text-gray-600"
                }`}
              >
                <span>🏠</span>
                <span>After You Land</span>
                <span className={`text-xs font-medium px-1.5 py-0.5 rounded-full ${
                  activePhase === "post" ? "bg-emerald-100 text-emerald-600" : "bg-gray-100 text-gray-400"
                }`}>
                  {postCompleted}/{postTasks.length}
                </span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* AI greeting — shown above panels so it's visible regardless of active tab */}
      {showGreeting && (
        <div className="max-w-2xl mx-auto px-4 pt-4">
          <AIGreetingCard
            userName={userName}
            destination={destination}
            totalCount={tasks.length}
            categoryCount={preSorted.length + postSorted.length}
            firstCategory={preSorted[0] ?? postSorted[0] ?? "telecom"}
            onDismiss={() => setShowGreeting(false)}
          />
        </div>
      )}

      {/* Baseline tips card — corridor-specific AI insights, dismissable */}
      {tips.length > 0 && (
        <div className="max-w-2xl mx-auto px-4 pt-4">
          <BaselineTipsCard
            origin={origin}
            destination={destination}
            tips={tips}
            onDismiss={handleDismissTips}
          />
        </div>
      )}

      {/* Scroll hint — first-time users only, fades in then bounces */}
      {showScrollHint && (
        <div className="flex flex-col items-center gap-1 py-4 animate-fade-in-up pointer-events-none select-none">
          <span className="text-xs text-slate-400 tracking-wide">scroll to explore</span>
          <div className="animate-bounce-down text-emerald-400">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      )}

      {/* Sliding content area */}
      <div
        style={{ overflowX: "hidden" }}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <div
          className="flex transition-transform duration-300 ease-in-out"
          style={{
            width: hasPreDeparture ? "200%" : "100%",
            transform: hasPreDeparture
              ? activePhase === "pre" ? "translateX(0)" : "translateX(-50%)"
              : "translateX(0)",
          }}
        >
          {/* PRE-DEPARTURE panel */}
          {hasPreDeparture && (
            <div className="py-5 space-y-3" style={{ width: "50%", paddingLeft: "max(1rem, calc((100vw - 672px) / 2 + 1rem))", paddingRight: "max(1rem, calc((100vw - 672px) / 2 + 1rem))" }}>
              {renderCards(preGrouped, preSorted, "pre")}

              {/* Help Before You Go — pre-departure services */}
              <Link
                href="/movers"
                className="block rounded-2xl border border-gray-200 bg-white hover:border-sky-200 hover:bg-sky-50/30 transition-all duration-200 shadow-sm group"
              >
                <div className="flex items-center gap-4 px-5 py-4">
                  <span className="text-2xl flex-shrink-0">📦</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-gray-900">Help Before You Go</span>
                      <span className="text-xs font-medium px-2 py-0.5 rounded-full border bg-sky-50 text-sky-600 border-sky-200">
                        Marketplace
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 mt-0.5">Movers, documents, pet transport, money transfer and more</p>
                  </div>
                  <svg
                    className="w-4 h-4 text-gray-300 group-hover:text-sky-500 transition-colors flex-shrink-0"
                    fill="none" viewBox="0 0 24 24" stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </Link>
            </div>
          )}

          {/* POST-ARRIVAL panel */}
          <div
            className="py-5 space-y-3"
            style={{
              width: hasPreDeparture ? "50%" : "100%",
              paddingLeft: hasPreDeparture
                ? "max(1rem, calc((100vw - 672px) / 2 + 1rem))"
                : undefined,
              paddingRight: hasPreDeparture
                ? "max(1rem, calc((100vw - 672px) / 2 + 1rem))"
                : undefined,
            }}
          >
            <div className={hasPreDeparture ? "" : "max-w-2xl mx-auto px-4"}>
              {renderCards(postGrouped, postSorted)}

              {/* Help on the Ground — vendor marketplace */}
              <Link
                href={`/vendors?from=/journey/${journeyId}`}
                className="block rounded-2xl border border-gray-200 bg-white hover:border-emerald-200 hover:bg-emerald-50/30 transition-all duration-200 shadow-sm group"
              >
                <div className="flex items-center gap-4 px-5 py-4">
                  <span className="text-2xl flex-shrink-0">🤝</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-gray-900">Help on the Ground</span>
                      <span className="text-xs font-medium px-2 py-0.5 rounded-full border bg-emerald-50 text-emerald-600 border-emerald-200">
                        Marketplace
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 mt-0.5">Vetted local experts — legal, housing, banking and more</p>
                  </div>
                  <svg
                    className="w-4 h-4 text-gray-300 group-hover:text-emerald-500 transition-colors flex-shrink-0"
                    fill="none" viewBox="0 0 24 24" stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* All-done celebration */}
      {allCompleted && (
        <div className="text-center py-10">
          <p className="text-4xl mb-3">🎉</p>
          <p className="text-lg font-bold text-gray-900">Relocation complete!</p>
          <p className="text-gray-500 text-sm mt-1">Welcome to {destination}.</p>
        </div>
      )}
    </div>
  );
}
