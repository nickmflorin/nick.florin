import uniqBy from "lodash.uniqby";

import type { BrandSkill, BrandProject, BrandRepository } from "./brand";

import { type getEducations } from "~/actions/fetches/educations";
import { type getExperiences } from "~/actions/fetches/experiences";

import { ProgrammingLanguage, SkillCategory, ProgrammingDomain } from "./core";
import { type ConditionallyInclude } from "./inclusion";

import { type ApiEducation, type ApiExperience } from ".";

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
  [ProgrammingLanguage.HTML]: { label: "HTML" },
  [ProgrammingLanguage.R]: { label: "R" },
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

// Note: Use Github gist to generate.
export type SkillIncludes =
  | ["educations", "experiences", "projects", "repositories"]
  | ["educations", "experiences", "repositories", "projects"]
  | ["educations", "projects", "experiences", "repositories"]
  | ["educations", "projects", "repositories", "experiences"]
  | ["educations", "repositories", "experiences", "projects"]
  | ["educations", "repositories", "projects", "experiences"]
  | ["experiences", "educations", "projects", "repositories"]
  | ["experiences", "educations", "repositories", "projects"]
  | ["experiences", "projects", "educations", "repositories"]
  | ["experiences", "projects", "repositories", "educations"]
  | ["experiences", "repositories", "educations", "projects"]
  | ["experiences", "repositories", "projects", "educations"]
  | ["projects", "educations", "experiences", "repositories"]
  | ["projects", "educations", "repositories", "experiences"]
  | ["projects", "experiences", "educations", "repositories"]
  | ["projects", "experiences", "repositories", "educations"]
  | ["projects", "repositories", "educations", "experiences"]
  | ["projects", "repositories", "experiences", "educations"]
  | ["repositories", "educations", "experiences", "projects"]
  | ["repositories", "educations", "projects", "experiences"]
  | ["repositories", "experiences", "educations", "projects"]
  | ["repositories", "experiences", "projects", "educations"]
  | ["repositories", "projects", "educations", "experiences"]
  | ["repositories", "projects", "experiences", "educations"]
  | ["educations", "experiences", "projects"]
  | ["educations", "experiences", "repositories"]
  | ["educations", "projects", "experiences"]
  | ["educations", "projects", "repositories"]
  | ["educations", "repositories", "experiences"]
  | ["educations", "repositories", "projects"]
  | ["experiences", "educations", "projects"]
  | ["experiences", "educations", "repositories"]
  | ["experiences", "projects", "educations"]
  | ["experiences", "projects", "repositories"]
  | ["experiences", "repositories", "educations"]
  | ["experiences", "repositories", "projects"]
  | ["projects", "educations", "experiences"]
  | ["projects", "educations", "repositories"]
  | ["projects", "experiences", "educations"]
  | ["projects", "experiences", "repositories"]
  | ["projects", "repositories", "educations"]
  | ["projects", "repositories", "experiences"]
  | ["repositories", "educations", "experiences"]
  | ["repositories", "educations", "projects"]
  | ["repositories", "experiences", "educations"]
  | ["repositories", "experiences", "projects"]
  | ["repositories", "projects", "educations"]
  | ["repositories", "projects", "experiences"]
  | ["educations", "experiences"]
  | ["educations", "projects"]
  | ["educations", "repositories"]
  | ["experiences", "educations"]
  | ["experiences", "projects"]
  | ["experiences", "repositories"]
  | ["projects", "educations"]
  | ["projects", "experiences"]
  | ["projects", "repositories"]
  | ["repositories", "educations"]
  | ["repositories", "experiences"]
  | ["repositories", "projects"]
  | ["educations"]
  | ["experiences"]
  | ["projects"]
  | ["repositories"]
  | [];

export type ApiSkill<I extends SkillIncludes = []> = ConditionallyInclude<
  BrandSkill & {
    readonly autoExperience: number;
    readonly educations: ApiEducation[];
    readonly experiences: ApiExperience[];
    readonly projects: BrandProject[];
    readonly repositories: BrandRepository[];
  },
  ["educations", "experiences", "projects", "repositories"],
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
