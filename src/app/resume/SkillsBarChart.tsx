import dynamic from "next/dynamic";

import { DateTime } from "luxon";

import { minDate, strictArrayLookup } from "~/lib";
import { type ComponentProps } from "~/components/types";
import { prisma } from "~/prisma/client";

const SkillsBarChart = dynamic(() => import("~/components/charts/SkillsBarChart/index"), {
  ssr: true,
  loading: () => <div>Loading...</div>,
});

type Datum = { experience: number; id: string; skill: string };

export type SkillsBarChartProps = ComponentProps;

const SkillsServerBarChart = async (props: SkillsBarChartProps): Promise<JSX.Element> => {
  const skills = await prisma.skill.findMany({ where: { includeInTopSkills: true } });

  const experiences = await prisma.experience.findMany({
    where: {
      skills: {
        some: { skillId: { in: skills.map(s => s.id) }, skill: { includeInTopSkills: true } },
      },
    },
    orderBy: { startDate: "asc" },
    include: { skills: true },
  });

  const educations = await prisma.education.findMany({
    where: {
      skills: {
        some: { skillId: { in: skills.map(s => s.id) }, skill: { includeInTopSkills: true } },
      },
    },
    orderBy: { startDate: "asc" },
    include: { skills: true },
  });

  const data: Datum[] = [];
  for (const skill of skills) {
    if (skill.experience !== null) {
      data.push({ skill: skill.label, experience: skill.experience, id: skill.slug });
    } else {
      /* Since the educations are already ordered by their start date, we can just take the first
         one from the filtered results. */
      const oldestEducation = strictArrayLookup(
        educations.filter(edu => edu.skills.some(s => s.skillId === skill.id)),
        0,
        {},
      );
      /* Since the experiences are already ordered by their start date, we can just take the first
         one from the filtered results. */
      const oldestExperience = strictArrayLookup(
        experiences.filter(exp => exp.skills.some(s => s.skillId === skill.id)),
        0,
        {},
      );
      const oldestDate =
        oldestEducation && oldestExperience
          ? DateTime.fromJSDate(minDate(oldestEducation.startDate, oldestExperience.startDate))
          : oldestEducation
            ? DateTime.fromJSDate(oldestEducation.startDate)
            : oldestExperience
              ? DateTime.fromJSDate(oldestExperience.startDate)
              : null;
      if (oldestDate) {
        data.push({
          skill: skill.label,
          id: skill.slug,
          experience: Math.round(DateTime.now().diff(oldestDate, "years").years),
        });
      }
    }
  }
  const sorted = data.sort((a, b) => b.experience - a.experience);
  return <SkillsBarChart {...props} data={sorted} />;
};

export default SkillsServerBarChart;
