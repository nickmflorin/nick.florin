-- AlterTable
ALTER TABLE "Education" ADD COLUMN     "highlighted" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "Experience" ADD COLUMN     "highlighted" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "Project" ADD COLUMN     "highlighted" BOOLEAN NOT NULL DEFAULT true;
