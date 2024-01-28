import { DetailEntityType } from "@prisma/client";

import { type ComponentProps } from "~/components/types";
import { prisma } from "~/prisma/client";

import { CommitTimeline } from "./CommitTimeline";
import { ExperienceTile } from "./ExperienceTile";
import { ResumeSection } from "./ResumeSection";

export type ExperienceProps = ComponentProps;

export const Experience = async (props: ExperienceProps): Promise<JSX.Element> => {
  const _experiences = await prisma.experience.findMany({
    include: { company: true },
    orderBy: { startDate: "desc" },
  });
  const details = await prisma.detail.findMany({
    where: {
      entityType: DetailEntityType.EXPERIENCE,
      entityId: { in: _experiences.map(e => e.id) },
    },
    orderBy: { createdAt: "desc" },
  });
  const skills = await prisma.skill.findMany({
    include: { experiences: true },
    where: { experiences: { some: { experience: { id: { in: _experiences.map(e => e.id) } } } } },
  });
  const experiences = _experiences.map(exp => ({
    ...exp,
    details: details.filter(d => d.entityId === exp.id),
    skills: skills.filter(s => s.experiences.some(e => e.experienceId === exp.id)),
  }));
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
