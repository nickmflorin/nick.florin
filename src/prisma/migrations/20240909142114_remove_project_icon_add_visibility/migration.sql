/*
  Warnings:

  - You are about to drop the column `icon` on the `Project` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "Project_icon_key";

-- AlterTable
ALTER TABLE "Project" DROP COLUMN "icon",
ADD COLUMN     "visible" BOOLEAN NOT NULL DEFAULT false,
ALTER COLUMN "highlighted" SET DEFAULT false;
