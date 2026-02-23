import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ journeyId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { journeyId } = await params;

  const journey = await prisma.journey.findUnique({ where: { id: journeyId }, select: { userId: true } });
  if (!journey) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (journey.userId !== session.user.id) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  await prisma.journey.update({ where: { id: journeyId }, data: { baselineTips: [] } });

  return NextResponse.json({ ok: true });
}
