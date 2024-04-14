/*
  Warnings:

  - Added the required column `filename` to the `Resume` table without a default value. This is not possible if the table is not empty.
  - Added the required column `pathname` to the `Resume` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Resume" ADD COLUMN     "filename" TEXT NOT NULL,
ADD COLUMN     "pathname" TEXT NOT NULL;
