/*
  Warnings:

  - A unique constraint covering the columns `[shortName]` on the table `Company` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Company" ADD COLUMN     "shortName" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Company_shortName_key" ON "Company"("shortName");
