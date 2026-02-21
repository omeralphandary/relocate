/**
 * API regression tests — additional endpoint coverage
 *
 * Covers routes not in workflow.test.ts:
 *   7. Google OAuth onboarding  (POST /api/onboarding/complete)
 *   8. Journey archive          (PATCH /api/journeys/[journeyId])
 *
 * All external deps mocked — no network, no DB, fully deterministic.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

// ─── Mocks ──────────────────────────────────────────────────────────────────

vi.mock("@/lib/prisma", () => {
  const prisma = {
    journey: {
      findFirst: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
      updateMany: vi.fn(),
      create: vi.fn(),
    },
    taskTemplate: {
      findMany: vi.fn(),
      create: vi.fn(),
    },
    profile: {
      upsert: vi.fn(),
    },
    $transaction: vi.fn(),
  };
  return { prisma };
});

vi.mock("@/auth", () => ({
  auth: vi.fn(),
}));

vi.mock("@/lib/llm", () => ({
  generateJourneyTasks: vi.fn(),
  enrichTask: vi.fn(),
  generateCustomTaskOverview: vi.fn(),
}));

// ─── Imports ────────────────────────────────────────────────────────────────

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { generateJourneyTasks } from "@/lib/llm";

import { POST as onboardingCompletePOST } from "@/app/api/onboarding/complete/route";
import { PATCH as journeyArchivePATCH } from "@/app/api/journeys/[journeyId]/route";

// ─── Fixtures ───────────────────────────────────────────────────────────────

const AUTHED_SESSION = {
  user: { id: "user-1", email: "alice@example.com" },
};

const VALID_COMPLETE_BODY = {
  nationality: "Israeli",
  originCountry: "Israel",
  destinationCountry: "Germany",
  employmentStatus: "employed",
  familyStatus: "single",
  hasChildren: false,
  movingDate: null,
};

const SAMPLE_TEMPLATES = [
  {
    id: "tpl-1",
    title: "Register at the Einwohnermeldeamt",
    description: "Register your address.",
    category: "legal",
    phase: "POST_ARRIVAL",
    documents: ["Passport", "Rental contract"],
    tips: "Book online in advance.",
    officialUrl: null,
    order: 1,
    countries: ["Germany"],
    originCountries: [],
    employmentStatuses: [],
    familyStatuses: [],
    dependsOn: [],
    aiEnriched: false,
  },
];

const SAMPLE_LLM_TASKS = [
  {
    title: "Get a SIM card",
    description: "Buy a local SIM card.",
    category: "telecom",
    documents: [],
    tips: "Telekom is reliable.",
    officialUrl: null,
    order: 1,
  },
];

function makeRequest(body: unknown, method = "POST") {
  return new NextRequest("http://localhost/", {
    method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

// ─── 7. POST /api/onboarding/complete ────────────────────────────────────────

describe("POST /api/onboarding/complete", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(auth).mockResolvedValue(AUTHED_SESSION as never);
    vi.mocked(prisma.journey.findFirst).mockResolvedValue(null);
    vi.mocked(prisma.journey.updateMany).mockResolvedValue({ count: 0 } as never);
    vi.mocked(prisma.taskTemplate.findMany).mockResolvedValue(SAMPLE_TEMPLATES as never);
    vi.mocked(prisma.$transaction).mockImplementation(async (fn: (tx: typeof prisma) => Promise<unknown>) =>
      fn(prisma)
    );
    vi.mocked(prisma.profile.upsert).mockResolvedValue({} as never);
    vi.mocked(prisma.journey.create).mockResolvedValue({ id: "journey-new" } as never);
  });

  it("returns 201 with journeyId on happy path", async () => {
    const res = await onboardingCompletePOST(makeRequest(VALID_COMPLETE_BODY));
    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body.journeyId).toBe("journey-new");
  });

  it("returns 401 when unauthenticated", async () => {
    vi.mocked(auth).mockResolvedValue(null as never);
    const res = await onboardingCompletePOST(makeRequest(VALID_COMPLETE_BODY));
    expect(res.status).toBe(401);
  });

  it("returns 400 when required fields are missing", async () => {
    const res = await onboardingCompletePOST(
      makeRequest({ nationality: "Israeli", originCountry: "Israel" })
    );
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toMatch(/missing required fields/i);
  });

  it("archives any existing active journey before creating the new one", async () => {
    vi.mocked(prisma.journey.updateMany).mockResolvedValue({ count: 1 } as never);
    const res = await onboardingCompletePOST(makeRequest(VALID_COMPLETE_BODY));
    expect(res.status).toBe(201);
    expect(prisma.journey.updateMany).toHaveBeenCalledWith({
      where: { userId: "user-1", status: "ACTIVE" },
      data: { status: "ARCHIVED" },
    });
    expect(prisma.journey.create).toHaveBeenCalled();
  });

  it("falls back to LLM when no templates match the corridor", async () => {
    vi.mocked(prisma.taskTemplate.findMany).mockResolvedValue([]);
    vi.mocked(generateJourneyTasks).mockResolvedValue(SAMPLE_LLM_TASKS as never);
    vi.mocked(prisma.taskTemplate.create).mockResolvedValue(SAMPLE_TEMPLATES[0] as never);

    const res = await onboardingCompletePOST(makeRequest(VALID_COMPLETE_BODY));
    expect(res.status).toBe(201);
    expect(generateJourneyTasks).toHaveBeenCalledWith(
      expect.objectContaining({ destinationCountry: "Germany" })
    );
  });

  it("returns 503 when no templates match and LLM fails", async () => {
    vi.mocked(prisma.taskTemplate.findMany).mockResolvedValue([]);
    vi.mocked(generateJourneyTasks).mockRejectedValue(new Error("LLM down"));
    const res = await onboardingCompletePOST(makeRequest(VALID_COMPLETE_BODY));
    expect(res.status).toBe(503);
    const body = await res.json();
    expect(body.error).toMatch(/ai generation failed/i);
  });

  it("upserts profile with correct fields", async () => {
    await onboardingCompletePOST(makeRequest(VALID_COMPLETE_BODY));
    expect(prisma.profile.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { userId: "user-1" },
        create: expect.objectContaining({
          nationality: "Israeli",
          destinationCountry: "Germany",
          employmentStatus: "employed",
          familyStatus: "single",
        }),
      })
    );
  });

  it("queries templates filtered by employmentStatus and familyStatus", async () => {
    await onboardingCompletePOST(makeRequest(VALID_COMPLETE_BODY));
    const findManyCall = vi.mocked(prisma.taskTemplate.findMany).mock.calls[0][0];
    const filters = findManyCall?.where?.AND as unknown[];
    // Should have 5 AND conditions: countries, originCountries, employmentStatuses, familyStatuses, nationalities
    expect(filters).toHaveLength(5);
  });
});

// ─── 8. PATCH /api/journeys/[journeyId] ─────────────────────────────────────

describe("PATCH /api/journeys/[journeyId] — archive", () => {
  const params = Promise.resolve({ journeyId: "journey-1" });

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(auth).mockResolvedValue({ user: { id: "user-1" } } as never);
    vi.mocked(prisma.journey.findUnique).mockResolvedValue({ userId: "user-1" } as never);
    vi.mocked(prisma.journey.update).mockResolvedValue({ id: "journey-1", status: "ARCHIVED" } as never);
  });

  it("returns 200 and archives the journey", async () => {
    const res = await journeyArchivePATCH(
      new NextRequest("http://localhost/", { method: "PATCH" }),
      { params }
    );
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.ok).toBe(true);
    expect(prisma.journey.update).toHaveBeenCalledWith({
      where: { id: "journey-1" },
      data: { status: "ARCHIVED" },
    });
  });

  it("returns 401 when unauthenticated", async () => {
    vi.mocked(auth).mockResolvedValue(null as never);
    const res = await journeyArchivePATCH(
      new NextRequest("http://localhost/", { method: "PATCH" }),
      { params }
    );
    expect(res.status).toBe(401);
  });

  it("returns 404 when journey does not exist", async () => {
    vi.mocked(prisma.journey.findUnique).mockResolvedValue(null as never);
    const res = await journeyArchivePATCH(
      new NextRequest("http://localhost/", { method: "PATCH" }),
      { params }
    );
    expect(res.status).toBe(404);
  });

  it("returns 403 when journey belongs to a different user", async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: "hacker-99" } } as never);
    const res = await journeyArchivePATCH(
      new NextRequest("http://localhost/", { method: "PATCH" }),
      { params }
    );
    expect(res.status).toBe(403);
    expect(prisma.journey.update).not.toHaveBeenCalled();
  });
});
