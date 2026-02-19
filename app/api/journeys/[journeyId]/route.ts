import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

interface Params {
  params: Promise<{ journeyId: string }>;
}

// PATCH /api/journeys/[journeyId] — archive the journey
export async function PATCH(req: NextRequest, { params }: Params) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { journeyId } = await params;

  const journey = await prisma.journey.findUnique({
    where: { id: journeyId },
    select: { userId: true },
  });

  if (!journey) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (journey.userId !== session.user.id) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  await prisma.journey.update({
    where: { id: journeyId },
    data: { status: "ARCHIVED" },
  });

  return NextResponse.json({ ok: true });
}
