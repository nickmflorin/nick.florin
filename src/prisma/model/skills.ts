import {
  type Experience,
  type Company,
  type Skill,
  type Education,
  type School,
  ProgrammingLanguage,
  SkillCategory,
  ProgrammingDomain,
} from "./core";

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
