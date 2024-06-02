import { enumeratedLiterals } from "enumerated-literals";

import type { DrawerDynamicProps } from "./drawers";

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

// Used for event mapping of drawers in the events.d.ts file.
export type TypeOfDrawerIds = typeof DrawerIds;

export type DrawerIdPropsPair<I extends DrawerId = DrawerId> = I extends DrawerId
  ? { id: I; props: DrawerDynamicProps<I> }
  : never;

export type OpenDrawerParams = {
  readonly push?: boolean;
};

export type DrawersManager = {
  readonly isReady: boolean;
  readonly drawer: JSX.Element | null;
  readonly forwardEnabled: boolean;
  readonly backEnabled: boolean;
  readonly forward: () => void;
  readonly back: () => void;
  readonly close: () => void;
  readonly open: <D extends DrawerId>(
    id: D,
    props: DrawerDynamicProps<D>,
    options?: OpenDrawerParams,
  ) => void;
};

export interface ExtendingDrawerProps {
  readonly onClose: () => void;
}

export interface ClientDrawerProps<D extends DrawerId> {
  readonly id: D;
  readonly props: DrawerDynamicProps<D>;
  readonly push?: boolean;
}

export type ClientDrawerComponent = {
  <D extends DrawerId>(props: ClientDrawerProps<D>): JSX.Element;
};
