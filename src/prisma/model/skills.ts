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
  readonly educations: (Pick<Education, "major" | "id" | "startDate" | "endDate" | "postPoned"> & {
    readonly school: Pick<School, "id" | "name" | "logoImageUrl" | "city" | "state" | "websiteUrl">;
  })[];
  readonly experiences: (Pick<Experience, "title" | "id" | "startDate" | "endDate" | "isRemote"> & {
    readonly company: Pick<
      Company,
      "id" | "name" | "logoImageUrl" | "city" | "state" | "websiteUrl"
    >;
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
  const experiences =
    params?.experiences ??
    (await prisma.experience.findMany({
      where: {
        skills: {
          some: { skillId: { in: skillIds } },
        },
      },
      orderBy: { startDate: "asc" },
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
      orderBy: { startDate: "asc" },
      include: { skills: true, school: true },
    }));

  const toApiSkill = (skill: Skill): ApiSkill => {
    const apiSkill = {
      ...skill,
      educations: educations
        .filter(edu =>
          edu.skills.some(s =>
            (s as EducationOnSkills).skillId !== undefined
              ? (s as EducationOnSkills).skillId === skill.id
              : (s as Skill).id === skill.id,
          ),
        )
        .sort((a, b) => a.startDate.getTime() - b.startDate.getTime()),
      experiences: experiences
        .filter(exp =>
          exp.skills.some(s =>
            (s as ExperienceOnSkills).skillId !== undefined
              ? (s as ExperienceOnSkills).skillId === skill.id
              : (s as Skill).id === skill.id,
          ),
        )
        .sort((a, b) => a.startDate.getTime() - b.startDate.getTime()),
    };
    /* In the case that the educations were not provided as a parameter to the function, the
       educations are already ordered by their start date - so we can just take the first one
       from the filtered results.  If the they are provided as parameters to the function, we
       cannot assume that they are ordered by their start date, so we must manually do that sort
       here.  */
    const oldestEducation = strictArrayLookup(
      params?.educations
        ? apiSkill.educations.sort((a, b) => a.startDate.getTime() - b.startDate.getTime())
        : apiSkill.educations,
      0,
      {},
    );
    /* In the case that the experiences were not provided as a parameter to the function, the
       educations are already ordered by their start date - so we can just take the first one
       from the filtered results.  If the they are provided as parameters to the function, we
       cannot assume that they are ordered by their start date, so we must manually do that sort
       here.  */
    const oldestExperience = strictArrayLookup(
      params?.experiences
        ? apiSkill.experiences.sort((a, b) => a.startDate.getTime() - b.startDate.getTime())
        : apiSkill.experiences,
      0,
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
