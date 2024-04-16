/*
  Warnings:

  - You are about to drop the column `exposed` on the `Resume` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Resume" DROP COLUMN "exposed",
ADD COLUMN     "primary" BOOLEAN NOT NULL DEFAULT false;
