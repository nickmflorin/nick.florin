/*
  Warnings:

  - You are about to drop the column `description` on the `Resume` table. All the data in the column will be lost.
  - You are about to drop the column `slug` on the `Resume` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "Resume_slug_key";

-- AlterTable
ALTER TABLE "Resume" DROP COLUMN "description",
DROP COLUMN "slug";
