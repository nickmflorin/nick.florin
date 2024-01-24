/*
  Warnings:

  - You are about to drop the column `slug` on the `Profile` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "Profile_slug_key";

-- AlterTable
ALTER TABLE "Education" ADD COLUMN     "postPoned" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "Profile" DROP COLUMN "slug";
