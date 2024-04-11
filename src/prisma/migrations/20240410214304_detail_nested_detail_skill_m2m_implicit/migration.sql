/*
  Warnings:

  - You are about to drop the `DetailOnSkills` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `NestedDetailOnSkills` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "DetailOnSkills" DROP CONSTRAINT "DetailOnSkills_detailId_fkey";

-- DropForeignKey
ALTER TABLE "DetailOnSkills" DROP CONSTRAINT "DetailOnSkills_skillId_fkey";

-- DropForeignKey
ALTER TABLE "NestedDetailOnSkills" DROP CONSTRAINT "NestedDetailOnSkills_nestedDetailId_fkey";

-- DropForeignKey
ALTER TABLE "NestedDetailOnSkills" DROP CONSTRAINT "NestedDetailOnSkills_skillId_fkey";

-- DropTable
DROP TABLE "DetailOnSkills";

-- DropTable
DROP TABLE "NestedDetailOnSkills";

-- CreateTable
CREATE TABLE "_nestedDetailSkills" (
    "A" UUID NOT NULL,
    "B" UUID NOT NULL
);

-- CreateTable
CREATE TABLE "_detailSkills" (
    "A" UUID NOT NULL,
    "B" UUID NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_nestedDetailSkills_AB_unique" ON "_nestedDetailSkills"("A", "B");

-- CreateIndex
CREATE INDEX "_nestedDetailSkills_B_index" ON "_nestedDetailSkills"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_detailSkills_AB_unique" ON "_detailSkills"("A", "B");

-- CreateIndex
CREATE INDEX "_detailSkills_B_index" ON "_detailSkills"("B");

-- AddForeignKey
ALTER TABLE "_nestedDetailSkills" ADD CONSTRAINT "_nestedDetailSkills_A_fkey" FOREIGN KEY ("A") REFERENCES "NestedDetail"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_nestedDetailSkills" ADD CONSTRAINT "_nestedDetailSkills_B_fkey" FOREIGN KEY ("B") REFERENCES "Skill"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_detailSkills" ADD CONSTRAINT "_detailSkills_A_fkey" FOREIGN KEY ("A") REFERENCES "Detail"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_detailSkills" ADD CONSTRAINT "_detailSkills_B_fkey" FOREIGN KEY ("B") REFERENCES "Skill"("id") ON DELETE CASCADE ON UPDATE CASCADE;
