"use client";
import dynamic from "next/dynamic";
import React, { useState, useCallback } from "react";

import { DrawerCloseButton } from "~/components/buttons/DrawerCloseButton";
import { Loading } from "~/components/feedback/Loading";

import { DrawerContainer } from "../DrawerContainer";

import * as types from "./types";
import { Drawer } from "./util";

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

export const Drawers = {
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
} as const satisfies {
  [key in types.DrawerId]: {
    id: key;
    component: React.ComponentType<types.WithInjectedDrawerProps<key>>;
  };
};

type DrawerConfig<D extends types.DrawerId> = (typeof Drawers)[D];

const getDrawerConfig = <D extends types.DrawerId>(id: D): DrawerConfig<D> =>
  Drawers[id] as DrawerConfig<D>;

const getDrawerComponent = <D extends types.DrawerId>(id: D): DrawerComponent<D> =>
  getDrawerConfig(id).component;

export type DrawerComponent<D extends types.DrawerId> = (typeof Drawers)[D]["component"];

export type DrawerDynamicProps<D extends types.DrawerId> = Omit<
  React.ComponentProps<DrawerComponent<D>>,
  keyof types.InjectedDrawerProps
>;

export type DrawersManager = {
  readonly isReady: boolean;
  readonly drawer: JSX.Element | null;
  readonly close: () => void;
  readonly open: <D extends types.DrawerId>(
    id: D,
    params: DrawerDynamicProps<D>,
    closeHandler?: () => void,
  ) => void;
};

export const useDrawersManager = (): Omit<DrawersManager, "isReady"> => {
  const [drawer, setDrawer] = useState<JSX.Element | null>(null);

  const close = useCallback(() => {
    setDrawer(null);
  }, []);

  const open = useCallback(
    <D extends types.DrawerId>(id: D, props: DrawerDynamicProps<D>, handler?: () => void) => {
      /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
      const Drawer = getDrawerComponent(id) as React.ComponentType<any>;
      const ps = {
        ...props,
        onClose: () => setDrawer(null),
      } as React.ComponentProps<typeof Drawer>;

      setDrawer(
        <DrawerContainer>
          <Drawer {...ps} />
          <DrawerCloseButton
            onClick={() => {
              handler?.();
              setDrawer(null);
            }}
          />
        </DrawerContainer>,
      );
    },
    [],
  );

  return { drawer, open, close };
};
