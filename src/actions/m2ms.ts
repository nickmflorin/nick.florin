'use server';
import { uniq } from 'lodash-es';

import { UnreachableCaseError } from '~/application/errors';
import { type Brand, type BrandModel, type PluralBrand } from '~/database/model';
import { type Transaction } from '~/database/prisma';

import { ApiClientFieldErrors } from '~/api';

type DynamicModel = Extract<
  Brand,
  | 'course'
  | 'detail'
  | 'education'
  | 'experience'
  | 'nestedDetail'
  | 'project'
  | 'repository'
  | 'skill'
>;

const FieldErrorKeys = {
  course: 'courses',
  detail: 'details',
  education: 'educations',
  experience: 'experiences',
  nestedDetail: 'nestedDetails',
  project: 'projects',
  repository: 'repositories',
  skill: 'skills',
} as const satisfies { [key in DynamicModel]: PluralBrand<key> };

export const queryIdsDynamically = async <T extends DynamicModel>(
  tx: Transaction,
  model: T,
  ids: string[],
): Promise<BrandModel<T>[]> => {
  switch (model) {
    case 'course':
      return (await tx.course.findMany({ where: { id: { in: ids } } })) as BrandModel<T>[];
    case 'detail':
      return (await tx.detail.findMany({ where: { id: { in: ids } } })) as BrandModel<T>[];
    case 'education':
      return (await tx.education.findMany({ where: { id: { in: ids } } })) as BrandModel<T>[];
    case 'experience':
      return (await tx.experience.findMany({
        where: { id: { in: ids } },
      })) as BrandModel<T>[];
    case 'nestedDetail':
      return (await tx.nestedDetail.findMany({
        where: { id: { in: ids } },
      })) as BrandModel<T>[];
    case 'project':
      return (await tx.project.findMany({ where: { id: { in: ids } } })) as BrandModel<T>[];
    case 'repository':
      return (await tx.repository.findMany({ where: { id: { in: ids } } })) as BrandModel<T>[];
    case 'skill':
      return (await tx.skill.findMany({ where: { id: { in: ids } } })) as BrandModel<T>[];
    default:
      throw new UnreachableCaseError();
  }
};

export type QueryM2MDynamicallyRT<
  I extends string[] | undefined,
  T extends DynamicModel,
> = I extends undefined
  ? [undefined, ApiClientFieldErrors]
  : [BrandModel<T>[], ApiClientFieldErrors];

/**
 * Returns the {@link ApiClientFieldErrors} instance that new violations should be added to.
 *
 * The provided instance is reused, rather than a new one always being created, so that a caller
 * can mutate it in place instead of having to thread the return value back through its own logic.
 */
const resolveFieldErrors = (fieldErrors?: ApiClientFieldErrors): ApiClientFieldErrors =>
  fieldErrors ?? new ApiClientFieldErrors();

export const queryM2MsDynamically = async <I extends string[] | undefined, T extends DynamicModel>(
  tx: Transaction,
  { fieldErrors, ids, model }: { fieldErrors?: ApiClientFieldErrors; ids: I; model: T },
): Promise<QueryM2MDynamicallyRT<I, T>> => {
  const flds = resolveFieldErrors(fieldErrors);
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
