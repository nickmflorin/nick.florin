/*
  Warnings:

  - You are about to drop the column `skillType` on the `Skill` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "SkillCategory" AS ENUM ('BACKEND', 'FRONTEND', 'DEVOPS', 'DATABASE', 'REST_API', 'TESTING', 'PROGRAMMING_LANGUAGE', 'WEB_FRAMEWORK', 'PYTHON_PACKAGE', 'JAVASCRIPT_PACKAGE');

-- AlterTable
ALTER TABLE "Skill" DROP COLUMN "skillType",
ADD COLUMN     "categories" "SkillCategory"[] DEFAULT ARRAY[]::"SkillCategory"[];

-- DropEnum
DROP TYPE "SkillType";
