/*
  Warnings:

  - You are about to drop the `ProjectOnSkills` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "ProjectOnSkills" DROP CONSTRAINT "ProjectOnSkills_projectId_fkey";

-- DropForeignKey
ALTER TABLE "ProjectOnSkills" DROP CONSTRAINT "ProjectOnSkills_skillId_fkey";

-- DropTable
DROP TABLE "ProjectOnSkills";

-- CreateTable
CREATE TABLE "_projectSkills" (
    "A" UUID NOT NULL,
    "B" UUID NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_projectSkills_AB_unique" ON "_projectSkills"("A", "B");

-- CreateIndex
CREATE INDEX "_projectSkills_B_index" ON "_projectSkills"("B");

-- AddForeignKey
ALTER TABLE "_projectSkills" ADD CONSTRAINT "_projectSkills_A_fkey" FOREIGN KEY ("A") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_projectSkills" ADD CONSTRAINT "_projectSkills_B_fkey" FOREIGN KEY ("B") REFERENCES "Skill"("id") ON DELETE CASCADE ON UPDATE CASCADE;
