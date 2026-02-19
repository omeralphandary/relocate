-- AlterTable
ALTER TABLE "TaskTemplate" ALTER COLUMN "employmentStatuses" SET DEFAULT ARRAY[]::TEXT[],
ALTER COLUMN "familyStatuses" SET DEFAULT ARRAY[]::TEXT[],
ALTER COLUMN "nationalities" SET DEFAULT ARRAY[]::TEXT[],
ALTER COLUMN "originCountries" SET DEFAULT ARRAY[]::TEXT[];
