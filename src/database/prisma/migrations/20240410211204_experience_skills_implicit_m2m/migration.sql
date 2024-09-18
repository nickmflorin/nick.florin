/*
  Warnings:

  - You are about to drop the `ExperienceOnSkills` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "ExperienceOnSkills" DROP CONSTRAINT "ExperienceOnSkills_experienceId_fkey";

-- DropForeignKey
ALTER TABLE "ExperienceOnSkills" DROP CONSTRAINT "ExperienceOnSkills_skillId_fkey";

-- DropTable
DROP TABLE "ExperienceOnSkills";

-- CreateTable
CREATE TABLE "_experienceSkills" (
    "A" UUID NOT NULL,
    "B" UUID NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_experienceSkills_AB_unique" ON "_experienceSkills"("A", "B");

-- CreateIndex
CREATE INDEX "_experienceSkills_B_index" ON "_experienceSkills"("B");

-- AddForeignKey
ALTER TABLE "_experienceSkills" ADD CONSTRAINT "_experienceSkills_A_fkey" FOREIGN KEY ("A") REFERENCES "Experience"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_experienceSkills" ADD CONSTRAINT "_experienceSkills_B_fkey" FOREIGN KEY ("B") REFERENCES "Skill"("id") ON DELETE CASCADE ON UPDATE CASCADE;
