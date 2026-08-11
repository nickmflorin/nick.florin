/*
  Inverts syndication from an exclusion list to an allowlist on every parallel content model:
  `excludedChannels` is RENAMED to `channels` (not dropped) and every existing row's value is
  inverted in place — the new allowlist is every `SyndicationChannel` member EXCEPT the channels
  the row used to exclude — so effective syndication is unchanged by this migration. The column
  default remains the empty array, which now means "syndicates nowhere".

  Also lands the carried-over models' membership (decided 2026-08-11): `channels` on
  `Project`/`Repository`/`Course`, the `Course.degreeId` parallel re-parent, and the three
  competency join tables.
*/
-- AlterTable
ALTER TABLE "Competency" RENAME COLUMN "excludedChannels" TO "channels";
UPDATE "Competency" SET "channels" = ARRAY(SELECT unnest(enum_range(NULL::"SyndicationChannel")) EXCEPT SELECT unnest("channels"));

-- AlterTable
ALTER TABLE "ContentNode" RENAME COLUMN "excludedChannels" TO "channels";
UPDATE "ContentNode" SET "channels" = ARRAY(SELECT unnest(enum_range(NULL::"SyndicationChannel")) EXCEPT SELECT unnest("channels"));

-- AlterTable
ALTER TABLE "Course" ADD COLUMN     "channels" "SyndicationChannel"[] DEFAULT ARRAY[]::"SyndicationChannel"[],
ADD COLUMN     "degreeId" UUID;

-- AlterTable
ALTER TABLE "Degree" RENAME COLUMN "excludedChannels" TO "channels";
UPDATE "Degree" SET "channels" = ARRAY(SELECT unnest(enum_range(NULL::"SyndicationChannel")) EXCEPT SELECT unnest("channels"));

-- AlterTable
ALTER TABLE "NestedContentNode" RENAME COLUMN "excludedChannels" TO "channels";
UPDATE "NestedContentNode" SET "channels" = ARRAY(SELECT unnest(enum_range(NULL::"SyndicationChannel")) EXCEPT SELECT unnest("channels"));

-- AlterTable
ALTER TABLE "ProfileAboutParagraph" RENAME COLUMN "excludedChannels" TO "channels";
UPDATE "ProfileAboutParagraph" SET "channels" = ARRAY(SELECT unnest(enum_range(NULL::"SyndicationChannel")) EXCEPT SELECT unnest("channels"));

-- AlterTable
ALTER TABLE "ProfileContactEntry" RENAME COLUMN "excludedChannels" TO "channels";
UPDATE "ProfileContactEntry" SET "channels" = ARRAY(SELECT unnest(enum_range(NULL::"SyndicationChannel")) EXCEPT SELECT unnest("channels"));

-- AlterTable
ALTER TABLE "ProfileHighlight" RENAME COLUMN "excludedChannels" TO "channels";
UPDATE "ProfileHighlight" SET "channels" = ARRAY(SELECT unnest(enum_range(NULL::"SyndicationChannel")) EXCEPT SELECT unnest("channels"));

-- AlterTable
ALTER TABLE "Project" ADD COLUMN     "channels" "SyndicationChannel"[] DEFAULT ARRAY[]::"SyndicationChannel"[];

-- AlterTable
ALTER TABLE "Repository" ADD COLUMN     "channels" "SyndicationChannel"[] DEFAULT ARRAY[]::"SyndicationChannel"[];

-- AlterTable
ALTER TABLE "Role" RENAME COLUMN "excludedChannels" TO "channels";
UPDATE "Role" SET "channels" = ARRAY(SELECT unnest(enum_range(NULL::"SyndicationChannel")) EXCEPT SELECT unnest("channels"));

-- CreateTable
CREATE TABLE "_projectCompetencies" (
    "A" UUID NOT NULL,
    "B" UUID NOT NULL
);

-- CreateTable
CREATE TABLE "_repositoryCompetencies" (
    "A" UUID NOT NULL,
    "B" UUID NOT NULL
);

-- CreateTable
CREATE TABLE "_courseCompetencies" (
    "A" UUID NOT NULL,
    "B" UUID NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_projectCompetencies_AB_unique" ON "_projectCompetencies"("A", "B");

-- CreateIndex
CREATE INDEX "_projectCompetencies_B_index" ON "_projectCompetencies"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_repositoryCompetencies_AB_unique" ON "_repositoryCompetencies"("A", "B");

-- CreateIndex
CREATE INDEX "_repositoryCompetencies_B_index" ON "_repositoryCompetencies"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_courseCompetencies_AB_unique" ON "_courseCompetencies"("A", "B");

-- CreateIndex
CREATE INDEX "_courseCompetencies_B_index" ON "_courseCompetencies"("B");

-- AddForeignKey
ALTER TABLE "Course" ADD CONSTRAINT "Course_degreeId_fkey" FOREIGN KEY ("degreeId") REFERENCES "Degree"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_projectCompetencies" ADD CONSTRAINT "_projectCompetencies_A_fkey" FOREIGN KEY ("A") REFERENCES "Competency"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_projectCompetencies" ADD CONSTRAINT "_projectCompetencies_B_fkey" FOREIGN KEY ("B") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_repositoryCompetencies" ADD CONSTRAINT "_repositoryCompetencies_A_fkey" FOREIGN KEY ("A") REFERENCES "Competency"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_repositoryCompetencies" ADD CONSTRAINT "_repositoryCompetencies_B_fkey" FOREIGN KEY ("B") REFERENCES "Repository"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_courseCompetencies" ADD CONSTRAINT "_courseCompetencies_A_fkey" FOREIGN KEY ("A") REFERENCES "Competency"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_courseCompetencies" ADD CONSTRAINT "_courseCompetencies_B_fkey" FOREIGN KEY ("B") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;
