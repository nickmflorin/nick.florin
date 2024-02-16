import { DateTime } from "luxon";

import { strictArrayLookup, minDate } from "~/lib";

import { prisma } from "./client";
import { type Skill, type ApiSkill } from "./model";

export const includeSkillMetadata = async (skills: Skill[]): Promise<ApiSkill[]> => {
  const experiences = await prisma.experience.findMany({
    where: {
      skills: {
        some: { skillId: { in: skills.map(s => s.id) } },
      },
    },
    orderBy: { startDate: "asc" },
    include: { skills: true, company: true },
  });

  const educations = await prisma.education.findMany({
    where: {
      skills: {
        some: { skillId: { in: skills.map(s => s.id) } },
      },
    },
    orderBy: { startDate: "asc" },
    include: { skills: true, school: true },
  });

  return skills.map((skill): ApiSkill => {
    const apiSkill = {
      ...skill,
      educations: educations.filter(edu => edu.skills.some(s => s.skillId === skill.id)),
      experiences: experiences.filter(exp => exp.skills.some(s => s.skillId === skill.id)),
    };
    /* Since the educations are already ordered by their start date, we can just take the first one
       from the filtered results. */
    const oldestEducation = strictArrayLookup(apiSkill.educations, 0, {});
    /* Since the experiences are already ordered by their start date, we can just take the first one
       from the filtered results. */
    const oldestExperience = strictArrayLookup(apiSkill.experiences, 0, {});
    const oldestDate = minDate(oldestEducation?.startDate, oldestExperience?.startDate);

    return {
      ...apiSkill,
      autoExperience: oldestDate
        ? Math.round(DateTime.now().diff(DateTime.fromJSDate(oldestDate), "years").years)
        : 0,
    };
  });
};
