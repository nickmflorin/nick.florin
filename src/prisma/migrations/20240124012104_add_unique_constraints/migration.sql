/*
  Warnings:

  - A unique constraint covering the columns `[major,schoolId]` on the table `Education` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[title,companyId]` on the table `Experience` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Education_major_schoolId_key" ON "Education"("major", "schoolId");

-- CreateIndex
CREATE UNIQUE INDEX "Experience_title_companyId_key" ON "Experience"("title", "companyId");
