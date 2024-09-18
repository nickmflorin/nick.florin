/*
  Warnings:

  - A unique constraint covering the columns `[npmPackageName]` on the table `Repository` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Repository_npmPackageName_key" ON "Repository"("npmPackageName");
