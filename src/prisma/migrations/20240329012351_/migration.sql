/*
  Warnings:

  - You are about to drop the column `label` on the `Course` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[name]` on the table `Course` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[shortName]` on the table `Course` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `name` to the `Course` table without a default value. This is not possible if the table is not empty.
  - Added the required column `shortName` to the `Course` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Course_label_key";

-- AlterTable
ALTER TABLE "Course" DROP COLUMN "label",
ADD COLUMN     "name" TEXT NOT NULL,
ADD COLUMN     "shortName" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Course_name_key" ON "Course"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Course_shortName_key" ON "Course"("shortName");
