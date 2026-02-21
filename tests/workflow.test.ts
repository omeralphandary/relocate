/**
 * Workflow regression tests — Realocate.ai
 *
 * Covers the core user journey end-to-end:
 *   1. Registration + journey creation  (POST /api/onboarding)
 *   2. Latest journey lookup            (GET  /api/journey/latest)
 *   3. Task status toggle               (PATCH /api/tasks/[taskId])
 *   4. AI task enrichment               (POST /api/tasks/[taskId]/enrich)
 *
 * All external dependencies (Prisma, NextAuth, Anthropic) are mocked so
 * the tests run offline, without a real DB, and deterministically.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

// ─── Mocks (must be hoisted before any route imports) ──────────────────────

vi.mock("@/lib/prisma", () => {
  const prisma = {
    user: {
      findUnique: vi.fn(),
      create: vi.fn(),
      deleteMany: vi.fn().mockResolvedValue({ count: 0 }),
    },
    journey: {
      findFirst: vi.fn(),
      findUnique: vi.fn(),
    },
    journeyTask: {
      update: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      delete: vi.fn(),
    },
    taskTemplate: {
      findMany: vi.fn(),
    },
  };
  return { prisma };
});

vi.mock("@/auth", () => ({
  auth: vi.fn(),
}));

vi.mock("@/lib/llm", () => ({
  enrichTask: vi.fn(),
  generateJourneyTasks: vi.fn(),
  generateCustomTaskOverview: vi.fn(),
}));

vi.mock("bcryptjs", () => ({
  default: {
    hash: vi.fn().mockResolvedValue("hashed_password"),
    compare: vi.fn().mockResolvedValue(true),
  },
}));

// ─── Import mocked modules & route handlers ────────────────────────────────

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { enrichTask, generateCustomTaskOverview } from "@/lib/llm";

import { POST as onboardingPOST } from "@/app/api/onboarding/route";
import { GET as latestJourneyGET } from "@/app/api/journey/latest/route";
import { PATCH as taskPATCH, DELETE as taskDELETE } from "@/app/api/tasks/[taskId]/route";
import { POST as enrichPOST } from "@/app/api/tasks/[taskId]/enrich/route";
import { POST as customTaskPOST } from "@/app/api/journeys/[journeyId]/tasks/route";

// ─── Helpers ───────────────────────────────────────────────────────────────

function makeRequest(body: unknown, method = "POST") {
  return new NextRequest("http://localhost/", {
    method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

const VALID_ONBOARDING = {
  name: "Alice",
  email: "alice@example.com",
  password: "password123",
  nationality: "British",
  originCountry: "United Kingdom",
  destinationCountry: "Czech Republic",
  employmentStatus: "employed",
  familyStatus: "single",
};

const SAMPLE_TEMPLATES = [
  {
    id: "tpl-1",
    title: "Get a SIM card",
    description: "Buy a local SIM.",
    category: "telecom",
    phase: "POST_ARRIVAL",
    documents: [],
    tips: "O2 is reliable.",
    officialUrl: null,
    order: 1,
    countries: ["Czech Republic"],
    dependsOn: [],
    aiEnriched: false,
  },
];

const SAMPLE_JOURNEY_TASK = {
  id: "jt-1",
  journeyId: "journey-1",
  taskId: "tpl-1",
  status: "PENDING",
  phase: "POST_ARRIVAL",
  completedAt: null,
  customTitle: null,
  customDescription: null,
  customCategory: null,
  template: {
    title: "Get a SIM card",
    description: "Buy a local SIM.",
    category: "telecom",
  },
  journey: {
    id: "journey-1",
    user: {
      email: "alice@example.com",
      profile: {
        nationality: "British",
        originCountry: "United Kingdom",
        destinationCountry: "Czech Republic",
        employmentStatus: "employed",
        familyStatus: "single",
        movingDate: null,
      },
    },
  },
};

const SAMPLE_CUSTOM_TASK = {
  id: "jt-custom-1",
  journeyId: "journey-1",
  taskId: null,
  status: "PENDING",
  completedAt: null,
  customTitle: "Find a language school",
  customDescription: "Locate and enroll in a Czech language course.",
  customCategory: "legal",
  aiInstructions: "Search online for Czech language schools in Prague.",
  aiDocuments: ["Passport"],
  aiTips: "Many schools offer free trial lessons.",
  aiGeneratedAt: new Date(),
  journey: {
    id: "journey-1",
    user: {
      email: "alice@example.com",
      profile: {
        nationality: "British",
        originCountry: "United Kingdom",
        destinationCountry: "Czech Republic",
        employmentStatus: "employed",
        familyStatus: "single",
        movingDate: null,
      },
    },
  },
};

const SAMPLE_JOURNEY_WITH_PROFILE = {
  id: "journey-1",
  userId: "user-1",
  user: {
    email: "alice@example.com",
    profile: {
      nationality: "British",
      originCountry: "United Kingdom",
      destinationCountry: "Czech Republic",
      employmentStatus: "employed",
      familyStatus: "single",
      movingDate: null,
    },
  },
};

const SAMPLE_CUSTOM_TASK_OVERVIEW = {
  refinedTitle: "Find a language school",
  description: "Locate and enroll in a Czech language course.",
  instructions: "Search online for Czech language schools in Prague.",
  documents: ["Passport"],
  tips: "Many schools offer free trial lessons.",
};

// ─── 1. Onboarding ─────────────────────────────────────────────────────────

describe("POST /api/onboarding", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(prisma.user.findUnique).mockResolvedValue(null);
    vi.mocked(prisma.taskTemplate.findMany).mockResolvedValue(SAMPLE_TEMPLATES as never);
    vi.mocked(prisma.user.create).mockResolvedValue({
      id: "user-1",
      journeys: [{ id: "journey-1" }],
    } as never);
  });

  it("creates a user and journey, returns 201 with journeyId", async () => {
    const res = await onboardingPOST(makeRequest(VALID_ONBOARDING));
    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body.journeyId).toBe("journey-1");
  });

  it("returns 400 when required fields are missing", async () => {
    const res = await onboardingPOST(
      makeRequest({ email: "alice@example.com", password: "password123" })
    );
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toMatch(/missing required fields/i);
  });

  it("returns 400 when password is shorter than 8 characters", async () => {
    const res = await onboardingPOST(
      makeRequest({ ...VALID_ONBOARDING, password: "short" })
    );
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toMatch(/password must be at least 8 characters/i);
  });

  it("re-registers successfully when the email already exists (dev mode)", async () => {
    // No findUnique check anymore — the route just deletes and recreates.
    vi.mocked(prisma.user.create).mockResolvedValue({
      id: "user-2",
      journeys: [{ id: "journey-2" }],
    } as never);
    const res = await onboardingPOST(makeRequest(VALID_ONBOARDING));
    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body.journeyId).toBeDefined();
  });

  it("hashes the password before saving", async () => {
    await onboardingPOST(makeRequest(VALID_ONBOARDING));
    const createCall = vi.mocked(prisma.user.create).mock.calls[0][0];
    expect(createCall.data.password).toBe("hashed_password");
    expect(createCall.data.password).not.toBe("password123");
  });

  it("returns 500 on unexpected database error", async () => {
    vi.mocked(prisma.user.create).mockRejectedValue(new Error("DB down"));
    const res = await onboardingPOST(makeRequest(VALID_ONBOARDING));
    expect(res.status).toBe(500);
  });
});

// ─── 2. Latest journey ─────────────────────────────────────────────────────

describe("GET /api/journey/latest", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 200 with journeyId for authenticated user", async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: "user-1" } } as never);
    vi.mocked(prisma.journey.findFirst).mockResolvedValue({
      id: "journey-1",
    } as never);

    const res = await latestJourneyGET();
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.journeyId).toBe("journey-1");
  });

  it("returns 401 when not authenticated", async () => {
    vi.mocked(auth).mockResolvedValue(null as never);
    const res = await latestJourneyGET();
    expect(res.status).toBe(401);
  });

  it("returns 404 when the user has no active journey", async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: "user-1" } } as never);
    vi.mocked(prisma.journey.findFirst).mockResolvedValue(null as never);

    const res = await latestJourneyGET();
    expect(res.status).toBe(404);
  });
});

// ─── 3. Task toggle ────────────────────────────────────────────────────────

describe("PATCH /api/tasks/[taskId]", () => {
  const params = Promise.resolve({ taskId: "jt-1" });

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(prisma.journeyTask.update).mockResolvedValue({
      id: "jt-1",
      status: "COMPLETED",
      completedAt: new Date("2025-01-01"),
    } as never);
  });

  it("marks a task COMPLETED and returns 200", async () => {
    const res = await taskPATCH(
      makeRequest({ status: "COMPLETED" }, "PATCH"),
      { params }
    );
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.status).toBe("COMPLETED");
  });

  it("clears completedAt when reverting to PENDING", async () => {
    vi.mocked(prisma.journeyTask.update).mockResolvedValue({
      id: "jt-1",
      status: "PENDING",
      completedAt: null,
    } as never);

    const res = await taskPATCH(
      makeRequest({ status: "PENDING" }, "PATCH"),
      { params }
    );
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.completedAt).toBeNull();

    const updateCall = vi.mocked(prisma.journeyTask.update).mock.calls[0][0];
    expect(updateCall.data.completedAt).toBeNull();
  });

  it("returns 400 for an invalid status value", async () => {
    const res = await taskPATCH(
      makeRequest({ status: "DONE" }, "PATCH"),
      { params }
    );
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toMatch(/invalid status/i);
  });

  it("sets completedAt when marking COMPLETED", async () => {
    await taskPATCH(
      makeRequest({ status: "COMPLETED" }, "PATCH"),
      { params }
    );
    const updateCall = vi.mocked(prisma.journeyTask.update).mock.calls[0][0];
    expect(updateCall.data.completedAt).toBeInstanceOf(Date);
  });
});

// ─── 4. AI enrichment ──────────────────────────────────────────────────────

describe("POST /api/tasks/[taskId]/enrich", () => {
  const params = Promise.resolve({ taskId: "jt-1" });

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(auth).mockResolvedValue({
      user: { email: "alice@example.com" },
    } as never);
    vi.mocked(prisma.journeyTask.findUnique).mockResolvedValue(
      SAMPLE_JOURNEY_TASK as never
    );
    vi.mocked(enrichTask).mockResolvedValue({
      instructions: "Go to the O2 store with your passport.",
      documents: ["Passport"],
      tips: "Avoid peak hours.",
    });
    vi.mocked(prisma.journeyTask.update).mockResolvedValue({
      aiInstructions: "Go to the O2 store with your passport.",
      aiDocuments: ["Passport"],
      aiTips: "Avoid peak hours.",
      aiGeneratedAt: new Date(),
    } as never);
  });

  it("returns 200 with AI fields for authenticated task owner", async () => {
    const res = await enrichPOST(makeRequest(null), { params });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.aiInstructions).toBe("Go to the O2 store with your passport.");
    expect(body.aiDocuments).toEqual(["Passport"]);
    expect(body.aiTips).toBe("Avoid peak hours.");
  });

  it("returns 401 when there is no session", async () => {
    vi.mocked(auth).mockResolvedValue(null as never);
    const res = await enrichPOST(makeRequest(null), { params });
    expect(res.status).toBe(401);
  });

  it("returns 404 when the task does not exist", async () => {
    vi.mocked(prisma.journeyTask.findUnique).mockResolvedValue(null as never);
    const res = await enrichPOST(makeRequest(null), { params });
    expect(res.status).toBe(404);
  });

  it("returns 403 when the task belongs to a different user", async () => {
    vi.mocked(auth).mockResolvedValue({
      user: { email: "hacker@example.com" },
    } as never);
    const res = await enrichPOST(makeRequest(null), { params });
    expect(res.status).toBe(403);
  });

  it("calls enrichTask with correct user profile data", async () => {
    await enrichPOST(makeRequest(null), { params });
    expect(enrichTask).toHaveBeenCalledWith(
      expect.objectContaining({
        taskTitle: "Get a SIM card",
        nationality: "British",
        destinationCountry: "Czech Republic",
        employmentStatus: "employed",
      })
    );
  });

  it("persists AI fields to the database after enrichment", async () => {
    await enrichPOST(makeRequest(null), { params });
    const updateCall = vi.mocked(prisma.journeyTask.update).mock.calls[0][0];
    expect(updateCall.data.aiInstructions).toBe(
      "Go to the O2 store with your passport."
    );
    expect(updateCall.data.aiGeneratedAt).toBeInstanceOf(Date);
  });

  it("returns 500 when the LLM call fails", async () => {
    vi.mocked(enrichTask).mockRejectedValue(new Error("Anthropic down"));
    const res = await enrichPOST(makeRequest(null), { params });
    expect(res.status).toBe(500);
  });

  it("regression: still works for template-based tasks after nullable template change", async () => {
    // taskId is non-null → should use template fields
    vi.mocked(prisma.journeyTask.findUnique).mockResolvedValue(
      SAMPLE_JOURNEY_TASK as never
    );
    const res = await enrichPOST(makeRequest(null), { params });
    expect(res.status).toBe(200);
    expect(enrichTask).toHaveBeenCalledWith(
      expect.objectContaining({ taskTitle: "Get a SIM card" })
    );
  });
});

// ─── 5. Custom task creation ────────────────────────────────────────────────

describe("POST /api/journeys/[journeyId]/tasks", () => {
  const params = Promise.resolve({ journeyId: "journey-1" });

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(auth).mockResolvedValue({ user: { email: "alice@example.com" } } as never);
    vi.mocked(prisma.journey.findUnique).mockResolvedValue(SAMPLE_JOURNEY_WITH_PROFILE as never);
    vi.mocked(generateCustomTaskOverview).mockResolvedValue(SAMPLE_CUSTOM_TASK_OVERVIEW);
    vi.mocked(prisma.journeyTask.create).mockResolvedValue({
      ...SAMPLE_CUSTOM_TASK,
    } as never);
  });

  it("returns 201 with new custom task on happy path", async () => {
    const res = await customTaskPOST(
      makeRequest({ title: "Find a language school", category: "legal" }),
      { params },
    );
    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body.isCustom).toBe(true);
    expect(body.customTitle).toBe("Find a language school");
    expect(body.aiInstructions).toBeDefined();
  });

  it("returns 400 when title is missing", async () => {
    const res = await customTaskPOST(
      makeRequest({ category: "legal" }),
      { params },
    );
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toMatch(/title/i);
  });

  it("returns 400 when category is invalid", async () => {
    const res = await customTaskPOST(
      makeRequest({ title: "Something", category: "invalid_cat" }),
      { params },
    );
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toMatch(/category/i);
  });

  it("returns 401 when not authenticated", async () => {
    vi.mocked(auth).mockResolvedValue(null as never);
    const res = await customTaskPOST(
      makeRequest({ title: "Something", category: "legal" }),
      { params },
    );
    expect(res.status).toBe(401);
  });

  it("returns 403 when journey belongs to a different user", async () => {
    vi.mocked(auth).mockResolvedValue({ user: { email: "hacker@example.com" } } as never);
    const res = await customTaskPOST(
      makeRequest({ title: "Something", category: "legal" }),
      { params },
    );
    expect(res.status).toBe(403);
  });

  it("returns 404 when journey does not exist", async () => {
    vi.mocked(prisma.journey.findUnique).mockResolvedValue(null as never);
    const res = await customTaskPOST(
      makeRequest({ title: "Something", category: "legal" }),
      { params },
    );
    expect(res.status).toBe(404);
  });

  it("returns 500 when LLM call fails", async () => {
    vi.mocked(generateCustomTaskOverview).mockRejectedValue(new Error("LLM down"));
    const res = await customTaskPOST(
      makeRequest({ title: "Something", category: "legal" }),
      { params },
    );
    expect(res.status).toBe(500);
  });

  it("creates task with taskId: null", async () => {
    await customTaskPOST(
      makeRequest({ title: "Find a language school", category: "legal" }),
      { params },
    );
    const createCall = vi.mocked(prisma.journeyTask.create).mock.calls[0][0];
    expect(createCall.data.taskId).toBeNull();
  });
});

// ─── 6. Custom task deletion ────────────────────────────────────────────────

describe("DELETE /api/tasks/[taskId]", () => {
  const params = Promise.resolve({ taskId: "jt-custom-1" });

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(auth).mockResolvedValue({ user: { email: "alice@example.com" } } as never);
    vi.mocked(prisma.journeyTask.findUnique).mockResolvedValue(SAMPLE_CUSTOM_TASK as never);
    vi.mocked(prisma.journeyTask.delete).mockResolvedValue(SAMPLE_CUSTOM_TASK as never);
  });

  it("returns 200 and deletes a custom task", async () => {
    const res = await taskDELETE(
      new NextRequest("http://localhost/", { method: "DELETE" }),
      { params },
    );
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.deleted).toBe(true);
    expect(prisma.journeyTask.delete).toHaveBeenCalledWith({ where: { id: "jt-custom-1" } });
  });

  it("returns 400 when trying to delete a system task", async () => {
    vi.mocked(prisma.journeyTask.findUnique).mockResolvedValue(SAMPLE_JOURNEY_TASK as never);
    const res = await taskDELETE(
      new NextRequest("http://localhost/", { method: "DELETE" }),
      { params },
    );
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toMatch(/cannot delete system tasks/i);
  });

  it("returns 401 when not authenticated", async () => {
    vi.mocked(auth).mockResolvedValue(null as never);
    const res = await taskDELETE(
      new NextRequest("http://localhost/", { method: "DELETE" }),
      { params },
    );
    expect(res.status).toBe(401);
  });

  it("returns 403 when task belongs to a different user", async () => {
    vi.mocked(auth).mockResolvedValue({ user: { email: "hacker@example.com" } } as never);
    const res = await taskDELETE(
      new NextRequest("http://localhost/", { method: "DELETE" }),
      { params },
    );
    expect(res.status).toBe(403);
  });
});
