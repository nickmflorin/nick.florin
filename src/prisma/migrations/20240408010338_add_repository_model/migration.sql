-- CreateTable
CREATE TABLE "Repository" (
    "id" UUID NOT NULL,
    "slug" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdById" UUID NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "updatedById" UUID NOT NULL,

    CONSTRAINT "Repository_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_skillRepositories" (
    "A" UUID NOT NULL,
    "B" UUID NOT NULL
);

-- CreateTable
CREATE TABLE "_projectRepositories" (
    "A" UUID NOT NULL,
    "B" UUID NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Repository_slug_key" ON "Repository"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "_skillRepositories_AB_unique" ON "_skillRepositories"("A", "B");

-- CreateIndex
CREATE INDEX "_skillRepositories_B_index" ON "_skillRepositories"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_projectRepositories_AB_unique" ON "_projectRepositories"("A", "B");

-- CreateIndex
CREATE INDEX "_projectRepositories_B_index" ON "_projectRepositories"("B");

-- AddForeignKey
ALTER TABLE "Repository" ADD CONSTRAINT "Repository_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Repository" ADD CONSTRAINT "Repository_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_skillRepositories" ADD CONSTRAINT "_skillRepositories_A_fkey" FOREIGN KEY ("A") REFERENCES "Repository"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_skillRepositories" ADD CONSTRAINT "_skillRepositories_B_fkey" FOREIGN KEY ("B") REFERENCES "Skill"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_projectRepositories" ADD CONSTRAINT "_projectRepositories_A_fkey" FOREIGN KEY ("A") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_projectRepositories" ADD CONSTRAINT "_projectRepositories_B_fkey" FOREIGN KEY ("B") REFERENCES "Repository"("id") ON DELETE CASCADE ON UPDATE CASCADE;
