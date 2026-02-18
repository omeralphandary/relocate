import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import JourneyView from "@/components/journey/JourneyView";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function JourneyPage({ params }: Props) {
  const { id } = await params;
  const session = await auth();

  const journey = await prisma.journey.findUnique({
    where: { id },
    include: {
      tasks: {
        include: { template: true },
        orderBy: { template: { order: "asc" } },
      },
    },
  });

  if (!journey) notFound();

  return (
    <JourneyView
      journeyId={journey.id}
      title={journey.title}
      origin={journey.origin}
      destination={journey.destination}
      userName={session?.user?.name ?? null}
      userEmail={session?.user?.email ?? null}
      tasks={journey.tasks.map((t) => ({
        id: t.id,
        status: t.status,
        template: {
          title: t.template.title,
          description: t.template.description,
          category: t.template.category,
          officialUrl: t.template.officialUrl,
          documents: t.template.documents,
          tips: t.template.tips,
          order: t.template.order,
        },
      }))}
    />
  );
}
