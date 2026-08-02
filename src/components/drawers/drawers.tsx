import dynamic from 'next/dynamic';
import { type ComponentProps, type ComponentType } from 'react';

import { Loading } from '~/components/loading/Loading';
import { type QuantitativeSize } from '~/components/types';

import { type DrawerId, DrawerIds } from './types';

/* eslint-disable-next-line @typescript-eslint/no-explicit-any */
export const Drawer = <D extends DrawerId, C extends ComponentType<any>>(
  id: D,
  component: C,
  width: QuantitativeSize<'px'> = '400px',
) => ({
  component,
  id,
  width,
});

const SkillsFilterDrawer = dynamic(
  () =>
    import('~/features/skills/components/drawers/SkillsFilterDrawer').then(
      mod => mod.SkillsFilterDrawer,
    ),
  {
    loading: () => <Loading isLoading />,
  },
);

const UpdateEducationDrawer = dynamic(
  () =>
    import('~/features/educations/components/drawers/UpdateEducationDrawer').then(
      mod => mod.UpdateEducationDrawer,
    ),
  {
    loading: () => <Loading isLoading />,
  },
);

const UpdateCompanyDrawer = dynamic(
  () =>
    import('~/features/companies/components/drawers/UpdateCompanyDrawer').then(
      mod => mod.UpdateCompanyDrawer,
    ),
  {
    loading: () => <Loading isLoading />,
  },
);

const UpdateExperienceDrawer = dynamic(
  () =>
    import('~/features/experiences/components/drawers/UpdateExperienceDrawer').then(
      mod => mod.UpdateExperienceDrawer,
    ),
  {
    loading: () => <Loading isLoading />,
  },
);

const UpdateSchoolDrawer = dynamic(
  () =>
    import('~/features/schools/components/drawers/UpdateSchoolDrawer').then(
      mod => mod.UpdateSchoolDrawer,
    ),
  {
    loading: () => <Loading isLoading />,
  },
);

const UpdateSkillDrawer = dynamic(
  () =>
    import('~/features/skills/components/drawers/UpdateSkillDrawer').then(
      mod => mod.UpdateSkillDrawer,
    ),
  {
    loading: () => <Loading isLoading />,
  },
);

const SkillDrawer = dynamic(
  () => import('~/features/skills/components/drawers/SkillDrawer').then(mod => mod.SkillDrawer),
  {
    loading: () => <Loading isLoading />,
  },
);

const CourseDrawer = dynamic(
  () => import('~/features/courses/components/drawers/CourseDrawer').then(mod => mod.CourseDrawer),
  {
    loading: () => <Loading isLoading />,
  },
);

const CreateCompanyDrawer = dynamic(
  () =>
    import('~/features/companies/components/drawers/CreateCompanyDrawer').then(
      mod => mod.CreateCompanyDrawer,
    ),
  {
    loading: () => <Loading isLoading />,
  },
);

const CreateSchoolDrawer = dynamic(
  () =>
    import('~/features/schools/components/drawers/CreateSchoolDrawer').then(
      mod => mod.CreateSchoolDrawer,
    ),
  {
    loading: () => <Loading isLoading />,
  },
);

const CreateExperienceDrawer = dynamic(
  () =>
    import('~/features/experiences/components/drawers/CreateExperienceDrawer').then(
      mod => mod.CreateExperienceDrawer,
    ),
  {
    loading: () => <Loading isLoading />,
  },
);

const CreateEducationDrawer = dynamic(
  () =>
    import('~/features/educations/components/drawers/CreateEducationDrawer').then(
      mod => mod.CreateEducationDrawer,
    ),
  {
    loading: () => <Loading isLoading />,
  },
);

const CreateSkillDrawer = dynamic(
  () =>
    import('~/features/skills/components/drawers/CreateSkillDrawer').then(
      mod => mod.CreateSkillDrawer,
    ),
  {
    loading: () => <Loading isLoading />,
  },
);

const UpdateExperienceDetailsDrawer = dynamic(
  () =>
    import('~/features/experiences/components/drawers/UpdateExperienceDetailsDrawer').then(
      mod => mod.UpdateExperienceDetailsDrawer,
    ),
  {
    loading: () => <Loading isLoading />,
  },
);

const UpdateEducationDetailsDrawer = dynamic(
  () =>
    import('~/features/educations/components/drawers/UpdateEducationDetailsDrawer').then(
      mod => mod.UpdatEducationDetailsDrawer,
    ),
  {
    loading: () => <Loading isLoading />,
  },
);

const UpdateProjectDrawer = dynamic(
  () =>
    import('~/features/projects/components/drawers/UpdateProjectDrawer').then(
      mod => mod.UpdateProjectDrawer,
    ),
  {
    loading: () => <Loading isLoading />,
  },
);

const CreateProjectDrawer = dynamic(
  () =>
    import('~/features/projects/components/drawers/CreateProjectDrawer').then(
      mod => mod.CreateProjectDrawer,
    ),
  {
    loading: () => <Loading isLoading />,
  },
);

const UpdateCourseDrawer = dynamic(
  () =>
    import('~/features/courses/components/drawers/UpdateCourseDrawer').then(
      mod => mod.UpdateCourseDrawer,
    ),
  {
    loading: () => <Loading isLoading />,
  },
);

const CreateCourseDrawer = dynamic(
  () =>
    import('~/features/courses/components/drawers/CreateCourseDrawer').then(
      mod => mod.CreateCourseDrawer,
    ),
  {
    loading: () => <Loading isLoading />,
  },
);

const ResumeDrawer = dynamic(
  () => import('~/features/resume/components/drawers/ResumeDrawer').then(mod => mod.ResumeDrawer),
  {
    loading: () => <Loading isLoading />,
  },
);

const UpdateRepositoryDrawer = dynamic(
  () =>
    import('~/features/repositories/components/drawers/UpdateRepositoryDrawer').then(
      mod => mod.UpdateRepositoryDrawer,
    ),
  {
    loading: () => <Loading isLoading />,
  },
);

const CreateRepositoryDrawer = dynamic(
  () =>
    import('~/features/repositories/components/drawers/CreateRepositoryDrawer').then(
      mod => mod.CreateRepositoryDrawer,
    ),
  {
    loading: () => <Loading isLoading />,
  },
);

const EducationDrawer = dynamic(
  () =>
    import('~/features/educations/components/drawers/EducationDrawer').then(
      mod => mod.EducationDrawer,
    ),
  {
    loading: () => <Loading isLoading />,
  },
);

const ExperienceDrawer = dynamic(
  () =>
    import('~/features/experiences/components/drawers/ExperienceDrawer').then(
      mod => mod.ExperienceDrawer,
    ),
  {
    loading: () => <Loading isLoading />,
  },
);

export const Drawers = {
  [DrawerIds.CREATE_COMPANY]: Drawer(DrawerIds.CREATE_COMPANY, CreateCompanyDrawer),
  [DrawerIds.CREATE_COURSE]: Drawer(DrawerIds.CREATE_COURSE, CreateCourseDrawer),
  [DrawerIds.CREATE_EDUCATION]: Drawer(DrawerIds.CREATE_EDUCATION, CreateEducationDrawer),
  [DrawerIds.CREATE_EXPERIENCE]: Drawer(DrawerIds.CREATE_EXPERIENCE, CreateExperienceDrawer),
  [DrawerIds.CREATE_PROJECT]: Drawer(DrawerIds.CREATE_PROJECT, CreateProjectDrawer),
  [DrawerIds.CREATE_REPOSITORY]: Drawer(DrawerIds.CREATE_REPOSITORY, CreateRepositoryDrawer),
  [DrawerIds.CREATE_SCHOOL]: Drawer(DrawerIds.CREATE_SCHOOL, CreateSchoolDrawer),
  [DrawerIds.CREATE_SKILL]: Drawer(DrawerIds.CREATE_SKILL, CreateSkillDrawer),
  [DrawerIds.SKILLS_FILTERS]: Drawer(DrawerIds.SKILLS_FILTERS, SkillsFilterDrawer),
  [DrawerIds.UPDATE_COMPANY]: Drawer(DrawerIds.UPDATE_COMPANY, UpdateCompanyDrawer),
  [DrawerIds.UPDATE_COURSE]: Drawer(DrawerIds.UPDATE_COURSE, UpdateCourseDrawer),
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
  [DrawerIds.UPDATE_PROJECT]: Drawer(DrawerIds.UPDATE_PROJECT, UpdateProjectDrawer),
  [DrawerIds.UPDATE_REPOSITORY]: Drawer(DrawerIds.UPDATE_REPOSITORY, UpdateRepositoryDrawer),
  [DrawerIds.UPDATE_SCHOOL]: Drawer(DrawerIds.UPDATE_SCHOOL, UpdateSchoolDrawer),
  [DrawerIds.UPDATE_SKILL]: Drawer(DrawerIds.UPDATE_SKILL, UpdateSkillDrawer),
  [DrawerIds.VIEW_COURSE]: Drawer(DrawerIds.VIEW_COURSE, CourseDrawer),
  [DrawerIds.VIEW_EDUCATION]: Drawer(DrawerIds.VIEW_EDUCATION, EducationDrawer),
  [DrawerIds.VIEW_EXPERIENCE]: Drawer(DrawerIds.VIEW_EXPERIENCE, ExperienceDrawer),
  [DrawerIds.VIEW_RESUMES]: Drawer(DrawerIds.VIEW_RESUMES, ResumeDrawer),
  [DrawerIds.VIEW_SKILL]: Drawer(DrawerIds.VIEW_SKILL, SkillDrawer),
} as const satisfies {
  [key in DrawerId]: {
    /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
    component: ComponentType<any>;
    id: key;
  };
};

export type DrawerComponent<D extends DrawerId> = (typeof Drawers)[D]['component'];

export type DrawerDynamicProps<D extends DrawerId> = Omit<
  ComponentProps<(typeof Drawers)[D]['component']>,
  'onClose'
>;

type DrawerConfig<D extends DrawerId> = (typeof Drawers)[D];

export const getDrawerConfig = <D extends DrawerId>(id: D): DrawerConfig<D> => Drawers[id];

export const getDrawerComponent = <D extends DrawerId>(id: D): DrawerComponent<D> =>
  getDrawerConfig(id).component;

export const getDrawerWidth = <D extends DrawerId>(id: D): QuantitativeSize<'px'> =>
  getDrawerConfig(id).width;
