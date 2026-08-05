-- AlterEnum
-- The `Degree` enum becomes `DegreeType` so the name is free for the new `Degree` table (a
-- table's row type shares the Postgres type namespace with enums). Metadata-only rename.
ALTER TYPE "Degree" RENAME TO "DegreeType";

-- CreateEnum
CREATE TYPE "SyndicationChannel" AS ENUM ('LINKEDIN', 'RESUME', 'WEBSITE');

-- CreateEnum
CREATE TYPE "ContentOwnerType" AS ENUM ('DEGREE', 'ROLE');

-- CreateEnum
CREATE TYPE "NodeKind" AS ENUM ('CONTENT', 'SUMMARY');

-- CreateEnum
CREATE TYPE "NodeType" AS ENUM ('BULLETED_LIST', 'NUMBERED_LIST', 'PARAGRAPH');

-- CreateEnum
CREATE TYPE "TitleLayout" AS ENUM ('INLINE', 'STACKED');

-- CreateEnum
CREATE TYPE "Proficiency" AS ENUM ('ADVANCED', 'EXPERT', 'FAMILIAR', 'PROFICIENT');

-- CreateEnum
CREATE TYPE "ContactIcon" AS ENUM ('AT', 'GITHUB', 'GLOBE', 'LINKEDIN');

-- CreateEnum
CREATE TYPE "ResumeCompetenciesGroupDisplay" AS ENUM ('BARS', 'PILLS');

-- AlterTable
ALTER TABLE "Company" ADD COLUMN     "logoFileName" TEXT,
ADD COLUMN     "slug" TEXT;

-- AlterTable
ALTER TABLE "Profile" ADD COLUMN     "handle" TEXT,
ADD COLUMN     "photoFileName" TEXT,
ADD COLUMN     "slug" TEXT;

-- AlterTable
ALTER TABLE "School" ADD COLUMN     "logoFileName" TEXT,
ADD COLUMN     "slug" TEXT;

-- CreateTable
CREATE TABLE "Competency" (
    "id" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdById" UUID NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "updatedById" UUID NOT NULL,
    "slug" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "shortLabel" TEXT,
    "description" TEXT,
    "shortDescription" TEXT,
    "proficiency" "Proficiency",
    "experience" INTEGER,
    "calculatedExperience" INTEGER,
    "isHighlighted" BOOLEAN NOT NULL DEFAULT false,
    "isPrioritized" BOOLEAN NOT NULL DEFAULT false,
    "isVisible" BOOLEAN NOT NULL DEFAULT true,
    "excludedChannels" "SyndicationChannel"[] DEFAULT ARRAY[]::"SyndicationChannel"[],

    CONSTRAINT "Competency_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Role" (
    "id" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdById" UUID NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "updatedById" UUID NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "shortTitle" TEXT,
    "companyId" UUID NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "isCurrent" BOOLEAN NOT NULL DEFAULT false,
    "isRemote" BOOLEAN NOT NULL DEFAULT false,
    "isHighlighted" BOOLEAN NOT NULL DEFAULT false,
    "city" TEXT,
    "state" TEXT,
    "isVisible" BOOLEAN NOT NULL DEFAULT true,
    "excludedChannels" "SyndicationChannel"[] DEFAULT ARRAY[]::"SyndicationChannel"[],
    "resumeSheetId" UUID,

    CONSTRAINT "Role_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Degree" (
    "id" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdById" UUID NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "updatedById" UUID NOT NULL,
    "slug" TEXT NOT NULL,
    "schoolId" UUID NOT NULL,
    "degree" "DegreeType" NOT NULL,
    "major" TEXT NOT NULL,
    "shortMajor" TEXT,
    "minor" TEXT,
    "shortMinor" TEXT,
    "concentration" TEXT,
    "shortConcentration" TEXT,
    "gpa" TEXT,
    "note" TEXT,
    "shortNote" TEXT,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "isCurrent" BOOLEAN NOT NULL DEFAULT false,
    "isHighlighted" BOOLEAN NOT NULL DEFAULT false,
    "isPostponed" BOOLEAN NOT NULL DEFAULT false,
    "isVisible" BOOLEAN NOT NULL DEFAULT true,
    "excludedChannels" "SyndicationChannel"[] DEFAULT ARRAY[]::"SyndicationChannel"[],
    "resumeSheetId" UUID,

    CONSTRAINT "Degree_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContentNode" (
    "id" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdById" UUID NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "updatedById" UUID NOT NULL,
    "slug" TEXT NOT NULL,
    "ownerId" UUID NOT NULL,
    "ownerType" "ContentOwnerType" NOT NULL,
    "kind" "NodeKind" NOT NULL,
    "type" "NodeType",
    "title" TEXT,
    "content" TEXT,
    "titleLayout" "TitleLayout",
    "order" INTEGER NOT NULL,
    "isVisible" BOOLEAN NOT NULL DEFAULT true,
    "excludedChannels" "SyndicationChannel"[] DEFAULT ARRAY[]::"SyndicationChannel"[],

    CONSTRAINT "ContentNode_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NestedContentNode" (
    "id" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdById" UUID NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "updatedById" UUID NOT NULL,
    "slug" TEXT NOT NULL,
    "parentId" UUID NOT NULL,
    "title" TEXT,
    "content" TEXT,
    "titleLayout" "TitleLayout",
    "order" INTEGER NOT NULL,
    "isVisible" BOOLEAN NOT NULL DEFAULT true,
    "excludedChannels" "SyndicationChannel"[] DEFAULT ARRAY[]::"SyndicationChannel"[],

    CONSTRAINT "NestedContentNode_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProfileAboutParagraph" (
    "id" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdById" UUID NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "updatedById" UUID NOT NULL,
    "slug" TEXT NOT NULL,
    "profileId" UUID NOT NULL,
    "content" TEXT NOT NULL,
    "shortContent" TEXT,
    "order" INTEGER NOT NULL,
    "isVisible" BOOLEAN NOT NULL DEFAULT true,
    "excludedChannels" "SyndicationChannel"[] DEFAULT ARRAY[]::"SyndicationChannel"[],

    CONSTRAINT "ProfileAboutParagraph_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProfileHighlight" (
    "id" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdById" UUID NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "updatedById" UUID NOT NULL,
    "slug" TEXT NOT NULL,
    "profileId" UUID NOT NULL,
    "text" TEXT NOT NULL,
    "shortText" TEXT,
    "order" INTEGER NOT NULL,
    "isVisible" BOOLEAN NOT NULL DEFAULT true,
    "excludedChannels" "SyndicationChannel"[] DEFAULT ARRAY[]::"SyndicationChannel"[],

    CONSTRAINT "ProfileHighlight_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProfileContactEntry" (
    "id" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdById" UUID NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "updatedById" UUID NOT NULL,
    "slug" TEXT NOT NULL,
    "profileId" UUID NOT NULL,
    "icon" "ContactIcon" NOT NULL,
    "text" TEXT NOT NULL,
    "shortText" TEXT,
    "order" INTEGER NOT NULL,
    "isVisible" BOOLEAN NOT NULL DEFAULT true,
    "excludedChannels" "SyndicationChannel"[] DEFAULT ARRAY[]::"SyndicationChannel"[],

    CONSTRAINT "ProfileContactEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ResumeSheet" (
    "id" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdById" UUID NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "updatedById" UUID NOT NULL,
    "slug" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "isIntroVisible" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "ResumeSheet_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ResumeCompetenciesGroup" (
    "id" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdById" UUID NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "updatedById" UUID NOT NULL,
    "slug" TEXT NOT NULL,
    "heading" TEXT NOT NULL,
    "shortHeading" TEXT,
    "display" "ResumeCompetenciesGroupDisplay" NOT NULL,
    "order" INTEGER NOT NULL,
    "resumeSheetId" UUID NOT NULL,

    CONSTRAINT "ResumeCompetenciesGroup_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_roleCompetencies" (
    "A" UUID NOT NULL,
    "B" UUID NOT NULL
);

-- CreateTable
CREATE TABLE "_degreeCompetencies" (
    "A" UUID NOT NULL,
    "B" UUID NOT NULL
);

-- CreateTable
CREATE TABLE "_contentNodeCompetencies" (
    "A" UUID NOT NULL,
    "B" UUID NOT NULL
);

-- CreateTable
CREATE TABLE "_nestedContentNodeCompetencies" (
    "A" UUID NOT NULL,
    "B" UUID NOT NULL
);

-- CreateTable
CREATE TABLE "_groupCompetencies" (
    "A" UUID NOT NULL,
    "B" UUID NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Competency_slug_key" ON "Competency"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Competency_label_key" ON "Competency"("label");

-- CreateIndex
CREATE UNIQUE INDEX "Role_slug_key" ON "Role"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Role_title_companyId_key" ON "Role"("title", "companyId");

-- CreateIndex
CREATE UNIQUE INDEX "Degree_slug_key" ON "Degree"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Degree_major_schoolId_key" ON "Degree"("major", "schoolId");

-- CreateIndex
CREATE UNIQUE INDEX "Degree_shortMajor_schoolId_key" ON "Degree"("shortMajor", "schoolId");

-- CreateIndex
CREATE UNIQUE INDEX "ContentNode_slug_ownerId_ownerType_key" ON "ContentNode"("slug", "ownerId", "ownerType");

-- CreateIndex
CREATE UNIQUE INDEX "NestedContentNode_slug_parentId_key" ON "NestedContentNode"("slug", "parentId");

-- CreateIndex
CREATE UNIQUE INDEX "ProfileAboutParagraph_slug_profileId_key" ON "ProfileAboutParagraph"("slug", "profileId");

-- CreateIndex
CREATE UNIQUE INDEX "ProfileHighlight_slug_profileId_key" ON "ProfileHighlight"("slug", "profileId");

-- CreateIndex
CREATE UNIQUE INDEX "ProfileContactEntry_slug_profileId_key" ON "ProfileContactEntry"("slug", "profileId");

-- CreateIndex
CREATE UNIQUE INDEX "ResumeSheet_slug_key" ON "ResumeSheet"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "ResumeCompetenciesGroup_slug_resumeSheetId_key" ON "ResumeCompetenciesGroup"("slug", "resumeSheetId");

-- CreateIndex
CREATE UNIQUE INDEX "_roleCompetencies_AB_unique" ON "_roleCompetencies"("A", "B");

-- CreateIndex
CREATE INDEX "_roleCompetencies_B_index" ON "_roleCompetencies"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_degreeCompetencies_AB_unique" ON "_degreeCompetencies"("A", "B");

-- CreateIndex
CREATE INDEX "_degreeCompetencies_B_index" ON "_degreeCompetencies"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_contentNodeCompetencies_AB_unique" ON "_contentNodeCompetencies"("A", "B");

-- CreateIndex
CREATE INDEX "_contentNodeCompetencies_B_index" ON "_contentNodeCompetencies"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_nestedContentNodeCompetencies_AB_unique" ON "_nestedContentNodeCompetencies"("A", "B");

-- CreateIndex
CREATE INDEX "_nestedContentNodeCompetencies_B_index" ON "_nestedContentNodeCompetencies"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_groupCompetencies_AB_unique" ON "_groupCompetencies"("A", "B");

-- CreateIndex
CREATE INDEX "_groupCompetencies_B_index" ON "_groupCompetencies"("B");

-- CreateIndex
CREATE UNIQUE INDEX "Company_slug_key" ON "Company"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Profile_slug_key" ON "Profile"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "School_slug_key" ON "School"("slug");

-- AddForeignKey
ALTER TABLE "Competency" ADD CONSTRAINT "Competency_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Competency" ADD CONSTRAINT "Competency_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Role" ADD CONSTRAINT "Role_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Role" ADD CONSTRAINT "Role_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Role" ADD CONSTRAINT "Role_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Role" ADD CONSTRAINT "Role_resumeSheetId_fkey" FOREIGN KEY ("resumeSheetId") REFERENCES "ResumeSheet"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Degree" ADD CONSTRAINT "Degree_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Degree" ADD CONSTRAINT "Degree_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Degree" ADD CONSTRAINT "Degree_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "School"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Degree" ADD CONSTRAINT "Degree_resumeSheetId_fkey" FOREIGN KEY ("resumeSheetId") REFERENCES "ResumeSheet"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContentNode" ADD CONSTRAINT "ContentNode_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContentNode" ADD CONSTRAINT "ContentNode_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NestedContentNode" ADD CONSTRAINT "NestedContentNode_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NestedContentNode" ADD CONSTRAINT "NestedContentNode_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NestedContentNode" ADD CONSTRAINT "NestedContentNode_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "ContentNode"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProfileAboutParagraph" ADD CONSTRAINT "ProfileAboutParagraph_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProfileAboutParagraph" ADD CONSTRAINT "ProfileAboutParagraph_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProfileAboutParagraph" ADD CONSTRAINT "ProfileAboutParagraph_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "Profile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProfileHighlight" ADD CONSTRAINT "ProfileHighlight_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProfileHighlight" ADD CONSTRAINT "ProfileHighlight_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProfileHighlight" ADD CONSTRAINT "ProfileHighlight_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "Profile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProfileContactEntry" ADD CONSTRAINT "ProfileContactEntry_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProfileContactEntry" ADD CONSTRAINT "ProfileContactEntry_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProfileContactEntry" ADD CONSTRAINT "ProfileContactEntry_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "Profile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ResumeSheet" ADD CONSTRAINT "ResumeSheet_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ResumeSheet" ADD CONSTRAINT "ResumeSheet_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ResumeCompetenciesGroup" ADD CONSTRAINT "ResumeCompetenciesGroup_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ResumeCompetenciesGroup" ADD CONSTRAINT "ResumeCompetenciesGroup_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ResumeCompetenciesGroup" ADD CONSTRAINT "ResumeCompetenciesGroup_resumeSheetId_fkey" FOREIGN KEY ("resumeSheetId") REFERENCES "ResumeSheet"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_roleCompetencies" ADD CONSTRAINT "_roleCompetencies_A_fkey" FOREIGN KEY ("A") REFERENCES "Competency"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_roleCompetencies" ADD CONSTRAINT "_roleCompetencies_B_fkey" FOREIGN KEY ("B") REFERENCES "Role"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_degreeCompetencies" ADD CONSTRAINT "_degreeCompetencies_A_fkey" FOREIGN KEY ("A") REFERENCES "Competency"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_degreeCompetencies" ADD CONSTRAINT "_degreeCompetencies_B_fkey" FOREIGN KEY ("B") REFERENCES "Degree"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_contentNodeCompetencies" ADD CONSTRAINT "_contentNodeCompetencies_A_fkey" FOREIGN KEY ("A") REFERENCES "Competency"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_contentNodeCompetencies" ADD CONSTRAINT "_contentNodeCompetencies_B_fkey" FOREIGN KEY ("B") REFERENCES "ContentNode"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_nestedContentNodeCompetencies" ADD CONSTRAINT "_nestedContentNodeCompetencies_A_fkey" FOREIGN KEY ("A") REFERENCES "Competency"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_nestedContentNodeCompetencies" ADD CONSTRAINT "_nestedContentNodeCompetencies_B_fkey" FOREIGN KEY ("B") REFERENCES "NestedContentNode"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_groupCompetencies" ADD CONSTRAINT "_groupCompetencies_A_fkey" FOREIGN KEY ("A") REFERENCES "Competency"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_groupCompetencies" ADD CONSTRAINT "_groupCompetencies_B_fkey" FOREIGN KEY ("B") REFERENCES "ResumeCompetenciesGroup"("id") ON DELETE CASCADE ON UPDATE CASCADE;

