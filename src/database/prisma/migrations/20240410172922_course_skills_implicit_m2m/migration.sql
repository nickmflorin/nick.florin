/*
  Warnings:

  - You are about to drop the `CourseOnSkills` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "CourseOnSkills" DROP CONSTRAINT "CourseOnSkills_courseId_fkey";

-- DropForeignKey
ALTER TABLE "CourseOnSkills" DROP CONSTRAINT "CourseOnSkills_skillId_fkey";

-- DropTable
DROP TABLE "CourseOnSkills";

-- CreateTable
CREATE TABLE "_courseSkills" (
    "A" UUID NOT NULL,
    "B" UUID NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_courseSkills_AB_unique" ON "_courseSkills"("A", "B");

-- CreateIndex
CREATE INDEX "_courseSkills_B_index" ON "_courseSkills"("B");

-- AddForeignKey
ALTER TABLE "_courseSkills" ADD CONSTRAINT "_courseSkills_A_fkey" FOREIGN KEY ("A") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_courseSkills" ADD CONSTRAINT "_courseSkills_B_fkey" FOREIGN KEY ("B") REFERENCES "Skill"("id") ON DELETE CASCADE ON UPDATE CASCADE;
