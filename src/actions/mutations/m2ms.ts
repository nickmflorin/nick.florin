"use server";
import uniq from "lodash.uniq";

import { UnreachableCaseError } from "~/application/errors";
import { type Experience, type Education, type Project, type Transaction } from "~/prisma/model";
import { ApiClientFieldErrors } from "~/api";

type DynamicModel = "experience" | "education" | "project";

const FieldErrorKeys = {
  experience: "experiences",
  education: "educations",
  project: "projects",
} as const satisfies { [key in DynamicModel]: `${key}s` };

export type QueryDynamicallyRT<T extends DynamicModel> = {
  experience: Experience[];
  education: Education[];
  project: Project[];
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
      flds.add(FieldErrorKeys[model], {
        internalMessage: `One or more of the provided ${model}(s) do not exist.`,
        code: "invalid",
      });
    }
    return [models, flds] as QueryM2MDynamicallyRT<I, T>;
  }
  return [undefined, flds] as QueryM2MDynamicallyRT<I, T>;
};
