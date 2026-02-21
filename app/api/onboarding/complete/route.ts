import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { generateJourneyTasks } from "@/lib/llm";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.email || !session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json() as {
      nationality?: string;
      secondNationality?: string;
      originCountry?: string;
      destinationCountry?: string;
      employmentStatus?: string;
      familyStatus?: string;
      hasChildren?: boolean;
      movingDate?: string | null;
    };

    const { nationality, secondNationality, originCountry, destinationCountry, employmentStatus, familyStatus, hasChildren, movingDate } = body;

    if (!nationality || !originCountry || !destinationCountry || !employmentStatus || !familyStatus) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const userId = session.user.id;

    // Guard: JWT can outlive account deletion (e.g. reset-user in dev, or future account deletion)
    const userExists = await prisma.user.findUnique({ where: { id: userId }, select: { id: true } });
    if (!userExists) {
      return NextResponse.json({ error: "Account not found. Please sign out and sign in again." }, { status: 401 });
    }

    // Archive any existing active journey before creating a new one
    await prisma.journey.updateMany({
      where: { userId, status: "ACTIVE" },
      data: { status: "ARCHIVED" },
    });

    const nationalityFilter = {
      OR: [
        { nationalities: { isEmpty: true } },
        { nationalities: { has: nationality } },
        ...(secondNationality ? [{ nationalities: { has: secondNationality } }] : []),
      ],
    };

    // Find templates matching this corridor
    let templates = await prisma.taskTemplate.findMany({
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

    // Fall back to LLM for unknown destinations — check POST_ARRIVAL specifically,
    // since PRE_DEPARTURE templates are global and always match, masking missing post-arrival content.
    const hasPostArrival = templates.some((t) => t.phase === "POST_ARRIVAL");
    if (!hasPostArrival) {
      try {
        const generated = await generateJourneyTasks({ nationality, originCountry, destinationCountry, employmentStatus, familyStatus });
        const llmTemplates = await Promise.all(
          generated.map((t) =>
            prisma.taskTemplate.create({
              data: {
                title: t.title, description: t.description, category: t.category,
                documents: t.documents, tips: t.tips, officialUrl: t.officialUrl ?? null,
                order: t.order, countries: [destinationCountry], dependsOn: [], aiEnriched: true,
                // phase defaults to POST_ARRIVAL — correct for LLM-generated content
              },
            })
          )
        );
        templates = [...templates, ...llmTemplates];
      } catch {
        return NextResponse.json(
          { error: `No relocation tasks available for "${destinationCountry}" and AI generation failed.` },
          { status: 503 },
        );
      }
    }

    // Upsert profile + create journey in a transaction
    const journey = await prisma.$transaction(async (tx) => {
      await tx.profile.upsert({
        where: { userId },
        update: { nationality, secondNationality: secondNationality ?? null, originCountry, destinationCountry, employmentStatus, familyStatus, hasChildren: hasChildren ?? false, movingDate: movingDate ? new Date(movingDate) : null },
        create: { userId, nationality, secondNationality: secondNationality ?? null, originCountry, destinationCountry, employmentStatus, familyStatus, hasChildren: hasChildren ?? false, movingDate: movingDate ? new Date(movingDate) : null },
      });

      return tx.journey.create({
        data: {
          userId,
          title: `${originCountry} → ${destinationCountry}`,
          origin: originCountry,
          destination: destinationCountry,
          tasks: { create: templates.map((t) => ({ taskId: t.id, phase: t.phase })) },
        },
      });
    });

    return NextResponse.json({ journeyId: journey.id }, { status: 201 });
  } catch (err) {
    console.error("[onboarding/complete]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
