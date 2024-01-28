-- CreateTable
CREATE TABLE "NestedDetail" (
    "id" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdById" UUID NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "updatedById" UUID NOT NULL,
    "label" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "visible" BOOLEAN NOT NULL DEFAULT true,
    "detailId" UUID NOT NULL,

    CONSTRAINT "NestedDetail_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "NestedDetail_label_detailId_key" ON "NestedDetail"("label", "detailId");

-- AddForeignKey
ALTER TABLE "NestedDetail" ADD CONSTRAINT "NestedDetail_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NestedDetail" ADD CONSTRAINT "NestedDetail_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NestedDetail" ADD CONSTRAINT "NestedDetail_detailId_fkey" FOREIGN KEY ("detailId") REFERENCES "Detail"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
