/*
  Warnings:

  - The values [BACKEND,FRONTEND,REST_API,PYTHON_PACKAGE,JAVASCRIPT_PACKAGE,REACT,MOBILE] on the enum `SkillCategory` will be removed. If these variants are still used in the database, this will fail.

*/
-- CreateEnum
CREATE TYPE "ProgrammingDomain" AS ENUM ('BACKEND', 'FRONTEND', 'MOBILE');

-- CreateEnum
CREATE TYPE "ProgrammingLanguage" AS ENUM ('JAVASCRIPT', 'TYPESCRIPT', 'PYTHON', 'REACT', 'SWIFT', 'REACT_NATIVE', 'CSS', 'SCSS');

-- AlterEnum
BEGIN;
CREATE TYPE "SkillCategory_new" AS ENUM ('DEVOPS', 'DATABASE', 'API_DEVELOPMENT', 'TESTING', 'PROGRAMMING_LANGUAGE', 'WEB_FRAMEWORK', 'PACKAGE');
ALTER TABLE "Skill" ALTER COLUMN "categories" DROP DEFAULT;
ALTER TABLE "Skill" ALTER COLUMN "categories" TYPE "SkillCategory_new"[] USING ("categories"::text::"SkillCategory_new"[]);
ALTER TYPE "SkillCategory" RENAME TO "SkillCategory_old";
ALTER TYPE "SkillCategory_new" RENAME TO "SkillCategory";
DROP TYPE "SkillCategory_old";
ALTER TABLE "Skill" ALTER COLUMN "categories" SET DEFAULT ARRAY[]::"SkillCategory"[];
COMMIT;

-- AlterTable
ALTER TABLE "Skill" ADD COLUMN     "programmingDomains" "ProgrammingDomain"[] DEFAULT ARRAY[]::"ProgrammingDomain"[],
ADD COLUMN     "programmingLanguages" "ProgrammingLanguage"[] DEFAULT ARRAY[]::"ProgrammingLanguage"[];
