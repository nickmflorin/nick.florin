/*
  Warnings:

  - You are about to drop the column `personalityTraitId` on the `EducationOnSkills` table. All the data in the column will be lost.
  - You are about to drop the column `personalityTraitId` on the `ExperienceOnSkills` table. All the data in the column will be lost.
  - You are about to drop the `PersonalityTrait` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "EducationOnSkills" DROP CONSTRAINT "EducationOnSkills_personalityTraitId_fkey";

-- DropForeignKey
ALTER TABLE "ExperienceOnSkills" DROP CONSTRAINT "ExperienceOnSkills_personalityTraitId_fkey";

-- DropForeignKey
ALTER TABLE "PersonalityTrait" DROP CONSTRAINT "PersonalityTrait_createdById_fkey";

-- DropForeignKey
ALTER TABLE "PersonalityTrait" DROP CONSTRAINT "PersonalityTrait_updatedById_fkey";

-- AlterTable
ALTER TABLE "Education" ADD COLUMN     "shortMajor" TEXT;

-- AlterTable
ALTER TABLE "EducationOnSkills" DROP COLUMN "personalityTraitId";

-- AlterTable
ALTER TABLE "ExperienceOnSkills" DROP COLUMN "personalityTraitId";

-- DropTable
DROP TABLE "PersonalityTrait";
