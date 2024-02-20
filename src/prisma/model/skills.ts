import { DateTime } from "luxon";
import {
  type Experience,
  type Company,
  type Skill,
  type Education,
  type School,
  type ExperienceOnSkills,
  type EducationOnSkills,
} from "@prisma/client";

import { strictArrayLookup, minDate } from "~/lib";

import { prisma } from "../client";

export type ApiSkill = Skill & {
  readonly autoExperience: number;
  readonly experience: number | null;
  readonly educations: (Pick<Education, "major" | "id"> & {
    readonly school: Pick<School, "id" | "name" | "logoImageUrl">;
  })[];
  readonly experiences: (Pick<Experience, "title" | "id"> & {
    readonly company: Pick<Company, "id" | "name" | "logoImageUrl">;
  })[];
};

type SkillMetadataArg = Skill[] | Skill;
type SkillMetadataRT<A extends SkillMetadataArg> = A extends Skill[] ? ApiSkill[] : ApiSkill;

type SkillMetadataExperience = Experience & {
  readonly company: Company;
  readonly skills: ExperienceOnSkills[];
};

type SkillMetadataEducation = Education & {
  readonly school: School;
  readonly skills: EducationOnSkills[];
};

export const includeSkillMetadata = async <A extends SkillMetadataArg>(
  arg: A,
  params?: {
    readonly experiences?: SkillMetadataExperience[];
    readonly educations?: SkillMetadataEducation[];
  },
): Promise<SkillMetadataRT<A>> => {
  const skillIds = Array.isArray(arg) ? arg.map(s => s.id) : [arg.id];
  const experiences =
    params?.experiences ??
    (await prisma.experience.findMany({
      where: {
        skills: {
          some: { skillId: { in: skillIds } },
        },
      },
      orderBy: { startDate: "desc" },
      include: { skills: true, company: true },
    }));

  const educations =
    params?.educations ??
    (await prisma.education.findMany({
      where: {
        skills: {
          some: { skillId: { in: skillIds } },
        },
      },
      orderBy: { startDate: "desc" },
      include: { skills: true, school: true },
    }));

  const toApiSkill = (skill: Skill): ApiSkill => {
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
  };

  return (
    Array.isArray(arg) ? arg.map(skill => toApiSkill(skill)) : toApiSkill(arg)
  ) as SkillMetadataRT<A>;
};
