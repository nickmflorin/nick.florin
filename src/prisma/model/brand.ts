import {
  type NestedDetail,
  type Experience,
  type Education,
  type Company,
  type School,
  type Detail,
  type Project,
  type Skill,
  type Course,
  type Repository,
  type Resume,
  type Profile,
} from "./generated";

export type ToBrandedModel<M, T extends string> = M & {
  readonly $kind: T;
};

export type Brands = {
  experience: Experience & { readonly company: BrandCompany };
  education: Education & { readonly school: BrandSchool };
  nestedDetail: NestedDetail;
  detail: Detail;
  company: Company;
  school: School;
  project: Project;
  skill: Skill;
  repository: Repository;
  course: Course;
  resume: Resume;
  profile: Profile;
};

export type BrandedModels = { [key in keyof Brands]: ToBrandedModel<Brands[key], key> };
export type Brand = keyof Brands;

export type BrandModel<T extends Brand> = T extends Brand ? BrandedModels[T] : never;

export type ResumeBrand = Extract<Brand, "education" | "experience">;

export type BrandExperience = BrandModel<"experience">;
export type BrandEducation = BrandModel<"education">;
export type BrandNestedDetail = BrandModel<"nestedDetail">;
export type BrandDetail = BrandModel<"detail">;
export type BrandCompany = BrandModel<"company">;
export type BrandSchool = BrandModel<"school">;
export type BrandProject = BrandModel<"project">;
export type BrandSkill = BrandModel<"skill">;
export type BrandRepository = BrandModel<"repository">;
export type BrandCourse = BrandModel<"course">;
export type BrandResume = BrandModel<"resume">;
export type BrandProfile = BrandModel<"profile">;

export type PluralBrand<T extends Brand = Brand> = T extends "repository"
  ? "repositories"
  : T extends "company"
    ? "companies"
    : `${T}s`;

export const pluralizeBrandModel = <T extends Brand>(brand: T): PluralBrand<T> => {
  if (brand === "repository") {
    return "repositories" as PluralBrand<T>;
  } else if (brand === "company") {
    return "companies" as PluralBrand<T>;
  }
  return `${brand}s` as PluralBrand<T>;
};
