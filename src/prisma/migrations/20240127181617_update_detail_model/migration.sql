-- AlterTable
ALTER TABLE "Detail" ADD COLUMN     "shortDescription" TEXT,
ADD COLUMN     "visible" BOOLEAN NOT NULL DEFAULT true;
