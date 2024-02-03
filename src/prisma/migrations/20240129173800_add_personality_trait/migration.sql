-- CreateEnum
CREATE TYPE "SkillType" AS ENUM ('PROGRAMMING_LANGUAGE', 'WEB_FRAMEWORK');

-- AlterTable
ALTER TABLE "EducationOnSkills" ADD COLUMN     "personalityTraitId" UUID;

-- AlterTable
ALTER TABLE "ExperienceOnSkills" ADD COLUMN     "personalityTraitId" UUID;

-- AlterTable
ALTER TABLE "Skill" ADD COLUMN     "description" TEXT,
ADD COLUMN     "experience" INTEGER,
ADD COLUMN     "skillType" "SkillType";

-- CreateTable
CREATE TABLE "PersonalityTrait" (
    "id" UUID NOT NULL,
    "label" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdById" UUID NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "updatedById" UUID NOT NULL,
    "visible" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "PersonalityTrait_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PersonalityTrait_label_key" ON "PersonalityTrait"("label");

-- AddForeignKey
ALTER TABLE "PersonalityTrait" ADD CONSTRAINT "PersonalityTrait_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PersonalityTrait" ADD CONSTRAINT "PersonalityTrait_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExperienceOnSkills" ADD CONSTRAINT "ExperienceOnSkills_personalityTraitId_fkey" FOREIGN KEY ("personalityTraitId") REFERENCES "PersonalityTrait"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EducationOnSkills" ADD CONSTRAINT "EducationOnSkills_personalityTraitId_fkey" FOREIGN KEY ("personalityTraitId") REFERENCES "PersonalityTrait"("id") ON DELETE SET NULL ON UPDATE CASCADE;
