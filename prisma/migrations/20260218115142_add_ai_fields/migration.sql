-- AlterTable
ALTER TABLE "JourneyTask" ADD COLUMN     "aiDocuments" TEXT[],
ADD COLUMN     "aiGeneratedAt" TIMESTAMP(3),
ADD COLUMN     "aiInstructions" TEXT,
ADD COLUMN     "aiTips" TEXT;

-- AlterTable
ALTER TABLE "TaskTemplate" ADD COLUMN     "aiEnriched" BOOLEAN NOT NULL DEFAULT false;
