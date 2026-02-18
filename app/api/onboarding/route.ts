import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
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
      nationality, originCountry, destinationCountry,
      employmentStatus, familyStatus, hasChildren, movingDate,
    } = body;

    if (!name || !email || !password || !nationality || !originCountry || !destinationCountry || !employmentStatus || !familyStatus) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    if (password.length < 8) {
      return NextResponse.json({ error: "Password must be at least 8 characters" }, { status: 400 });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: "An account with this email already exists" }, { status: 409 });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const templates = await prisma.taskTemplate.findMany({
      where: {
        OR: [
          { countries: { isEmpty: true } },
          { countries: { has: destinationCountry } },
        ],
      },
      orderBy: [{ category: "asc" }, { order: "asc" }],
    });

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
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
            tasks: {
              create: templates.map((t) => ({ taskId: t.id })),
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
