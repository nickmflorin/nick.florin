/*
  Warnings:

  - You are about to drop the column `includeInTopSkills` on the `Skill` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Skill" DROP COLUMN "includeInTopSkills",
ADD COLUMN     "highlighted" BOOLEAN NOT NULL DEFAULT false;
