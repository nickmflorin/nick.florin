-- CreateTable
CREATE TABLE "NestedDetailOnSkills" (
    "nestedDetailId" UUID NOT NULL,
    "skillId" UUID NOT NULL,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "assignedById" UUID NOT NULL,

    CONSTRAINT "NestedDetailOnSkills_pkey" PRIMARY KEY ("skillId","nestedDetailId")
);

-- CreateTable
CREATE TABLE "DetailOnSkills" (
    "detailId" UUID NOT NULL,
    "skillId" UUID NOT NULL,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "assignedById" UUID NOT NULL,

    CONSTRAINT "DetailOnSkills_pkey" PRIMARY KEY ("skillId","detailId")
);

-- AddForeignKey
ALTER TABLE "NestedDetailOnSkills" ADD CONSTRAINT "NestedDetailOnSkills_nestedDetailId_fkey" FOREIGN KEY ("nestedDetailId") REFERENCES "NestedDetail"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NestedDetailOnSkills" ADD CONSTRAINT "NestedDetailOnSkills_skillId_fkey" FOREIGN KEY ("skillId") REFERENCES "Skill"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DetailOnSkills" ADD CONSTRAINT "DetailOnSkills_detailId_fkey" FOREIGN KEY ("detailId") REFERENCES "Detail"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DetailOnSkills" ADD CONSTRAINT "DetailOnSkills_skillId_fkey" FOREIGN KEY ("skillId") REFERENCES "Skill"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
