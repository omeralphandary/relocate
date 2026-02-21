import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import JourneyView from "@/components/journey/JourneyView";

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const journey = await prisma.journey.findUnique({
    where: { id },
    select: { title: true, destination: true },
  });
  if (!journey) return {};
  return {
    title: journey.title,
    description: `Your personalised relocation checklist for moving to ${journey.destination}. Track tasks, get AI guidance, and stay on top of your move.`,
  };
}

export default async function JourneyPage({ params }: Props) {
  const { id } = await params;
  const session = await auth();

  const journey = await prisma.journey.findUnique({
    where: { id },
    include: {
      tasks: {
        include: { template: true },
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
        taskId: t.taskId,
        status: t.status,
        phase: t.phase,
        isCustom: t.taskId === null,
        customTitle: t.customTitle,
        customDescription: t.customDescription,
        customCategory: t.customCategory,
        aiInstructions: t.aiInstructions,
        aiDocuments: t.aiDocuments,
        aiTips: t.aiTips,
        template: t.template
          ? {
              title: t.template.title,
              description: t.template.description,
              category: t.template.category,
              officialUrl: t.template.officialUrl,
              documents: t.template.documents,
              tips: t.template.tips,
              order: t.template.order,
              dependsOn: t.template.dependsOn,
            }
          : undefined,
      }))}
    />
  );
}
