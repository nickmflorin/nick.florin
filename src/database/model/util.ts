import { Prisma } from "./generated";

export const getModel = (name: Prisma.ModelName): Prisma.DMMF.Model => {
  const model = Prisma.dmmf.datamodel.models.find(m => m.name === name);
  if (!model) {
    throw new TypeError(`Invalid model name '${name}'.`);
  }
  return model;
};

export const modelHasField = (name: Prisma.ModelName | Prisma.DMMF.Model, field: string) => {
  const m = typeof name === "string" ? getModel(name) : name;
  return m.fields.find(f => f.name === field) !== undefined;
};

export const safeEnumValue = <E extends Record<string, string>>(
  value: string,
  prismaEnum: E,
): E[keyof E] => {
  const v = value.toUpperCase();
  if (prismaEnum[v] === undefined) {
    throw new TypeError(
      `Invalid enum value '${value}' detected for enum, must be one of ${Object.values(
        prismaEnum,
      ).join(", ")}'`,
    );
  }
  return v as E[keyof E];
};
