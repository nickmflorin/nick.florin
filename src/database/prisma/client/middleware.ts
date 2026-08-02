import { type Prisma } from '~/database/model';
import { modelHasField } from '~/database/model/util';
import { isRecordType } from '~/lib/typeguards';

type UpdateAction = Extract<Prisma.PrismaAction, `update${string}`>;

const UPDATE_ACTIONS: UpdateAction[] = ['update', 'updateMany'];
const UPDATE_OR_UPSERT_ACTIONS: ('upsert' | UpdateAction)[] = [...UPDATE_ACTIONS, 'upsert'];

const getUpdateData = (args: unknown, action: 'upsert' | UpdateAction): unknown => {
  if (isRecordType(args)) {
    return action === 'upsert' ? args.update : args.data;
  }
  return undefined;
};

const updateDataHasField = (
  field: string,
  args: unknown,
  action: 'upsert' | UpdateAction,
): boolean => {
  const data = getUpdateData(args, action);
  return isRecordType(data) && data[field] !== undefined;
};

const FIELDS_REQUIRED_ON_UPDATE = ['updatedById'];
const FIELDS_PROHIBITED_ON_UPDATE = ['createdById', 'createdAt', 'assignedAt'];

export const ModelMetaDataMiddleware: Prisma.Middleware<unknown> = async (params, next) => {
  const { action, model } = params;
  if (UPDATE_OR_UPSERT_ACTIONS.includes(action as 'upsert' | UpdateAction) && model) {
    for (const field of FIELDS_REQUIRED_ON_UPDATE) {
      if (
        modelHasField(model, field) &&
        !updateDataHasField(field, params.args, action as 'upsert' | UpdateAction)
      ) {
        throw new Error(
          `For action '${action}' on model '${model}', the field '${field}' is required.`,
        );
      }
    }
    for (const field of FIELDS_PROHIBITED_ON_UPDATE) {
      if (
        modelHasField(model, field) &&
        updateDataHasField(field, params.args, action as 'upsert' | UpdateAction)
      ) {
        throw new Error(
          `For action '${action}' on model '${model}', the field '${field}' is prohibited.`,
        );
      }
    }
  }
  return next(params);
};
