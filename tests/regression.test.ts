/**
 * Regression tests — corridor filtering, phase propagation, LLM fallback edge cases
 *
 * Covers behaviour added/changed in the corridor expansion (UK, India, IL PRE_DEPARTURE):
 *   1. PRE_DEPARTURE phase is propagated from template → journey task
 *   2. LLM fallback fires when templates are all PRE_DEPARTURE (no POST_ARRIVAL match)
 *   3. originCountry filter is included in the findMany query
 *   4. secondNationality expands the nationality filter
 *   5. employmentStatus filter is constructed correctly (has: value)
 *   6. Journey title is formatted as "origin → destination"
 *   7. movingDate: null is stored as null (not omitted)
 *   8. Mixed-phase templates: LLM not called when POST_ARRIVAL templates exist
 *
 * All external deps mocked — no network, no DB, fully deterministic.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

// ─── Mocks ──────────────────────────────────────────────────────────────────

vi.mock("@/lib/prisma", () => {
  const prisma = {
    user: { findUnique: vi.fn() },
    journey: { updateMany: vi.fn(), create: vi.fn() },
    taskTemplate: { findMany: vi.fn(), create: vi.fn() },
    profile: { upsert: vi.fn() },
    $transaction: vi.fn(),
  };
  return { prisma };
});

vi.mock("@/auth", () => ({ auth: vi.fn() }));

vi.mock("@/lib/llm", () => ({
  generateJourneyTasks: vi.fn(),
  enrichTask: vi.fn(),
  generateCustomTaskOverview: vi.fn(),
}));

// ─── Imports ─────────────────────────────────────────────────────────────────

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { generateJourneyTasks } from "@/lib/llm";
import { POST as onboardingCompletePOST } from "@/app/api/onboarding/complete/route";

// ─── Fixtures ────────────────────────────────────────────────────────────────

const SESSION = { user: { id: "user-1", email: "alice@example.com" } };

const BASE_BODY = {
  nationality: "Indian",
  originCountry: "India",
  destinationCountry: "United Kingdom",
  employmentStatus: "employed",
  familyStatus: "single",
  hasChildren: false,
  movingDate: null,
};

function makePostArrivalTemplate(overrides: Record<string, unknown> = {}) {
  return {
    id: "tpl-post",
    title: "Register with NHS GP",
    description: "Register with a local GP.",
    category: "insurance",
    phase: "POST_ARRIVAL",
    documents: [],
    tips: null,
    officialUrl: null,
    order: 1,
    countries: ["United Kingdom"],
    originCountries: [],
    employmentStatuses: [],
    familyStatuses: [],
    dependsOn: [],
    aiEnriched: false,
    ...overrides,
  };
}

function makePreDepartureTemplate(overrides: Record<string, unknown> = {}) {
  return {
    id: "tpl-pre",
    title: "Get MEA apostille on your key Indian documents",
    description: "Apostille before leaving.",
    category: "documents",
    phase: "PRE_DEPARTURE",
    documents: [],
    tips: null,
    officialUrl: null,
    order: 3,
    countries: [],
    originCountries: ["India"],
    employmentStatuses: [],
    familyStatuses: [],
    dependsOn: [],
    aiEnriched: false,
    ...overrides,
  };
}

function req(body: unknown) {
  return new NextRequest("http://localhost/", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

// ─── Setup ───────────────────────────────────────────────────────────────────

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(auth).mockResolvedValue(SESSION as never);
  vi.mocked(prisma.user.findUnique).mockResolvedValue({ id: "user-1" } as never);
  vi.mocked(prisma.journey.updateMany).mockResolvedValue({ count: 0 } as never);
  vi.mocked(prisma.$transaction).mockImplementation(
    async (fn: (tx: typeof prisma) => Promise<unknown>) => fn(prisma)
  );
  vi.mocked(prisma.profile.upsert).mockResolvedValue({} as never);
  vi.mocked(prisma.journey.create).mockResolvedValue({ id: "journey-1" } as never);
});

// ─── 1. PRE_DEPARTURE phase propagation ──────────────────────────────────────

describe("PRE_DEPARTURE phase propagation", () => {
  it("passes template phase to journey task when template is PRE_DEPARTURE", async () => {
    const templates = [makePreDepartureTemplate(), makePostArrivalTemplate()];
    vi.mocked(prisma.taskTemplate.findMany).mockResolvedValue(templates as never);

    await onboardingCompletePOST(req(BASE_BODY));

    const createCall = vi.mocked(prisma.journey.create).mock.calls[0][0];
    const tasksInput = createCall.data.tasks as { create: Array<{ taskId: string; phase: string }> };
    const tasks = tasksInput.create;

    const preDeptTask = tasks.find((t) => t.taskId === "tpl-pre");
    const postArrTask = tasks.find((t) => t.taskId === "tpl-post");

    expect(preDeptTask?.phase).toBe("PRE_DEPARTURE");
    expect(postArrTask?.phase).toBe("POST_ARRIVAL");
  });

  it("all journey tasks have their phase set (none undefined)", async () => {
    const templates = [makePreDepartureTemplate(), makePostArrivalTemplate()];
    vi.mocked(prisma.taskTemplate.findMany).mockResolvedValue(templates as never);

    await onboardingCompletePOST(req(BASE_BODY));

    const createCall = vi.mocked(prisma.journey.create).mock.calls[0][0];
    const tasksInput = createCall.data.tasks as { create: Array<{ phase?: string }> };
    expect(tasksInput.create.every((t) => t.phase !== undefined)).toBe(true);
  });
});

// ─── 2. LLM fallback when only PRE_DEPARTURE templates match ─────────────────

describe("LLM fallback edge cases", () => {
  it("triggers LLM when templates exist but all are PRE_DEPARTURE (no POST_ARRIVAL)", async () => {
    vi.mocked(prisma.taskTemplate.findMany).mockResolvedValue([makePreDepartureTemplate()] as never);
    vi.mocked(generateJourneyTasks).mockResolvedValue([{
      title: "Open a UK bank account", description: "...", category: "banking",
      documents: [], tips: null, officialUrl: null, order: 1,
    }] as never);
    vi.mocked(prisma.taskTemplate.create).mockResolvedValue(makePostArrivalTemplate() as never);

    const res = await onboardingCompletePOST(req(BASE_BODY));

    expect(res.status).toBe(201);
    expect(generateJourneyTasks).toHaveBeenCalledOnce();
  });

  it("does NOT trigger LLM when at least one POST_ARRIVAL template exists", async () => {
    vi.mocked(prisma.taskTemplate.findMany).mockResolvedValue(
      [makePreDepartureTemplate(), makePostArrivalTemplate()] as never
    );

    const res = await onboardingCompletePOST(req(BASE_BODY));

    expect(res.status).toBe(201);
    expect(generateJourneyTasks).not.toHaveBeenCalled();
  });
});

// ─── 3. originCountry filter ──────────────────────────────────────────────────

describe("originCountry corridor filter", () => {
  it("includes originCountries condition in the findMany query", async () => {
    vi.mocked(prisma.taskTemplate.findMany).mockResolvedValue([makePostArrivalTemplate()] as never);

    await onboardingCompletePOST(req({ ...BASE_BODY, originCountry: "India" }));

    const call = vi.mocked(prisma.taskTemplate.findMany).mock.calls[0][0];
    const andFilters = call?.where?.AND as unknown[];
    const originFilter = andFilters?.find((f: unknown) => {
      const filter = f as Record<string, unknown>;
      return "OR" in filter && JSON.stringify(filter).includes("originCountries");
    });
    expect(originFilter).toBeDefined();
  });

  it("passes originCountry value into the has filter", async () => {
    vi.mocked(prisma.taskTemplate.findMany).mockResolvedValue([makePostArrivalTemplate()] as never);

    await onboardingCompletePOST(req({ ...BASE_BODY, originCountry: "India" }));

    const call = vi.mocked(prisma.taskTemplate.findMany).mock.calls[0][0];
    const queryString = JSON.stringify(call?.where);
    expect(queryString).toContain("India");
  });
});

// ─── 4. secondNationality expands nationality filter ─────────────────────────

describe("secondNationality filter expansion", () => {
  it("adds a third OR condition when secondNationality is provided", async () => {
    vi.mocked(prisma.taskTemplate.findMany).mockResolvedValue([makePostArrivalTemplate()] as never);

    await onboardingCompletePOST(req({
      ...BASE_BODY,
      nationality: "Indian",
      secondNationality: "British",
    }));

    const call = vi.mocked(prisma.taskTemplate.findMany).mock.calls[0][0];
    const andFilters = call?.where?.AND as Array<Record<string, unknown>>;
    const nationalityFilter = andFilters?.find((f) =>
      "OR" in f && JSON.stringify(f).includes("nationalities")
    ) as { OR: unknown[] } | undefined;

    // isEmpty + has(nationality) + has(secondNationality) = 3 conditions
    expect(nationalityFilter?.OR).toHaveLength(3);
  });

  it("only has two OR conditions when secondNationality is absent", async () => {
    vi.mocked(prisma.taskTemplate.findMany).mockResolvedValue([makePostArrivalTemplate()] as never);

    await onboardingCompletePOST(req(BASE_BODY)); // no secondNationality

    const call = vi.mocked(prisma.taskTemplate.findMany).mock.calls[0][0];
    const andFilters = call?.where?.AND as Array<Record<string, unknown>>;
    const nationalityFilter = andFilters?.find((f) =>
      "OR" in f && JSON.stringify(f).includes("nationalities")
    ) as { OR: unknown[] } | undefined;

    expect(nationalityFilter?.OR).toHaveLength(2);
  });
});

// ─── 5. employmentStatus filter ───────────────────────────────────────────────

describe("employmentStatus filter", () => {
  it("includes employmentStatus in the query", async () => {
    vi.mocked(prisma.taskTemplate.findMany).mockResolvedValue([makePostArrivalTemplate()] as never);

    await onboardingCompletePOST(req({ ...BASE_BODY, employmentStatus: "student" }));

    const call = vi.mocked(prisma.taskTemplate.findMany).mock.calls[0][0];
    const queryString = JSON.stringify(call?.where);
    expect(queryString).toContain("student");
  });
});

// ─── 6. Journey title format ──────────────────────────────────────────────────

describe("journey title", () => {
  it("formats title as 'origin → destination'", async () => {
    vi.mocked(prisma.taskTemplate.findMany).mockResolvedValue([makePostArrivalTemplate()] as never);

    await onboardingCompletePOST(req({
      ...BASE_BODY,
      originCountry: "India",
      destinationCountry: "United Kingdom",
    }));

    const createCall = vi.mocked(prisma.journey.create).mock.calls[0][0];
    expect(createCall.data.title).toBe("India → United Kingdom");
  });
});

// ─── 7. movingDate null handling ──────────────────────────────────────────────

describe("movingDate null handling", () => {
  it("stores null movingDate as null in profile (not as a Date)", async () => {
    vi.mocked(prisma.taskTemplate.findMany).mockResolvedValue([makePostArrivalTemplate()] as never);

    await onboardingCompletePOST(req({ ...BASE_BODY, movingDate: null }));

    const upsertCall = vi.mocked(prisma.profile.upsert).mock.calls[0][0];
    expect(upsertCall.create.movingDate).toBeNull();
    expect(upsertCall.update.movingDate).toBeNull();
  });

  it("stores a valid date string as a Date object in profile", async () => {
    vi.mocked(prisma.taskTemplate.findMany).mockResolvedValue([makePostArrivalTemplate()] as never);

    await onboardingCompletePOST(req({ ...BASE_BODY, movingDate: "2026-06-01" }));

    const upsertCall = vi.mocked(prisma.profile.upsert).mock.calls[0][0];
    expect(upsertCall.create.movingDate).toBeInstanceOf(Date);
  });
});
