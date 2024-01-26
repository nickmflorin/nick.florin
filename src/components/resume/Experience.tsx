import { type ComponentProps } from "~/components/types";
import { prisma } from "~/prisma/client";

import { CommitTimeline } from "./CommitTimeline";
import { ExperienceTile } from "./ExperienceTile";
import { ResumeSection } from "./ResumeSection";

export type ExperienceProps = ComponentProps;

export const Experience = async (props: ExperienceProps): Promise<JSX.Element> => {
  const experiences = await prisma.experience.findMany({
    include: { company: true },
    orderBy: { startDate: "desc" },
  });
  return (
    <ResumeSection title="Experience" {...props}>
      <CommitTimeline>
        {experiences.map(experience => (
          <ExperienceTile key={experience.id} experience={experience} />
        ))}
      </CommitTimeline>
    </ResumeSection>
  );
};
