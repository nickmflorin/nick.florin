import { enumeratedLiterals, type EnumeratedLiteralsType } from "~/lib/literals";
import type {
  BrandSchool,
  BrandCompany,
  BrandSkill,
  BrandCourse,
  BrandProject,
  BrandEducation,
  BrandExperience,
  BrandRepository,
} from "~/prisma/model";

export const DrawerIds = enumeratedLiterals(
  [
    "create-education",
    "create-skill",
    "create-experience",
    "create-company",
    "create-school",
    "update-education-details",
    "update-education",
    "update-experience-details",
    "update-experience",
    "update-skill",
    "update-company",
    "update-school",
    "view-skill",
    "view-course",
    "create-project",
    "update-project",
    "update-course",
    "create-course",
    "view-resumes",
    "update-repository",
    "create-repository",
    "view-education",
    "view-experience",
  ] as const,
  {},
);

export type DrawerId = EnumeratedLiteralsType<typeof DrawerIds>;

export type DrawerIdProps<D extends DrawerId> = {
  "update-education": { educationId: string; eager: Pick<BrandEducation, "major"> };
  "update-experience": { experienceId: string; eager: Pick<BrandExperience, "title"> };
  "update-project": { projectId: string; eager: Pick<BrandProject, "name"> };
  "update-course": { courseId: string; eager: Pick<BrandCourse, "name"> };
  "update-skill": { skillId: string; eager: Pick<BrandSkill, "label"> };
  "update-company": { companyId: string; eager: Pick<BrandCompany, "name"> };
  "update-school": { schoolId: string; eager: Pick<BrandSchool, "name"> };
  "update-repository": { repositoryId: string; eager: Pick<BrandRepository, "slug"> };
  "view-skill": { skillId: string };
  "view-education": { educationId: string };
  "view-experience": { experienceId: string };
  "view-course": { courseId: string };
  "update-education-details": {
    entityId: string;
  };
  "update-experience-details": {
    entityId: string;
  };
  /* eslint-disable @typescript-eslint/ban-types */
  "create-education": {};
  "create-experience": {};
  "create-skill": {};
  "create-school": {};
  "create-company": {};
  "create-project": {};
  "create-course": {};
  "create-repository": {};
  "view-resumes": {};
  /* eslint-enable @typescript-eslint/ban-types */
}[D];

export type InjectedDrawerProps = {
  readonly onClose: () => void;
};

export type ExtendingDrawerProps<P = Record<never, never>> = P & InjectedDrawerProps;

export type WithInjectedDrawerProps<D extends DrawerId> = DrawerIdProps<D> & InjectedDrawerProps;

export type DrawerIdPropsPair<I extends DrawerId = DrawerId> = I extends DrawerId
  ? { id: I; props: DrawerIdProps<I> }
  : never;
