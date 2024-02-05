/*
  Warnings:

  - The values [REACT,REACT_NATIVE] on the enum `ProgrammingLanguage` will be removed. If these variants are still used in the database, this will fail.
  - The values [WEB_FRAMEWORK] on the enum `SkillCategory` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "ProgrammingLanguage_new" AS ENUM ('JAVASCRIPT', 'TYPESCRIPT', 'PYTHON', 'SWIFT', 'CSS', 'SCSS', 'CPLUSPLUS');
ALTER TABLE "Skill" ALTER COLUMN "programmingLanguages" DROP DEFAULT;
ALTER TABLE "Skill" ALTER COLUMN "programmingLanguages" TYPE "ProgrammingLanguage_new"[] USING ("programmingLanguages"::text::"ProgrammingLanguage_new"[]);
ALTER TYPE "ProgrammingLanguage" RENAME TO "ProgrammingLanguage_old";
ALTER TYPE "ProgrammingLanguage_new" RENAME TO "ProgrammingLanguage";
DROP TYPE "ProgrammingLanguage_old";
ALTER TABLE "Skill" ALTER COLUMN "programmingLanguages" SET DEFAULT ARRAY[]::"ProgrammingLanguage"[];
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "SkillCategory_new" AS ENUM ('DEVOPS', 'DATABASE', 'API_DEVELOPMENT', 'TESTING', 'PROGRAMMING_LANGUAGE', 'FRAMEWORK', 'PACKAGE');
ALTER TABLE "Skill" ALTER COLUMN "categories" DROP DEFAULT;
ALTER TABLE "Skill" ALTER COLUMN "categories" TYPE "SkillCategory_new"[] USING ("categories"::text::"SkillCategory_new"[]);
ALTER TYPE "SkillCategory" RENAME TO "SkillCategory_old";
ALTER TYPE "SkillCategory_new" RENAME TO "SkillCategory";
DROP TYPE "SkillCategory_old";
ALTER TABLE "Skill" ALTER COLUMN "categories" SET DEFAULT ARRAY[]::"SkillCategory"[];
COMMIT;
