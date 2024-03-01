import { DateTime } from "luxon";
import {
  type Experience,
  type Company,
  type Skill,
  type Education,
  type School,
  type ExperienceOnSkills,
  type EducationOnSkills,
  ProgrammingLanguage,
  SkillCategory,
  ProgrammingDomain,
} from "@prisma/client";

import { strictArrayLookup, minDate } from "~/lib";

import { prisma } from "../client";

export const ProgrammingLanguages = {
  [ProgrammingLanguage.BASH]: { label: "Bash" },
  [ProgrammingLanguage.CPLUSPLUS]: { label: "C++" },
  [ProgrammingLanguage.CSS]: { label: "CSS" },
  [ProgrammingLanguage.PYTHON]: { label: "Python" },
  [ProgrammingLanguage.SCSS]: { label: "SASS/SCSS" },
  [ProgrammingLanguage.JAVASCRIPT]: { label: "JavaScript" },
  [ProgrammingLanguage.TYPESCRIPT]: { label: "TypeScript" },
  [ProgrammingLanguage.JQUERY]: { label: "jQuery" },
  [ProgrammingLanguage.SWIFT]: { label: "Swift" },
  [ProgrammingLanguage.MATLAB]: { label: "Matlab" },
} satisfies { [key in ProgrammingLanguage]: { label: string } };

export const getProgrammingLanguage = <L extends ProgrammingLanguage>(
  language: L,
): (typeof ProgrammingLanguages)[L] & { value: L } => ({
  ...ProgrammingLanguages[language],
  value: language,
});

export const SkillCategories = {
  [SkillCategory.API_DEVELOPMENT]: { label: "API Development" } as const,
  [SkillCategory.DATABASE]: { label: "Database" } as const,
  [SkillCategory.DEVOPS]: { label: "Dev Ops" } as const,
  [SkillCategory.FRAMEWORK]: { label: "Framework" } as const,
  [SkillCategory.ORM]: { label: "ORM" } as const,
  [SkillCategory.PACKAGE]: { label: "Package" } as const,
  [SkillCategory.PACKAGE_MANAGER]: { label: "Package Manager" } as const,
  [SkillCategory.PROGRAMMING_LANGUAGE]: { label: "Programming Language" } as const,
  [SkillCategory.TESTING]: { label: "Testing" } as const,
  [SkillCategory.VERSION_MANAGER]: { label: "Version Manager" } as const,
  [SkillCategory.WORKFLOW]: { label: "Workflow" } as const,
} satisfies { [key in SkillCategory]: { label: string } };

export const getSkillCategory = <C extends SkillCategory>(
  cat: C,
): (typeof SkillCategories)[C] & { value: C } => ({ ...SkillCategories[cat], value: cat });

export const ProgrammingDomains = {
  [ProgrammingDomain.BACKEND]: { label: "Backend" },
  [ProgrammingDomain.FRONTEND]: { label: "Frontend" },
  [ProgrammingDomain.FULL_STACK]: { label: "Full Stack" },
  [ProgrammingDomain.MOBILE]: { label: "Mobile" },
} satisfies { [key in ProgrammingDomain]: { label: string } };

export const getProgrammingDomain = <D extends ProgrammingDomain>(
  domain: D,
): (typeof ProgrammingDomains)[D] & { value: D } => ({
  ...ProgrammingDomains[domain],
  value: domain,
});

export type ApiSkill = Skill & {
  readonly autoExperience: number;
  readonly experience: number | null;
  readonly educations: (Education & {
    readonly school: School;
  })[];
  readonly experiences: (Experience & {
    readonly company: Company;
  })[];
};

type SkillMetadataArg = Skill[] | Skill;
type SkillMetadataRT<A extends SkillMetadataArg> = A extends Skill[] ? ApiSkill[] : ApiSkill;

type SkillMetadataExperience = Experience & {
  readonly company: Company;
  readonly skills: (ExperienceOnSkills | Skill)[];
};

type SkillMetadataEducation = Education & {
  readonly school: School;
  readonly skills: (EducationOnSkills | Skill)[];
};

export const includeSkillMetadata = async <A extends SkillMetadataArg>(
  arg: A,
  params?: {
    readonly experiences?: SkillMetadataExperience[];
    readonly educations?: SkillMetadataEducation[];
  },
): Promise<SkillMetadataRT<A>> => {
  const skillIds = Array.isArray(arg) ? arg.map(s => s.id) : [arg.id];
  const experiences = params?.experiences
    ? params.experiences.sort((a, b) => b.startDate.getTime() - a.startDate.getTime())
    : await prisma.experience.findMany({
        where: {
          skills: {
            some: { skillId: { in: skillIds } },
          },
        },
        orderBy: { startDate: "desc" },
        include: { skills: true, company: true },
      });

  const educations = params?.educations
    ? params.educations.sort((a, b) => b.startDate.getTime() - a.startDate.getTime())
    : await prisma.education.findMany({
        where: {
          skills: {
            some: { skillId: { in: skillIds } },
          },
        },
        orderBy: { startDate: "desc" },
        include: { skills: true, school: true },
      });

  const toApiSkill = (skill: Skill): ApiSkill => {
    const apiSkill = {
      ...skill,
      educations: educations.filter(edu =>
        edu.skills.some(s =>
          (s as EducationOnSkills).skillId !== undefined
            ? (s as EducationOnSkills).skillId === skill.id
            : (s as Skill).id === skill.id,
        ),
      ),
      experiences: experiences.filter(exp =>
        exp.skills.some(s =>
          (s as ExperienceOnSkills).skillId !== undefined
            ? (s as ExperienceOnSkills).skillId === skill.id
            : (s as Skill).id === skill.id,
        ),
      ),
    };
    const oldestEducation = strictArrayLookup(
      apiSkill.educations,
      apiSkill.educations.length - 1,
      {},
    );
    const oldestExperience = strictArrayLookup(
      apiSkill.experiences,
      apiSkill.experiences.length - 1,
      {},
    );
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
