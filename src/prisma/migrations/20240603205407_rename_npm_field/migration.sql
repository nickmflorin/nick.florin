/*
  Warnings:

  - You are about to drop the column `npm_package_name` on the `Repository` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Repository" DROP COLUMN "npm_package_name",
ADD COLUMN     "npmPackageName" TEXT;
