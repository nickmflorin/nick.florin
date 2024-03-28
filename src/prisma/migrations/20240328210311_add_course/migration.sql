-- CreateTable
CREATE TABLE "Course" (
    "id" UUID NOT NULL,
    "label" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdById" UUID NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "updatedById" UUID NOT NULL,
    "educationId" UUID NOT NULL,
    "visible" BOOLEAN NOT NULL DEFAULT true,
    "description" TEXT,

    CONSTRAINT "Course_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Course_label_key" ON "Course"("label");

-- CreateIndex
CREATE UNIQUE INDEX "Course_slug_key" ON "Course"("slug");

-- AddForeignKey
ALTER TABLE "Course" ADD CONSTRAINT "Course_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Course" ADD CONSTRAINT "Course_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Course" ADD CONSTRAINT "Course_educationId_fkey" FOREIGN KEY ("educationId") REFERENCES "Education"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
