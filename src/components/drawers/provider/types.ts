import { enumeratedLiterals, type EnumeratedLiteralsType } from "~/lib/literals";

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
  ] as const,
  {},
);

export type DrawerId = EnumeratedLiteralsType<typeof DrawerIds>;

export type DrawerProps<D extends DrawerId> = {
  "update-education": { educationId: string };
  "update-experience": { experienceId: string };
  "update-skill": { skillId: string };
  "update-company": { companyId: string };
  "update-school": { schoolId: string };
  "view-skill": { skillId: string };
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
  /* eslint-enable @typescript-eslint/ban-types */
}[D];

export type InjectedDrawerProps = {
  readonly onClose: () => void;
};

export type ExtendingDrawerProps<P = Record<never, never>> = P & InjectedDrawerProps;

export type WithInjectedDrawerProps<D extends DrawerId> = DrawerProps<D> & InjectedDrawerProps;
