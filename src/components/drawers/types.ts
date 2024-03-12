import { ReadonlyURLSearchParams } from "next/navigation";

import { z } from "zod";

export const DrawerParams = {
  skill: "skillId",
  "update-skill": "updateSkillId",
  "update-experience": "updateExperienceId",
  "update-education": "updateEducationId",
  "update-experience-details": "updateExperienceDetailsId",
  "update-education-details": "updateEducationDetailsId",
} as const;

export type DrawerId = keyof typeof DrawerParams;

export type DrawerParam<I extends DrawerId = DrawerId> = (typeof DrawerParams)[I];

export type DrawerSearchParams = { [key in DrawerId as DrawerParam<key>]: string | undefined };

const isUuid = (v: unknown): v is string => z.string().uuid().safeParse(v).success;

export const parseSearchParams = (
  searchParams: ReadonlyURLSearchParams | Record<string, string | undefined>,
) => {
  const relevant: DrawerSearchParams = {} as DrawerSearchParams;
  for (const k of Object.keys(DrawerParams)) {
    const param = DrawerParams[k as DrawerId];
    const v =
      searchParams instanceof ReadonlyURLSearchParams
        ? searchParams.get(param)
        : searchParams[param];
    if (isUuid(v)) {
      relevant[param] = v;
    } else {
      relevant[param] = undefined;
    }
  }
  return relevant;
};
