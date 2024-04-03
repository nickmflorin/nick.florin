"use client";
import dynamic from "next/dynamic";
import React, { useState, useRef, useCallback, useMemo } from "react";

import { Loading } from "~/components/views/Loading";

import { DrawerContainer } from "../DrawerContainer";

import * as types from "./types";
import { Drawer } from "./util";

const DrawerCloseButton = dynamic(() => import("~/components/buttons/DrawerCloseButton"));

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

const SkillDrawer = dynamic(() => import("../SkillDrawer"), {
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

type OpenState<I extends types.DrawerId = types.DrawerId> = I extends types.DrawerId
  ? {
      id: I;
      props: DrawerDynamicProps<I>;
    }
  : never;

export type DrawersManager = {
  readonly isReady: boolean;
  readonly drawer: JSX.Element | null;
  readonly openId: types.DrawerId | null;
  readonly close: () => void;
  readonly open: <D extends types.DrawerId>(
    id: D,
    params: DrawerDynamicProps<D>,
    closeHandler?: () => void,
  ) => void;
};

export const useDrawersManager = (): Omit<DrawersManager, "isReady"> => {
  const [openState, setOpenState] = useState<OpenState | null>(null);
  const closeHandler = useRef<(() => void) | null>(null);

  const close = useCallback(() => {
    if (openState) {
      setOpenState(null);
      if (closeHandler.current) {
        closeHandler.current();
      }
    }
  }, [openState]);

  const open = useCallback(
    <D extends types.DrawerId>(id: D, props: DrawerDynamicProps<D>, handler?: () => void) => {
      closeHandler?.current?.();
      closeHandler.current = handler ?? null;
      setOpenState({ id, props } as OpenState);
    },
    [],
  );

  const drawer = useMemo(() => {
    if (openState) {
      /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
      const Drawer = getDrawerComponent(openState.id) as React.ComponentType<any>;
      const ps = {
        ...openState.props,
        onClose: () => close(),
      } as React.ComponentProps<typeof Drawer>;

      return (
        <DrawerContainer>
          <Drawer {...ps} />
          <DrawerCloseButton onClick={() => close()} />
        </DrawerContainer>
      );
    }
    return null;
  }, [openState, close]);

  return { drawer, open, close, openId: openState?.id ?? null };
};
