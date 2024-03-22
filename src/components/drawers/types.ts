import { type SnakeCaseToCamelCase } from "~/lib/formatters";
import { enumeratedLiterals, type EnumeratedLiteralsType } from "~/lib/literals";

export const QueryDrawerIds = enumeratedLiterals(
  [
    "update-education-details",
    "update-education",
    /* "update-experience-details",
       "update-experience",
       "update-skill",
       "update-company",
       "update-school",
       "view-skill", */
  ] as const,
  {},
);

const test = async () => {
  const imported = await import("./UpdateEducationDrawer");
};

export type QueryDrawerId = EnumeratedLiteralsType<typeof QueryDrawerIds>;

export const DrawerIds = enumeratedLiterals(
  [
    ...QueryDrawerIds.values,
    /* "create-education",
       "create-skill",
       "create-experience",
       "create-company",
       "create-school", */
  ] as const,
  {},
);

export type DrawerId = EnumeratedLiteralsType<typeof DrawerIds>;

export type DrawerQueryParams = {
  [key in QueryDrawerId as SnakeCaseToCamelCase<key>]: string | null;
};

export type DrawerProps = {
  "update-education": { educationId: string };
};

export const DrawerComponents = {
  [DrawerIds.UPDATE_EDUCATION]: async () => {
    const imported = await import("./UpdateEducationDrawer");
    return imported.UpdateEducationDrawer;
  },
} satisfies {
  [key in DrawerId]: () => Promise<React.FunctionComponent>;
} as const;
