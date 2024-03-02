/*
  Warnings:

  - A unique constraint covering the columns `[shortMajor,schoolId]` on the table `Education` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[shortName]` on the table `School` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "School" ADD COLUMN     "shortName" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Education_shortMajor_schoolId_key" ON "Education"("shortMajor", "schoolId");

-- CreateIndex
CREATE UNIQUE INDEX "School_shortName_key" ON "School"("shortName");
