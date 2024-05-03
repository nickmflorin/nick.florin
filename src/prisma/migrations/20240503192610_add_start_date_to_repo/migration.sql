/*
  Warnings:

  - Added the required column `startDate` to the `Repository` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Repository" ADD COLUMN     "startDate" TIMESTAMP(3) NOT NULL;
