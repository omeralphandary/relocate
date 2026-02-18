import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const journey = await prisma.journey.findFirst({
    where: { userId: session.user.id, status: "ACTIVE" },
    orderBy: { createdAt: "desc" },
  });

  if (!journey) {
    return NextResponse.json({ error: "No journey found" }, { status: 404 });
  }

  return NextResponse.json({ journeyId: journey.id });
}
