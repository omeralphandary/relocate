-- DropForeignKey
ALTER TABLE "JourneyTask" DROP CONSTRAINT "JourneyTask_taskId_fkey";

-- AlterTable
ALTER TABLE "JourneyTask" ADD COLUMN     "customCategory" TEXT,
ADD COLUMN     "customDescription" TEXT,
ADD COLUMN     "customTitle" TEXT,
ALTER COLUMN "taskId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "TaskTemplate" ADD COLUMN     "employmentStatuses" TEXT[],
ADD COLUMN     "familyStatuses" TEXT[],
ADD COLUMN     "nationalities" TEXT[],
ADD COLUMN     "originCountries" TEXT[];

-- AddForeignKey
ALTER TABLE "JourneyTask" ADD CONSTRAINT "JourneyTask_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "TaskTemplate"("id") ON DELETE SET NULL ON UPDATE CASCADE;
