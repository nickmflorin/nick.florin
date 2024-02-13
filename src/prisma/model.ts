import {
  type Experience,
  Prisma,
  type School,
  type Detail,
  type Education,
  type Company,
  type Skill,
} from "@prisma/client";

export * from "@prisma/client";

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

export type ApiExperience = Experience & {
  readonly company: Company;
  readonly details: Detail[];
  readonly skills: Skill[];
};

export type ApiEducation = Education & {
  readonly school: School;
  readonly details: Detail[];
  readonly skills: Skill[];
};

export type ApiSkill = Omit<Skill, "experience"> & {
  readonly experience: number;
  readonly educations: (Pick<Education, "major" | "id"> & {
    readonly school: Pick<School, "id" | "name" | "logoImageUrl">;
  })[];
  readonly experiences: (Pick<Experience, "title" | "id"> & {
    readonly company: Pick<Company, "id" | "name" | "logoImageUrl">;
  })[];
};
