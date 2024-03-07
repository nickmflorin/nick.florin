-- AlterTable
ALTER TABLE "NestedDetail" ADD COLUMN     "shortDescription" TEXT,
ALTER COLUMN "description" DROP NOT NULL;
