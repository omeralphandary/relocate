import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { generateJourneyTasks, type GeneratedTask } from "@/lib/llm";
import { OnboardingData } from "@/types";

interface OnboardingBody extends OnboardingData {
  name: string;
  email: string;
  password: string;
}

export async function POST(req: NextRequest) {
  try {
    const body: OnboardingBody = await req.json();
    const {
      name, email, password,
      nationality, secondNationality, originCountry, destinationCountry, destinationCity,
      employmentStatus, familyStatus, hasChildren, movingDate,
    } = body;

    if (!name || !email || !password || !nationality || !originCountry || !destinationCountry || !employmentStatus || !familyStatus) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    if (password.length < 8) {
      return NextResponse.json({ error: "Password must be at least 8 characters" }, { status: 400 });
    }

    // Delete any existing account for this email so the same email can be
    // re-used freely during development / manual testing.
    await prisma.user.deleteMany({ where: { email } });

    const hashedPassword = await bcrypt.hash(password, 12);

    // Look for seeded templates matching this corridor
    const nationalityFilter = {
      OR: [
        { nationalities: { isEmpty: true } },
        { nationalities: { has: nationality } },
        ...(secondNationality ? [{ nationalities: { has: secondNationality } }] : []),
      ],
    };

    const seededTemplates = await prisma.taskTemplate.findMany({
      where: {
        AND: [
          { OR: [{ countries: { isEmpty: true } }, { countries: { has: destinationCountry } }] },
          { OR: [{ originCountries: { isEmpty: true } }, { originCountries: { has: originCountry } }] },
          { OR: [{ employmentStatuses: { isEmpty: true } }, { employmentStatuses: { has: employmentStatus } }] },
          { OR: [{ familyStatuses: { isEmpty: true } }, { familyStatuses: { has: familyStatus } }] },
          nationalityFilter,
        ],
      },
      orderBy: [{ category: "asc" }, { order: "asc" }],
    });

    // Check for destination-specific POST_ARRIVAL coverage (origin-only tasks don't count).
    // PRE_DEPARTURE templates are global (countries: []) and always match, so we can't use total count.
    // Origin-specific tasks (e.g. US tax filing) also have countries: [], so we only count
    // templates explicitly scoped to this destination country.
    const hasPostArrival = seededTemplates.some(
      (t) => t.phase === "POST_ARRIVAL" && t.countries.length > 0,
    );

    let llmTasks: GeneratedTask[] = [];
    if (!hasPostArrival) {
      console.log(`[onboarding] No templates for ${destinationCountry}, generating via LLM...`);
      try {
        llmTasks = await generateJourneyTasks({
          nationality,
          originCountry,
          destinationCountry,
          destinationCity,
          employmentStatus,
          familyStatus,
        });
        console.log(`[onboarding] Generated ${llmTasks.length} LLM tasks for ${destinationCountry}`);
      } catch (llmErr) {
        console.error(`[onboarding] LLM generation failed for ${destinationCountry}:`, llmErr);
        return NextResponse.json(
          { error: `No relocation tasks are available for "${destinationCountry}" yet, and AI generation failed. Try Czech Republic, United Kingdom, or Germany — or top up your Anthropic API credits.` },
          { status: 503 },
        );
      }
    }

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        profile: {
          create: {
            nationality,
            secondNationality: secondNationality ?? null,
            originCountry,
            destinationCountry,
            destinationCity: destinationCity ?? null,
            employmentStatus,
            familyStatus,
            hasChildren: hasChildren ?? false,
            movingDate: movingDate ? new Date(movingDate) : undefined,
          },
        },
        journeys: {
          create: {
            title: `${originCountry} → ${destinationCountry}`,
            origin: originCountry,
            destination: destinationCountry,
            tasks: {
              create: [
                ...seededTemplates.map((t) => ({ taskId: t.id, phase: t.phase })),
                ...llmTasks.map((t) => ({
                  taskId: null,
                  phase: "POST_ARRIVAL" as const,
                  customTitle: t.title,
                  customDescription: t.description,
                  customCategory: t.category,
                  aiDocuments: t.documents,
                  aiTips: t.tips,
                  aiInstructions: t.instructions ?? null,
                  aiGeneratedAt: new Date(),
                })),
              ],
            },
          },
        },
      },
      include: { journeys: true },
    });

    return NextResponse.json({ journeyId: user.journeys[0].id }, { status: 201 });
  } catch (err) {
    console.error("[onboarding]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
