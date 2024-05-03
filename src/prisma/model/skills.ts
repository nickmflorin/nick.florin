import uniqBy from "lodash.uniqby";
import { DateTime } from "luxon";

import type { BrandSkill, BrandProject, BrandRepository } from "./brand";

import { strictArrayLookup, minDate } from "~/lib";
import { type getEducations } from "~/actions/fetches/educations";
import { type getExperiences } from "~/actions/fetches/experiences";
import { type IconProp } from "~/components/icons";

import { type ApiCourse } from "./course";
import { ProgrammingLanguage, SkillCategory, ProgrammingDomain } from "./generated";
import { type ConditionallyInclude } from "./inclusion";

import { type ApiEducation, type ApiExperience } from ".";

export const ProgrammingLanguages = {
  [ProgrammingLanguage.BASH]: { label: "Bash", icon: "/programming-languages/bash.svg" },
  [ProgrammingLanguage.CPLUSPLUS]: { label: "C++", icon: "/programming-languages/cplusplus.svg" },
  [ProgrammingLanguage.CSS]: { label: "CSS", icon: "/programming-languages/css.svg" },
  [ProgrammingLanguage.PYTHON]: {
    label: "Python",
    icon: "/programming-languages/python.svg",
  },
  [ProgrammingLanguage.SCSS]: { label: "SASS/SCSS", icon: "/programming-languages/sass.svg" },
  [ProgrammingLanguage.JAVASCRIPT]: {
    label: "JavaScript",
    icon: "/programming-languages/javascript.svg",
  },
  [ProgrammingLanguage.TYPESCRIPT]: {
    label: "TypeScript",
    icon: "/programming-languages/typescript.svg",
  },
  [ProgrammingLanguage.JQUERY]: { label: "jQuery", icon: "/programming-languages/jquery.svg" },
  [ProgrammingLanguage.SWIFT]: { label: "Swift", icon: "/programming-languages/swift.svg" },
  [ProgrammingLanguage.MATLAB]: { label: "Matlab", icon: "/programming-languages/matlab.svg" },
  [ProgrammingLanguage.HTML]: { label: "HTML", icon: "/programming-languages/html.svg" },
  [ProgrammingLanguage.R]: { label: "R", icon: "/programming-languages/r.svg" },
} satisfies {
  [key in ProgrammingLanguage]: {
    label: string;
    icon: IconProp | `/programming-languages/${string}.svg` | null;
  };
};

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

// Note: Use Github gist to generate.
export type SkillIncludes =
  | ["educations", "experiences", "projects", "repositories", "courses"]
  | ["educations", "experiences", "projects", "courses", "repositories"]
  | ["educations", "experiences", "repositories", "projects", "courses"]
  | ["educations", "experiences", "repositories", "courses", "projects"]
  | ["educations", "experiences", "courses", "projects", "repositories"]
  | ["educations", "experiences", "courses", "repositories", "projects"]
  | ["educations", "projects", "experiences", "repositories", "courses"]
  | ["educations", "projects", "experiences", "courses", "repositories"]
  | ["educations", "projects", "repositories", "experiences", "courses"]
  | ["educations", "projects", "repositories", "courses", "experiences"]
  | ["educations", "projects", "courses", "experiences", "repositories"]
  | ["educations", "projects", "courses", "repositories", "experiences"]
  | ["educations", "repositories", "experiences", "projects", "courses"]
  | ["educations", "repositories", "experiences", "courses", "projects"]
  | ["educations", "repositories", "projects", "experiences", "courses"]
  | ["educations", "repositories", "projects", "courses", "experiences"]
  | ["educations", "repositories", "courses", "experiences", "projects"]
  | ["educations", "repositories", "courses", "projects", "experiences"]
  | ["educations", "courses", "experiences", "projects", "repositories"]
  | ["educations", "courses", "experiences", "repositories", "projects"]
  | ["educations", "courses", "projects", "experiences", "repositories"]
  | ["educations", "courses", "projects", "repositories", "experiences"]
  | ["educations", "courses", "repositories", "experiences", "projects"]
  | ["educations", "courses", "repositories", "projects", "experiences"]
  | ["experiences", "educations", "projects", "repositories", "courses"]
  | ["experiences", "educations", "projects", "courses", "repositories"]
  | ["experiences", "educations", "repositories", "projects", "courses"]
  | ["experiences", "educations", "repositories", "courses", "projects"]
  | ["experiences", "educations", "courses", "projects", "repositories"]
  | ["experiences", "educations", "courses", "repositories", "projects"]
  | ["experiences", "projects", "educations", "repositories", "courses"]
  | ["experiences", "projects", "educations", "courses", "repositories"]
  | ["experiences", "projects", "repositories", "educations", "courses"]
  | ["experiences", "projects", "repositories", "courses", "educations"]
  | ["experiences", "projects", "courses", "educations", "repositories"]
  | ["experiences", "projects", "courses", "repositories", "educations"]
  | ["experiences", "repositories", "educations", "projects", "courses"]
  | ["experiences", "repositories", "educations", "courses", "projects"]
  | ["experiences", "repositories", "projects", "educations", "courses"]
  | ["experiences", "repositories", "projects", "courses", "educations"]
  | ["experiences", "repositories", "courses", "educations", "projects"]
  | ["experiences", "repositories", "courses", "projects", "educations"]
  | ["experiences", "courses", "educations", "projects", "repositories"]
  | ["experiences", "courses", "educations", "repositories", "projects"]
  | ["experiences", "courses", "projects", "educations", "repositories"]
  | ["experiences", "courses", "projects", "repositories", "educations"]
  | ["experiences", "courses", "repositories", "educations", "projects"]
  | ["experiences", "courses", "repositories", "projects", "educations"]
  | ["projects", "educations", "experiences", "repositories", "courses"]
  | ["projects", "educations", "experiences", "courses", "repositories"]
  | ["projects", "educations", "repositories", "experiences", "courses"]
  | ["projects", "educations", "repositories", "courses", "experiences"]
  | ["projects", "educations", "courses", "experiences", "repositories"]
  | ["projects", "educations", "courses", "repositories", "experiences"]
  | ["projects", "experiences", "educations", "repositories", "courses"]
  | ["projects", "experiences", "educations", "courses", "repositories"]
  | ["projects", "experiences", "repositories", "educations", "courses"]
  | ["projects", "experiences", "repositories", "courses", "educations"]
  | ["projects", "experiences", "courses", "educations", "repositories"]
  | ["projects", "experiences", "courses", "repositories", "educations"]
  | ["projects", "repositories", "educations", "experiences", "courses"]
  | ["projects", "repositories", "educations", "courses", "experiences"]
  | ["projects", "repositories", "experiences", "educations", "courses"]
  | ["projects", "repositories", "experiences", "courses", "educations"]
  | ["projects", "repositories", "courses", "educations", "experiences"]
  | ["projects", "repositories", "courses", "experiences", "educations"]
  | ["projects", "courses", "educations", "experiences", "repositories"]
  | ["projects", "courses", "educations", "repositories", "experiences"]
  | ["projects", "courses", "experiences", "educations", "repositories"]
  | ["projects", "courses", "experiences", "repositories", "educations"]
  | ["projects", "courses", "repositories", "educations", "experiences"]
  | ["projects", "courses", "repositories", "experiences", "educations"]
  | ["repositories", "educations", "experiences", "projects", "courses"]
  | ["repositories", "educations", "experiences", "courses", "projects"]
  | ["repositories", "educations", "projects", "experiences", "courses"]
  | ["repositories", "educations", "projects", "courses", "experiences"]
  | ["repositories", "educations", "courses", "experiences", "projects"]
  | ["repositories", "educations", "courses", "projects", "experiences"]
  | ["repositories", "experiences", "educations", "projects", "courses"]
  | ["repositories", "experiences", "educations", "courses", "projects"]
  | ["repositories", "experiences", "projects", "educations", "courses"]
  | ["repositories", "experiences", "projects", "courses", "educations"]
  | ["repositories", "experiences", "courses", "educations", "projects"]
  | ["repositories", "experiences", "courses", "projects", "educations"]
  | ["repositories", "projects", "educations", "experiences", "courses"]
  | ["repositories", "projects", "educations", "courses", "experiences"]
  | ["repositories", "projects", "experiences", "educations", "courses"]
  | ["repositories", "projects", "experiences", "courses", "educations"]
  | ["repositories", "projects", "courses", "educations", "experiences"]
  | ["repositories", "projects", "courses", "experiences", "educations"]
  | ["repositories", "courses", "educations", "experiences", "projects"]
  | ["repositories", "courses", "educations", "projects", "experiences"]
  | ["repositories", "courses", "experiences", "educations", "projects"]
  | ["repositories", "courses", "experiences", "projects", "educations"]
  | ["repositories", "courses", "projects", "educations", "experiences"]
  | ["repositories", "courses", "projects", "experiences", "educations"]
  | ["courses", "educations", "experiences", "projects", "repositories"]
  | ["courses", "educations", "experiences", "repositories", "projects"]
  | ["courses", "educations", "projects", "experiences", "repositories"]
  | ["courses", "educations", "projects", "repositories", "experiences"]
  | ["courses", "educations", "repositories", "experiences", "projects"]
  | ["courses", "educations", "repositories", "projects", "experiences"]
  | ["courses", "experiences", "educations", "projects", "repositories"]
  | ["courses", "experiences", "educations", "repositories", "projects"]
  | ["courses", "experiences", "projects", "educations", "repositories"]
  | ["courses", "experiences", "projects", "repositories", "educations"]
  | ["courses", "experiences", "repositories", "educations", "projects"]
  | ["courses", "experiences", "repositories", "projects", "educations"]
  | ["courses", "projects", "educations", "experiences", "repositories"]
  | ["courses", "projects", "educations", "repositories", "experiences"]
  | ["courses", "projects", "experiences", "educations", "repositories"]
  | ["courses", "projects", "experiences", "repositories", "educations"]
  | ["courses", "projects", "repositories", "educations", "experiences"]
  | ["courses", "projects", "repositories", "experiences", "educations"]
  | ["courses", "repositories", "educations", "experiences", "projects"]
  | ["courses", "repositories", "educations", "projects", "experiences"]
  | ["courses", "repositories", "experiences", "educations", "projects"]
  | ["courses", "repositories", "experiences", "projects", "educations"]
  | ["courses", "repositories", "projects", "educations", "experiences"]
  | ["courses", "repositories", "projects", "experiences", "educations"]
  | ["educations", "experiences", "projects", "repositories"]
  | ["educations", "experiences", "projects", "courses"]
  | ["educations", "experiences", "repositories", "projects"]
  | ["educations", "experiences", "repositories", "courses"]
  | ["educations", "experiences", "courses", "projects"]
  | ["educations", "experiences", "courses", "repositories"]
  | ["educations", "projects", "experiences", "repositories"]
  | ["educations", "projects", "experiences", "courses"]
  | ["educations", "projects", "repositories", "experiences"]
  | ["educations", "projects", "repositories", "courses"]
  | ["educations", "projects", "courses", "experiences"]
  | ["educations", "projects", "courses", "repositories"]
  | ["educations", "repositories", "experiences", "projects"]
  | ["educations", "repositories", "experiences", "courses"]
  | ["educations", "repositories", "projects", "experiences"]
  | ["educations", "repositories", "projects", "courses"]
  | ["educations", "repositories", "courses", "experiences"]
  | ["educations", "repositories", "courses", "projects"]
  | ["educations", "courses", "experiences", "projects"]
  | ["educations", "courses", "experiences", "repositories"]
  | ["educations", "courses", "projects", "experiences"]
  | ["educations", "courses", "projects", "repositories"]
  | ["educations", "courses", "repositories", "experiences"]
  | ["educations", "courses", "repositories", "projects"]
  | ["experiences", "educations", "projects", "repositories"]
  | ["experiences", "educations", "projects", "courses"]
  | ["experiences", "educations", "repositories", "projects"]
  | ["experiences", "educations", "repositories", "courses"]
  | ["experiences", "educations", "courses", "projects"]
  | ["experiences", "educations", "courses", "repositories"]
  | ["experiences", "projects", "educations", "repositories"]
  | ["experiences", "projects", "educations", "courses"]
  | ["experiences", "projects", "repositories", "educations"]
  | ["experiences", "projects", "repositories", "courses"]
  | ["experiences", "projects", "courses", "educations"]
  | ["experiences", "projects", "courses", "repositories"]
  | ["experiences", "repositories", "educations", "projects"]
  | ["experiences", "repositories", "educations", "courses"]
  | ["experiences", "repositories", "projects", "educations"]
  | ["experiences", "repositories", "projects", "courses"]
  | ["experiences", "repositories", "courses", "educations"]
  | ["experiences", "repositories", "courses", "projects"]
  | ["experiences", "courses", "educations", "projects"]
  | ["experiences", "courses", "educations", "repositories"]
  | ["experiences", "courses", "projects", "educations"]
  | ["experiences", "courses", "projects", "repositories"]
  | ["experiences", "courses", "repositories", "educations"]
  | ["experiences", "courses", "repositories", "projects"]
  | ["projects", "educations", "experiences", "repositories"]
  | ["projects", "educations", "experiences", "courses"]
  | ["projects", "educations", "repositories", "experiences"]
  | ["projects", "educations", "repositories", "courses"]
  | ["projects", "educations", "courses", "experiences"]
  | ["projects", "educations", "courses", "repositories"]
  | ["projects", "experiences", "educations", "repositories"]
  | ["projects", "experiences", "educations", "courses"]
  | ["projects", "experiences", "repositories", "educations"]
  | ["projects", "experiences", "repositories", "courses"]
  | ["projects", "experiences", "courses", "educations"]
  | ["projects", "experiences", "courses", "repositories"]
  | ["projects", "repositories", "educations", "experiences"]
  | ["projects", "repositories", "educations", "courses"]
  | ["projects", "repositories", "experiences", "educations"]
  | ["projects", "repositories", "experiences", "courses"]
  | ["projects", "repositories", "courses", "educations"]
  | ["projects", "repositories", "courses", "experiences"]
  | ["projects", "courses", "educations", "experiences"]
  | ["projects", "courses", "educations", "repositories"]
  | ["projects", "courses", "experiences", "educations"]
  | ["projects", "courses", "experiences", "repositories"]
  | ["projects", "courses", "repositories", "educations"]
  | ["projects", "courses", "repositories", "experiences"]
  | ["repositories", "educations", "experiences", "projects"]
  | ["repositories", "educations", "experiences", "courses"]
  | ["repositories", "educations", "projects", "experiences"]
  | ["repositories", "educations", "projects", "courses"]
  | ["repositories", "educations", "courses", "experiences"]
  | ["repositories", "educations", "courses", "projects"]
  | ["repositories", "experiences", "educations", "projects"]
  | ["repositories", "experiences", "educations", "courses"]
  | ["repositories", "experiences", "projects", "educations"]
  | ["repositories", "experiences", "projects", "courses"]
  | ["repositories", "experiences", "courses", "educations"]
  | ["repositories", "experiences", "courses", "projects"]
  | ["repositories", "projects", "educations", "experiences"]
  | ["repositories", "projects", "educations", "courses"]
  | ["repositories", "projects", "experiences", "educations"]
  | ["repositories", "projects", "experiences", "courses"]
  | ["repositories", "projects", "courses", "educations"]
  | ["repositories", "projects", "courses", "experiences"]
  | ["repositories", "courses", "educations", "experiences"]
  | ["repositories", "courses", "educations", "projects"]
  | ["repositories", "courses", "experiences", "educations"]
  | ["repositories", "courses", "experiences", "projects"]
  | ["repositories", "courses", "projects", "educations"]
  | ["repositories", "courses", "projects", "experiences"]
  | ["courses", "educations", "experiences", "projects"]
  | ["courses", "educations", "experiences", "repositories"]
  | ["courses", "educations", "projects", "experiences"]
  | ["courses", "educations", "projects", "repositories"]
  | ["courses", "educations", "repositories", "experiences"]
  | ["courses", "educations", "repositories", "projects"]
  | ["courses", "experiences", "educations", "projects"]
  | ["courses", "experiences", "educations", "repositories"]
  | ["courses", "experiences", "projects", "educations"]
  | ["courses", "experiences", "projects", "repositories"]
  | ["courses", "experiences", "repositories", "educations"]
  | ["courses", "experiences", "repositories", "projects"]
  | ["courses", "projects", "educations", "experiences"]
  | ["courses", "projects", "educations", "repositories"]
  | ["courses", "projects", "experiences", "educations"]
  | ["courses", "projects", "experiences", "repositories"]
  | ["courses", "projects", "repositories", "educations"]
  | ["courses", "projects", "repositories", "experiences"]
  | ["courses", "repositories", "educations", "experiences"]
  | ["courses", "repositories", "educations", "projects"]
  | ["courses", "repositories", "experiences", "educations"]
  | ["courses", "repositories", "experiences", "projects"]
  | ["courses", "repositories", "projects", "educations"]
  | ["courses", "repositories", "projects", "experiences"]
  | ["educations", "experiences", "projects"]
  | ["educations", "experiences", "repositories"]
  | ["educations", "experiences", "courses"]
  | ["educations", "projects", "experiences"]
  | ["educations", "projects", "repositories"]
  | ["educations", "projects", "courses"]
  | ["educations", "repositories", "experiences"]
  | ["educations", "repositories", "projects"]
  | ["educations", "repositories", "courses"]
  | ["educations", "courses", "experiences"]
  | ["educations", "courses", "projects"]
  | ["educations", "courses", "repositories"]
  | ["experiences", "educations", "projects"]
  | ["experiences", "educations", "repositories"]
  | ["experiences", "educations", "courses"]
  | ["experiences", "projects", "educations"]
  | ["experiences", "projects", "repositories"]
  | ["experiences", "projects", "courses"]
  | ["experiences", "repositories", "educations"]
  | ["experiences", "repositories", "projects"]
  | ["experiences", "repositories", "courses"]
  | ["experiences", "courses", "educations"]
  | ["experiences", "courses", "projects"]
  | ["experiences", "courses", "repositories"]
  | ["projects", "educations", "experiences"]
  | ["projects", "educations", "repositories"]
  | ["projects", "educations", "courses"]
  | ["projects", "experiences", "educations"]
  | ["projects", "experiences", "repositories"]
  | ["projects", "experiences", "courses"]
  | ["projects", "repositories", "educations"]
  | ["projects", "repositories", "experiences"]
  | ["projects", "repositories", "courses"]
  | ["projects", "courses", "educations"]
  | ["projects", "courses", "experiences"]
  | ["projects", "courses", "repositories"]
  | ["repositories", "educations", "experiences"]
  | ["repositories", "educations", "projects"]
  | ["repositories", "educations", "courses"]
  | ["repositories", "experiences", "educations"]
  | ["repositories", "experiences", "projects"]
  | ["repositories", "experiences", "courses"]
  | ["repositories", "projects", "educations"]
  | ["repositories", "projects", "experiences"]
  | ["repositories", "projects", "courses"]
  | ["repositories", "courses", "educations"]
  | ["repositories", "courses", "experiences"]
  | ["repositories", "courses", "projects"]
  | ["courses", "educations", "experiences"]
  | ["courses", "educations", "projects"]
  | ["courses", "educations", "repositories"]
  | ["courses", "experiences", "educations"]
  | ["courses", "experiences", "projects"]
  | ["courses", "experiences", "repositories"]
  | ["courses", "projects", "educations"]
  | ["courses", "projects", "experiences"]
  | ["courses", "projects", "repositories"]
  | ["courses", "repositories", "educations"]
  | ["courses", "repositories", "experiences"]
  | ["courses", "repositories", "projects"]
  | ["educations", "experiences"]
  | ["educations", "projects"]
  | ["educations", "repositories"]
  | ["educations", "courses"]
  | ["experiences", "educations"]
  | ["experiences", "projects"]
  | ["experiences", "repositories"]
  | ["experiences", "courses"]
  | ["projects", "educations"]
  | ["projects", "experiences"]
  | ["projects", "repositories"]
  | ["projects", "courses"]
  | ["repositories", "educations"]
  | ["repositories", "experiences"]
  | ["repositories", "projects"]
  | ["repositories", "courses"]
  | ["courses", "educations"]
  | ["courses", "experiences"]
  | ["courses", "projects"]
  | ["courses", "repositories"]
  | ["educations"]
  | ["experiences"]
  | ["projects"]
  | ["repositories"]
  | ["courses"]
  | [];

export type ApiSkill<I extends SkillIncludes = []> = ConditionallyInclude<
  BrandSkill & {
    readonly autoExperience: number;
    readonly educations: ApiEducation[];
    readonly experiences: ApiExperience[];
    readonly projects: BrandProject[];
    readonly repositories: BrandRepository[];
    readonly courses: ApiCourse[];
  },
  ["educations", "experiences", "projects", "repositories", "courses"],
  I
>;

type ModelWithRedundantSkills = Awaited<
  ReturnType<
    typeof getExperiences<["skills", "details"]> | typeof getEducations<["skills", "details"]>
  >
>[number];

/**
 * Performs manipulation of the {@link Skill} objects associated with an {@link Experience} or
 * {@link Education} model, their details, their {@link Detail}s' projects and nested details,
 * {@link NestedDetail[]}, such that the top level model (the {@link Experience} or
 * {@link Education}) does not contain references to {@link Skill} objects that are already included
 * in the {@link Detail}(s) or any of the {@link Detail}'s nested details, {@link NestedDetail[]}.
 *
 * Additionally, any {@link Skill} objects associated with a {@link Project} that is associated with
 * the {@link Detail} or {@link NestedDetail} will be included in the {@link Skill}(s) tied to that
 * specific {@link Detail} or {@link NestedDetail}.
 *
 * Before:
 * ------
 * - Skills:
 *   - Skill A (Redundant)
 *   - Skill B (Redundant)
 *   - Skill C
 * - Details:
 *   - Detail A
 *       - Skills:
 *         - Skill A
 *         - Skill D
 *     - Project
 *       - Skills:
 *         - Skill E (Moved to Detail Level)
 *         - Skill B (Moved to Detail Level)
 *
 * After:
 * -----
 * - Skills:
 *   - Skill C
 * - Details:
 *   - Detail A
 *       - Skills:
 *         - Skill A
 *         - Skill D
 *         - Skill E
 *         - Skill B
 */
export const removeRedundantTopLevelSkills = <T extends ModelWithRedundantSkills>(model: T): T => {
  type Det = (typeof model)["details"][number];
  type NestedDet = Det["nestedDetails"][number];
  type Sk = (typeof model)["skills"][number];

  const [details, skills]: [Det[], Sk[]] = [...model.details].reduce(
    (prev: [Det[], Sk[]], detail: Det): [Det[], Sk[]] => {
      const [nestedDetails, nestedSkills] = detail.nestedDetails.reduce(
        (prev: [NestedDet[], Sk[]], nestedDetail: NestedDet): [NestedDet[], Sk[]] => {
          /* If the nested detail is associated with a project, include the skills for that project
           alongside the skills for the nested detail. */
          const nestedSkills = [
            ...nestedDetail.skills,
            ...(nestedDetail.project ? nestedDetail.project.skills : []),
          ];
          return [
            [...prev[0], { ...nestedDetail, skills: uniqBy(nestedSkills, sk => sk.id) }],
            [...prev[1], ...nestedSkills],
          ];
        },
        [[], []] as [NestedDet[], Sk[]],
      );
      /* If the detail is associated with a project, include the skills for that project alongside
         the skills for the detail. */
      const skills = [...detail.skills, ...(detail.project ? detail.project.skills : [])];
      return [
        [...prev[0], { ...detail, nestedDetails, skills: uniqBy(skills, sk => sk.id) }],
        [...prev[1], ...skills, ...nestedSkills],
      ];
    },
    [[], []] as [Det[], Sk[]],
  );

  return {
    ...model,
    details,
    skills: model.skills.filter(sk => !skills.some(nsk => nsk.id === sk.id)),
  };
};

/* Note: This method assumes that the models associated with the skill are ordered by their start
   date or related fields, in ascending order. */
export const calculateSkillExperience = <
  /* A course in and of itself does not have a start date that can be used for inferring experience
     of a skill.  However, it is tied to an education that does - so we can use the start date on
     an education that is tied to a course that is associated with the skill. */
  T extends ApiSkill<["repositories", "educations", "experiences", "projects"]> & {
    readonly courses: ApiCourse<["education"]>[];
  },
>(
  skill: T,
): number => {
  const oldestEducation = strictArrayLookup(skill.educations, 0, {});
  const oldestExperience = strictArrayLookup(skill.experiences, 0, {});
  const oldestProject = strictArrayLookup(skill.projects, 0, {});
  const oldestCourse = strictArrayLookup(skill.courses, 0, {});
  const oldestRepository = strictArrayLookup(skill.repositories, 0, {});

  const oldestDate = minDate(
    oldestEducation?.startDate,
    oldestExperience?.startDate,
    oldestProject?.startDate,
    oldestCourse?.education.startDate,
    oldestRepository?.startDate,
  );

  return oldestDate
    ? Math.round(DateTime.now().diff(DateTime.fromJSDate(oldestDate), "years").years)
    : 0;
};
