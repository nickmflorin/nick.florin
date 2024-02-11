import dynamic from "next/dynamic";

import { DetailEntityType } from "@prisma/client";

import { type ComponentProps } from "~/components/types";
import { prisma } from "~/prisma/client";

import { ExperienceTile } from "./ExperienceTile";

const CommitTimeline = dynamic(async () => await import("../CommitTimeline"), {
  ssr: false,
  loading: () => <div>Loading...</div>,
});

export type ExperienceTimelineProps = ComponentProps;

export const ExperienceTimeline = async (props: ExperienceTimelineProps): Promise<JSX.Element> => {
  const _experiences = await prisma.experience.findMany({
    include: { company: true },
    orderBy: { startDate: "desc" },
  });
  const details = await prisma.detail.findMany({
    where: {
      entityType: DetailEntityType.EXPERIENCE,
      entityId: { in: _experiences.map(e => e.id) },
    },
    include: { nestedDetails: true },
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
    <CommitTimeline {...props}>
      {experiences.map(experience => (
        <ExperienceTile key={experience.id} experience={experience} />
      ))}
    </CommitTimeline>
  );
};
