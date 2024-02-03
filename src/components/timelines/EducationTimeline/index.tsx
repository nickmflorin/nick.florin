import dynamic from "next/dynamic";

import { DetailEntityType } from "@prisma/client";

import { type ComponentProps } from "~/components/types";
import { prisma } from "~/prisma/client";

import { EducationTile } from "./EducationTile";

const CommitTimeline = dynamic(
  async () => {
    await new Promise(resolve => setTimeout(resolve, 2000));
    return await import("../CommitTimeline");
  },
  {
    ssr: false,
    loading: () => <div>Loading...</div>,
  },
);

export type EducationTimelineProps = ComponentProps;

export const EducationTimeline = async (props: EducationTimelineProps): Promise<JSX.Element> => {
  const _educations = await prisma.education.findMany({
    include: { school: true },
    orderBy: { startDate: "desc" },
  });
  const details = await prisma.detail.findMany({
    where: {
      entityType: DetailEntityType.EDUCATION,
      entityId: { in: _educations.map(e => e.id) },
    },
    include: { nestedDetails: true },
    orderBy: { createdAt: "desc" },
  });
  const skills = await prisma.skill.findMany({
    include: { educations: true },
    where: { educations: { some: { education: { id: { in: _educations.map(e => e.id) } } } } },
  });
  const educations = _educations.map(edu => ({
    ...edu,
    details: details.filter(d => d.entityId === edu.id),
    skills: skills.filter(s => s.educations.some(e => e.educationId === edu.id)),
  }));
  return (
    <CommitTimeline {...props}>
      {educations.map(education => (
        <EducationTile key={education.id} education={education} />
      ))}
    </CommitTimeline>
  );
};
