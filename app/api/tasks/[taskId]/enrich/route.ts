import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { enrichTask } from "@/lib/llm";

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ taskId: string }> },
) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { taskId } = await params;

    const journeyTask = await prisma.journeyTask.findUnique({
      where: { id: taskId },
      include: {
        template: true,
        journey: {
          include: {
            user: { include: { profile: true } },
          },
        },
      },
    });

    if (!journeyTask) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    if (journeyTask.journey.user.email !== session.user.email) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const profile = journeyTask.journey.user.profile;
    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 400 });
    }

    const taskTitle = journeyTask.taskId
      ? journeyTask.template!.title
      : (journeyTask.customTitle ?? "Custom task");
    const taskDescription = journeyTask.taskId
      ? journeyTask.template!.description
      : (journeyTask.customDescription ?? "");
    const category = journeyTask.taskId
      ? journeyTask.template!.category
      : (journeyTask.customCategory ?? "general");

    const enriched = await enrichTask({
      taskTitle,
      taskDescription,
      category,
      nationality: profile.nationality,
      originCountry: profile.originCountry,
      destinationCountry: profile.destinationCountry,
      employmentStatus: profile.employmentStatus,
      familyStatus: profile.familyStatus,
      movingDate: profile.movingDate?.toISOString() ?? null,
    });

    const updated = await prisma.journeyTask.update({
      where: { id: taskId },
      data: {
        aiInstructions: enriched.instructions,
        aiDocuments: enriched.documents,
        aiTips: enriched.tips,
        aiGeneratedAt: new Date(),
      },
    });

    return NextResponse.json({
      aiInstructions: updated.aiInstructions,
      aiDocuments: updated.aiDocuments,
      aiTips: updated.aiTips,
      aiGeneratedAt: updated.aiGeneratedAt,
    });
  } catch (err) {
    console.error("[enrich]", err);
    return NextResponse.json(
      { error: "Failed to generate AI guidance. Please try again." },
      { status: 500 },
    );
  }
}
