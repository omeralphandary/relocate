import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { TaskStatus } from "@prisma/client";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ taskId: string }> }
) {
  try {
    const { taskId } = await params;
    const { status } = await req.json() as { status: TaskStatus };

    if (!Object.values(TaskStatus).includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    const task = await prisma.journeyTask.update({
      where: { id: taskId },
      data: {
        status,
        completedAt: status === TaskStatus.COMPLETED ? new Date() : null,
      },
    });

    return NextResponse.json(task);
  } catch (err) {
    console.error("[tasks PATCH]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
