import clsx from "clsx";

import { type ComponentProps } from "~/components/types";
import { prisma } from "~/prisma/client";

import { CommitTimeline } from "./CommitTimeline";
import { EducationTile } from "./EducationTile";
import { ResumeSection } from "./ResumeSection";

export type EducationProps = ComponentProps;

export const Education = async (props: EducationProps): Promise<JSX.Element> => {
  const educations = await prisma.education.findMany({
    include: { school: true },
    orderBy: { startDate: "desc" },
  });
  return (
    <ResumeSection {...props} title="Education">
      <CommitTimeline>
        {educations.map(education => (
          <EducationTile key={education.id} education={education} />
        ))}
      </CommitTimeline>
    </ResumeSection>
  );
};
