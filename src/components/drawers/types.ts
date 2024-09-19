import { enumeratedLiterals, type EnumeratedLiteralsMember } from "enumerated-literals";

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
    "skills-filters",
  ] as const,
  {},
);

export type DrawerId = EnumeratedLiteralsMember<typeof DrawerIds>;

export type DrawerIdPropsPair<I extends DrawerId = DrawerId> = I extends DrawerId
  ? { id: I; props: DrawerDynamicProps<I> }
  : never;

export interface DrawersManager {
  readonly isInScope: boolean;
  readonly drawerId: DrawerId | null;
  readonly drawer: JSX.Element | null;
  readonly close: () => void;
  readonly open: <D extends DrawerId>(
    id: D,
    props: DrawerDynamicProps<D>
  ) => void;
}

export interface ExtendingDrawerProps {
  readonly onClose: () => void;
}
