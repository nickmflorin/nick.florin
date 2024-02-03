/*
  Warnings:

  - A unique constraint covering the columns `[label]` on the table `Skill` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Skill_label_key" ON "Skill"("label");
