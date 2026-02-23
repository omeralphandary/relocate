-- AlterTable
ALTER TABLE "Journey" ADD COLUMN     "baselineTips" TEXT[] DEFAULT ARRAY[]::TEXT[];
