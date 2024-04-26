import omit from "lodash.omit";

type ForeignKeyId = `${string}Id`;
type FieldsToClean = "id" | "updatedById" | "createdById" | "$kind" | ForeignKeyId;

type CleanedModel<T extends Record<string, unknown>> = {
  [key in Exclude<keyof T, FieldsToClean>]: T[key];
};

export const cleanModel = <T extends Record<string, unknown>>(model: T): CleanedModel<T> => {
  const initial = omit(model, ["id", "updatedById", "createdById", "$kind"]);
  return Object.keys(initial).reduce((acc: CleanedModel<T>, key) => {
    if (key.endsWith("Id")) {
      return acc;
    }
    return { ...acc, [key]: initial[key] };
  }, {} as CleanedModel<T>);
};
