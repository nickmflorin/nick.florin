import dynamic from "next/dynamic";
import React from "react";

import { Loading } from "~/components/feedback/Loading";
import { type QuantitativeSize } from "~/components/types";

import { DrawerIds, type DrawerId } from "./types";

/* eslint-disable-next-line @typescript-eslint/no-explicit-any */
export const Drawer = <D extends DrawerId, C extends React.ComponentType<any>>(
  id: D,
  component: C,
  width: QuantitativeSize<"px"> = "400px",
) => ({
  id,
  component,
  width,
});

const UpdateEducationDrawer = dynamic(
  () => import("~/features/educations/components/drawers/UpdateEducationDrawer"),
  {
    loading: () => <Loading isLoading={true} />,
  },
);

const UpdateCompanyDrawer = dynamic(
  () => import("~/features/companies/components/drawers/UpdateCompanyDrawer"),
  {
    loading: () => <Loading isLoading={true} />,
  },
);

const UpdateExperienceDrawer = dynamic(
  () => import("~/features/experiences/components/drawers/UpdateExperienceDrawer"),
  {
    loading: () => <Loading isLoading={true} />,
  },
);

const UpdateSchoolDrawer = dynamic(
  () => import("~/features/schools/components/drawers/UpdateSchoolDrawer"),
  {
    loading: () => <Loading isLoading={true} />,
  },
);

const UpdateSkillDrawer = dynamic(
  () => import("~/features/skills/components/drawers/UpdateSkillDrawer"),
  {
    loading: () => <Loading isLoading={true} />,
  },
);

const SkillDrawer = dynamic(() => import("~/features/skills/components/drawers/SkillDrawer"), {
  loading: () => <Loading isLoading={true} />,
});

const CourseDrawer = dynamic(() => import("~/features/courses/components/drawers/CourseDrawer"), {
  loading: () => <Loading isLoading={true} />,
});

const CreateCompanyDrawer = dynamic(
  () => import("~/features/companies/components/drawers/CreateCompanyDrawer"),
  {
    loading: () => <Loading isLoading={true} />,
  },
);

const CreateSchoolDrawer = dynamic(
  () => import("~/features/schools/components/drawers/CreateSchoolDrawer"),
  {
    loading: () => <Loading isLoading={true} />,
  },
);

const CreateExperienceDrawer = dynamic(
  () => import("~/features/experiences/components/drawers/CreateExperienceDrawer"),
  {
    loading: () => <Loading isLoading={true} />,
  },
);

const CreateEducationDrawer = dynamic(
  () => import("~/features/educations/components/drawers/CreateEducationDrawer"),
  {
    loading: () => <Loading isLoading={true} />,
  },
);

const CreateSkillDrawer = dynamic(
  () => import("~/features/skills/components/drawers/CreateSkillDrawer"),
  {
    loading: () => <Loading isLoading={true} />,
  },
);

const UpdateExperienceDetailsDrawer = dynamic(
  () => import("~/features/experiences/components/drawers/UpdateExperienceDetailsDrawer"),
  {
    loading: () => <Loading isLoading={true} />,
  },
);

const UpdateEducationDetailsDrawer = dynamic(
  () => import("~/features/educations/components/drawers/UpdateEducationDetailsDrawer"),
  {
    loading: () => <Loading isLoading={true} />,
  },
);

const UpdateProjectDrawer = dynamic(
  () => import("~/features/projects/components/drawers/UpdateProjectDrawer"),
  {
    loading: () => <Loading isLoading={true} />,
  },
);

const CreateProjectDrawer = dynamic(
  () => import("~/features/projects/components/drawers/CreateProjectDrawer"),
  {
    loading: () => <Loading isLoading={true} />,
  },
);

const UpdateCourseDrawer = dynamic(
  () => import("~/features/courses/components/drawers/UpdateCourseDrawer"),
  {
    loading: () => <Loading isLoading={true} />,
  },
);

const CreateCourseDrawer = dynamic(
  () => import("~/features/courses/components/drawers/CreateCourseDrawer"),
  {
    loading: () => <Loading isLoading={true} />,
  },
);

const ResumeDrawer = dynamic(() => import("~/features/resume/components/drawers/ResumeDrawer"), {
  loading: () => <Loading isLoading={true} />,
});

const UpdateRepositoryDrawer = dynamic(
  () => import("~/features/repositories/components/drawers/UpdateRepositoryDrawer"),
  {
    loading: () => <Loading isLoading={true} />,
  },
);

const CreateRepositoryDrawer = dynamic(
  () => import("~/features/repositories/components/drawers/CreateRepositoryDrawer"),
  {
    loading: () => <Loading isLoading={true} />,
  },
);

const EducationDrawer = dynamic(
  () => import("~/features/educations/components/drawers/EducationDrawer"),
  {
    loading: () => <Loading isLoading={true} />,
  },
);

const ExperienceDrawer = dynamic(
  () => import("~/features/experiences/components/drawers/ExperienceDrawer"),
  {
    loading: () => <Loading isLoading={true} />,
  },
);

export const Drawers = {
  [DrawerIds.VIEW_EDUCATION]: Drawer(DrawerIds.VIEW_EDUCATION, EducationDrawer),
  [DrawerIds.VIEW_EXPERIENCE]: Drawer(DrawerIds.VIEW_EXPERIENCE, ExperienceDrawer),
  [DrawerIds.UPDATE_EDUCATION]: Drawer(DrawerIds.UPDATE_EDUCATION, UpdateEducationDrawer),
  [DrawerIds.UPDATE_EDUCATION_DETAILS]: Drawer(
    DrawerIds.UPDATE_EDUCATION_DETAILS,
    UpdateEducationDetailsDrawer,
  ),
  [DrawerIds.UPDATE_EXPERIENCE]: Drawer(DrawerIds.UPDATE_EXPERIENCE, UpdateExperienceDrawer),
  [DrawerIds.UPDATE_EXPERIENCE_DETAILS]: Drawer(
    DrawerIds.UPDATE_EXPERIENCE_DETAILS,
    UpdateExperienceDetailsDrawer,
  ),
  [DrawerIds.UPDATE_COMPANY]: Drawer(DrawerIds.UPDATE_COMPANY, UpdateCompanyDrawer),
  [DrawerIds.UPDATE_SCHOOL]: Drawer(DrawerIds.UPDATE_SCHOOL, UpdateSchoolDrawer),
  [DrawerIds.VIEW_SKILL]: Drawer(DrawerIds.VIEW_SKILL, SkillDrawer),
  [DrawerIds.UPDATE_SKILL]: Drawer(DrawerIds.UPDATE_SKILL, UpdateSkillDrawer),
  [DrawerIds.CREATE_COMPANY]: Drawer(DrawerIds.CREATE_COMPANY, CreateCompanyDrawer),
  [DrawerIds.CREATE_SCHOOL]: Drawer(DrawerIds.CREATE_SCHOOL, CreateSchoolDrawer),
  [DrawerIds.CREATE_SKILL]: Drawer(DrawerIds.CREATE_SKILL, CreateSkillDrawer),
  [DrawerIds.CREATE_EDUCATION]: Drawer(DrawerIds.CREATE_EDUCATION, CreateEducationDrawer),
  [DrawerIds.CREATE_EXPERIENCE]: Drawer(DrawerIds.CREATE_EXPERIENCE, CreateExperienceDrawer),
  [DrawerIds.CREATE_PROJECT]: Drawer(DrawerIds.CREATE_PROJECT, CreateProjectDrawer),
  [DrawerIds.UPDATE_PROJECT]: Drawer(DrawerIds.UPDATE_PROJECT, UpdateProjectDrawer),
  [DrawerIds.VIEW_COURSE]: Drawer(DrawerIds.VIEW_COURSE, CourseDrawer),
  [DrawerIds.CREATE_COURSE]: Drawer(DrawerIds.CREATE_COURSE, CreateCourseDrawer),
  [DrawerIds.UPDATE_COURSE]: Drawer(DrawerIds.UPDATE_COURSE, UpdateCourseDrawer),
  [DrawerIds.VIEW_RESUMES]: Drawer(DrawerIds.VIEW_RESUMES, ResumeDrawer),
  [DrawerIds.UPDATE_REPOSITORY]: Drawer(DrawerIds.UPDATE_REPOSITORY, UpdateRepositoryDrawer),
  [DrawerIds.CREATE_REPOSITORY]: Drawer(DrawerIds.CREATE_REPOSITORY, CreateRepositoryDrawer),
} as const satisfies {
  [key in DrawerId]: {
    id: key;
    /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
    component: React.ComponentType<any>;
  };
};

export type DrawerComponent<D extends DrawerId> = (typeof Drawers)[D]["component"];

export type DrawerDynamicProps<D extends DrawerId> = Omit<
  React.ComponentProps<(typeof Drawers)[D]["component"]>,
  "onClose"
>;

type DrawerConfig<D extends DrawerId> = (typeof Drawers)[D];

export const getDrawerConfig = <D extends DrawerId>(id: D): DrawerConfig<D> =>
  Drawers[id] as DrawerConfig<D>;

export const getDrawerComponent = <D extends DrawerId>(id: D): DrawerComponent<D> =>
  getDrawerConfig(id).component;

export const getDrawerWidth = <D extends DrawerId>(id: D): QuantitativeSize<"px"> =>
  getDrawerConfig(id).width;
