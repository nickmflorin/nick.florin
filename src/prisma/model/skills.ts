import omit from "lodash.omit";
import uniqBy from "lodash.uniqby";
import { DateTime } from "luxon";

import type { BrandSkill, BrandProject, BrandRepository } from "./brand";

import { strictArrayLookup, minDate } from "~/lib";
import type { Transaction } from "~/prisma/client";
import { type User, type ApiEducation, type ApiExperience } from "~/prisma/model";
import { DetailEntityType } from "~/prisma/model";
import { type getEducations } from "~/actions/fetches/educations";
import { type getExperiences } from "~/actions/fetches/experiences";
import { type IconProp } from "~/components/icons";

import { type ApiCourse } from "./course";
import { ProgrammingLanguage, SkillCategory, ProgrammingDomain } from "./generated";
import { type ConditionallyInclude } from "./inclusion";

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

type RecalculateSkillsReturnForm = "skills" | "experience";

type RecalculateSkillUnpersistOptions = {
  readonly persist: false;
  readonly user?: never;
  readonly returnAs?: RecalculateSkillsReturnForm;
};

type RecalculateSkillPersistOptions = {
  readonly persist?: true;
  readonly user: User;
  readonly returnAs?: RecalculateSkillsReturnForm;
};

type RecalculateSkillOptions = RecalculateSkillUnpersistOptions | RecalculateSkillPersistOptions;

type RecalculateSkillsResult<
  I extends string | string[],
  O extends RecalculateSkillOptions,
> = O extends { returnAs: "experience" }
  ? I extends string[]
    ? Record<string, number>
    : number
  : I extends string[]
    ? BrandSkill[]
    : BrandSkill;

export const calculateSkillsExperience = async <
  I extends string | string[],
  O extends RecalculateSkillOptions,
>(
  tx: Transaction,
  ids: I,
  { persist = true, user, returnAs = "skills" }: O,
): Promise<RecalculateSkillsResult<I, O>> => {
  const _ids = Array.isArray(ids) ? ids : ([ids] as string[]);
  const skills = await tx.skill.findMany({
    where: { id: { in: _ids } },
    include: {
      projects: { orderBy: { startDate: "asc" } },
      repositories: { orderBy: { startDate: "asc" } },
      /* It does not matter if two models have the same start date because we are only interested
         in the oldest. */
      courses: { include: { education: true }, orderBy: { education: { startDate: "asc" } } },
    },
  });
  /* When looking at the relationship between a Skill and an Education and/or Experience, it is
     important to also account for the Detail(s) and NestedDetail(s) because both can also be
     associated with a Skill independently of the relationship between the Education/Experience
     they belong to and the same Skill.  In other words, there can be Skill(s) associated with a
     Detail or NestedDetail that are not associated with the Education or Experience that the Detail
     or NestedDetail belongs to.  In those cases, we want to include those indirectly related
     Education(s) and Experience(s) when calculating the oldest start date. */
  const details = await tx.detail.findMany({
    where: {
      OR: [
        { skills: { some: { id: { in: _ids } } } },
        { nestedDetails: { some: { skills: { some: { id: { in: _ids } } } } } },
      ],
    },
  });
  const educations = await tx.education.findMany({
    orderBy: { startDate: "asc" },
    include: { skills: true },
    where: {
      OR: [
        { skills: { some: { id: { in: _ids } } } },
        {
          id: {
            in: details.filter(d => d.entityType === DetailEntityType.EDUCATION).map(d => d.id),
          },
        },
      ],
    },
  });
  const experiences = await tx.experience.findMany({
    orderBy: { startDate: "asc" },
    include: { skills: true },
    where: {
      OR: [
        { skills: { some: { id: { in: _ids } } } },
        {
          id: {
            in: details.filter(d => d.entityType === DetailEntityType.EXPERIENCE).map(d => d.id),
          },
        },
      ],
    },
  });

  let mapped: { [key in string]: number } = {};
  let updated: BrandSkill[] = [];

  const readyToProcess = skills.map(sk => ({
    ...sk,
    experiences: experiences.filter(e => e.skills.some(s => s.id === sk.id)),
    educations: educations.filter(e => e.skills.some(s => s.id === sk.id)),
  }));

  for (let i = 0; i < readyToProcess.length; i++) {
    const sk = readyToProcess[i];
    /* If the Skill has an explicitly overridden experience, that value should be used.  Instead,
       the Skill's experience should be calculated. */
    if (sk.experience) {
      mapped = { ...mapped, [sk.id]: sk.experience };
      updated = [
        ...updated,
        {
          ...omit(sk, ["projects", "educations", "experiences", "courses", "repositories"]),
          calculatedExperience: sk.experience,
        },
      ];
    } else {
      const oldestDate = minDate(
        strictArrayLookup(sk.educations, 0, {})?.startDate,
        strictArrayLookup(sk.experiences, 0, {})?.startDate,
        strictArrayLookup(sk.projects, 0, {})?.startDate,
        strictArrayLookup(sk.courses, 0, {})?.education.startDate,
        strictArrayLookup(sk.repositories, 0, {})?.startDate,
      );
      const experience = oldestDate
        ? Math.round(DateTime.now().diff(DateTime.fromJSDate(oldestDate), "years").years)
        : 0;

      mapped = { ...mapped, [sk.id]: experience };
      updated = [
        ...updated,
        {
          ...omit(sk, ["projects", "educations", "experiences", "courses", "repositories"]),
          calculatedExperience: experience,
        },
      ];
    }
  }

  if (persist) {
    if (user === undefined) {
      /* This should be prevented by TS externally to this function, but we have to ensure it
             it satisfied internally. */
      throw new TypeError(
        "The user must be provided as an option when persisting the results of the " +
          "skill's calculation.",
      );
    }
    const persisted = await Promise.all(
      updated.map(sk =>
        tx.skill.update({
          where: { id: sk.id },
          data: { calculatedExperience: sk.calculatedExperience, updatedById: user.id },
        }),
      ),
    );
    if (returnAs === "experience") {
      if (Array.isArray(ids)) {
        /* If multiple skills were provided as an array, we want to return the experience as a
           mapping. */
        return mapped as RecalculateSkillsResult<I, O>;
      } else if (persisted.length !== 1) {
        // This should not happen based on the implementation logic.
        throw new TypeError(
          "Unexpectedly encountered multiple persisted skills when persisting a single skill.",
        );
      }
      return persisted[0].calculatedExperience as RecalculateSkillsResult<I, O>;
    } else if (Array.isArray(ids)) {
      return persisted as RecalculateSkillsResult<I, O>;
    } else if (persisted.length !== 1) {
      // This should not happen based on the implementation logic.
      throw new TypeError(
        "Unexpectedly encountered multiple persisted skills when persisting a single skill.",
      );
    }
    return persisted[0] as RecalculateSkillsResult<I, O>;
  } else if (returnAs === "experience") {
    if (Array.isArray(ids)) {
      /* If multiple skills were provided as an array, we want to return the experience as a
         mapping. */
      return mapped as RecalculateSkillsResult<I, O>;
    } else if (updated.length !== 1) {
      // This should not happen based on the implementation logic.
      throw new TypeError(
        "Unexpectedly encountered multiple updated skills when updating a single skill.",
      );
    }
    return updated[0].calculatedExperience as RecalculateSkillsResult<I, O>;
  } else if (Array.isArray(ids)) {
    return updated as RecalculateSkillsResult<I, O>;
  } else if (updated.length !== 1) {
    // This should not happen based on the implementation logic.
    throw new TypeError(
      "Unexpectedly encountered multiple updated skills when updating a single skill.",
    );
  }
  return updated[0] as RecalculateSkillsResult<I, O>;
};
