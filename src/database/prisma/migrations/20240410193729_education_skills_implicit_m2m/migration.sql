/*
  Warnings:

  - You are about to drop the `EducationOnSkills` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "EducationOnSkills" DROP CONSTRAINT "EducationOnSkills_educationId_fkey";

-- DropForeignKey
ALTER TABLE "EducationOnSkills" DROP CONSTRAINT "EducationOnSkills_skillId_fkey";

-- DropTable
DROP TABLE "EducationOnSkills";

-- CreateTable
CREATE TABLE "_educationSkills" (
    "A" UUID NOT NULL,
    "B" UUID NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_educationSkills_AB_unique" ON "_educationSkills"("A", "B");

-- CreateIndex
CREATE INDEX "_educationSkills_B_index" ON "_educationSkills"("B");

-- AddForeignKey
ALTER TABLE "_educationSkills" ADD CONSTRAINT "_educationSkills_A_fkey" FOREIGN KEY ("A") REFERENCES "Education"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_educationSkills" ADD CONSTRAINT "_educationSkills_B_fkey" FOREIGN KEY ("B") REFERENCES "Skill"("id") ON DELETE CASCADE ON UPDATE CASCADE;
