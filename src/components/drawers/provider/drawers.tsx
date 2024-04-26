import dynamic from "next/dynamic";

import { Loading } from "~/components/feedback/Loading";

import * as types from "./types";

export const Drawer = <
  D extends types.DrawerId,
  P extends types.WithInjectedDrawerProps<D>,
  C extends React.ComponentType<P>,
>(
  id: D,
  component: C,
) => ({
  id,
  component,
});

const UpdateEducationDrawer = dynamic(() => import("../UpdateEducationDrawer"), {
  loading: () => <Loading isLoading={true} />,
});

const UpdateCompanyDrawer = dynamic(() => import("../UpdateCompanyDrawer"), {
  loading: () => <Loading isLoading={true} />,
});

const UpdateExperienceDrawer = dynamic(() => import("../UpdateExperienceDrawer"), {
  loading: () => <Loading isLoading={true} />,
});

const UpdateSchoolDrawer = dynamic(() => import("../UpdateSchoolDrawer"), {
  loading: () => <Loading isLoading={true} />,
});

const UpdateSkillDrawer = dynamic(() => import("../UpdateSkillDrawer"), {
  loading: () => <Loading isLoading={true} />,
});

const SkillDrawer = dynamic(() => import("../details/SkillDrawer"), {
  loading: () => <Loading isLoading={true} />,
});

const CourseDrawer = dynamic(() => import("../details/CourseDrawer"), {
  loading: () => <Loading isLoading={true} />,
});

const CreateCompanyDrawer = dynamic(() => import("../CreateCompanyDrawer"), {
  loading: () => <Loading isLoading={true} />,
});

const CreateSchoolDrawer = dynamic(() => import("../CreateSchoolDrawer"), {
  loading: () => <Loading isLoading={true} />,
});

const CreateExperienceDrawer = dynamic(() => import("../CreateExperienceDrawer"), {
  loading: () => <Loading isLoading={true} />,
});

const CreateEducationDrawer = dynamic(() => import("../CreateEducationDrawer"), {
  loading: () => <Loading isLoading={true} />,
});

const CreateSkillDrawer = dynamic(() => import("../CreateSkillDrawer"), {
  loading: () => <Loading isLoading={true} />,
});

const UpdateExperienceDetailsDrawer = dynamic(() => import("../UpdateExperienceDetailsDrawer"), {
  loading: () => <Loading isLoading={true} />,
});

const UpdateEducationDetailsDrawer = dynamic(() => import("../UpdateEducationDetailsDrawer"), {
  loading: () => <Loading isLoading={true} />,
});

const UpdateProjectDrawer = dynamic(() => import("../UpdateProjectDrawer"), {
  loading: () => <Loading isLoading={true} />,
});

const CreateProjectDrawer = dynamic(() => import("../CreateProjectDrawer"), {
  loading: () => <Loading isLoading={true} />,
});

const UpdateCourseDrawer = dynamic(() => import("../UpdateCourseDrawer"), {
  loading: () => <Loading isLoading={true} />,
});

const CreateCourseDrawer = dynamic(() => import("../CreateCourseDrawer"), {
  loading: () => <Loading isLoading={true} />,
});

const ResumeDrawer = dynamic(() => import("../ResumeDrawer"), {
  loading: () => <Loading isLoading={true} />,
});

const UpdateRepositoryDrawer = dynamic(() => import("../UpdateRepositoryDrawer"), {
  loading: () => <Loading isLoading={true} />,
});

const CreateRepositoryDrawer = dynamic(() => import("../CreateRepositoryDrawer"), {
  loading: () => <Loading isLoading={true} />,
});

const EducationDrawer = dynamic(() => import("../details/EducationDrawer"), {
  loading: () => <Loading isLoading={true} />,
});

const ExperienceDrawer = dynamic(() => import("../details/ExperienceDrawer"), {
  loading: () => <Loading isLoading={true} />,
});

export const Drawers = {
  [types.DrawerIds.VIEW_EDUCATION]: Drawer(types.DrawerIds.VIEW_EDUCATION, EducationDrawer),
  [types.DrawerIds.VIEW_EXPERIENCE]: Drawer(types.DrawerIds.VIEW_EXPERIENCE, ExperienceDrawer),
  [types.DrawerIds.UPDATE_EDUCATION]: Drawer(
    types.DrawerIds.UPDATE_EDUCATION,
    UpdateEducationDrawer,
  ),
  [types.DrawerIds.UPDATE_EDUCATION_DETAILS]: Drawer(
    types.DrawerIds.UPDATE_EDUCATION_DETAILS,
    UpdateEducationDetailsDrawer,
  ),
  [types.DrawerIds.UPDATE_EXPERIENCE]: Drawer(
    types.DrawerIds.UPDATE_EXPERIENCE,
    UpdateExperienceDrawer,
  ),
  [types.DrawerIds.UPDATE_EXPERIENCE_DETAILS]: Drawer(
    types.DrawerIds.UPDATE_EXPERIENCE_DETAILS,
    UpdateExperienceDetailsDrawer,
  ),
  [types.DrawerIds.UPDATE_COMPANY]: Drawer(types.DrawerIds.UPDATE_COMPANY, UpdateCompanyDrawer),
  [types.DrawerIds.UPDATE_SCHOOL]: Drawer(types.DrawerIds.UPDATE_SCHOOL, UpdateSchoolDrawer),
  [types.DrawerIds.VIEW_SKILL]: Drawer(types.DrawerIds.VIEW_SKILL, SkillDrawer),
  [types.DrawerIds.UPDATE_SKILL]: Drawer(types.DrawerIds.UPDATE_SKILL, UpdateSkillDrawer),
  [types.DrawerIds.CREATE_COMPANY]: Drawer(types.DrawerIds.CREATE_COMPANY, CreateCompanyDrawer),
  [types.DrawerIds.CREATE_SCHOOL]: Drawer(types.DrawerIds.CREATE_SCHOOL, CreateSchoolDrawer),
  [types.DrawerIds.CREATE_SKILL]: Drawer(types.DrawerIds.CREATE_SKILL, CreateSkillDrawer),
  [types.DrawerIds.CREATE_EDUCATION]: Drawer(
    types.DrawerIds.CREATE_EDUCATION,
    CreateEducationDrawer,
  ),
  [types.DrawerIds.CREATE_EXPERIENCE]: Drawer(
    types.DrawerIds.CREATE_EXPERIENCE,
    CreateExperienceDrawer,
  ),
  [types.DrawerIds.CREATE_PROJECT]: Drawer(types.DrawerIds.CREATE_PROJECT, CreateProjectDrawer),
  [types.DrawerIds.UPDATE_PROJECT]: Drawer(types.DrawerIds.UPDATE_PROJECT, UpdateProjectDrawer),
  [types.DrawerIds.VIEW_COURSE]: Drawer(types.DrawerIds.VIEW_COURSE, CourseDrawer),
  [types.DrawerIds.CREATE_COURSE]: Drawer(types.DrawerIds.CREATE_COURSE, CreateCourseDrawer),
  [types.DrawerIds.UPDATE_COURSE]: Drawer(types.DrawerIds.UPDATE_COURSE, UpdateCourseDrawer),
  [types.DrawerIds.VIEW_RESUMES]: Drawer(types.DrawerIds.VIEW_RESUMES, ResumeDrawer),
  [types.DrawerIds.UPDATE_REPOSITORY]: Drawer(
    types.DrawerIds.UPDATE_REPOSITORY,
    UpdateRepositoryDrawer,
  ),
  [types.DrawerIds.CREATE_REPOSITORY]: Drawer(
    types.DrawerIds.CREATE_REPOSITORY,
    CreateRepositoryDrawer,
  ),
} as const satisfies {
  [key in types.DrawerId]: {
    id: key;
    component: React.ComponentType<types.WithInjectedDrawerProps<key>>;
  };
};

export type DrawersType = typeof Drawers;

type DrawerConfig<D extends types.DrawerId> = DrawersType[D];

export const getDrawerConfig = <D extends types.DrawerId>(id: D): DrawerConfig<D> =>
  Drawers[id] as DrawerConfig<D>;

export type DrawerComponent<D extends types.DrawerId> = DrawersType[D]["component"];

export const getDrawerComponent = <D extends types.DrawerId>(id: D): DrawerComponent<D> =>
  getDrawerConfig(id).component;
