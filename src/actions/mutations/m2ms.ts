"use server";
import uniq from "lodash.uniq";

import { UnreachableCaseError } from "~/application/errors";
import { type Transaction } from "~/prisma/client";
import {
  type BrandExperience,
  type BrandEducation,
  type BrandProject,
  type BrandDetail,
  type BrandSkill,
  type BrandNestedDetail,
} from "~/prisma/model";
import { ApiClientFieldErrors } from "~/api";

type DynamicModel = "experience" | "education" | "project" | "detail" | "skill" | "nestedDetail";

const FieldErrorKeys = {
  experience: "experiences",
  education: "educations",
  project: "projects",
  detail: "details",
  skill: "skills",
  nestedDetail: "nestedDetails",
} as const satisfies { [key in DynamicModel]: `${key}s` };

export type QueryDynamicallyRT<T extends DynamicModel> = {
  experience: BrandExperience[];
  education: BrandEducation[];
  project: BrandProject[];
  skill: BrandSkill[];
  detail: BrandDetail[];
  nestedDetail: BrandNestedDetail[];
}[T];

export const queryIdsDynamically = async <T extends DynamicModel>(
  tx: Transaction,
  model: T,
  ids: string[],
): Promise<QueryDynamicallyRT<T>> => {
  switch (model) {
    case "experience":
      return (await tx.experience.findMany({
        where: { id: { in: ids } },
      })) as QueryDynamicallyRT<T>;
    case "education":
      return (await tx.education.findMany({ where: { id: { in: ids } } })) as QueryDynamicallyRT<T>;
    case "project":
      return (await tx.project.findMany({ where: { id: { in: ids } } })) as QueryDynamicallyRT<T>;
    case "detail":
      return (await tx.detail.findMany({ where: { id: { in: ids } } })) as QueryDynamicallyRT<T>;
    case "nestedDetail":
      return (await tx.nestedDetail.findMany({
        where: { id: { in: ids } },
      })) as QueryDynamicallyRT<T>;
    case "skill":
      return (await tx.skill.findMany({ where: { id: { in: ids } } })) as QueryDynamicallyRT<T>;
    default:
      throw new UnreachableCaseError();
  }
};

export type QueryM2MDynamicallyRT<
  I extends string[] | undefined,
  T extends DynamicModel,
> = I extends undefined
  ? [undefined, ApiClientFieldErrors]
  : [QueryDynamicallyRT<T>, ApiClientFieldErrors];

export const queryM2MsDynamically = async <I extends string[] | undefined, T extends DynamicModel>(
  tx: Transaction,
  { model, ids, fieldErrors }: { model: T; ids?: I; fieldErrors?: ApiClientFieldErrors },
): Promise<QueryM2MDynamicallyRT<I, T>> => {
  /* If the field errors are passed in, we want to just mutate them in place to allow handling of
     the return type of this method to be less cumbersome. */
  const flds = fieldErrors ?? new ApiClientFieldErrors();
  if (ids) {
    const models = await queryIdsDynamically(tx, model, ids);
    if (models.length !== uniq(ids).length) {
      flds.addInvalid(
        FieldErrorKeys[model],
        `One or more of the provided ${model}(s) do not exist.`,
      );
    }
    return [models, flds] as QueryM2MDynamicallyRT<I, T>;
  }
  return [undefined, flds] as QueryM2MDynamicallyRT<I, T>;
};
