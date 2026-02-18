import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { OnboardingData } from "@/types";

export async function POST(req: NextRequest) {
  try {
    const body: OnboardingData = await req.json();

    const { nationality, originCountry, destinationCountry, employmentStatus, familyStatus, hasChildren, movingDate } = body;

    if (!nationality || !originCountry || !destinationCountry || !employmentStatus || !familyStatus) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Create a guest user for now (no auth yet)
    const user = await prisma.user.create({
      data: {
        email: `guest_${Date.now()}@relocate.app`,
        profile: {
          create: {
            nationality,
            originCountry,
            destinationCountry,
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
          },
        },
      },
      include: {
        journeys: true,
      },
    });

    const journey = user.journeys[0];

    return NextResponse.json({ journeyId: journey.id }, { status: 201 });
  } catch (err) {
    console.error("[onboarding]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
