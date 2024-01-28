-- CreateEnum
CREATE TYPE "DetailEntityType" AS ENUM ('EXPERIENCE', 'EDUCATION');

-- CreateTable
CREATE TABLE "Detail" (
    "id" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdById" UUID NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "updatedById" UUID NOT NULL,
    "entityId" UUID NOT NULL,
    "entityType" "DetailEntityType" NOT NULL,
    "label" TEXT NOT NULL,
    "description" TEXT NOT NULL,

    CONSTRAINT "Detail_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Detail_label_entityId_entityType_key" ON "Detail"("label", "entityId", "entityType");

-- AddForeignKey
ALTER TABLE "Detail" ADD CONSTRAINT "Detail_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Detail" ADD CONSTRAINT "Detail_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
