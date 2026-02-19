import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { generateCustomTaskOverview } from "@/lib/llm";

const VALID_CATEGORIES = ["housing", "banking", "legal", "telecom", "transport", "insurance", "general"];

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ journeyId: string }> },
) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { journeyId } = await params;

    const journey = await prisma.journey.findUnique({
      where: { id: journeyId },
      include: { user: { include: { profile: true } } },
    });

    if (!journey) {
      return NextResponse.json({ error: "Journey not found" }, { status: 404 });
    }

    if (journey.user.email !== session.user.email) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json() as { title?: string; category?: string };
    const { title, category } = body;

    if (!title || typeof title !== "string" || title.trim() === "") {
      return NextResponse.json({ error: "title is required" }, { status: 400 });
    }
    if (!category || !VALID_CATEGORIES.includes(category)) {
      return NextResponse.json(
        { error: `category must be one of: ${VALID_CATEGORIES.join(", ")}` },
        { status: 400 },
      );
    }

    const profile = journey.user.profile;
    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 400 });
    }

    let overview;
    try {
      overview = await generateCustomTaskOverview({
        userTitle: title.trim(),
        category,
        nationality: profile.nationality,
        originCountry: profile.originCountry,
        destinationCountry: profile.destinationCountry,
        employmentStatus: profile.employmentStatus,
        familyStatus: profile.familyStatus,
        movingDate: profile.movingDate?.toISOString() ?? null,
      });
    } catch (llmErr) {
      console.error("[custom task LLM]", llmErr);
      return NextResponse.json(
        { error: "Failed to generate task overview. Please try again." },
        { status: 500 },
      );
    }

    const task = await prisma.journeyTask.create({
      data: {
        journeyId,
        taskId: null,
        customTitle: overview.refinedTitle,
        customDescription: overview.description,
        customCategory: category,
        aiInstructions: overview.instructions,
        aiDocuments: overview.documents,
        aiTips: overview.tips,
        aiGeneratedAt: new Date(),
      },
    });

    return NextResponse.json(
      {
        id: task.id,
        status: task.status,
        isCustom: true,
        customTitle: task.customTitle,
        customDescription: task.customDescription,
        customCategory: task.customCategory,
        aiInstructions: task.aiInstructions,
        aiDocuments: task.aiDocuments,
        aiTips: task.aiTips,
        aiGeneratedAt: task.aiGeneratedAt,
        template: undefined,
      },
      { status: 201 },
    );
  } catch (err) {
    console.error("[journeys tasks POST]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
