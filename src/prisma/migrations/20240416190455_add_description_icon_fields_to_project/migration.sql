/*
  Warnings:

  - A unique constraint covering the columns `[icon]` on the table `Project` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `description` to the `Project` table without a default value. This is not possible if the table is not empty.
  - Added the required column `icon` to the `Project` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Project" ADD COLUMN     "description" TEXT NOT NULL,
ADD COLUMN     "icon" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Project_icon_key" ON "Project"("icon");
