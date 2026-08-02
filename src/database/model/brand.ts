import {
  type Company,
  type Course,
  type Detail,
  type Education,
  type Experience,
  type NestedDetail,
  type Profile,
  type Project,
  type Repository,
  type Resume,
  type School,
  type Skill,
} from './prisma-client';

export type ToBrandedModel<M, T extends string> = {
  readonly $kind: T;
} & M;

export type Brands = {
  company: Company;
  course: Course;
  detail: Detail;
  education: { readonly school: BrandSchool } & Education;
  experience: { readonly company: BrandCompany } & Experience;
  nestedDetail: NestedDetail;
  profile: Profile;
  project: Project;
  repository: Repository;
  resume: Resume;
  school: School;
  skill: Skill;
};

export type BrandedModels = { [key in keyof Brands]: ToBrandedModel<Brands[key], key> };
export type Brand = keyof Brands;

export type BrandModel<T extends Brand> = T extends Brand ? BrandedModels[T] : never;

export type ResumeBrand = Extract<Brand, 'education' | 'experience'>;

export type BrandExperience = BrandModel<'experience'>;
export type BrandEducation = BrandModel<'education'>;
export type BrandNestedDetail = BrandModel<'nestedDetail'>;
export type BrandDetail = BrandModel<'detail'>;
export type BrandCompany = BrandModel<'company'>;
export type BrandSchool = BrandModel<'school'>;
export type BrandProject = BrandModel<'project'>;
export type BrandSkill = BrandModel<'skill'>;
export type BrandRepository = BrandModel<'repository'>;
export type BrandCourse = BrandModel<'course'>;
export type BrandResume = BrandModel<'resume'>;
export type BrandProfile = BrandModel<'profile'>;

export type PluralBrand<T extends Brand = Brand> = T extends 'repository'
  ? 'repositories'
  : T extends 'company'
    ? 'companies'
    : `${T}s`;

export const pluralizeBrandModel = <T extends Brand>(brand: T): PluralBrand<T> => {
  if (brand === 'repository') {
    return 'repositories' as PluralBrand<T>;
  } else if (brand === 'company') {
    return 'companies' as PluralBrand<T>;
  }
  return `${brand}s` as PluralBrand<T>;
};
