import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
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

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ taskId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { taskId } = await params;

    const task = await prisma.journeyTask.findUnique({
      where: { id: taskId },
      include: {
        journey: { include: { user: true } },
      },
    });

    if (!task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    if (task.journey.user.email !== session.user.email) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (task.taskId !== null) {
      return NextResponse.json({ error: "Cannot delete system tasks" }, { status: 400 });
    }

    await prisma.journeyTask.delete({ where: { id: taskId } });

    return NextResponse.json({ deleted: true });
  } catch (err) {
    console.error("[tasks DELETE]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
