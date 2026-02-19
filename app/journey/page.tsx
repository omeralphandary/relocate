import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

// Landing page after Google sign-in — redirects to the user's active journey
// or to /onboarding if they haven't set one up yet.
export default async function JourneyIndexPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/auth/signin");

  const journey = await prisma.journey.findFirst({
    where: { userId: session.user.id, status: "ACTIVE" },
    orderBy: { createdAt: "desc" },
    select: { id: true },
  });

  if (journey) redirect(`/journey/${journey.id}`);
  redirect("/onboarding");
}
